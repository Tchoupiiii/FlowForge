import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { ICON_MAP, getModuleByType } from '../data/moduleDefinitions'

function CustomNode({ data, selected }) {
  const IconComp = ICON_MAP[data.icon]
  const statusClass = data.status || 'idle'
  const moduleDef = getModuleByType(data.type) || {}
  const inputsCount = data.inputs !== undefined ? data.inputs : (moduleDef.inputs || 0)
  const outputsCount = data.outputs !== undefined ? data.outputs : (moduleDef.outputs || 0)

  // Build a config summary to show in the node body
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
    }
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
        <span className="custom-node-label">{data.label}</span>
      </div>

      {configSummary && (
        <div className="custom-node-body">
          <span className="custom-node-summary">{configSummary}</span>
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
