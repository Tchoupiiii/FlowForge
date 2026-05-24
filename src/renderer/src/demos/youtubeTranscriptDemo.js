export const demoYoutubeTranscript = {
  id: 'demo-youtube',
  title: 'Analyse Vidéo YouTube',
  description: 'Extrait les sous-titres d\'une vidéo YouTube et demande à l\'IA de générer un post Twitter.',
  nodes: [
    {
      id: 'trigger-1',
      type: 'triggerManual',
      position: { x: 50, y: 150 },
      data: { label: 'Déclencheur Manuel', type: 'triggerManual', color: '#f43f5e', config: {} }
    },
    {
      id: 'yt-1',
      type: 'youtubeTranscript',
      position: { x: 300, y: 150 },
      data: { 
        label: 'Sous-titres YouTube', 
        type: 'youtubeTranscript', 
        color: '#ef4444', 
        config: { url: 'https://www.youtube.com/watch?v=M576WLS9KOs' } 
      }
    },
    {
      id: 'ai-1',
      type: 'aiAgent',
      position: { x: 600, y: 150 },
      data: {
        label: 'Générateur de Post',
        type: 'aiAgent',
        color: '#818cf8',
        config: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          systemPrompt: 'Tu es un community manager expert.',
          userPrompt: 'Rédige un post Twitter accrocheur basé sur cette vidéo. Utilise des emojis et des hashtags pertinents :\n\n{{transcript}}'
        }
      }
    },
    {
      id: 'discord-1',
      type: 'discordWebhook',
      position: { x: 900, y: 150 },
      data: {
        label: 'Envoi Slack/Discord',
        type: 'discordWebhook',
        color: '#5865F2',
        config: {
          webhookUrl: '',
          content: 'Nouveau post prêt à être publié :\n\n{{response}}',
          username: 'Social Media Bot'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-1', target: 'yt-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e2', source: 'yt-1', target: 'ai-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e3', source: 'ai-1', target: 'discord-1', sourceHandle: 'a', targetHandle: 'a' }
  ]
}
