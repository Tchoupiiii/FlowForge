export const demoCryptoBot = {
  id: 'demo-crypto-bot',
  name: 'Bot Telegram Crypto',
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 100, y: 200 },
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
      position: { x: 500, y: 200 },
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
      position: { x: 900, y: 200 },
      data: {
        type: 'telegramSend',
        label: 'Envoi Telegram',
        color: '#0088cc',
        config: { botToken: '', chatId: '{{chatId}}', message: 'Le prix de {{coin}} est de {{price}} {{currency}}' }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#0088cc', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } }
  ]
}
