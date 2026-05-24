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
    // Si c'est une connexion de type variable (pas les points centraux "a" aux deux extrémités)
    if (params.targetHandle && params.sourceHandle && params.targetHandle !== 'a') {
      setNodes(nds => nds.map(n => {
        if (n.id === params.target) {
          // Compter les connexions existantes sur le même port de départ
          const existingSameHandleEdges = edges.filter(e => 
            e.target === params.target && 
            e.sourceHandle === params.sourceHandle &&
            e.source !== params.source
          )
          
          let handleName = params.sourceHandle
          if (handleName === 'a') {
            const sourceNode = nds.find(node => node.id === params.source)
            const sourceDef = sourceNode ? getModuleByType(sourceNode.data?.type) : null
            if (sourceDef && sourceDef.outputFields && sourceDef.outputFields.length > 0) {
              handleName = sourceDef.outputFields[0].key
            } else {
              handleName = 'input'
            }
          }
          
          if (existingSameHandleEdges.length > 0) {
            handleName = `${handleName}_${existingSameHandleEdges.length + 1}`
          }

          const currentVal = n.data.config?.[params.targetHandle] || ''
          const injection = `{{${handleName}}}`
          // Eviter de l'ajouter si déjà présent
          const newVal = String(currentVal).includes(injection) 
            ? currentVal 
            : `${currentVal} ${injection}`.trim()
            
          return {
            ...n,
            data: {
              ...n.data,
              config: { ...n.data.config, [params.targetHandle]: newVal }
            }
          }
        }
        return n
      }))
    }

    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'var(--accent)', strokeWidth: 2 }
    }, eds))
  }, [setEdges, setNodes, edges])

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

  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [clipboard, setClipboard] = useState({ nodes: [], edges: [] })

  const takeSnapshot = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push({ 
        nodes: JSON.parse(JSON.stringify(nodes)), 
        edges: JSON.parse(JSON.stringify(edges)) 
      })
      if (newHistory.length > 50) newHistory.shift()
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [nodes, edges, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setNodes(prev.nodes)
      setEdges(prev.edges)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex, setNodes, setEdges])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setNodes(next.nodes)
      setEdges(next.edges)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex, setNodes, setEdges])

  const copySelection = useCallback((selectedNodes, selectedEdges) => {
    setClipboard({ 
      nodes: JSON.parse(JSON.stringify(selectedNodes)), 
      edges: JSON.parse(JSON.stringify(selectedEdges)) 
    })
  }, [])

  const pasteSelection = useCallback((centerPos = null) => {
    if (clipboard.nodes.length === 0) return
    takeSnapshot()
    
    // Create mapping of old ID to new ID
    const idMap = {}
    const newNodes = clipboard.nodes.map((n, idx) => {
      const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      idMap[n.id] = newId
      // If we have centerPos, offset the first node to the center, and others relative to it
      let finalX = n.position.x + 50
      let finalY = n.position.y + 50
      
      if (centerPos) {
        if (idx === 0) {
          finalX = centerPos.x
          finalY = centerPos.y
        } else {
          // Keep relative distance from the first node
          const dx = n.position.x - clipboard.nodes[0].position.x
          const dy = n.position.y - clipboard.nodes[0].position.y
          finalX = centerPos.x + dx
          finalY = centerPos.y + dy
        }
      }

      return {
        ...n,
        id: newId,
        position: { x: finalX, y: finalY },
        selected: true
      }
    })

    const newEdges = clipboard.edges.map(e => ({
      ...e,
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target,
      selected: true
    }))

    // Deselect current
    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes))
    setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges))
  }, [clipboard, takeSnapshot, setNodes, setEdges])

  const reorganizeLayout = useCallback(() => {
    if (nodes.length === 0) return

    // Identify all nodes and build adjacency list
    const nodeMap = {}
    nodes.forEach(n => {
      nodeMap[n.id] = {
        node: n,
        incoming: [],
        outgoing: []
      }
    })

    edges.forEach(e => {
      if (nodeMap[e.source] && nodeMap[e.target]) {
        nodeMap[e.source].outgoing.push(e.target)
        nodeMap[e.target].incoming.push(e.source)
      }
    })

    // Find roots (nodes with no incoming edges)
    let roots = Object.keys(nodeMap).filter(id => nodeMap[id].incoming.length === 0)
    if (roots.length === 0 && nodes.length > 0) {
      roots = [nodes[0].id]
    }

    // Determine the rank (column) of each node using BFS
    const ranks = {}
    const queue = []

    roots.forEach(rId => {
      ranks[rId] = 0
      queue.push(rId)
    })

    while (queue.length > 0) {
      const currentId = queue.shift()
      const currentRank = ranks[currentId]

      if (nodeMap[currentId]) {
        nodeMap[currentId].outgoing.forEach(neighborId => {
          const nextRank = currentRank + 1
          if (ranks[neighborId] === undefined || nextRank > ranks[neighborId]) {
            ranks[neighborId] = nextRank
            queue.push(neighborId)
          }
        })
      }
    }

    // Handle any nodes that were not reached (isolated components)
    nodes.forEach(n => {
      if (ranks[n.id] === undefined) {
        ranks[n.id] = 0
      }
    })

    // Group nodes by rank
    const rankGroups = {}
    Object.keys(ranks).forEach(id => {
      const r = ranks[id]
      if (!rankGroups[r]) {
        rankGroups[r] = []
      }
      rankGroups[r].push(id)
    })

    // Calculate new positions
    const nodeWidthSpace = 380
    const nodeHeightSpace = 250

    const updatedNodes = nodes.map(n => {
      const rank = ranks[n.id] || 0
      const group = rankGroups[rank] || [n.id]
      const idx = group.indexOf(n.id)

      const groupHeight = (group.length - 1) * nodeHeightSpace
      const yPos = 150 + idx * nodeHeightSpace - (groupHeight / 2) + 150

      return {
        ...n,
        position: {
          x: 100 + rank * nodeWidthSpace,
          y: Math.max(50, yPos)
        }
      }
    })

    takeSnapshot()
    setNodes(updatedNodes)
  }, [nodes, edges, setNodes, takeSnapshot])

  const value = {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    tabs, activeTabId,
    workflowName, workflowId,
    setWorkflowName, setWorkflowId,
    createNewTab, closeTab, switchTab,
    savedWorkflows, saveWorkflow, loadWorkflow, deleteWorkflow, listWorkflows,
    loadDemoWorkflow, clearCanvas,
    onConnect, addNode, duplicateNode, renameNode,
    updateNodeConfig, updateNodeStatus, resetAllStatus, modulePreferences, reactFlowWrapper,
    undo, redo, takeSnapshot, copySelection, pasteSelection, reorganizeLayout
  }

  return (
    <WorkflowContext.Provider value={value}>
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
