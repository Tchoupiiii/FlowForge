import React from 'react'
import { X, BookOpen, Settings, FileText, Lightbulb } from 'lucide-react'
import { ICON_MAP } from '../data/moduleDefinitions'

export default function HelpPanel({ module, onClose }) {
  if (!module) return null

  const Icon = ICON_MAP[module.icon]
  const help = module.help || {}

  return (
    <div className="help-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="help-panel slide-in-right">
        <div className="help-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div className="config-panel-icon" style={{ background: `${module.color}20`, color: module.color }}>
              {Icon && <Icon size={22} />}
            </div>
            <div>
              <h2>Aide — {module.label}</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{module.category === 'ai' ? 'Intelligence Artificielle' : module.category === 'map' ? 'Carte' : 'Core'}</span>
            </div>
          </div>
          <button className="help-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="help-panel-body">
          {help.description && (
            <div className="help-section">
              <div className="help-section-title">
                <BookOpen size={16} />
                <span>Description</span>
              </div>
              <p className="help-section-content">{help.description}</p>
            </div>
          )}

          {module.configFields && module.configFields.length > 0 && (
            <div className="help-section">
              <div className="help-section-title">
                <Settings size={16} />
                <span>Configuration</span>
              </div>
              <div className="help-config-list">
                {module.configFields.map(field => (
                  <div key={field.key} className="help-config-item">
                    <span className="help-config-key">{field.label}</span>
                    <span className="help-config-type">{field.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {help.example && (
            <div className="help-section">
              <div className="help-section-title">
                <FileText size={16} />
                <span>Exemple</span>
              </div>
              <pre className="help-example">{help.example}</pre>
            </div>
          )}

          {help.tip && (
            <div className="help-section help-tip-section">
              <div className="help-section-title">
                <Lightbulb size={16} />
                <span>Astuce</span>
              </div>
              <p className="help-tip">{help.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
