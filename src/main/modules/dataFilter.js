export const meta = {
  type: 'dataFilter',
  label: 'Filtre de Données',
  category: 'core'
}

export async function execute(config, inputData) {
  try {
    const property = config.property || ''
    const operator = config.operator || '=='
    const value = config.value || ''
    
    // Le module peut prendre un tableau (items) ou un objet
    const items = Array.isArray(inputData?.items) ? inputData.items : (Array.isArray(inputData) ? inputData : [inputData])

    if (!property) {
      return { success: false, error: 'Propriété à filtrer requise' }
    }

    const filtered = items.filter(item => {
      // Helper to access nested properties like 'user.address.city'
      const itemValue = property.split('.').reduce((o, i) => o ? o[i] : undefined, item)
      
      switch (operator) {
        case '==': return String(itemValue) === String(value)
        case '!=': return String(itemValue) !== String(value)
        case '>': return Number(itemValue) > Number(value)
        case '<': return Number(itemValue) < Number(value)
        case '>=': return Number(itemValue) >= Number(value)
        case '<=': return Number(itemValue) <= Number(value)
        case 'contains': return String(itemValue).toLowerCase().includes(String(value).toLowerCase())
        case 'not_contains': return !String(itemValue).toLowerCase().includes(String(value).toLowerCase())
        default: return false
      }
    })

    return { 
      success: true, 
      originalCount: items.length,
      filteredCount: filtered.length,
      items: filtered,
      firstMatch: filtered[0] || null
    }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}` }
  }
}
