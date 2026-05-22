import React from 'react'
import { X, Bell } from 'lucide-react'

export default function NotificationsModal({ notifications, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Bell size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />Centre de Notifications</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Aucune notification.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((notif, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {notif.body}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(notif.timestamp).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
