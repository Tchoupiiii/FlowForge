export const demoLoop = {
  id: 'demo-loop',
  name: 'Boucle For-Each',
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
        type: 'codeJs',
        label: 'Générer Tableau',
        color: '#fcd34d',
        config: { code: 'return { items: [1, 2, 3, 4, 5] };' }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 700, y: 200 },
      data: {
        type: 'loopForEach',
        label: 'Boucle',
        color: '#22d3ee',
        config: { arrayField: 'items', maxIterations: 0 }
      }
    },
    {
      id: 'n4',
      type: 'customNode',
      position: { x: 1000, y: 200 },
      data: {
        type: 'codeJs',
        label: 'Multiplier x10',
        color: '#fcd34d',
        config: { code: 'return { result: input.item * 10 };' }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#fcd34d', strokeWidth: 2 } },
    { id: 'e3-4', source: 'n3', target: 'n4', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 } }
  ]
}
