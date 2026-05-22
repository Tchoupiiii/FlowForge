export default function shopFinder() {
  return {
    name: 'Recherche Boutiques',
    description: 'Trouve des boutiques à proximité via la carte, transforme les résultats et exporte la liste en fichier JSON.',
    tags: ['Trigger', 'Carte', 'Transformer', 'Écriture Fichier'],
    nodes: [
      { id: 'd5_1', type: 'customNode', position: { x: 80, y: 60 }, data: { type: 'triggerManual', label: 'Trigger Manuel', icon: 'Play', color: '#4ade80', category: 'core', inputs: 0, outputs: 1, config: {}, status: 'idle' } },
      { id: 'd5_2', type: 'customNode', position: { x: 80, y: 230 }, data: { type: 'mapSearch', label: 'Recherche Carte', icon: 'MapPin', color: '#fb7185', category: 'map', inputs: 1, outputs: 1, config: { query: 'boulangerie', location: 'Paris 11e', radius: 2 }, status: 'idle' } },
      { id: 'd5_3', type: 'customNode', position: { x: 80, y: 400 }, data: { type: 'transformJson', label: 'Transformer JSON', icon: 'RefreshCw', color: '#2dd4bf', category: 'core', inputs: 1, outputs: 1, config: { expression: 'return { boutiques: input.places?.map(p => ({ nom: p.name, adresse: p.fullAddress, distance: p.distanceMeters + "m" })) || [], total: input.count || 0 };' }, status: 'idle' } },
      { id: 'd5_4', type: 'customNode', position: { x: 80, y: 570 }, data: { type: 'writeFile', label: 'Écriture Fichier', icon: 'Save', color: '#34d399', category: 'core', inputs: 1, outputs: 1, config: { path: 'C:\\data\\boutiques.json', format: 'json' }, status: 'idle' } }
    ],
    edges: [
      { id: 'd5_e1', source: 'd5_1', sourceHandle: 'a', target: 'd5_2', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd5_e2', source: 'd5_2', sourceHandle: 'a', target: 'd5_3', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd5_e3', source: 'd5_3', sourceHandle: 'a', target: 'd5_4', targetHandle: 'a', type: 'smoothstep', animated: true }
    ]
  }
}
