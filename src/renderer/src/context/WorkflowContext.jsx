import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNodesState, useEdgesState, addEdge } from 'reactflow'
import { getModuleByType } from '../data/moduleDefinitions'

const WorkflowContext = createContext()

let nodeIdCounter = 1

export function WorkflowProvider({ children }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [workflowName, setWorkflowName] = useState('Nouveau Workflow')
  const [workflowId, setWorkflowId] = useState(null)
  const [savedWorkflows, setSavedWorkflows] = useState([])
  const reactFlowWrapper = useRef(null)

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'var(--accent)', strokeWidth: 2 }
    }, eds))
  }, [setEdges])

  const addNode = useCallback((type, position) => {
    const moduleDef = getModuleByType(type)
    if (!moduleDef) return

    const id = `node_${Date.now()}_${nodeIdCounter++}`
    const newNode = {
      id,
      type: 'customNode',
      position,
      data: {
        type: moduleDef.type,
        label: moduleDef.label,
        icon: moduleDef.icon,
        color: moduleDef.color,
        category: moduleDef.category,
        inputs: moduleDef.inputs,
        outputs: moduleDef.outputs,
        config: {},
        status: 'idle'
      }
    }

    // Set default config values
    if (moduleDef.configFields) {
      moduleDef.configFields.forEach(field => {
        newNode.data.config[field.key] = field.default
      })
    }

    setNodes((nds) => [...nds, newNode])
    return id
  }, [setNodes])

  const updateNodeConfig = useCallback((nodeId, config) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
      }
      return n
    }))
  }, [setNodes])

  const updateNodeStatus = useCallback((nodeId, status) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, status } }
      }
      return n
    }))
  }, [setNodes])

  const resetAllStatus = useCallback(() => {
    setNodes((nds) => nds.map(n => ({
      ...n, data: { ...n.data, status: 'idle' }
    })))
  }, [setNodes])

  const saveWorkflow = useCallback(async () => {
    const workflow = {
      id: workflowId || `wf_${Date.now()}`,
      name: workflowName,
      nodes: nodes.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
      updatedAt: Date.now()
    }
    if (!workflowId) {
      workflow.createdAt = Date.now()
      setWorkflowId(workflow.id)
    }
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveWorkflow(workflow)
      }
      return { ...workflow, _saved: true }
    } catch (e) {
      console.error('Save failed:', e)
      return { ...workflow, _saved: false, _error: e.message }
    }
  }, [workflowId, workflowName, nodes, edges])

  const loadWorkflow = useCallback(async (id) => {
    try {
      if (window.electronAPI) {
        const wf = await window.electronAPI.loadWorkflow(id)
        if (wf) {
          setWorkflowId(wf.id)
          setWorkflowName(wf.name || 'Sans nom')
          setNodes(wf.nodes || [])
          setEdges(wf.edges || [])
        }
      }
    } catch (e) {
      console.error('Load failed:', e)
    }
  }, [setNodes, setEdges])

  const loadDemoWorkflow = useCallback((demo) => {
    setWorkflowId(null)
    setWorkflowName(demo.name || 'Démo')
    setNodes(demo.nodes || [])
    setEdges(demo.edges || [])
  }, [setNodes, setEdges])

  const listWorkflows = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const list = await window.electronAPI.listWorkflows()
        setSavedWorkflows(list || [])
        return list
      }
    } catch (e) {
      console.error('List failed:', e)
    }
    return []
  }, [])

  const deleteWorkflow = useCallback(async (id) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.deleteWorkflow(id)
        await listWorkflows()
      }
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }, [listWorkflows])

  const clearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setWorkflowId(null)
    setWorkflowName('Nouveau Workflow')
  }, [setNodes, setEdges])

  return (
    <WorkflowContext.Provider value={{
      nodes, edges, setNodes, setEdges,
      onNodesChange, onEdgesChange, onConnect,
      workflowName, setWorkflowName,
      workflowId,
      addNode, updateNodeConfig, updateNodeStatus, resetAllStatus,
      saveWorkflow, loadWorkflow, loadDemoWorkflow,
      listWorkflows, deleteWorkflow, savedWorkflows,
      clearCanvas, reactFlowWrapper
    }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}

export default WorkflowContext
