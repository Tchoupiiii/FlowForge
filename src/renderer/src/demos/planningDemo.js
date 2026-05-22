export default function planningDemo() {
  return {
    name: 'Organisation Quotidienne',
    description: 'Crée automatiquement un événement dans l\'agenda et une tâche de suivi dans Notion.',
    tags: ['Planning', 'Productivité', 'Organisation'],
    nodes: [
      {
        id: 'n1',
        type: 'customNode',
        position: { x: 100, y: 150 },
        data: {
          type: 'triggerManual',
          label: 'Lancement Manuel',
          icon: 'Play',
          color: '#4ade80',
          category: 'core',
          inputs: 0,
          outputs: 1,
          config: {},
          status: 'idle'
        }
      },
      {
        id: 'n2',
        type: 'customNode',
        position: { x: 400, y: 150 },
        data: {
          type: 'googleCalendar',
          label: 'Ajout Agenda',
          icon: 'Calendar',
          color: '#4285F4',
          category: 'planning',
          inputs: 1,
          outputs: 1,
          config: {
            summary: 'Point Synthèse Equipe'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 700, y: 150 },
        data: {
          type: 'notionDatabase',
          label: 'Tâche Notion',
          icon: 'Database',
          color: '#000000',
          category: 'productivite',
          inputs: 1,
          outputs: 1,
          config: {
            title: 'Préparer la synthèse pour la réunion'
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
