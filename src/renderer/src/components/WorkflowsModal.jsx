import React, { useEffect } from 'react'
import { X, FolderOpen, Trash2 } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'

export default function WorkflowsModal({ onClose }) {
  const { listWorkflows, savedWorkflows, loadWorkflow, deleteWorkflow } = useWorkflow()

  useEffect(() => {
    listWorkflows()
  }, [listWorkflows])

  const handleLoad = async (id) => {
    await loadWorkflow(id)
    onClose()
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (confirm('Voulez-vous vraiment supprimer ce workflow ?')) {
      await deleteWorkflow(id)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2><FolderOpen size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Ouvrir un Workflow</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {savedWorkflows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Aucun workflow sauvegardé.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedWorkflows.map(wf => (
                <div 
                  key={wf.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="workflow-item"
                  onClick={() => handleLoad(wf.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: '500', color: 'var(--text)' }}>{wf.name || 'Sans nom'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Dernière modif: {new Date(wf.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <button 
                    className="icon-btn" 
                    onClick={(e) => handleDelete(wf.id, e)}
                    style={{ color: 'var(--danger)' }}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
