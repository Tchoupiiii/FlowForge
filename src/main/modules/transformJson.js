/**
 * Transform JSON Module
 * Applies a series of transformations to input data.
 */
export default {
  meta: {
    type: 'transformJson',
    name: 'Transform JSON',
    description: 'Apply transformations like pick, rename, filter, and map to JSON data',
    category: 'transform',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const operations = config.operations || []

    if (operations.length === 0) {
      return inputData
    }

    let data = structuredClone(inputData)

    for (const op of operations) {
      data = applyOperation(data, op)
    }

    return data
  }
}

function applyOperation(data, op) {
  switch (op.type) {
    case 'pick':
      return applyPick(data, op)
    case 'rename':
      return applyRename(data, op)
    case 'filter':
      return applyFilter(data, op)
    case 'map':
      return applyMap(data, op)
    case 'set':
      return applySet(data, op)
    case 'delete':
      return applyDelete(data, op)
    case 'flatten':
      return applyFlatten(data, op)
    case 'sort':
      return applySort(data, op)
    default:
      throw new Error(`Transform JSON: unknown operation type "${op.type}"`)
  }
}

/**
 * Pick specified fields from the data object.
 * { type: 'pick', fields: ['name', 'age', 'address.city'] }
 */
function applyPick(data, op) {
  const fields = op.fields || []

  if (Array.isArray(data)) {
    return data.map((item) => pickFields(item, fields))
  }

  return pickFields(data, fields)
}

function pickFields(obj, fields) {
  const result = {}
  for (const field of fields) {
    const parts = field.split('.')
    if (parts.length === 1) {
      if (field in obj) {
        result[field] = obj[field]
      }
    } else {
      // For dot-notation, put the resolved value under the last key
      const value = resolveNestedField(obj, parts)
      if (value !== undefined) {
        result[parts[parts.length - 1]] = value
      }
    }
  }
  return result
}

function resolveNestedField(obj, parts) {
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

/**
 * Rename fields in the data object.
 * { type: 'rename', mappings: { oldName: 'newName', ... } }
 */
function applyRename(data, op) {
  const mappings = op.mappings || {}

  if (Array.isArray(data)) {
    return data.map((item) => renameFields(item, mappings))
  }

  return renameFields(data, mappings)
}

function renameFields(obj, mappings) {
  const result = { ...obj }
  for (const [oldKey, newKey] of Object.entries(mappings)) {
    if (oldKey in result) {
      result[newKey] = result[oldKey]
      delete result[oldKey]
    }
  }
  return result
}

/**
 * Filter array items based on a condition.
 * { type: 'filter', field: 'age', operator: 'gt', value: 18 }
 */
function applyFilter(data, op) {
  if (!Array.isArray(data)) {
    // If data is not an array, wrap in array and filter
    const arr = data.items || data.data || [data]
    if (!Array.isArray(arr)) return data
    return filterArray(arr, op)
  }

  return filterArray(data, op)
}

function filterArray(arr, op) {
  const { field, operator, value } = op

  return arr.filter((item) => {
    const fieldValue = field.includes('.') ? resolveNestedField(item, field.split('.')) : item[field]
    return evaluateFilterCondition(fieldValue, operator, value)
  })
}

function evaluateFilterCondition(fieldValue, operator, compareValue) {
  const numField = Number(fieldValue)
  const numCompare = Number(compareValue)

  switch (operator) {
    case 'eq':
    case 'equals':
      return String(fieldValue) === String(compareValue)
    case 'neq':
    case 'notEquals':
      return String(fieldValue) !== String(compareValue)
    case 'gt':
    case 'greaterThan':
      return !isNaN(numField) && !isNaN(numCompare) && numField > numCompare
    case 'gte':
      return !isNaN(numField) && !isNaN(numCompare) && numField >= numCompare
    case 'lt':
    case 'lessThan':
      return !isNaN(numField) && !isNaN(numCompare) && numField < numCompare
    case 'lte':
      return !isNaN(numField) && !isNaN(numCompare) && numField <= numCompare
    case 'contains':
      return String(fieldValue).includes(String(compareValue))
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null
    default:
      return true
  }
}

/**
 * Map/transform each item using an expression.
 * { type: 'map', expression: 'item.name.toUpperCase()', as: 'upperName' }
 */
function applyMap(data, op) {
  const arr = Array.isArray(data) ? data : [data]
  const expression = op.expression
  const targetField = op.as || 'mapped'

  if (!expression) {
    throw new Error('Transform JSON map: expression is required')
  }

  return arr.map((item) => {
    try {
      const fn = new Function('item', `return ${expression}`)
      const result = fn(item)
      if (targetField === '*') {
        // Replace entire item with result
        return result
      }
      return { ...item, [targetField]: result }
    } catch (err) {
      return { ...item, [targetField]: null, _mapError: err.message }
    }
  })
}

/**
 * Set a field to a specific value.
 * { type: 'set', field: 'status', value: 'active' }
 */
function applySet(data, op) {
  if (Array.isArray(data)) {
    return data.map((item) => ({ ...item, [op.field]: op.value }))
  }
  return { ...data, [op.field]: op.value }
}

/**
 * Delete specified fields.
 * { type: 'delete', fields: ['password', 'secret'] }
 */
function applyDelete(data, op) {
  const fields = op.fields || []

  if (Array.isArray(data)) {
    return data.map((item) => {
      const result = { ...item }
      for (const f of fields) delete result[f]
      return result
    })
  }

  const result = { ...data }
  for (const f of fields) delete result[f]
  return result
}

/**
 * Flatten nested array field.
 * { type: 'flatten', field: 'items' }
 */
function applyFlatten(data, op) {
  if (Array.isArray(data)) {
    return data.flat(op.depth || 1)
  }
  if (op.field && Array.isArray(data[op.field])) {
    return { ...data, [op.field]: data[op.field].flat(op.depth || 1) }
  }
  return data
}

/**
 * Sort an array by a field.
 * { type: 'sort', field: 'name', order: 'asc'|'desc' }
 */
function applySort(data, op) {
  if (!Array.isArray(data)) return data

  const field = op.field
  const order = op.order || 'asc'
  const multiplier = order === 'desc' ? -1 : 1

  return [...data].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (aVal < bVal) return -1 * multiplier
    if (aVal > bVal) return 1 * multiplier
    return 0
  })
}
