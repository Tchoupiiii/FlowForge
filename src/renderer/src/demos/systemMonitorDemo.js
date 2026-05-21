export default function systemMonitorDemo() {
  return {
    name: 'Moniteur Système OS',
    description: 'Exécute une commande shell locale pour surveiller l\'espace disque et sauvegarde le résultat.',
    tags: ['Système', 'Terminal', 'Fichier'],
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
          type: 'executeCommand',
          label: 'Info Système',
          icon: 'Terminal',
          color: '#64748b',
          category: 'systeme',
          inputs: 1,
          outputs: 1,
          config: {
            command: 'systeminfo | findstr /C:"OS Name" /C:"Total Physical Memory"'
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
          label: 'Sauvegarde Log',
          icon: 'Save',
          color: '#34d399',
          category: 'core',
          inputs: 1,
          outputs: 1,
          config: {
            path: 'system_status.log',
            format: 'text'
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
