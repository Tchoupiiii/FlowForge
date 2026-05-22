import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ExecutionContext = createContext()

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
        const timerNode = workflow.nodes.find(n => n.type === 'timerCron' || n.data?.type === 'timerCron')
        
        if (timerNode) {
          const configInterval = timerNode.data?.config?.interval
          // Interval is in seconds, fallback to 60 if not specified
          const waitMs = (configInterval ? parseInt(configInterval) : 60) * 1000

          while (!shouldStopRef.current) {
            result = await window.electronAPI.executeWorkflow({ ...workflow, globalSettings })
            if (shouldStopRef.current) break
            
            // Wait based on configured interval
            await new Promise(resolve => setTimeout(resolve, waitMs))
            if (!shouldStopRef.current) {
               setLogs(prev => [...prev, { id: Date.now().toString(), status: 'info', message: `--- Nouvelle itération du Timer (${waitMs/1000}s) ---`, timestamp: Date.now() }])
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
