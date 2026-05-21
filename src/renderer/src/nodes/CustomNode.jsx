import React, { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { ICON_MAP, getModuleByType } from '../data/moduleDefinitions'

function CustomNode({ data, selected }) {
  const IconComp = ICON_MAP[data.icon]
  const statusClass = data.status || 'idle'
  const moduleDef = getModuleByType(data.type) || {}
  const inputsCount = data.inputs !== undefined ? data.inputs : (moduleDef.inputs || 0)
  const outputsCount = data.outputs !== undefined ? data.outputs : (moduleDef.outputs || 0)
  
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

  return (
    <div className={`custom-node ${statusClass} ${selected ? 'selected' : ''}`}>
      {/* Input handle */}
      {inputsCount > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="custom-handle"
          style={{ background: data.color }}
        />
      )}

      <div className="custom-node-header">
        <div className="custom-node-icon" style={{ background: `${data.color}20`, color: data.color }}>
          {IconComp && <IconComp size={18} />}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            className="node-rename-input"
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

      {configSummary && (
        <div className="custom-node-body">
          <span className="custom-node-summary">{renderSummary(configSummary)}</span>
        </div>
      )}

      {/* Output handles */}
      {outputsCount === 1 && (
        <Handle
          type="source"
          position={Position.Right}
          className="custom-handle"
          style={{ background: data.color }}
        />
      )}

      {outputsCount === 2 && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="custom-handle handle-true"
            style={{ background: '#4ade80', top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="custom-handle handle-false"
            style={{ background: '#f87171', top: '70%' }}
          />
        </>
      )}
    </div>
  )
}

export default memo(CustomNode)
