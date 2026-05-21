import React, { useCallback, useRef } from 'react'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import { useWorkflow } from '../context/WorkflowContext'
import CustomNode from '../nodes/CustomNode'

const nodeTypes = { customNode: CustomNode }

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'var(--accent)', strokeWidth: 2 }
}

export default function Canvas({ onNodeSelect, onContextMenu }) {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    addNode, reactFlowWrapper
  } = useWorkflow()
  const reactFlowInstance = useRef(null)

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/flowforge-node')
    if (!type || !reactFlowInstance.current) return

    const bounds = reactFlowWrapper.current?.getBoundingClientRect()
    const position = reactFlowInstance.current.project({
      x: e.clientX - (bounds?.left || 0),
      y: e.clientY - (bounds?.top || 0)
    })

    addNode(type, position)
  }, [addNode, reactFlowWrapper])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onNodeClick = useCallback((_e, node) => {
    if (onNodeSelect) onNodeSelect(node)
  }, [onNodeSelect])

  const onPaneClick = useCallback(() => {
    if (onNodeSelect) onNodeSelect(null)
  }, [onNodeSelect])

  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault()
    if (onContextMenu) {
      onContextMenu({ x: event.clientX, y: event.clientY, type: 'node', nodeId: node.id })
    }
  }, [onContextMenu])

  const handlePaneContextMenu = useCallback((event) => {
    event.preventDefault()
    if (onContextMenu) {
      onContextMenu({ x: event.clientX, y: event.clientY, type: 'canvas' })
    }
  }, [onContextMenu])

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => { reactFlowInstance.current = instance }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        className="flow-canvas"
      >
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="var(--text-muted)"
          style={{ opacity: 0.3 }}
        />
        <Controls
          className="flow-controls"
          showInteractive={false}
        />
        <MiniMap
          className="flow-minimap"
          nodeColor={(n) => n.data?.color || 'var(--accent)'}
          maskColor="var(--bg-primary-alpha)"
          style={{ borderRadius: 12 }}
        />
      </ReactFlow>
    </div>
  )
}
