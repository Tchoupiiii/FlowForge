import React, { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { Loader2 } from 'lucide-react'
import { ICON_MAP, getModuleByType } from '../data/moduleDefinitions'

function CustomNode({ id, data, selected }) {
  const IconComp = ICON_MAP[data.icon]
  const statusClass = data.status || 'idle'
  const moduleDef = getModuleByType(data.type) || {}
  const inputsCount = data.inputs !== undefined ? data.inputs : (moduleDef.inputs || 0)
  const outputsCount = data.outputs !== undefined ? data.outputs : (moduleDef.outputs || 0)
  
  const excludedKeys = ['token', 'apikey', 'bottoken', 'chatid', 'password', 'webhookurl']
  const configFields = (moduleDef.configFields || []).filter(f => !excludedKeys.some(k => f.key.toLowerCase().includes(k)))
  const outputFields = moduleDef.outputFields || []
  
  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(data.label || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    setEditLabel(data.label || '')
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editLabel.trim() && editLabel !== data.label && data.onRename) {
      data.onRename(editLabel.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
    if (e.key === 'Escape') {
      setEditLabel(data.label || '')
      setIsEditing(false)
    }
  }

  // Build a config summary with variable highlighting
  let configSummary = ''
  if (data.config) {
    if (data.type === 'httpRequest' && data.config.url) {
      configSummary = data.config.url
    } else if (data.type === 'aiAgent' && data.config.userPrompt) {
      configSummary = data.config.userPrompt.substring(0, 40) + '...'
    } else if (data.type === 'phoneAgent' && data.config.userQuery) {
      configSummary = `Appelant: "${data.config.userQuery.substring(0, 35)}..."`
    } else if (data.type === 'googleCalendar' && data.config.summary) {
      configSummary = `RDV: "${data.config.summary}" (${data.config.date || 'Dyn'})`
    } else if (data.type === 'mapSearch' && data.config.query) {
      configSummary = `${data.config.query} — ${data.config.location || ''}`
    } else if (data.type === 'email' && data.config.to) {
      configSummary = data.config.to
    } else if (data.type === 'readFile' && data.config.path) {
      configSummary = data.config.path.split(/[/\\]/).pop()
    } else if (data.type === 'writeFile' && data.config.path) {
      configSummary = data.config.path.split(/[/\\]/).pop()
    } else if (data.type === 'delay' && data.config.seconds) {
      configSummary = `${data.config.seconds}s`
    } else if (data.type === 'notification' && data.config.body) {
      configSummary = data.config.body.substring(0, 40)
    } else if (data.type === 'timerCron' && data.config.interval) {
      configSummary = `${data.config.interval}s`
    } else if (data.type === 'condition' && data.config.field) {
      configSummary = `${data.config.field} ${data.config.operator || '=='} ${data.config.value || ''}`
    } else if (data.type === 'codeJs') {
      configSummary = 'JavaScript'
    } else if (data.type === 'loopForEach') {
      configSummary = `${data.config.arrayField || 'items'} ${data.config.maxIterations ? '(max: ' + data.config.maxIterations + ')' : ''}`
    }
  }

  // Render summary with variable highlighting
  const renderSummary = (text) => {
    if (!text || !text.includes('{{')) return text
    const parts = text.split(/(\{\{.+?\}\})/g)
    return parts.map((part, i) =>
      /^\{\{.+?\}\}$/.test(part)
        ? <span key={i} className="var-highlight">{part}</span>
        : part
    )
  }

  const isPhoneAgent = data.type === 'phoneAgent'
  const customStyle = isPhoneAgent 
    ? { minWidth: '180px', maxWidth: '210px', minHeight: '85px', paddingBottom: '6px' } 
    : {}

  const handleDrop = (e) => {
    if (isPhoneAgent) {
      e.preventDefault()
      e.stopPropagation()
      const files = Array.from(e.dataTransfer.files)
      const newPaths = files.map(f => f.path).filter(Boolean)
      if (newPaths.length > 0 && data.updateConfig) {
        const currentFiles = data.config?.files || []
        data.updateConfig({ files: [...currentFiles, ...newPaths] })
      }
    }
  }

  const handleDragOver = (e) => {
    if (isPhoneAgent) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div 
      className={`custom-node ${statusClass} ${selected ? 'selected' : ''}`} 
      style={customStyle}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Target (Input) Handles */}
      {inputsCount > 0 && isPhoneAgent ? (
        <div className="custom-handles-multiple">
          <Handle type="target" position={Position.Left} id="a" className="custom-handle generic-handle" style={{ background: '#64748b', top: '30%', width: '12px', height: '12px', borderRadius: '2px' }} />
          <span className="handle-label target-label" style={{ top: 'calc(30% - 6px)' }}>Déclencheur</span>
          
          <Handle type="target" position={Position.Left} id="source" className="custom-handle" style={{ background: '#ec4899', top: '70%', width: '12px', height: '12px', borderRadius: '2px' }} />
          <span className="handle-label target-label" style={{ top: 'calc(70% - 6px)' }}>Source</span>
        </div>
      ) : inputsCount > 0 && (
        <div className="custom-handles-target">
          {configFields.length > 0 ? (
            <>
              {/* Generic Input Handle */}
              <Handle
                type="target"
                position={Position.Left}
                id="a"
                className="custom-handle generic-handle"
                style={{ top: '10%', background: '#64748b', width: '12px', height: '12px', borderRadius: '2px' }}
              />
              {configFields.map((field, i) => (
                <div key={field.key} className="handle-wrapper target">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={field.key}
                    className="custom-handle"
                    style={{ top: `${((i + 1) / (configFields.length + 1)) * 80 + 20}%`, background: data.color }}
                  />
                  <span className="handle-label target-label" style={{ top: `calc(${((i + 1) / (configFields.length + 1)) * 80 + 20}% - 6px)` }}>
                    {field.label}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <Handle
              type="target"
              position={Position.Left}
              id="a"
              className="custom-handle"
              style={{ background: data.color }}
            />
          )}
        </div>
      )}

      <div className="custom-node-header">
        <div className="custom-node-icon" style={{ background: `${data.color}20`, color: data.color }}>
          {statusClass === 'running' ? <Loader2 size={18} className="spin" /> : (IconComp && <IconComp size={18} />)}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            className="node-rename-input nodrag nopan"
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 6px',
              outline: 'none',
              width: '100%',
              minWidth: '60px'
            }}
          />
        ) : (
          <span className="custom-node-label" onDoubleClick={handleDoubleClick} title="Double-clic pour renommer">{data.label}</span>
        )}
      </div>

      {configSummary && !isPhoneAgent && (
        <div className="custom-node-body">
          <span className="custom-node-summary">{renderSummary(configSummary)}</span>
        </div>
      )}

      {isPhoneAgent && (
        <div className="custom-node-body" style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', width: '100%' }}>
          <button 
            className="nodrag nopan"
            onClick={(e) => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('open-call-simulator', {
                detail: { nodeId: id, label: data.label, config: data.config }
              }))
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: '90%',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            📞 Simuler l'appel
          </button>
        </div>
      )}

      {/* Source (Output) Handles */}
      {outputsCount > 0 && data.type === 'condition' ? (
        <div className="custom-handles-multiple">
          <Handle type="source" position={Position.Right} id="true" className="custom-handle handle-true" style={{ background: '#4ade80', top: '30%' }} />
          <span className="handle-label source-label" style={{ top: 'calc(30% - 6px)', color: '#4ade80' }}>Vrai</span>
          <Handle type="source" position={Position.Right} id="false" className="custom-handle handle-false" style={{ background: '#f87171', top: '70%' }} />
          <span className="handle-label source-label" style={{ top: 'calc(70% - 6px)', color: '#f87171' }}>Faux</span>
        </div>
      ) : outputsCount > 0 ? (
        <div className="custom-handles-source">
          {outputFields.length > 0 ? (
            <>
              {/* Generic Output Handle */}
              <Handle
                type="source"
                position={Position.Right}
                id="a"
                className="custom-handle generic-handle"
                style={{ top: '10%', background: '#64748b', width: '12px', height: '12px', borderRadius: '2px' }}
              />
              {outputFields.map((field, i) => (
                <div key={field.key} className="handle-wrapper source">
                  <span className="handle-label source-label" style={{ top: `calc(${((i + 1) / (outputFields.length + 1)) * 80 + 20}% - 6px)` }}>
                    {field.label}
                  </span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={field.key}
                    className="custom-handle"
                    style={{ top: `${((i + 1) / (outputFields.length + 1)) * 80 + 20}%`, background: data.color }}
                  />
                </div>
              ))}
            </>
          ) : (
            <Handle
              type="source"
              position={Position.Right}
              id="a"
              className="custom-handle"
              style={{ background: data.color }}
            />
          )}
        </div>
      ) : null}
    </div>
  )
}

export default memo(CustomNode)
