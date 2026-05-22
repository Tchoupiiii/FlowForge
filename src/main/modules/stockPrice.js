export default {
  meta: {
    type: 'stockPrice',
    name: 'Cours Bourse (Finance)',
    description: 'Récupère le cours d\'une action en bourse (simulé pour l\'exemple).',
    category: 'finance',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const symbol = config.symbol || inputData.symbol || 'AAPL'
    
    try {
      // API Publique de Yahoo Finance (non-officielle mais fonctionnelle)
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`)
      
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }
      
      const data = await res.json()
      const result = data.chart?.result?.[0]
      
      if (!result || !result.meta) {
        throw new Error(`Symbole ${symbol} introuvable`)
      }
      
      const price = result.meta.regularMarketPrice
      const currency = result.meta.currency || 'USD'
      const name = result.meta.shortName || symbol.toUpperCase()

      return {
        symbol: symbol.toUpperCase(),
        ticker: symbol.toUpperCase(),
        name: name,
        price: price,
        currency: currency,
        timestamp: Date.now()
      }
    } catch (err) {
      console.error('Erreur Yahoo Finance:', err)
      // Fallback au cas où
      return {
        symbol: symbol.toUpperCase(),
        ticker: symbol.toUpperCase(),
        error: `Impossible de récupérer le cours: ${err.message}`,
        timestamp: Date.now()
      }
    }
  }
}
