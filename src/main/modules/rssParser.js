export const meta = {
  type: 'rssParser',
  label: 'Lecture RSS',
  category: 'core'
}

export async function execute(config, inputData) {
  try {
    const rssUrl = config.rssUrl || inputData?.rssUrl || ''

    if (!rssUrl) {
      return { success: false, error: 'URL du flux RSS requise' }
    }

    // Utilisation de l'API publique rss2json pour éviter les dépendances XML
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return { success: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` }
    }

    const data = await response.json()

    if (data.status !== 'ok') {
      return { success: false, error: `Erreur API RSS: ${data.message}` }
    }

    return { 
      success: true, 
      feed: data.feed,
      items: data.items,
      latest: data.items[0] || null
    }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}` }
  }
}
