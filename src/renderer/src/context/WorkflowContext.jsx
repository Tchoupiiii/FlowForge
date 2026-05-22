import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useNodesState, useEdgesState, addEdge } from 'reactflow'
import { getModuleByType } from '../data/moduleDefinitions'

const WorkflowContext = createContext()

let nodeIdCounter = 1

export function WorkflowProvider({ children }) {
  // Global ReactFlow state for the CURRENTLY ACTIVE tab
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  // Tab Management State
  // A tab has: tabId, workflowId, workflowName, nodes, edges
  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('flowforge_tabs')
      if (saved) return JSON.parse(saved)
    } catch(e) {}
    return [{ tabId: 'tab_1', workflowId: null, workflowName: 'Nouveau Workflow', nodes: [], edges: [] }]
  })
  const [activeTabId, setActiveTabId] = useState(() => {
    return localStorage.getItem('flowforge_active_tab') || 'tab_1'
  })

  useEffect(() => {
    localStorage.setItem('flowforge_tabs', JSON.stringify(tabs))
  }, [tabs])

  useEffect(() => {
    localStorage.setItem('flowforge_active_tab', activeTabId)
  }, [activeTabId])
  
  const [savedWorkflows, setSavedWorkflows] = useState([])
  const [modulePreferences, setModulePreferences] = useState({})
  const reactFlowWrapper = useRef(null)

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getSettings) {
      window.electronAPI.getSettings().then(data => {
        setModulePreferences({
          defaultSaveOutputs: data.defaultSaveOutputs || false
        })
      }).catch(e => console.error("Error loading module preferences", e))
    }
  }, [])

  // When activeTabId changes, load its nodes/edges into ReactFlow
  useEffect(() => {
    const activeTab = tabs.find(t => t.tabId === activeTabId)
    if (activeTab) {
      setNodes(activeTab.nodes || [])
      setEdges(activeTab.edges || [])
    }
  }, [activeTabId]) // deliberately NOT depending on tabs, only run on tab switch

  // When nodes/edges change in ReactFlow, we need to sync them back to the active tab
  // We do this by updating the tabs array.
  useEffect(() => {
    setTabs(prevTabs => prevTabs.map(t => 
      t.tabId === activeTabId 
        ? { ...t, nodes, edges } 
        : t
    ))
  }, [nodes, edges, activeTabId])

  // Helper to get active tab metadata
  const activeTab = tabs.find(t => t.tabId === activeTabId) || tabs[0]
  const workflowName = activeTab.workflowName
  const workflowId = activeTab.workflowId

  const setWorkflowName = useCallback((name) => {
    setTabs(prev => prev.map(t => t.tabId === activeTabId ? { ...t, workflowName: name } : t))
  }, [activeTabId])

  const setWorkflowId = useCallback((id) => {
    setTabs(prev => prev.map(t => t.tabId === activeTabId ? { ...t, workflowId: id } : t))
  }, [activeTabId])

  // --- TAB MANAGEMENT ---
  const createNewTab = useCallback(() => {
    const newTabId = `tab_${Date.now()}`
    setTabs(prev => [...prev, {
      tabId: newTabId,
      workflowId: null,
      workflowName: 'Nouveau Workflow',
      nodes: [],
      edges: []
    }])
    setActiveTabId(newTabId)
  }, [])

  const closeTab = useCallback((tabIdToClose) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.tabId !== tabIdToClose)
      if (newTabs.length === 0) {
        // Always keep at least one tab
        const defaultTab = { tabId: `tab_${Date.now()}`, workflowId: null, workflowName: 'Nouveau Workflow', nodes: [], edges: [] }
        setActiveTabId(defaultTab.tabId)
        return [defaultTab]
      }
      if (activeTabId === tabIdToClose) {
        setActiveTabId(newTabs[newTabs.length - 1].tabId)
      }
      return newTabs
    })
  }, [activeTabId])

  const switchTab = useCallback((tabId) => {
    setActiveTabId(tabId)
  }, [])

  // --- REACT FLOW HELPERS ---
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

    if (moduleDef.configFields) {
      moduleDef.configFields.forEach(field => {
        newNode.data.config[field.key] = field.default
      })
    }

    // Apply module preferences
    if (modulePreferences.defaultSaveOutputs) {
      newNode.data.config.saveOutputs = true
    }

    setNodes((nds) => [...nds, newNode])
    return id
  }, [setNodes, modulePreferences])

  const duplicateNode = useCallback((nodeToDuplicate) => {
    if (!nodeToDuplicate) return

    const id = `node_${Date.now()}_${nodeIdCounter++}`
    const newNode = {
      id,
      type: 'customNode',
      position: {
        x: nodeToDuplicate.position.x + 30,
        y: nodeToDuplicate.position.y + 30
      },
      data: {
        ...JSON.parse(JSON.stringify(nodeToDuplicate.data)),
        status: 'idle'
      }
    }

    setNodes((nds) => [...nds, newNode])
    // Deselect all other nodes and select the new one
    setNodes((nds) => nds.map(n => ({
      ...n,
      selected: n.id === newNode.id
    })))
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

  const renameNode = useCallback((nodeId, newLabel) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, label: newLabel } }
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

  // --- WORKFLOW IO ---
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
  }, [workflowId, workflowName, nodes, edges, setWorkflowId])

  const loadWorkflow = useCallback(async (id) => {
    try {
      if (window.electronAPI) {
        const wf = await window.electronAPI.loadWorkflow(id)
        if (wf) {
          // Si l'onglet actuel est vide, on le remplace, sinon on ouvre un nouvel onglet
          const isTabEmpty = nodes.length === 0 && !workflowId
          if (isTabEmpty) {
            setWorkflowId(wf.id)
            setWorkflowName(wf.name || 'Sans nom')
            setNodes(wf.nodes || [])
            setEdges(wf.edges || [])
          } else {
            const newTabId = `tab_${Date.now()}`
            setTabs(prev => [...prev, {
              tabId: newTabId,
              workflowId: wf.id,
              workflowName: wf.name || 'Sans nom',
              nodes: wf.nodes || [],
              edges: wf.edges || []
            }])
            setActiveTabId(newTabId)
          }
        }
      }
    } catch (e) {
      console.error('Load failed:', e)
    }
  }, [nodes, workflowId, setWorkflowId, setWorkflowName, setNodes, setEdges])

  const loadDemoWorkflow = useCallback((demo) => {
    const isTabEmpty = nodes.length === 0 && !workflowId
    if (isTabEmpty) {
      setWorkflowId(null)
      setWorkflowName(demo.name || 'Démo')
      setNodes(demo.nodes || [])
      setEdges(demo.edges || [])
    } else {
      const newTabId = `tab_${Date.now()}`
      setTabs(prev => [...prev, {
        tabId: newTabId,
        workflowId: null,
        workflowName: demo.name || 'Démo',
        nodes: demo.nodes || [],
        edges: demo.edges || []
      }])
      setActiveTabId(newTabId)
    }
  }, [nodes, workflowId, setWorkflowId, setWorkflowName, setNodes, setEdges])

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
    createNewTab()
  }, [createNewTab])

  return (
    <WorkflowContext.Provider value={{
      tabs, activeTabId, createNewTab, closeTab, switchTab,
      nodes, edges, setNodes, setEdges,
      onNodesChange, onEdgesChange, onConnect,
      workflowName, setWorkflowName,
      workflowId,
      addNode, duplicateNode, updateNodeConfig, updateNodeStatus, resetAllStatus, renameNode,
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
