/**
 * Read File Module
 * Reads a file from disk in text, JSON, or CSV format.
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export default {
  meta: {
    type: 'readFile',
    name: 'Read File',
    description: 'Read a file from disk as text, JSON, or CSV',
    category: 'files',
    inputs: 1,
    outputs: 1
  },

  async execute(config, _inputData) {
    const filePath = config.path
    if (!filePath) {
      throw new Error('Read File: path is required')
    }

    const resolvedPath = resolve(filePath)
    if (!existsSync(resolvedPath)) {
      throw new Error(`Read File: file not found at "${resolvedPath}"`)
    }

    const format = (config.format || 'text').toLowerCase()
    const encoding = config.encoding || 'utf-8'
    const raw = readFileSync(resolvedPath, encoding)

    let data
    switch (format) {
      case 'json':
        try {
          data = JSON.parse(raw)
        } catch (err) {
          throw new Error(`Read File: failed to parse JSON — ${err.message}`)
        }
        break

      case 'csv':
        data = parseCSV(raw, config)
        break

      case 'text':
      default:
        data = raw
        break
    }

    return {
      path: resolvedPath,
      format,
      size: Buffer.byteLength(raw, encoding),
      data
    }
  }
}

/**
 * Manual CSV parser. Handles quoted fields, commas inside quotes, and newlines.
 */
function parseCSV(content, config = {}) {
  const delimiter = config.delimiter || ','
  const hasHeader = config.hasHeader !== false // default true

  const rows = parseCSVRows(content, delimiter)

  if (rows.length === 0) {
    return []
  }

  if (hasHeader) {
    const headers = rows[0].map((h) => h.trim())
    const dataRows = rows.slice(1)

    return dataRows.map((row) => {
      const obj = {}
      headers.forEach((header, i) => {
        obj[header] = i < row.length ? row[i] : ''
      })
      return obj
    })
  }

  return rows
}

function parseCSVRows(content, delimiter) {
  const rows = []
  let currentRow = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < content.length) {
    const char = content[i]

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ""
        if (i + 1 < content.length && content[i + 1] === '"') {
          currentField += '"'
          i += 2
          continue
        }
        // End of quoted field
        inQuotes = false
        i++
        continue
      }
      currentField += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }

    if (char === delimiter) {
      currentRow.push(currentField)
      currentField = ''
      i++
      continue
    }

    if (char === '\r') {
      // Skip \r, handle \r\n
      if (i + 1 < content.length && content[i + 1] === '\n') {
        i++ // skip \r, \n will be handled next
      } else {
        // \r alone acts as newline
        currentRow.push(currentField)
        currentField = ''
        if (currentRow.some((f) => f !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        i++
        continue
      }
    }

    if (char === '\n') {
      currentRow.push(currentField)
      currentField = ''
      if (currentRow.some((f) => f !== '') || currentRow.length > 1) {
        rows.push(currentRow)
      }
      currentRow = []
      i++
      continue
    }

    currentField += char
    i++
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    if (currentRow.some((f) => f !== '') || currentRow.length > 1) {
      rows.push(currentRow)
    }
  }

  return rows
}
