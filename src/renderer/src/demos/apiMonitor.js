export default function apiMonitor() {
  return {
    name: 'Surveillance API',
    description: 'Surveille un endpoint API à intervalles réguliers. Envoie un email d\'alerte si le serveur ne répond plus.',
    tags: ['Timer', 'HTTP', 'Condition', 'Email'],
    nodes: [
      { id: 'd4_1', type: 'customNode', position: { x: 100, y: 60 }, data: { type: 'timerCron', label: 'Timer / Cron', icon: 'Clock', color: '#fbbf24', category: 'core', inputs: 0, outputs: 1, config: { interval: 300, cron: '' }, status: 'idle' } },
      { id: 'd4_2', type: 'customNode', position: { x: 100, y: 220 }, data: { type: 'httpRequest', label: 'HTTP Request', icon: 'Globe', color: '#60a5fa', category: 'core', inputs: 1, outputs: 1, config: { url: 'https://api.example.com/health', method: 'GET', headers: '{}', body: '' }, status: 'idle' } },
      { id: 'd4_3', type: 'customNode', position: { x: 100, y: 380 }, data: { type: 'condition', label: 'Condition', icon: 'GitBranch', color: '#fb923c', category: 'core', inputs: 1, outputs: 2, config: { field: 'status', operator: '!=', value: '200' }, status: 'idle' } },
      { id: 'd4_4', type: 'customNode', position: { x: 300, y: 540 }, data: { type: 'email', label: 'Email SMTP', icon: 'Mail', color: '#f472b6', category: 'core', inputs: 1, outputs: 1, config: { to: 'admin@example.com', subject: '⚠️ API Down!', body: 'L\'API ne répond plus. Vérifiez le serveur immédiatement.' }, status: 'idle' } },
      { id: 'd4_5', type: 'customNode', position: { x: -100, y: 540 }, data: { type: 'notification', label: 'Notification', icon: 'Bell', color: '#f87171', category: 'core', inputs: 1, outputs: 1, config: { title: '✅ API OK', body: 'Le serveur fonctionne normalement.' }, status: 'idle' } }
    ],
    edges: [
      { id: 'd4_e1', source: 'd4_1', sourceHandle: 'a', target: 'd4_2', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd4_e2', source: 'd4_2', sourceHandle: 'a', target: 'd4_3', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd4_e3', source: 'd4_3', sourceHandle: 'true', target: 'd4_4', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd4_e4', source: 'd4_3', sourceHandle: 'false', target: 'd4_5', targetHandle: 'a', type: 'smoothstep', animated: true }
    ]
  }
}
