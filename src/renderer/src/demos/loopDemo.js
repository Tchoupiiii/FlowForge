export default function loopDemo() {
  return {
    name: 'Boucle sur Articles RSS',
    description: 'Récupère un flux RSS, boucle sur chaque article et les envoie un par un.',
    tags: ['Boucle', 'RSS', 'Notification'],
    nodes: [
      {
        id: 'trigger',
        type: 'customNode',
        position: { x: 50, y: 150 },
        data: { type: 'triggerManual', label: 'Déclencheur', icon: 'Play', color: '#4ade80', category: 'core', inputs: 0, outputs: 1, config: {}, status: 'idle' }
      },
      {
        id: 'rss',
        type: 'customNode',
        position: { x: 300, y: 150 },
        data: {
          type: 'rssParser',
          label: 'Flux RSS',
          icon: 'Rss', color: '#f97316', category: 'core', inputs: 1, outputs: 1, status: 'idle',
          config: { rssUrl: 'https://news.ycombinator.com/rss' }
        }
      },
      {
        id: 'loop',
        type: 'customNode',
        position: { x: 550, y: 150 },
        data: {
          type: 'loopForEach',
          label: 'Boucle (Articles)',
          icon: 'RefreshCw', color: '#22d3ee', category: 'core', inputs: 1, outputs: 1, status: 'idle',
          config: { arrayField: 'items', maxIterations: 3 }
        }
      },
      {
        id: 'notify',
        type: 'customNode',
        position: { x: 800, y: 150 },
        data: {
          type: 'notification',
          label: 'Notification',
          icon: 'Bell', color: '#f87171', category: 'core', inputs: 1, outputs: 1, status: 'idle',
          config: {
            title: 'Nouvel article',
            body: '{{input.title}} - Par: {{input.creator}}'
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger', sourceHandle: 'a', target: 'rss' },
      { id: 'e2', source: 'rss', sourceHandle: 'a', target: 'loop' },
      { id: 'e3', source: 'loop', sourceHandle: 'a', target: 'notify' }
    ]
  }
}
