export default function cryptoDiscordDemo() {
  return {
    name: 'Alerte Crypto Discord',
    description: 'Vérifie le prix du Bitcoin et envoie une alerte sur Discord',
    tags: ['crypto', 'discord', 'automatisation'],
    nodes: [
      {
        id: 'n1',
        type: 'customNode',
        position: { x: 100, y: 150 },
        data: {
          type: 'triggerManual',
          label: 'Trigger Manuel',
          icon: 'Play',
          color: '#4ade80',
          category: 'core',
          config: {},
          status: 'idle'
        }
      },
      {
        id: 'n2',
        type: 'customNode',
        position: { x: 350, y: 150 },
        data: {
          type: 'cryptoPrice',
          label: 'Prix Crypto',
          icon: 'Bitcoin',
          color: '#f59e0b',
          category: 'core',
          config: {
            coin: 'bitcoin',
            currency: 'usd'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 600, y: 150 },
        data: {
          type: 'transformJson',
          label: 'Transformer JSON',
          icon: 'RefreshCw',
          color: '#2dd4bf',
          category: 'core',
          config: {
            expression: 'return {\n  message: `🚀 Le prix actuel du ${input.coin?.toUpperCase() || "BTC"} est de $${input.price || input.bitcoin?.usd || "N/A"} !`\n};'
          },
          status: 'idle'
        }
      },
      {
        id: 'n4',
        type: 'customNode',
        position: { x: 850, y: 150 },
        data: {
          type: 'discordWebhook',
          label: 'Envoi Discord',
          icon: 'MessageSquare',
          color: '#5865F2',
          category: 'core',
          config: {
            webhookUrl: '',
            content: '{{input.message}}',
            username: 'Crypto Bot'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', sourceHandle: 'a', target: 'n2', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'n2', sourceHandle: 'a', target: 'n3', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'n3', sourceHandle: 'a', target: 'n4', targetHandle: 'a', type: 'smoothstep', animated: true }
    ]
  }
}
