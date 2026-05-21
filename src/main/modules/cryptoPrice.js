export const meta = {
  type: 'cryptoPrice',
  label: 'Prix Crypto',
  category: 'core'
}

export async function execute(config, inputData) {
  try {
    const coin = (config.coin || 'bitcoin').toLowerCase()
    const currency = (config.currency || 'usd').toLowerCase()

    if (!coin) {
      return { success: false, error: 'Identifiant de la cryptomonnaie requis (ex: bitcoin, ethereum)' }
    }

    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=${encodeURIComponent(currency)}`
    
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return { success: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` }
    }

    const data = await response.json()

    if (!data[coin]) {
      return { success: false, error: `Cryptomonnaie "${coin}" introuvable.` }
    }

    const price = data[coin][currency]

    return { 
      success: true, 
      coin,
      currency,
      price,
      message: `Le prix du ${coin} est de ${price} ${currency.toUpperCase()}`
    }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}` }
  }
}
