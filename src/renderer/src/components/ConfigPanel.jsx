import React from 'react'
import { X, HelpCircle, MessageCircleQuestion } from 'lucide-react'
import { getModuleByType, ICON_MAP } from '../data/moduleDefinitions'
import { useWorkflow } from '../context/WorkflowContext'
import MapView from './MapView'

export default function ConfigPanel({ node, onShowHelp, onClose }) {
  const { updateNodeConfig } = useWorkflow()
  const [ollamaModels, setOllamaModels] = React.useState([])
  const [ollamaError, setOllamaError] = React.useState(false)

  React.useEffect(() => {
    // If the node has a provider field set to ollama, try to fetch models
    const checkOllama = async () => {
      const providerField = node?.data?.type ? getModuleByType(node.data.type)?.configFields?.find(f => f.key === 'provider') : null;
      const providerValue = node?.data?.config?.provider !== undefined ? node.data.config.provider : (providerField?.default);
      
      if (providerValue === 'ollama') {
        try {
          if (window.electronAPI && window.electronAPI.getOllamaModels) {
            const data = await window.electronAPI.getOllamaModels()
            if (data.success) {
              setOllamaModels(data.models?.map(m => m.name) || [])
              setOllamaError(false)
            } else {
              throw new Error('API locale non disponible')
            }
          } else {
            // Fallback
            setOllamaModels([])
          }
        } catch (e) {
          setOllamaError(true)
        }
      }
    }
    checkOllama()
  }, [node?.data?.config?.provider])

  if (!node) return null

  const moduleDef = getModuleByType(node.data?.type)
  if (!moduleDef) return null

  const Icon = ICON_MAP[moduleDef.icon]
  const config = node.data?.config || {}

  const handleChange = (key, value) => {
    let updates = { [key]: value }

    // Extension automatique
    if (key === 'format' && (node.data?.type === 'readFile' || node.data?.type === 'writeFile')) {
      if (config.path && typeof config.path === 'string') {
        const parts = config.path.split('.')
        if (parts.length > 1) {
          parts.pop() // remove old extension
          updates.path = `${parts.join('.')}.${value === 'text' ? 'txt' : value}`
        } else {
          updates.path = `${config.path}.${value === 'text' ? 'txt' : value}`
        }
      }
    }

    updateNodeConfig(node.id, updates)
  }


  const renderField = (field) => {
    const value = config[field.key] !== undefined ? config[field.key] : field.default

    switch (field.type) {
      case 'text':
      case 'password':
        // Special logic for dynamic ollama model field
        const providerField = moduleDef.configFields?.find(f => f.key === 'provider');
        const providerValue = config.provider !== undefined ? config.provider : (providerField?.default);
        
        if (field.key === 'model' && providerValue === 'ollama') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <select
                className="config-select"
                value={value || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              >
                <option value="">-- Sélectionnez un modèle Ollama --</option>
                {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {ollamaError && <span style={{ fontSize: '11px', color: 'var(--danger)' }}>Erreur: Ollama introuvable (local)</span>}
            </div>
          )
        }
        return (
          <input
            type={field.type}
            className="config-input"
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.default || ''}
          />
        )
      case 'number':
        return (
          <input
            type="number"
            className="config-input"
            value={value || ''}
            onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
          />
        )
      case 'select':
        return (
          <select
            className="config-select"
            value={value || field.default || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          >
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'textarea':
      case 'code':
        return (
          <textarea
            className={`config-textarea ${field.type === 'code' ? 'config-code' : ''}`}
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            rows={field.type === 'code' ? 6 : 3}
            placeholder={field.default || ''}
            spellCheck={false}
          />
        )
      default:
        return (
          <input
            type="text"
            className="config-input"
            value={value || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        )
    }
  }

  return (
    <div className="config-panel slide-in-right">
      <div className="config-panel-header">
        <div className="config-panel-title">
          <div className="config-panel-icon" style={{ background: `${moduleDef.color}20`, color: moduleDef.color }}>
            {Icon && <Icon size={20} />}
          </div>
          <span>{moduleDef.label}</span>
        </div>
        <div className="config-panel-actions">
          <button className="config-panel-action-btn" onClick={() => onShowHelp(moduleDef)} title="Aide sur ce module">
            <MessageCircleQuestion size={18} />
          </button>
          <button className="config-panel-action-btn" onClick={onClose} title="Fermer">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="config-panel-body">
        {moduleDef.configFields && moduleDef.configFields.length > 0 ? (
          moduleDef.configFields
            .filter(field => {
              if (typeof field.showIf === 'function') {
                return field.showIf(config)
              }
              return true
            })
            .map(field => (
            <div key={field.key} className="config-field">
              <label className="config-field-label">{field.label}</label>
              {renderField(field)}
            </div>
          ))
        ) : (
          <div className="config-empty">
            <p>Aucune configuration requise pour ce module.</p>
          </div>
        )}

        {node.data?.type === 'mapSearch' && (
          <div className="config-map-section">
            <label className="config-field-label">Aperçu de la carte</label>
            <MapView
              query={config.query}
              location={config.location}
              radius={config.radius}
            />
          </div>
        )}

        {moduleDef.help && (
          <details className="config-help-section" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <summary style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', cursor: 'pointer', userSelect: 'none' }}>Aide & Exemples</summary>
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.5' }}>{moduleDef.help.description}</p>
              {moduleDef.help.example && (
                <div style={{ background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Exemple</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{moduleDef.help.example}</span>
                </div>
              )}
              {moduleDef.help.tip && (
                <div style={{ background: 'rgba(124, 107, 240, 0.1)', borderLeft: '3px solid var(--accent)', padding: '8px 12px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Astuce</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text)' }}>{moduleDef.help.tip}</span>
                </div>
              )}
            </div>
          </details>
        )}

        <details className="config-variables-section" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
          <summary style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', cursor: 'pointer', userSelect: 'none' }}>Variables Dynamiques</summary>
          <div style={{ marginTop: '10px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.5' }}>
              Vous pouvez injecter les données des nœuds précédents (parents) dans n'importe quel champ de texte en utilisant les doubles accolades <code style={{background: 'var(--bg-surface-2)', padding: '2px 4px', borderRadius: '4px'}}>{"{{variable}}"}</code>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: '6px 10px', borderRadius: '4px' }}>
                <code style={{ fontSize: '11.5px', color: 'var(--accent)' }}>{"{{price}}"}</code>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bourse (Finance)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: '6px 10px', borderRadius: '4px' }}>
                <code style={{ fontSize: '11.5px', color: 'var(--accent)' }}>{"{{text}}"}</code>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lire un Fichier / Extraction web</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: '6px 10px', borderRadius: '4px' }}>
                <code style={{ fontSize: '11.5px', color: 'var(--accent)' }}>{"{{content}}"}</code>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Requête HTTP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)', padding: '6px 10px', borderRadius: '4px' }}>
                <code style={{ fontSize: '11.5px', color: 'var(--accent)' }}>{"{{message}}"}</code>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ollama / OpenAI</span>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
