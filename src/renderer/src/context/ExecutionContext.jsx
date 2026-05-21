import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ExecutionContext = createContext()

export function ExecutionProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState([])

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

        if (data.status === 'error' || data.status === 'success') {
          // Individual node completion
        }
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
    setLogs([])

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.executeWorkflow(workflow)
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
