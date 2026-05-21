import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs'

const workflowsDir = join(app.getPath('userData'), 'workflows')
const settingsPath = join(app.getPath('userData'), 'settings.json')

function ensureWorkflowsDir() {
  if (!existsSync(workflowsDir)) {
    mkdirSync(workflowsDir, { recursive: true })
  }
}

/**
 * Save a workflow to disk. Assigns an id and timestamps if missing.
 * @param {object} workflow - The workflow object { id?, name, description?, nodes, edges }
 * @returns {object} The saved workflow with id, createdAt, updatedAt
 */
export function save(workflow) {
  ensureWorkflowsDir()

  const now = new Date().toISOString()
  const id = workflow.id || `wf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Check if workflow already exists (update case)
  const filePath = join(workflowsDir, `${id}.json`)
  let createdAt = now
  if (existsSync(filePath)) {
    try {
      const existing = JSON.parse(readFileSync(filePath, 'utf-8'))
      createdAt = existing.createdAt || now
    } catch {
      // If existing file is corrupt, treat as new
    }
  }

  const record = {
    id,
    name: workflow.name || 'Untitled Workflow',
    description: workflow.description || '',
    nodes: workflow.nodes || [],
    edges: workflow.edges || [],
    createdAt,
    updatedAt: now
  }

  writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8')
  return record
}

/**
 * Load a workflow by id.
 * @param {string} id - The workflow id
 * @returns {object|null} The workflow object or null if not found
 */
export function load(id) {
  ensureWorkflowsDir()

  const filePath = join(workflowsDir, `${id}.json`)
  if (!existsSync(filePath)) {
    return null
  }

  try {
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * List all saved workflows (metadata only: id, name, description, createdAt, updatedAt).
 * @returns {object[]} Array of workflow summaries
 */
export function list() {
  ensureWorkflowsDir()

  const files = readdirSync(workflowsDir).filter((f) => f.endsWith('.json'))
  const workflows = []

  for (const file of files) {
    try {
      const data = readFileSync(join(workflowsDir, file), 'utf-8')
      const wf = JSON.parse(data)
      workflows.push({
        id: wf.id,
        name: wf.name,
        description: wf.description,
        createdAt: wf.createdAt,
        updatedAt: wf.updatedAt,
        nodeCount: (wf.nodes || []).length,
        edgeCount: (wf.edges || []).length
      })
    } catch {
      // Skip corrupt files
    }
  }

  // Sort by updatedAt descending
  workflows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  return workflows
}

/**
 * Delete a workflow by id.
 * @param {string} id - The workflow id
 * @returns {boolean} True if deleted, false if not found
 */
export function remove(id) {
  ensureWorkflowsDir()

  const filePath = join(workflowsDir, `${id}.json`)
  if (!existsSync(filePath)) {
    return false
  }

  try {
    unlinkSync(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Save application settings to disk.
 * @param {object} settings - The settings object
 * @returns {object} The saved settings
 */
export function saveSettings(settings) {
  const existing = loadSettings()
  const merged = { ...existing, ...settings }
  writeFileSync(settingsPath, JSON.stringify(merged, null, 2), 'utf-8')
  return merged
}

/**
 * Load application settings from disk.
 * @returns {object} The settings object
 */
export function loadSettings() {
  if (!existsSync(settingsPath)) {
    return { theme: 'dark' }
  }

  try {
    const data = readFileSync(settingsPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { theme: 'dark' }
  }
}
