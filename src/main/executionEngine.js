import { getModuleExecutor } from './modules/index.js'

/**
 * Interpolate {{input.xxx}} variables in a string
 * Supports nested paths like {{input.data.name}} and array access like {{input.items[0]}}
 */
function getCaseInsensitive(obj, key) {
  if (!obj || typeof obj !== 'object') return undefined;
  const lowerKey = key.toLowerCase();
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase() === lowerKey) return obj[k];
  }
  return undefined;
}

function getNestedValue(data, key) {
  const trimmedKey = key.trim()
  const cleanKey = trimmedKey.startsWith('input.') ? trimmedKey.slice(6) : trimmedKey
  if (cleanKey.toLowerCase() === 'input') return data
  
  const parts = cleanKey.replace(/\[(\d+)\]/g, '.$1').split('.')
  let value = data
  for (const part of parts) {
    if (value === null || value === undefined) return undefined
    value = getCaseInsensitive(value, part)
  }
  return value
}

function interpolate(template, data) {
  if (!data || typeof template !== 'string') return template
  return template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
    const value = getNestedValue(data, key)
    if (value === null || value === undefined) return match // Return original tag if not found
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}

function interpolateConfig(config, inputData) {
  if (!inputData || !config) return config
  const result = {}
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      // Check for EXACT match to preserve types (e.g. array/object injection)
      const exactMatch = value.match(/^\{\{(.+?)\}\}$/)
      if (exactMatch) {
        const rawVal = getNestedValue(inputData, exactMatch[1])
        result[key] = rawVal !== undefined ? rawVal : value
      } else {
        result[key] = interpolate(value, inputData)
      }
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
    const { nodes, edges, globalSettings = {} } = workflow
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
        let rawConfig = node.data?.config || {}
        
        // --- Injection des paramètres globaux ---
        if (globalSettings) {
          if (!rawConfig.apiKey && globalSettings.openaiKey && ['openAiChat', 'aiAgent', 'aiTextAnalyzer', 'aiClassifier', 'aiImageGenerator'].includes(moduleType)) {
            rawConfig.apiKey = globalSettings.openaiKey
          }
          if (!rawConfig.botToken && globalSettings.telegramToken && ['telegramSend', 'telegramTrigger'].includes(moduleType)) {
            rawConfig.botToken = globalSettings.telegramToken
          }
          if (!rawConfig.webhookUrl && globalSettings.discordUrl && moduleType === 'discordWebhook') {
            rawConfig.webhookUrl = globalSettings.discordUrl
          }
          if (!rawConfig.token && globalSettings.githubToken && ['githubRepoInfo', 'githubCreateIssue'].includes(moduleType)) {
            rawConfig.token = globalSettings.githubToken
          }
        }

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
            
            // Standard data merging for {{input.xxx}} usage
            inputData = { ...inputData, ...results[pe.source] }
          }
        }

        if (wasSkipped || results[nodeId]?._skipped) continue

        onProgress(nodeId, 'running', { message: `Exécution de ${label}...` })

        // ★ INTERPOLATE all {{input.xxx}} variables in config before executing
        let config = interpolateConfig(rawConfig, inputData)

        if (!executor) {
          // Trigger nodes just pass through
          if (moduleType === 'triggerManual') {
            results[nodeId] = { triggered: true, trigger: true, timestamp: Date.now() }
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

          // Pass all upstream data downstream to allow global interpolation
          results[nodeId] = { ...inputData, ...result }
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
          break // STOP execution on error
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
