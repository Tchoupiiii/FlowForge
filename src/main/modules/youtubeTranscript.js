import { YoutubeTranscript } from 'youtube-transcript'

export default {
  meta: {
    type: 'youtubeTranscript',
    name: 'YouTube Transcript',
    description: 'Récupère les sous-titres d\'une vidéo YouTube',
    category: 'core',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const url = config.url || ''

    if (!url) {
      throw new Error('YouTube Transcript: L\'URL de la vidéo est requise')
    }

    try {
      // Fetch transcript
      const transcriptArray = await YoutubeTranscript.fetchTranscript(url)
      
      // Combine the text
      const fullText = transcriptArray.map(t => t.text).join(' ')
      
      // Return as output
      return {
        url,
        transcript: fullText
      }
    } catch (err) {
      throw new Error(`YouTube Transcript: Impossible de récupérer les sous-titres (${err.message}). Vérifiez que la vidéo a des sous-titres générés.`)
    }
  }
}

