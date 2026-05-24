import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ExecutionContext = createContext()

// Calculate milliseconds until the next occurrence based on repetition, hour, and minute
function getMsUntilNextTimer(config) {
  if (!config) return 60 * 1000;
  const { repetition = 'daily', hour = 15, minute = 0 } = config;
  const now = new Date();
  
  if (repetition === 'interval') {
    const val = parseInt(config.intervalValue, 10) || 30;
    const unit = config.intervalUnit || 'seconds';
    let ms = val * 1000;
    if (unit === 'minutes') ms *= 60;
    if (unit === 'hours') ms *= 3600;
    return ms;
  }
  
  if (repetition === 'every_minute') {
    const next = new Date(now.getTime());
    next.setSeconds(0);
    next.setMilliseconds(0);
    next.setMinutes(next.getMinutes() + 1);
    return Math.max(1000, next.getTime() - now.getTime());
  }
  
  if (repetition === 'hourly') {
    const next = new Date(now.getTime());
    next.setSeconds(0);
    next.setMilliseconds(0);
    next.setMinutes(parseInt(minute, 10));
    if (next.getTime() <= now.getTime()) {
      next.setHours(next.getHours() + 1);
    }
    return Math.max(1000, next.getTime() - now.getTime());
  }
  
  // daily
  const next = new Date(now.getTime());
  next.setSeconds(0);
  next.setMilliseconds(0);
  next.setMinutes(parseInt(minute, 10));
  next.setHours(parseInt(hour, 10));
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return Math.max(1000, next.getTime() - now.getTime());
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
            let nextWaitMs = 1000
            if (type === 'timerCron') {
              nextWaitMs = getMsUntilNextTimer(timerNode.data?.config)
            } else {
              nextWaitMs = 1000
            }
            
            setLogs(prev => [...prev, { id: Date.now().toString(), status: 'info', message: `--- Attente du déclencheur (${(nextWaitMs/1000).toFixed(1)}s) ---`, timestamp: Date.now() }])
            await new Promise(resolve => setTimeout(resolve, nextWaitMs))
            if (shouldStopRef.current) break
            
            result = await window.electronAPI.executeWorkflow({ ...workflow, globalSettings })
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
