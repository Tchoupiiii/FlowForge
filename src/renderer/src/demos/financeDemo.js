export default function financeDemo() {
  return {
    name: 'Alerte Bourse Telegram',
    description: 'Vérifie le prix d\'une action en bourse et envoie une alerte Telegram.',
    tags: ['Finance', 'Telegram', 'Notification'],
    nodes: [
      {
        id: 'n1',
        type: 'customNode',
        position: { x: 100, y: 150 },
        data: {
          type: 'timerCron',
          label: 'Vérification Hebdo',
          icon: 'Clock',
          color: '#fbbf24',
          category: 'core',
          inputs: 0,
          outputs: 1,
          config: { interval: 86400 }, // Tous les jours
          status: 'idle'
        }
      },
      {
        id: 'n2',
        type: 'customNode',
        position: { x: 400, y: 150 },
        data: {
          type: 'stockPrice',
          label: 'Prix Apple',
          icon: 'LineChart',
          color: '#10b981',
          category: 'finance',
          inputs: 1,
          outputs: 1,
          config: {
            symbol: 'AAPL'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 700, y: 150 },
        data: {
          type: 'telegramSend',
          label: 'Message Telegram',
          icon: 'Send',
          color: '#0088cc',
          category: 'telegram',
          inputs: 1,
          outputs: 1,
          config: {
            message: 'Le prix de l\'action AAPL est actuellement de {{input.price}} {{input.currency}}.'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', sourceHandle: 'a', target: 'n2', targetHandle: 'a', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'e2-3', source: 'n2', sourceHandle: 'a', target: 'n3', targetHandle: 'a', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } }
    ]
  }
}
