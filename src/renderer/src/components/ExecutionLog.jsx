import React, { useRef, useEffect } from 'react'
import { X, Trash2, CheckCircle, AlertCircle, Loader, SkipForward } from 'lucide-react'
import { useExecution } from '../context/ExecutionContext'

const STATUS_CONFIG = {
  running: { icon: Loader, color: 'var(--accent)', label: 'En cours' },
  success: { icon: CheckCircle, color: 'var(--success)', label: 'Succès' },
  error: { icon: AlertCircle, color: 'var(--error)', label: 'Erreur' },
  skipped: { icon: SkipForward, color: 'var(--text-muted)', label: 'Ignoré' }
}

export default function ExecutionLog({ onClose }) {
  const { logs, clearLogs } = useExecution()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="execution-log">
      <div className="execution-log-header">
        <span className="execution-log-title">Logs d'exécution</span>
        <div className="execution-log-actions">
          <button className="execution-log-btn" onClick={clearLogs} title="Effacer">
            <Trash2 size={14} />
          </button>
          <button className="execution-log-btn" onClick={onClose} title="Fermer">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="execution-log-body" ref={scrollRef}>
        {logs.length === 0 ? (
          <div className="execution-log-empty">
            Aucun log. Exécutez un workflow pour voir les résultats.
          </div>
        ) : (
          logs.map(log => {
            const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.running
            const StatusIcon = cfg.icon
            return (
              <div key={log.id} className={`log-entry log-${log.status}`}>
                <span className="log-time">{formatTime(log.timestamp)}</span>
                <span className="log-status-badge" style={{ color: cfg.color }}>
                  <StatusIcon size={14} className={log.status === 'running' ? 'spin' : ''} />
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
