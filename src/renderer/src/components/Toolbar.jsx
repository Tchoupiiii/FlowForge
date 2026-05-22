import React from 'react'
import { Play, Square, Save, FolderOpen, Layout, Trash2, BookOpen, Sparkles, Settings, Bell, Download, Upload, Terminal } from 'lucide-react'
import { useWorkflow } from '../context/WorkflowContext'
import { useExecution } from '../context/ExecutionContext'
import { useToast } from './ToastProvider'
import ThemeToggle from './ThemeToggle'

export default function Toolbar({ onShowDemos, onToggleLog, showLog, onShowGuide, onShowSettings, onShowWorkflows, onShowNotifications, hasUnreadNotifications }) {
  const { workflowName, setWorkflowName, nodes, edges, saveWorkflow, clearCanvas, loadDemoWorkflow } = useWorkflow()
  const { isRunning, execute, stop } = useExecution()
  const toast = useToast()

  const handleRun = async () => {
    if (isRunning) {
      await stop()
    } else {
      await execute({ nodes, edges })
    }
  }

  const handleSave = async () => {
    const result = await saveWorkflow()
    if (result?._saved) {
      toast.success('Workflow sauvegardé', `"${result.name}" a été enregistré.`)
    } else {
      toast.error('Erreur de sauvegarde', result?._error || 'Une erreur est survenue.')
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input
          type="text"
          className="toolbar-title-input"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Nom du workflow..."
        />
      </div>

      <div className="toolbar-center">
        <button
          className={`toolbar-btn ${isRunning ? 'toolbar-btn-danger' : 'toolbar-btn-primary'}`}
          onClick={handleRun}
          title={isRunning ? 'Arrêter' : 'Exécuter'}
        >
          {isRunning ? <Square size={16} /> : <Play size={16} />}
          <span>{isRunning ? 'Arrêter' : 'Exécuter'}</span>
        </button>

        <div className="toolbar-divider" />

        <label className="toolbar-btn toolbar-btn-secondary" title="Importer un workflow depuis un fichier JSON" style={{ cursor: 'pointer' }}>
          <Upload size={16} />
          <span>Ouvrir</span>
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (event) => {
                try {
                  const data = JSON.parse(event.target.result)
                  loadDemoWorkflow(data)
                } catch (err) {
                  toast.error("Erreur", "Fichier invalide")
                }
              }
              reader.readAsText(file)
            }}
          />
        </label>

        <button className="toolbar-btn" onClick={handleSave} title="Sauvegarder">
          <Save size={18} />
        </button>

        <div className="toolbar-divider" />

        <button className="toolbar-btn" onClick={onShowDemos} title="Démos">
          <Layout size={18} />
        </button>

        <button className="toolbar-btn" onClick={onShowGuide} title="Guide">
          <BookOpen size={18} />
        </button>

        <button className="toolbar-btn" onClick={onShowSettings} title="Paramètres">
          <Settings size={18} />
        </button>

        <button className="toolbar-btn" onClick={() => onToggleLog && onToggleLog()} title={showLog ? 'Masquer Logs' : 'Afficher Logs'}>
          <Terminal size={18} />
        </button>

        <div className="toolbar-divider" />

        <button className="toolbar-btn toolbar-btn-ghost" onClick={clearCanvas} title="Nouveau">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="toolbar-right">
        {isRunning && <div className="toolbar-status"><span className="toolbar-status-dot running" />En cours...</div>}
        
        <button 
          className="toolbar-btn toolbar-btn-ghost" 
          onClick={onShowNotifications} 
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          {hasUnreadNotifications && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid var(--bg-surface)'
            }} />
          )}
        </button>
        
        <ThemeToggle />
      </div>
    </div>
  )
}
