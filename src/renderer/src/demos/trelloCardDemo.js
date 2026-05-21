export default function trelloCardDemo() {
  return {
    name: 'Créateur de Ticket',
    description: 'Extrait le nom d\'un projet via Regex et crée automatiquement une carte Trello via l\'API.',
    tags: ['Productivité', 'Trello', 'Données'],
    nodes: [
      {
        id: 'n1',
        type: 'customNode',
        position: { x: 100, y: 150 },
        data: {
          type: 'triggerManual',
          label: 'Lancement',
          icon: 'Play',
          color: '#4ade80',
          category: 'core',
          inputs: 0,
          outputs: 1,
          config: {},
          status: 'idle'
        }
      },
      {
        id: 'n2',
        type: 'customNode',
        position: { x: 400, y: 150 },
        data: {
          type: 'regexMatch',
          label: 'Extraction Regex',
          icon: 'Search',
          color: '#14b8a6',
          category: 'donnees',
          inputs: 1,
          outputs: 1,
          config: {
            pattern: 'Projet\\s*:\\s*(.*)',
            inputField: 'text'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 700, y: 150 },
        data: {
          type: 'trelloCard',
          label: 'Carte Trello',
          icon: 'Layout',
          color: '#0079bf',
          category: 'productivite',
          inputs: 1,
          outputs: 1,
          config: {
            name: '{{input.matches[0]}}',
            idList: 'TRELLO_LIST_ID',
            apiKey: '',
            token: ''
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } }
    ]
  }
}
