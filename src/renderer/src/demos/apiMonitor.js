export const demoApiMonitor = {
  id: 'demo-api-monitor',
  name: 'Monitoring API (Health Check)',
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 100, y: 200 },
      data: {
        type: 'triggerManual',
        label: 'Déclencheur Manuel',
        color: '#f43f5e',
        config: {}
      }
    },
    {
      id: 'n2',
      type: 'customNode',
      position: { x: 400, y: 200 },
      data: {
        type: 'httpRequest',
        label: 'Requête HTTP',
        color: '#10b981',
        config: { url: 'https://api.github.com', method: 'GET', headers: '{}', body: '' }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 700, y: 200 },
      data: {
        type: 'condition',
        label: 'Condition Status',
        color: '#eab308',
        config: { field: '{{status}}', operator: 'equals', value: '200' }
      }
    },
    {
      id: 'n4',
      type: 'customNode',
      position: { x: 1000, y: 100 },
      data: {
        type: 'notification',
        label: 'Alerte Succès',
        color: '#f87171',
        config: { title: 'API UP', body: "L'API répond correctement ({{status}})." }
      }
    },
    {
      id: 'n5',
      type: 'customNode',
      position: { x: 1000, y: 300 },
      data: {
        type: 'notification',
        label: 'Alerte Erreur',
        color: '#f87171',
        config: { title: 'API DOWN', body: 'Erreur: Le status est {{status}}' }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'status', targetHandle: 'field', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e3-4', source: 'n3', target: 'n4', sourceHandle: 'true', targetHandle: 'title', animated: true, style: { stroke: '#4ade80', strokeWidth: 2 } },
    { id: 'e3-5', source: 'n3', target: 'n5', sourceHandle: 'false', targetHandle: 'title', animated: true, style: { stroke: '#f87171', strokeWidth: 2 } }
  ]
}
