const cheerio = require('cheerio')

export default {
  meta: {
    type: 'webScraper',
    name: 'Web Scraper',
    description: 'Extrait le texte propre d\'une page web',
    category: 'core',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const url = config.url || ''

    if (!url) {
      throw new Error('Web Scraper: L\'URL est requise')
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
      }
      const html = await response.text()
      const $ = cheerio.load(html)
      
      // Remove scripts, styles, noscript, etc.
      $('script, style, noscript, nav, footer, iframe, header, svg').remove()
      
      // Extract clean text
      let text = $('body').text()
      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim()
      
      // Also get title
      const title = $('title').text().trim() || $('h1').first().text().trim()

      return {
        url,
        title,
        content: text.substring(0, 40000) // Limit to ~40k chars to avoid blowing up memory/prompts
      }
    } catch (err) {
      throw new Error(`Web Scraper: Impossible de lire la page (${err.message})`)
    }
  }
}

