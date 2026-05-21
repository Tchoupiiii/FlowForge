export default function healthDemo() {
  return {
    name: 'Veille Santé Publique',
    description: 'Interroge l\'API OpenFDA pour surveiller les effets secondaires d\'un médicament et sauvegarde le résultat.',
    tags: ['Santé', 'API', 'Fichier'],
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
          type: 'openFda',
          label: 'Recherche OpenFDA',
          icon: 'Heart',
          color: '#ec4899',
          category: 'sante',
          inputs: 1,
          outputs: 1,
          config: {
            query: 'paracetamol',
            endpoint: 'drug/event'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 700, y: 150 },
        data: {
          type: 'writeFile',
          label: 'Sauvegarde JSON',
          icon: 'Save',
          color: '#34d399',
          category: 'core',
          inputs: 1,
          outputs: 1,
          config: {
            path: 'effets_secondaires_paracetamol.json',
            format: 'json'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
      { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true, style: { stroke: 'var(--accent)', strokeWidth: 2 } }
    ]
  }
}
