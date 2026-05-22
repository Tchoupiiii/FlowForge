/**
 * Condition Module
 * Evaluates a condition against input data and routes to true/false branches.
 */
export default {
  meta: {
    type: 'condition',
    name: 'Condition',
    description: 'Evaluate a condition and branch the workflow based on true/false result',
    category: 'logic',
    inputs: 1,
    outputs: 2 // true branch, false branch
  },

  async execute(config, inputData) {
    const { field, operator, value } = config.condition || config

    if (!field || !operator) {
      throw new Error('Condition: field and operator are required')
    }

    // Resolve field value from inputData using dot notation
    const fieldValue = resolveField(inputData, field)

    // Evaluate the condition
    const result = evaluateCondition(fieldValue, operator, value)

    return {
      result,
      branch: result ? 'true' : 'false',
      data: inputData,
      evaluation: {
        field,
        fieldValue,
        operator,
        compareValue: value,
        outcome: result
      }
    }
  }
}

/**
 * Resolve a dot-notation field path from an object.
 * e.g. "data.user.name" resolves to obj.data.user.name
 */
function resolveField(obj, path) {
  if (obj === null || obj === undefined) return undefined

  // Si le champ est déjà un objet/tableau (ex: variable écrasée par un câble), c'est la valeur finale
  if (typeof path !== 'string') return path

  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined

    // Support array indexing: "items[0]"
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)
    if (arrayMatch) {
      current = current[arrayMatch[1]]
      if (Array.isArray(current)) {
        current = current[parseInt(arrayMatch[2], 10)]
      } else {
        return undefined
      }
    } else {
      current = current[part]
    }
  }

  return current
}

/**
 * Evaluate a condition given a field value, operator, and comparison value.
 */
function evaluateCondition(fieldValue, operator, compareValue) {
  // Coerce compare value for numeric comparisons
  const numField = Number(fieldValue)
  const numCompare = Number(compareValue)

  switch (operator) {
    case 'equals':
    case 'eq':
    case '==':
      return String(fieldValue) === String(compareValue)

    case 'notEquals':
    case 'neq':
    case '!=':
      return String(fieldValue) !== String(compareValue)

    case 'strictEquals':
    case '===':
      return fieldValue === compareValue

    case 'greaterThan':
    case 'gt':
    case '>':
      return !isNaN(numField) && !isNaN(numCompare) && numField > numCompare

    case 'greaterThanOrEqual':
    case 'gte':
    case '>=':
      return !isNaN(numField) && !isNaN(numCompare) && numField >= numCompare

    case 'lessThan':
    case 'lt':
    case '<':
      return !isNaN(numField) && !isNaN(numCompare) && numField < numCompare

    case 'lessThanOrEqual':
    case 'lte':
    case '<=':
      return !isNaN(numField) && !isNaN(numCompare) && numField <= numCompare

    case 'contains':
      return (typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue)).includes(String(compareValue))

    case 'notContains':
      return !(typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue)).includes(String(compareValue))

    case 'startsWith':
      return String(fieldValue).startsWith(String(compareValue))

    case 'endsWith':
      return String(fieldValue).endsWith(String(compareValue))

    case 'matches':
      try {
        return new RegExp(compareValue).test(String(fieldValue))
      } catch {
        return false
      }

    case 'isEmpty':
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      )

    case 'isNotEmpty':
      return (
        fieldValue !== null &&
        fieldValue !== undefined &&
        fieldValue !== '' &&
        !(Array.isArray(fieldValue) && fieldValue.length === 0)
      )

    case 'isTrue':
      return fieldValue === true || fieldValue === 'true' || fieldValue === 1

    case 'isFalse':
      return fieldValue === false || fieldValue === 'false' || fieldValue === 0

    case 'exists':
      return fieldValue !== undefined && fieldValue !== null

    case 'notExists':
      return fieldValue === undefined || fieldValue === null

    default:
      throw new Error(`Condition: unknown operator "${operator}"`)
  }
}
