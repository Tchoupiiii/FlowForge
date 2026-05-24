export const demoCryptoBot = {
  id: 'demo-crypto-bot',
  name: 'Bot Telegram Crypto',
  description: 'Écoute les demandes de prix crypto par Telegram, interroge l\'API de cours en temps réel, et renvoie la réponse au client.',
  tags: ['Crypto', 'Telegram', 'API Bourse'],
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 50, y: 150 },
      data: {
        type: 'telegramTrigger',
        label: 'Trigger Telegram',
        color: '#0088cc',
        config: { botToken: '', timeout: 30 }
      }
    },
    {
      id: 'n2',
      type: 'customNode',
      position: { x: 380, y: 150 },
      data: {
        type: 'cryptoPrice',
        label: 'Prix Crypto',
        color: '#f59e0b',
        config: { coin: '{{text}}', currency: 'usd' }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 700, y: 150 },
      data: {
        type: 'telegramSend',
        label: 'Envoi Telegram',
        color: '#0088cc',
        config: { botToken: '', chatId: '{{chatid}}', message: 'Le prix de {{coin}} est de {{price}} USD.' }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'text', targetHandle: 'coin', animated: true, style: { stroke: '#0088cc', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'price', targetHandle: 'message', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { id: 'e1-3', source: 'n1', target: 'n3', sourceHandle: 'chatid', targetHandle: 'chatId', animated: true, style: { stroke: '#0088cc', strokeWidth: 2 } }
  ]
}
