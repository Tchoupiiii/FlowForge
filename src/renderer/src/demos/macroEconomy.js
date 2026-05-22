export const demoMacroEconomy = {
  id: 'demo-macro-economy',
  name: 'Veille Macro-économie IA',
  description: 'Analyse et résume les actualités macro-économiques via RSS avec une IA.',
  tags: ['IA', 'RSS', 'Finance'],
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 100, y: 200 },
      data: {
        type: 'timerCron',
        label: 'Tous les jours à 15h',
        color: '#f59e0b',
        config: { interval: '0 15 * * *' }
      }
    },
    {
      id: 'n2',
      type: 'customNode',
      position: { x: 400, y: 200 },
      data: {
        type: 'rssParser',
        label: 'Flux Google News',
        color: '#f97316',
        config: { url: 'https://news.google.com/rss/search?q=macroeconomy+dollar' }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 700, y: 200 },
      data: {
        type: 'aiAgent',
        label: 'Analyse IA',
        color: '#8b5cf6',
        config: { systemPrompt: 'Tu es un expert financier. Fais un résumé concis des 3 actualités les plus importantes pour le dollar. Retourne la réponse en texte clair.', userPrompt: 'Voici les news: {{items}}' }
      }
    },
    {
      id: 'n4',
      type: 'customNode',
      position: { x: 1000, y: 200 },
      data: {
        type: 'telegramSend',
        label: 'Envoi Telegram',
        color: '#0088cc',
        config: { botToken: '', chatId: '', message: 'Résumé du jour : \n\n{{result}}' }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
    { id: 'e3-4', source: 'n3', target: 'n4', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }
  ]
}
