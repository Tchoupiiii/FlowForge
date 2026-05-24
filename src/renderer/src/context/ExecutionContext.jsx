import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ExecutionContext = createContext()

// Helper to match a single cron field expression
function matchCronField(value, expr, minVal, maxVal) {
  if (expr === '*') return true;
  
  const parts = expr.split(',');
  if (parts.length > 1) {
    return parts.some(part => matchCronField(value, part, minVal, maxVal));
  }
  
  const stepParts = expr.split('/');
  if (stepParts.length === 2) {
    const range = stepParts[0];
    const step = parseInt(stepParts[1], 10);
    let start = minVal;
    let end = maxVal;
    if (range !== '*') {
      const rangeParts = range.split('-');
      start = parseInt(rangeParts[0], 10);
      if (rangeParts.length === 2) {
        end = parseInt(rangeParts[1], 10);
      }
    }
    if (value < start || value > end) return false;
    return (value - start) % step === 0;
  }
  
  const rangeParts = expr.split('-');
  if (rangeParts.length === 2) {
    const start = parseInt(rangeParts[0], 10);
    const end = parseInt(rangeParts[1], 10);
    return value >= start && value <= end;
  }
  
  return parseInt(expr, 10) === value;
}

// Helper to check if a Date matches the 5 cron fields
function matchesCron(date, fields) {
  const min = date.getMinutes();
  const hour = date.getHours();
  const dom = date.getDate();
  const month = date.getMonth() + 1; // JS month 0-11
  const dow = date.getDay(); // JS Sunday 0
  
  return (
    matchCronField(min, fields[0], 0, 59) &&
    matchCronField(hour, fields[1], 0, 23) &&
    matchCronField(dom, fields[2], 1, 31) &&
    matchCronField(month, fields[3], 1, 12) &&
    matchCronField(dow, fields[4], 0, 6)
  );
}

// Calculate exact milliseconds until the next cron match minute
function getMsUntilNextCron(cronExpr) {
  const fields = cronExpr.trim().split(/\s+/);
  if (fields.length !== 5) {
    return 60 * 1000; // default 1 min fallback
  }
  
  const now = new Date();
  let testDate = new Date(now.getTime());
  testDate.setSeconds(0);
  testDate.setMilliseconds(0);
  
  // Start testing from the next minute onwards to get the true next trigger time
  testDate.setMinutes(testDate.getMinutes() + 1);
  
  const maxSearchMinutes = 8 * 24 * 60; // search up to 8 days
  for (let i = 0; i < maxSearchMinutes; i++) {
    if (matchesCron(testDate, fields)) {
      const diff = testDate.getTime() - now.getTime();
      return diff > 0 ? diff : 1000;
    }
    testDate.setMinutes(testDate.getMinutes() + 1);
  }
  
  return 60 * 1000;
}

// Parse interval string (5s, 10m, 1h, or cron expression) into milliseconds
function parseIntervalToMs(intervalStr) {
  if (!intervalStr) return 60 * 1000;
  
  const trimmed = intervalStr.trim();
  if (trimmed.split(/\s+/).length === 5) {
    return Math.max(1000, getMsUntilNextCron(trimmed));
  }
  
  const match = trimmed.match(/^(\d+)\s*([smhd]?)$/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase();
    let ms = 1000;
    switch (unit) {
      case 's': ms = value * 1000; break;
      case 'm': ms = value * 60 * 1000; break;
      case 'h': ms = value * 60 * 60 * 1000; break;
      case 'd': ms = value * 24 * 60 * 60 * 1000; break;
      default: ms = value * 1000; break;
    }
    return Math.max(1000, ms);
  }
  
  const parsed = parseInt(trimmed, 10);
  if (isNaN(parsed) || parsed <= 0) return 60 * 1000;
  return Math.max(1000, parsed * 1000);
}

export function ExecutionProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const shouldStopRef = React.useRef(false)

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onExecutionProgress((data) => {
        setLogs(prev => [...prev, {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
          nodeId: data.nodeId,
          status: data.status,
          message: data.data?.message || '',
          data: data.data,
          timestamp: data.timestamp || Date.now()
        }])
      })
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeExecutionProgress()
      }
    }
  }, [])

  const execute = useCallback(async (workflow) => {
    setIsRunning(true)
    shouldStopRef.current = false
    setLogs([])

    try {
      if (window.electronAPI) {
        let savedSettings = {}
        if (window.electronAPI.getSettings) {
          savedSettings = await window.electronAPI.getSettings()
        }
        
        const globalSettings = {
          openaiKey: savedSettings.openaiApiKey || '',
          telegramToken: savedSettings.telegramToken || '',
          discordUrl: savedSettings.discordUrl || '',
          githubToken: savedSettings.githubToken || ''
        }
        
        let result
        const timerNode = workflow.nodes.find(n => ['timerCron', 'telegramTrigger', 'webhook'].includes(n.data?.type || n.type))
        
        if (timerNode) {
          const type = timerNode.data?.type || timerNode.type
          
          while (!shouldStopRef.current) {
            result = await window.electronAPI.executeWorkflow({ ...workflow, globalSettings })
            if (shouldStopRef.current) break
            
            // Calculate delay until next run dynamically
            let nextWaitMs = 1000
            if (type === 'timerCron') {
              const configInterval = timerNode.data?.config?.interval
              nextWaitMs = parseIntervalToMs(configInterval)
            } else {
              nextWaitMs = 1000
            }
            
            if (shouldStopRef.current) break
            
            // Wait based on configured interval
            await new Promise(resolve => setTimeout(resolve, nextWaitMs))
            if (!shouldStopRef.current) {
               setLogs(prev => [...prev, { id: Date.now().toString(), status: 'info', message: `--- Nouvelle itération du Trigger (attente de ${(nextWaitMs/1000).toFixed(1)}s) ---`, timestamp: Date.now() }])
            }
          }
        } else {
          result = await window.electronAPI.executeWorkflow({ ...workflow, globalSettings })
        }

        setIsRunning(false)
        return result
      } else {
        // Dev mode simulation
        setLogs(prev => [...prev, {
          id: 'sim_1',
          nodeId: 'sim',
          status: 'success',
          message: 'Mode développement — exécution simulée',
          timestamp: Date.now()
        }])
        setIsRunning(false)
        return { success: true, simulated: true }
      }
    } catch (error) {
      setIsRunning(false)
      setLogs(prev => [...prev, {
        id: 'err_1',
        nodeId: 'system',
        status: 'error',
        message: `Erreur: ${error.message}`,
        timestamp: Date.now()
      }])
      return { success: false, error: error.message }
    }
  }, [])

  const stop = useCallback(async () => {
    shouldStopRef.current = true
    try {
      if (window.electronAPI) {
        await window.electronAPI.stopWorkflow()
      }
    } catch (e) {}
    setIsRunning(false)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return (
    <ExecutionContext.Provider value={{ isRunning, logs, execute, stop, clearLogs }}>
      {children}
    </ExecutionContext.Provider>
  )
}

export function useExecution() {
  const ctx = useContext(ExecutionContext)
  if (!ctx) throw new Error('useExecution must be used within ExecutionProvider')
  return ctx
}

export default ExecutionContext
