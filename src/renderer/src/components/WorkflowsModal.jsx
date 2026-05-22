import React, { useEffect, useState } from 'react'
import { X, FolderOpen, Trash2, Download, Upload } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'
import { useToast } from './ToastProvider'

export default function WorkflowsModal({ onClose }) {
  const { listWorkflows, savedWorkflows, loadWorkflow, deleteWorkflow, nodes, edges, workflowName, loadDemoWorkflow } = useWorkflow()
  const [confirmDelete, setConfirmDelete] = useState(null)
  const toast = useToast()

  useEffect(() => {
    listWorkflows()
  }, [listWorkflows])

  const handleLoad = async (id) => {
    await loadWorkflow(id)
    toast.success('Workflow chargé', 'Le workflow a été chargé avec succès.')
    onClose()
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    await deleteWorkflow(id)
    toast.info('Workflow supprimé', 'Le workflow a été supprimé.')
    setConfirmDelete(null)
  }

  const handleExport = async () => {
    if (window.electronAPI && window.electronAPI.exportWorkflow) {
      const workflow = {
        name: workflowName,
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e })),
        exportedAt: new Date().toISOString()
      }
      const result = await window.electronAPI.exportWorkflow(workflow)
      if (result?.success) {
        toast.success('Workflow exporté', `Sauvegardé dans ${result.path}`)
      } else if (!result?.canceled) {
        toast.error('Erreur', result?.error || 'Impossible d\'exporter.')
      }
    }
  }

  const handleImport = async () => {
    if (window.electronAPI && window.electronAPI.importWorkflow) {
      const result = await window.electronAPI.importWorkflow()
      if (result?.success && result.workflow) {
        loadDemoWorkflow({
          name: result.workflow.name || 'Workflow importé',
          nodes: result.workflow.nodes || [],
          edges: result.workflow.edges || []
        })
        toast.success('Workflow importé', `"${result.workflow.name || 'Workflow'}" chargé avec succès.`)
        onClose()
      } else if (!result?.canceled) {
        toast.error('Erreur', result?.error || 'Fichier invalide.')
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FolderOpen size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />Mes Workflows</h2>
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
                  className="workflow-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => confirmDelete !== wf.id && handleLoad(wf.id)}
                >
                  {confirmDelete === wf.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>Supprimer ce workflow ?</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px' }} 
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                        >
                          Annuler
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ background: 'var(--danger)', padding: '4px 10px' }} 
                          onClick={(e) => handleDelete(wf.id, e)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>{wf.name || 'Sans nom'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {wf.nodeCount || 0} nœuds · Modifié le {new Date(wf.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button 
                        className="icon-btn" 
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(wf.id); }}
                        style={{ color: 'var(--error)' }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={handleImport}>
              <Upload size={14} /> Importer
            </button>
            <button className="btn-secondary" onClick={handleExport}>
              <Download size={14} /> Exporter actuel
            </button>
          </div>
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}
