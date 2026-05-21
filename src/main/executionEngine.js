import { getModuleExecutor } from './modules/index.js'

/**
 * Interpolate {{input.xxx}} variables in a string
 * Supports nested paths like {{input.data.name}} and array access like {{input.items[0]}}
 */
function interpolate(template, data) {
  if (!data || typeof template !== 'string') return template
  return template.replace(/\{\{(.+?)\}\}/g, (_match, key) => {
    const trimmedKey = key.trim()
    // Support "input.xxx" or just "xxx"
    const cleanKey = trimmedKey.startsWith('input.') ? trimmedKey.slice(6) : trimmedKey
    
    if (cleanKey === 'input' || trimmedKey === 'input') {
      // {{input}} = the whole input object
      return typeof data === 'object' ? JSON.stringify(data) : String(data)
    }
    
    // Navigate nested paths (supports dots and brackets)
    const parts = cleanKey.replace(/\[(\d+)\]/g, '.$1').split('.')
    let value = data
    for (const part of parts) {
      if (value === null || value === undefined) return ''
      value = value[part]
    }
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}

/**
 * Deep-interpolate all string values in a config object
 */
function interpolateConfig(config, inputData) {
  if (!inputData || !config) return config
  const result = {}
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      result[key] = interpolate(value, inputData)
    } else {
      result[key] = value
    }
  }
  return result
}

export class ExecutionEngine {
  constructor() {
    this.isRunning = false
    this.shouldStop = false
  }

  stop() {
    this.shouldStop = true
  }

  async execute(workflow, onProgress) {
    this.isRunning = true
    this.shouldStop = false
    const { nodes, edges } = workflow
    const results = {}

    try {
      // Build adjacency and in-degree maps
      const adjacency = {}
      const inDegree = {}

      nodes.forEach(n => {
        adjacency[n.id] = []
        inDegree[n.id] = 0
      })

      edges.forEach(e => {
        if (adjacency[e.source]) {
          adjacency[e.source].push({
            target: e.target,
            sourceHandle: e.sourceHandle || null
          })
        }
        if (inDegree[e.target] !== undefined) {
          inDegree[e.target]++
        }
      })

      // Topological sort (Kahn's algorithm)
      const queue = []
      nodes.forEach(n => {
        if (inDegree[n.id] === 0) queue.push(n.id)
      })

      const sortedIds = []
      while (queue.length > 0) {
        const current = queue.shift()
        sortedIds.push(current)
        for (const neighbor of adjacency[current]) {
          inDegree[neighbor.target]--
          if (inDegree[neighbor.target] === 0) {
            queue.push(neighbor.target)
          }
        }
      }

      // Add any remaining nodes (handles disconnected nodes)
      nodes.forEach(n => {
        if (!sortedIds.includes(n.id)) sortedIds.push(n.id)
      })

      // Execute nodes in topological order
      for (const nodeId of sortedIds) {
        if (this.shouldStop) {
          onProgress(nodeId, 'skipped', { message: 'Exécution arrêtée' })
          continue
        }

        const node = nodes.find(n => n.id === nodeId)
        if (!node) continue
        const moduleType = node.data?.type || node.type
        const executor = getModuleExecutor(moduleType)
        const rawConfig = node.data?.config || {}
        const label = node.data?.label || moduleType

        // Gather input data from parent nodes
        let inputData = {}
        const parentEdges = edges.filter(e => e.target === nodeId)
        let wasSkipped = false

        for (const pe of parentEdges) {
          if (results[pe.source]) {
            // If condition node, check which branch
            const sourceNode = nodes.find(n => n.id === pe.source)
            if (sourceNode && (sourceNode.type === 'condition' || sourceNode.data?.type === 'condition')) {
              const condResult = results[pe.source]
              const branch = pe.sourceHandle
              if (branch === 'false' && condResult.result === true) {
                onProgress(nodeId, 'skipped', { message: 'Branche non prise (condition vraie)' })
                results[nodeId] = { _skipped: true }
                wasSkipped = true
                break
              }
              if (branch === 'true' && condResult.result === false) {
                onProgress(nodeId, 'skipped', { message: 'Branche non prise (condition fausse)' })
                results[nodeId] = { _skipped: true }
                wasSkipped = true
                break
              }
            }
            if (results[pe.source]._skipped) {
              results[nodeId] = { _skipped: true }
              onProgress(nodeId, 'skipped', { message: 'Parent ignoré' })
              wasSkipped = true
              break
            }
            inputData = { ...inputData, ...results[pe.source] }
          }
        }

        if (wasSkipped || results[nodeId]?._skipped) continue

        onProgress(nodeId, 'running', { message: `Exécution de ${label}...` })

        // ★ INTERPOLATE all {{input.xxx}} variables in config before executing
        const config = interpolateConfig(rawConfig, inputData)

        if (!executor) {
          // Trigger nodes just pass through
          if (moduleType === 'triggerManual') {
            results[nodeId] = { triggered: true, timestamp: Date.now() }
            onProgress(nodeId, 'success', {
              message: 'Workflow déclenché',
              data: results[nodeId]
            })
            continue
          }
          onProgress(nodeId, 'error', { message: `Module inconnu: ${moduleType}` })
          results[nodeId] = { error: `Module inconnu: ${moduleType}` }
          continue
        }

        try {
          const startTime = Date.now()
          const result = await executor(config, inputData)
          const duration = Date.now() - startTime

          results[nodeId] = result
          onProgress(nodeId, 'success', {
            message: `Terminé en ${duration}ms`,
            data: result,
            duration
          })
        } catch (error) {
          results[nodeId] = { error: error.message }
          onProgress(nodeId, 'error', {
            message: `Erreur: ${error.message}`,
            error: error.message
          })
        }
      }

      this.isRunning = false
      return { success: true, results }
    } catch (error) {
      this.isRunning = false
      return { success: false, error: error.message, results }
    }
  }
}

export default ExecutionEngine
