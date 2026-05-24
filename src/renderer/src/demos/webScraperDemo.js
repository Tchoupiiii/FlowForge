export const demoWebScraper = {
  id: 'demo-webscraper',
  title: 'Résumé d\'Article Web',
  description: 'Extrait le contenu d\'une page web et demande à l\'IA de la résumer en 3 points.',
  nodes: [
    {
      id: 'trigger-1',
      type: 'triggerManual',
      position: { x: 50, y: 150 },
      data: { label: 'Déclencheur Manuel', type: 'triggerManual', color: '#f43f5e', config: {} }
    },
    {
      id: 'scraper-1',
      type: 'webScraper',
      position: { x: 300, y: 150 },
      data: { 
        label: 'Scraper Wikipedia', 
        type: 'webScraper', 
        color: '#10b981', 
        config: { url: 'https://fr.wikipedia.org/wiki/Intelligence_artificielle' } 
      }
    },
    {
      id: 'ai-1',
      type: 'aiAgent',
      position: { x: 600, y: 150 },
      data: {
        label: 'IA : Résumé',
        type: 'aiAgent',
        color: '#818cf8',
        config: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          systemPrompt: 'Tu es un assistant de synthèse très concis.',
          userPrompt: 'Fais-moi un résumé en 3 points de cet article : {{content}}'
        }
      }
    },
    {
      id: 'notify-1',
      type: 'notification',
      position: { x: 900, y: 150 },
      data: {
        label: 'Alerte Résumé',
        type: 'notification',
        color: '#f87171',
        config: {
          title: 'Résumé : {{title}}',
          message: '{{response}}'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-1', target: 'scraper-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e2', source: 'scraper-1', target: 'ai-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e3', source: 'ai-1', target: 'notify-1', sourceHandle: 'a', targetHandle: 'a' }
  ]
}
