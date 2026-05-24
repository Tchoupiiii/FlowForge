import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react'
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
    addNode, duplicateNode, reactFlowWrapper, renameNode,
    undo, redo, copySelection, pasteSelection, takeSnapshot,
    activeTabId, updateNodeConfig
  } = useWorkflow()
  const reactFlowInstance = useRef(null)

  useEffect(() => {
    if (reactFlowInstance.current && nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.current.fitView({ padding: 0.2, duration: 800 })
      }, 50)
    }
  }, [activeTabId])

  // Inject callbacks into each node's data
  const augmentedNodes = useMemo(() => {
    return nodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        onRename: (newLabel) => renameNode(n.id, newLabel),
        updateConfig: (config) => updateNodeConfig(n.id, config)
      }
    }))
  }, [nodes, renameNode, updateNodeConfig])

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

  const [clipboard, setClipboard] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      const activeTag = document.activeElement?.tagName
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const selectedNode = augmentedNodes.find(n => n.selected)
        if (selectedNode) {
          setClipboard(selectedNode)
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboard) {
          duplicateNode(clipboard)
        }
      }
      if ((e.ctrlKey || e.metaKey) && !e.repeat) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
          return // Let the user copy/paste text inside inputs
        }
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault()
            undo()
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'c':
            e.preventDefault()
            const selectedNodes = nodes.filter(n => n.selected)
            const selectedEdges = edges.filter(e => e.selected)
            if (selectedNodes.length > 0) copySelection(selectedNodes, selectedEdges)
            break
          case 'v':
            e.preventDefault()
            let position = null
            if (reactFlowInstance.current && reactFlowWrapper.current) {
              const bounds = reactFlowWrapper.current.getBoundingClientRect()
              position = reactFlowInstance.current.project({
                x: bounds.width / 2,
                y: bounds.height / 2
              })
            }
            pasteSelection(position)
            break
          default:
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, copySelection, pasteSelection, nodes, edges])

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={augmentedNodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes)
        }}
        onEdgesChange={onEdgesChange}
        onConnect={(params) => {
          takeSnapshot()
          onConnect(params)
        }}
        onNodeDragStop={() => takeSnapshot()}
        nodeTypes={nodeTypes}
        onInit={(instance) => { reactFlowInstance.current = instance }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={['Backspace', 'Delete']}
        selectionKeyCode="Shift"
        selectionMode="partial"
        selectionOnDrag={true}
        onNodesDelete={() => takeSnapshot()}
        onEdgesDelete={() => takeSnapshot()}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
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
