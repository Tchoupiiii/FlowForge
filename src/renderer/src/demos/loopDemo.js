export default function loopDemo() {
  return {
    name: 'Boucle sur Articles RSS',
    description: 'Récupère un flux RSS, boucle sur chaque article et les envoie un par un.',
    tags: ['Boucle', 'RSS', 'Notification'],
    nodes: [
      {
        id: 'trigger',
        type: 'triggerManual',
        position: { x: 50, y: 150 },
        data: { type: 'triggerManual', label: 'Déclencheur' }
      },
      {
        id: 'rss',
        type: 'rssParser',
        position: { x: 300, y: 150 },
        data: {
          type: 'rssParser',
          label: 'Flux RSS',
          config: { url: 'https://news.ycombinator.com/rss' }
        }
      },
      {
        id: 'loop',
        type: 'loopForEach',
        position: { x: 550, y: 150 },
        data: {
          type: 'loopForEach',
          label: 'Boucle (Articles)',
          config: { arrayField: 'items', maxIterations: 3 }
        }
      },
      {
        id: 'notify',
        type: 'notification',
        position: { x: 800, y: 150 },
        data: {
          type: 'notification',
          label: 'Notification',
          config: {
            title: 'Nouvel article',
            body: '{{input.title}} - Par: {{input.creator}}'
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'rss' },
      { id: 'e2', source: 'rss', target: 'loop' },
      { id: 'e3', source: 'loop', target: 'notify' }
    ]
  }
}
