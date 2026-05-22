export default function sentimentAnalysis() {
  return {
    name: 'Analyse de Sentiment',
    description: 'Lit un fichier de reviews, analyse le sentiment avec l\'IA, puis notifie si des avis négatifs sont détectés.',
    tags: ['Trigger', 'Lecture Fichier', 'Analyseur IA', 'Condition', 'Notification'],
    nodes: [
      { id: 'd6_1', type: 'customNode', position: { x: 100, y: 60 }, data: { type: 'triggerManual', label: 'Trigger Manuel', icon: 'Play', color: '#4ade80', category: 'core', inputs: 0, outputs: 1, config: {}, status: 'idle' } },
      { id: 'd6_2', type: 'customNode', position: { x: 100, y: 220 }, data: { type: 'readFile', label: 'Lecture Fichier', icon: 'FolderOpen', color: '#a78bfa', category: 'core', inputs: 1, outputs: 1, config: { path: 'C:\\data\\reviews.txt', format: 'text' }, status: 'idle' } },
      { id: 'd6_3', type: 'customNode', position: { x: 100, y: 380 }, data: { type: 'aiTextAnalyzer', label: 'Analyseur Texte IA', icon: 'Brain', color: '#a78bfa', category: 'ai', inputs: 1, outputs: 1, config: { provider: 'openai', apiKey: '', model: 'gpt-4', analysisType: 'sentiment' }, status: 'idle' } },
      { id: 'd6_4', type: 'customNode', position: { x: 100, y: 540 }, data: { type: 'condition', label: 'Condition', icon: 'GitBranch', color: '#fb923c', category: 'core', inputs: 1, outputs: 2, config: { field: 'sentiment', operator: '==', value: 'négatif' }, status: 'idle' } },
      { id: 'd6_5', type: 'customNode', position: { x: 300, y: 700 }, data: { type: 'notification', label: 'Notification', icon: 'Bell', color: '#f87171', category: 'core', inputs: 1, outputs: 1, config: { title: '⚠️ Avis négatif détecté', body: 'Un avis négatif a été identifié. Vérifiez les reviews.' }, status: 'idle' } },
      { id: 'd6_6', type: 'customNode', position: { x: -100, y: 700 }, data: { type: 'notification', label: 'Notification', icon: 'Bell', color: '#4ade80', category: 'core', inputs: 1, outputs: 1, config: { title: '✅ Avis positif', body: 'Tous les avis sont positifs !' }, status: 'idle' } }
    ],
    edges: [
      { id: 'd6_e1', source: 'd6_1', sourceHandle: 'a', target: 'd6_2', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd6_e2', source: 'd6_2', sourceHandle: 'a', target: 'd6_3', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd6_e3', source: 'd6_3', sourceHandle: 'a', target: 'd6_4', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd6_e4', source: 'd6_4', sourceHandle: 'true', target: 'd6_5', targetHandle: 'a', type: 'smoothstep', animated: true },
      { id: 'd6_e5', source: 'd6_4', sourceHandle: 'false', target: 'd6_6', targetHandle: 'a', type: 'smoothstep', animated: true }
    ]
  }
}
