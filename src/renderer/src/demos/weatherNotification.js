export default function weatherNotification() {
  return {
    name: 'Météo + Notification IA',
    description: 'Récupère la météo actuelle via API, l\'IA rédige un résumé, puis envoie une notification.',
    tags: ['Timer', 'HTTP', 'Agent IA', 'Notification'],
    nodes: [
      { id: 'd1_1', type: 'customNode', position: { x: 80, y: 60 }, data: { type: 'timerCron', label: 'Timer / Cron', icon: 'Clock', color: '#fbbf24', category: 'core', inputs: 0, outputs: 1, config: { interval: 3600, cron: '' }, status: 'idle' } },
      { id: 'd1_2', type: 'customNode', position: { x: 80, y: 220 }, data: { type: 'httpRequest', label: 'HTTP Request', icon: 'Globe', color: '#60a5fa', category: 'core', inputs: 1, outputs: 1, config: { url: 'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true', method: 'GET', headers: '{}', body: '' }, status: 'idle' } },
      { id: 'd1_3', type: 'customNode', position: { x: 80, y: 380 }, data: { type: 'aiAgent', label: 'Agent IA', icon: 'Bot', color: '#818cf8', category: 'ai', inputs: 1, outputs: 1, config: { provider: 'openai', apiKey: '', model: 'gpt-4', systemPrompt: 'Tu es un météorologue. Résume les données météo en une phrase courte et naturelle en français.', userPrompt: 'Voici les données météo: {{input.current_weather}}', temperature: 0.7 }, status: 'idle' } },
      { id: 'd1_4', type: 'customNode', position: { x: 80, y: 540 }, data: { type: 'notification', label: 'Notification', icon: 'Bell', color: '#f87171', category: 'core', inputs: 1, outputs: 1, config: { title: '🌤 Météo Paris', body: '{{input.response}}' }, status: 'idle' } }
    ],
    edges: [
      { id: 'd1_e1', source: 'd1_1', sourceHandle: 'a', target: 'd1_2', targetHandle: 'a', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'd1_e2', source: 'd1_2', sourceHandle: 'a', target: 'd1_3', targetHandle: 'a', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'd1_e3', source: 'd1_3', sourceHandle: 'a', target: 'd1_4', targetHandle: 'a', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } }
    ]
  }
}
