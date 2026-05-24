import React, { useState, useEffect } from 'react'
import { X, Save, Key, Eye, EyeOff } from 'lucide-react'
import { useToast } from './ToastProvider'

function PasswordField({ name, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="settings-field">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input 
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ paddingRight: '42px' }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            display: 'flex'
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

import { useTheme } from '../context/ThemeContext'

export default function SettingsModal({ onClose }) {
  const toast = useToast()
  const { changeTheme } = useTheme()
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    anthropicApiKey: '',
    trelloApiKey: '',
    trelloToken: '',
    githubToken: '',
    defaultSaveOutputs: false,
    theme: 'dark'
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
          githubToken: data.githubToken || '',
          defaultSaveOutputs: data.defaultSaveOutputs || false,
          theme: data.theme || 'dark'
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

  const handleThemeChange = (e) => {
    const nextTheme = e.target.value
    setSettings(prev => ({ ...prev, theme: nextTheme }))
    changeTheme(nextTheme)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (window.electronAPI && window.electronAPI.setSettings) {
        await window.electronAPI.setSettings(settings)
      }
      toast.success('Paramètres sauvegardés', 'Vos clés API et préférences ont été enregistrées.')
    } catch (e) {
      toast.error('Erreur', 'Impossible de sauvegarder les paramètres.')
    }
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><Key size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />Paramètres Globaux</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
            Configurez vos clés API par défaut et le thème de votre espace de travail.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Chargement...</div>
          ) : (
            <div className="settings-grid">
              <PasswordField name="openaiApiKey" label="OpenAI API Key (ChatGPT)" value={settings.openaiApiKey} onChange={handleChange} placeholder="sk-..." />
              <PasswordField name="anthropicApiKey" label="Anthropic API Key (Claude)" value={settings.anthropicApiKey} onChange={handleChange} placeholder="sk-ant-..." />
              <PasswordField name="trelloApiKey" label="Trello API Key" value={settings.trelloApiKey} onChange={handleChange} placeholder="Clé développeur Trello" />
              <PasswordField name="trelloToken" label="Trello Token" value={settings.trelloToken} onChange={handleChange} placeholder="Token serveur Trello" />
              <PasswordField name="githubToken" label="GitHub Personal Access Token" value={settings.githubToken} onChange={handleChange} placeholder="ghp_..." />
              
              <div className="settings-field">
                <label>Thème de l'interface</label>
                <select 
                  name="theme" 
                  value={settings.theme} 
                  onChange={handleThemeChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text)',
                    outline: 'none',
                    marginTop: '4px'
                  }}
                >
                  <option value="dark">Sombre (Défaut)</option>
                  <option value="light">Clair</option>
                  <option value="mono">Noir & Gris (Monochrome)</option>
                  <option value="cyberpunk">Cyberpunk (Néon)</option>
                  <option value="ocean">Océan (Lagune)</option>
                  <option value="forest">Forêt (Nature)</option>
                  <option value="dracula">Dracula (Vampire)</option>
                  <option value="sakura">Sakura (Cerisier)</option>
                </select>
              </div>

              <div className="settings-field" style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none', color: 'var(--text)', fontSize: '13px' }}>
                  <input 
                    type="checkbox" 
                    name="defaultSaveOutputs" 
                    checked={settings.defaultSaveOutputs || false} 
                    onChange={e => setSettings(prev => ({ ...prev, defaultSaveOutputs: e.target.checked }))} 
                    style={{ width: '16px', height: '16px' }}
                  />
                  Sauvegarde par défaut (Activer l'option de sauvegarde de résultat pour les nouveaux modules)
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading || saving}>
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}

