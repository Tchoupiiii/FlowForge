export default {
  meta: {
    type: 'openFda',
    name: 'OpenFDA (Santé)',
    description: 'Recherche des données publiques sur les médicaments, les effets indésirables et les rappels alimentaires via l\'API OpenFDA.',
    category: 'sante',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const query = config.query || inputData.query || 'aspirin'
    const limit = config.limit || 1
    const endpoint = config.endpoint || 'drug/event' // drug/event, drug/label, food/enforcement

    // Pour l'API de test openFDA (publique sans clé pour des petits quotas)
    const url = `https://api.fda.gov/${endpoint}.json?search=${encodeURIComponent(query)}&limit=${limit}`

    try {
      // In node 18+, fetch is global, but we kept the import or fallback
      const response = await (typeof fetch !== 'undefined' ? fetch(url) : global.fetch(url))
      
      if (!response.ok) {
        throw new Error(`OpenFDA API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      return {
        query,
        endpoint,
        resultsCount: data.meta?.results?.total || 0,
        results: data.results || [],
        timestamp: Date.now(),
        result: `Recherche OpenFDA pour "${query}" sur l'endpoint "${endpoint}" : ${data.meta?.results?.total || 0} résultats trouvés.`
      }
    } catch (error) {
      throw new Error(`Erreur OpenFDA: ${error.message}`)
    }
  }
}
