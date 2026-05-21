import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

export default function SettingsModal({ onClose }) {
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    anthropicApiKey: '',
    trelloApiKey: '',
    trelloToken: '',
    githubToken: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getSettings) {
      window.electronAPI.getSettings().then(data => {
        setSettings({
          openaiApiKey: data.openaiApiKey || '',
          anthropicApiKey: data.anthropicApiKey || '',
          trelloApiKey: data.trelloApiKey || '',
          trelloToken: data.trelloToken || '',
          githubToken: data.githubToken || ''
        })
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    if (window.electronAPI && window.electronAPI.setSettings) {
      await window.electronAPI.setSettings(settings)
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>⚙️ Paramètres Globaux</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Configurez ici vos clés API par défaut. Elles seront utilisées automatiquement par les modules si vous ne les spécifiez pas manuellement.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Chargement...</div>
          ) : (
            <div className="config-fields" style={{ display: 'grid', gap: '16px' }}>
              <div className="config-field">
                <label>OpenAI API Key (ChatGPT)</label>
                <input 
                  type="password" 
                  name="openaiApiKey"
                  value={settings.openaiApiKey}
                  onChange={handleChange}
                  placeholder="sk-..."
                />
              </div>

              <div className="config-field">
                <label>Anthropic API Key (Claude)</label>
                <input 
                  type="password" 
                  name="anthropicApiKey"
                  value={settings.anthropicApiKey}
                  onChange={handleChange}
                  placeholder="sk-ant-..."
                />
              </div>

              <div className="config-field">
                <label>Trello API Key</label>
                <input 
                  type="password" 
                  name="trelloApiKey"
                  value={settings.trelloApiKey}
                  onChange={handleChange}
                  placeholder="Clé développeur Trello"
                />
              </div>

              <div className="config-field">
                <label>Trello Token</label>
                <input 
                  type="password" 
                  name="trelloToken"
                  value={settings.trelloToken}
                  onChange={handleChange}
                  placeholder="Token serveur Trello"
                />
              </div>

              <div className="config-field">
                <label>GitHub Personal Access Token</label>
                <input 
                  type="password" 
                  name="githubToken"
                  value={settings.githubToken}
                  onChange={handleChange}
                  placeholder="ghp_..."
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || saving}>
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
