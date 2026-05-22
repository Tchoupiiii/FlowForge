/**
 * Write File Module
 * Writes data to a file on disk in text, JSON, or CSV format.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import os from 'os'
import { resolve, dirname, isAbsolute, join } from 'path'

export default {
  meta: {
    type: 'writeFile',
    name: 'Write File',
    description: 'Write data to a file on disk as text, JSON, or CSV',
    category: 'files',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const filePath = config.path
    if (!filePath) {
      throw new Error('Write File: path is required')
    }

    let resolvedPath
    if (isAbsolute(filePath)) {
      resolvedPath = resolve(filePath)
    } else {
      try {
        const electron = await import('electron').catch(() => null)
        if (electron && electron.app) {
          resolvedPath = join(electron.app.getPath('desktop'), filePath)
        } else {
          resolvedPath = join(os.tmpdir(), filePath)
        }
      } catch (e) {
        resolvedPath = join(os.tmpdir(), filePath)
      }
    }
    
    const format = (config.format || 'text').toLowerCase()
    const encoding = config.encoding || 'utf-8'
    const append = config.append || false

    // Use config.data if provided, otherwise use inputData
    const data = config.data !== undefined ? config.data : inputData

    // Ensure parent directory exists
    const dir = dirname(resolvedPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    let content
    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, config.indent !== undefined ? config.indent : 2)
        break

      case 'csv':
        content = toCSV(data, config)
        break

      case 'text':
      default:
        if (typeof data === 'string') {
          content = data
        } else {
          content = JSON.stringify(data)
        }
        break
    }

    if (append) {
      const { appendFileSync } = await import('fs')
      appendFileSync(resolvedPath, content, encoding)
    } else {
      writeFileSync(resolvedPath, content, encoding)
    }

    return {
      path: resolvedPath,
      format,
      size: Buffer.byteLength(content, encoding),
      written: true,
      timestamp: Date.now()
    }
  }
}

/**
 * Convert data to CSV string.
 * Accepts an array of objects or an array of arrays.
 */
function toCSV(data, config = {}) {
  const delimiter = config.delimiter || ','
  const includeHeader = config.includeHeader !== false

  if (!Array.isArray(data)) {
    // Single object, wrap it
    data = [data]
  }

  if (data.length === 0) {
    return ''
  }

  // If array of objects
  if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
    const headers = Object.keys(data[0])
    const rows = []

    if (includeHeader) {
      rows.push(headers.map((h) => escapeCSVField(h, delimiter)).join(delimiter))
    }

    for (const item of data) {
      const row = headers.map((h) => escapeCSVField(item[h], delimiter))
      rows.push(row.join(delimiter))
    }

    return rows.join('\n')
  }

  // If array of arrays
  return data.map((row) => {
    if (Array.isArray(row)) {
      return row.map((field) => escapeCSVField(field, delimiter)).join(delimiter)
    }
    return escapeCSVField(row, delimiter)
  }).join('\n')
}

function escapeCSVField(value, delimiter) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}
