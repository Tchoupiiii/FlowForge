export const demoWeather = {
  id: 'demo-weather',
  name: 'Météo du Jour',
  description: 'Récupère automatiquement la météo actuelle via l\'API météo gratuite (Open-Meteo) chaque matin et l\'envoie sous forme de notification desktop.',
  tags: ['Météo', 'API', 'Automatique', 'Notifications'],
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 50, y: 150 },
      data: {
        type: 'timerCron',
        label: 'Tous les matins à 8h',
        color: '#f59e0b',
        config: { interval: '0 8 * * *' }
      }
    },
    {
      id: 'n2',
      type: 'customNode',
      position: { x: 350, y: 150 },
      data: {
        type: 'httpRequest',
        label: 'Météo (Open-Meteo)',
        color: '#10b981',
        config: { url: 'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true', method: 'GET', headers: '{}', body: '' }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 680, y: 150 },
      data: {
        type: 'notification',
        label: 'Notification Météo',
        color: '#f87171',
        config: { title: 'Météo à Paris', body: 'Il fait actuellement {{current_weather.temperature}}°C.' }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'content', targetHandle: 'body', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
  ]
}
