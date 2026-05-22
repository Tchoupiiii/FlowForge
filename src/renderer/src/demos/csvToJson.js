export default function csvToJson() {
  return {
    name: 'Convertisseur CSV → JSON',
    description: 'Lit un fichier CSV, le transforme en JSON structuré, puis l\'écrit dans un nouveau fichier.',
    tags: ['Trigger', 'Lecture Fichier', 'Transformer', 'Écriture'],
    nodes: [
      { id: 'd2_1', type: 'customNode', position: { x: 80, y: 60 }, data: { type: 'triggerManual', label: 'Trigger Manuel', icon: 'Play', color: '#4ade80', category: 'core', inputs: 0, outputs: 1, config: {}, status: 'idle' } },
      { id: 'd2_2', type: 'customNode', position: { x: 80, y: 220 }, data: { type: 'readFile', label: 'Lecture Fichier', icon: 'FolderOpen', color: '#a78bfa', category: 'core', inputs: 1, outputs: 1, config: { path: 'C:\\data\\input.csv', format: 'csv' }, status: 'idle' } },
      { id: 'd2_3', type: 'customNode', position: { x: 80, y: 380 }, data: { type: 'transformJson', label: 'Transformer JSON', icon: 'RefreshCw', color: '#2dd4bf', category: 'core', inputs: 1, outputs: 1, config: { expression: 'return { records: input.data, count: input.data?.length || 0, convertedAt: new Date().toISOString() };' }, status: 'idle' } },
      { id: 'd2_4', type: 'customNode', position: { x: 80, y: 540 }, data: { type: 'writeFile', label: 'Écriture Fichier', icon: 'Save', color: '#34d399', category: 'core', inputs: 1, outputs: 1, config: { path: 'C:\\data\\output.json', format: 'json' }, status: 'idle' } }
    ],
    edges: [
      { id: 'd2_e1', source: 'd2_1', sourceHandle: 'a', target: 'd2_2', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd2_e2', source: 'd2_2', sourceHandle: 'a', target: 'd2_3', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd2_e3', source: 'd2_3', sourceHandle: 'a', target: 'd2_4', targetHandle: 'a', type: 'smoothstep', animated: true }
    ]
  }
}
