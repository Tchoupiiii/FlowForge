export const demoCryptoDiscord = {
  id: 'demo-crypto-discord',
  title: 'Alerte Prix Crypto',
  description: 'Vérifie le prix du Bitcoin toutes les heures et envoie une alerte Discord s\'il dépasse un certain seuil.',
  nodes: [
    {
      id: 'cron-1',
      type: 'timerCron',
      position: { x: 50, y: 150 },
      data: {
        label: 'Toutes les heures',
        type: 'timerCron',
        color: '#f59e0b',
        config: {
          interval: '1h'
        }
      }
    },
    {
      id: 'crypto-1',
      type: 'cryptoPrice',
      position: { x: 300, y: 150 },
      data: {
        label: 'Prix BTC',
        type: 'cryptoPrice',
        color: '#f59e0b',
        config: {
          coin: 'bitcoin',
          currency: 'eur'
        }
      }
    },
    {
      id: 'condition-1',
      type: 'condition',
      position: { x: 600, y: 150 },
      data: {
        label: 'Si > 60000€',
        type: 'condition',
        color: '#fb923c',
        config: {
          field: 'price',
          operator: '>',
          value: '60000'
        }
      }
    },
    {
      id: 'discord-1',
      type: 'discordWebhook',
      position: { x: 900, y: 150 },
      data: {
        label: 'Alerte Discord',
        type: 'discordWebhook',
        color: '#5865F2',
        config: {
          webhookUrl: '',
          content: '🚀 ALERTE BTC : Le Bitcoin a dépassé les 60 000€ ! Prix actuel : {{price}}€',
          username: 'Crypto Bot'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'cron-1', target: 'crypto-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e2', source: 'crypto-1', target: 'condition-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e3', source: 'condition-1', target: 'discord-1', sourceHandle: 'a', targetHandle: 'a' }
  ]
}
