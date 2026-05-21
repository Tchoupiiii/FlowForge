export default function rssSlackDemo() {
  return {
    name: 'Veille RSS vers Slack',
    description: 'Lit un flux RSS, filtre les mots clés et envoie sur Slack',
    tags: ['rss', 'slack', 'veille'],
    nodes: [
      {
        id: 'n1',
        type: 'customNode',
        position: { x: 100, y: 150 },
        data: {
          type: 'timerCron',
          label: 'Timer / Cron',
          icon: 'Clock',
          color: '#fbbf24',
          category: 'core',
          config: {
            interval: 3600,
            cron: ''
          },
          status: 'idle'
        }
      },
      {
        id: 'n2',
        type: 'customNode',
        position: { x: 350, y: 150 },
        data: {
          type: 'rssParser',
          label: 'Lecture RSS',
          icon: 'Rss',
          color: '#f97316',
          category: 'core',
          config: {
            rssUrl: 'https://news.ycombinator.com/rss'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 600, y: 150 },
        data: {
          type: 'dataFilter',
          label: 'Filtre de Données',
          icon: 'Filter',
          color: '#14b8a6',
          category: 'core',
          config: {
            property: 'title',
            operator: 'contains',
            value: 'AI'
          },
          status: 'idle'
        }
      },
      {
        id: 'n4',
        type: 'customNode',
        position: { x: 850, y: 150 },
        data: {
          type: 'slackWebhook',
          label: 'Envoi Slack',
          icon: 'Hash',
          color: '#E01E5A',
          category: 'core',
          config: {
            webhookUrl: '',
            text: 'Nouvel article sur l\'IA trouvé : {{input.firstMatch.title}} - {{input.firstMatch.link}}'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep', animated: true }
    ]
  }
}
