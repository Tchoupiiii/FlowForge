export default {
  meta: {
    type: 'setVariables',
    name: 'Déclarer Variables',
    description: 'Déclare des variables statiques ou dynamiques pour la suite du flux.',
    category: 'transform',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const vars = config.variables || {}
    let parsedVars = {}
    
    // Si variables est une chaîne JSON, on la parse
    if (typeof vars === 'string') {
      try {
        parsedVars = JSON.parse(vars)
      } catch (e) {
        parsedVars = { value: vars }
      }
    } else {
      parsedVars = vars
    }

    // Le moteur interpole déjà config, mais on s'assure de propager tout
    return {
      ...inputData,
      ...parsedVars,
      timestamp: Date.now()
    }
  }
}
