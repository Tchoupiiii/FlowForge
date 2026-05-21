export const meta = {
  type: 'loopForEach',
  label: 'Boucle (Loop)',
  category: 'core'
}

export const execute = async (config, inputData) => {
  const arrayField = config.arrayField || 'items'
  let items = inputData[arrayField]

  if (!items || !Array.isArray(items)) {
    for (const key of Object.keys(inputData)) {
      if (Array.isArray(inputData[key])) {
        items = inputData[key]
        break
      }
    }
  }

  if (!items || !Array.isArray(items)) {
    return { items: [inputData], count: 1, looped: true }
  }

  const maxIterations = parseInt(config.maxIterations) || 0
  const limitedItems = maxIterations > 0 ? items.slice(0, maxIterations) : items

  return {
    items: limitedItems,
    count: limitedItems.length,
    total: items.length,
    looped: true
  }
}
