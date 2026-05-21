export default function webhookAi() {
  return {
    name: 'Webhook + Réponse IA',
    description: 'Reçoit des données via webhook, les traite avec un agent IA, puis renvoie la réponse via HTTP.',
    tags: ['Webhook', 'Agent IA', 'HTTP Request'],
    nodes: [
      { id: 'd3_1', type: 'customNode', position: { x: 80, y: 60 }, data: { type: 'webhook', label: 'Webhook', icon: 'Anchor', color: '#c084fc', category: 'core', inputs: 0, outputs: 1, config: { port: 3000, path: '/chat' }, status: 'idle' } },
      { id: 'd3_2', type: 'customNode', position: { x: 80, y: 250 }, data: { type: 'aiAgent', label: 'Agent IA', icon: 'Bot', color: '#818cf8', category: 'ai', inputs: 1, outputs: 1, config: { provider: 'openai', apiKey: '', model: 'gpt-4', systemPrompt: 'Tu es un chatbot amical. Réponds de manière concise et utile.', userPrompt: '', temperature: 0.7 }, status: 'idle' } },
      { id: 'd3_3', type: 'customNode', position: { x: 80, y: 440 }, data: { type: 'httpRequest', label: 'HTTP Request', icon: 'Globe', color: '#60a5fa', category: 'core', inputs: 1, outputs: 1, config: { url: 'https://webhook.site/your-url', method: 'POST', headers: '{"Content-Type": "application/json"}', body: '' }, status: 'idle' } }
    ],
    edges: [
      { id: 'd3_e1', source: 'd3_1', target: 'd3_2', type: 'smoothstep', animated: true },
      { id: 'd3_e2', source: 'd3_2', target: 'd3_3', type: 'smoothstep', animated: true }
    ]
  }
}
