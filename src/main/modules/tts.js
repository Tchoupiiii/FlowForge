export const meta = {
  type: 'tts',
  name: 'Synthèse Vocale (TTS)',
  description: 'Génère un fichier audio parlé à partir d\'un texte.',
  category: 'ai',
  inputs: 1,
  outputs: 1
}

export async function execute(config, inputData) {
  const text = config.text || inputData?.response || inputData?.result || inputData?.text || 'Bonjour et bienvenue chez FlowForge !'
  const language = config.language || 'fr'

  if (!text) {
    throw new Error('TTS : Aucun texte fourni à synthétiser.')
  }

  // Simulate TTS processing delay
  await new Promise(resolve => setTimeout(resolve, 400))

  // Google Translate free TTS API endpoint
  // Supports up to 200 characters natively. Let's truncate or clean the query to fit nicely.
  const cleanedText = text.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 190)
  const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(language)}&client=tw-ob&q=${encodeURIComponent(cleanedText)}`

  return {
    success: true,
    text: cleanedText,
    language,
    audioUrl,
    result: audioUrl,
    timestamp: Date.now()
  }
}
