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
    
    // Simulation d'une requête API (ex: Alpha Vantage, Yahoo Finance)
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Génération d'un prix aléatoire réaliste pour la démo
    const basePrices = { AAPL: 175.50, MSFT: 400.20, GOOGL: 140.10, TSLA: 210.80 }
    const base = basePrices[symbol.toUpperCase()] || 100 + Math.random() * 50
    const variation = (Math.random() - 0.5) * 5
    const price = +(base + variation).toFixed(2)

    return {
      symbol: symbol.toUpperCase(),
      price: price,
      currency: 'USD',
      timestamp: Date.now()
    }
  }
}
