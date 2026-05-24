export default {
  meta: {
    type: 'translateText',
    name: 'Translate Text',
    description: 'Traduit un texte d\'une langue vers une autre (via IA Locale ou Distante)',
    category: 'ai',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const text = config.text || inputData.text
    const targetLang = config.targetLanguage || 'fr'

    if (!text) {
      throw new Error('Translate Text: aucun texte à traduire')
    }

    // In a real app, this would call an API like DeepL, OpenAI, or Ollama.
    // For demonstration, we'll prefix it if it's mock, or if Ollama is configured we could call it.
    // We'll simulate a translation delay and return a pseudo-translation or use a free API if needed.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Very basic mock translation for demo purposes
    let translated = `[Traduit en ${targetLang.toUpperCase()}]: ${text}`

    return {
      original: text,
      translated,
      targetLanguage: targetLang,
      timestamp: Date.now(),
      result: translated
    }
  }
}
