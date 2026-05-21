import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext()

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const removeToast = useCallback((id) => {
    // First mark as leaving for animation
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, title, message, leaving: false }])
    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => removeToast(id), duration)
    }
    return id
  }, [removeToast])

  const toast = useMemo(() => ({
    success: (title, message, duration) => addToast('success', title, message, duration),
    error: (title, message, duration) => addToast('error', title, message, duration || 6000),
    warning: (title, message, duration) => addToast('warning', title, message, duration),
    info: (title, message, duration) => addToast('info', title, message, duration)
  }), [addToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info
          return (
            <div
              key={t.id}
              className={`toast toast-${t.type} ${t.leaving ? 'toast-leaving' : ''}`}
              onClick={() => removeToast(t.id)}
            >
              <div className="toast-icon">
                <Icon size={16} />
              </div>
              <div className="toast-body">
                <div className="toast-title">{t.title}</div>
                {t.message && <div className="toast-message">{t.message}</div>}
              </div>
              <X size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
