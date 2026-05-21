export default function githubTranslateDemo() {
  return {
    name: 'GitHub Repo Traductor',
    description: 'Récupère les infos d\'un dépôt GitHub, traduit sa description et sauvegarde le tout dans un fichier JSON.',
    tags: ['GitHub', 'IA', 'Fichier'],
    nodes: [
      {
        id: 'n1',
        type: 'customNode',
        position: { x: 100, y: 150 },
        data: {
          type: 'triggerManual',
          label: 'Trigger Manuel',
          icon: 'Play',
          color: '#4ade80',
          category: 'core',
          config: {},
          status: 'idle'
        }
      },
      {
        id: 'n2',
        type: 'customNode',
        position: { x: 350, y: 150 },
        data: {
          type: 'githubRepoInfo',
          label: 'Info GitHub',
          icon: 'Github',
          color: '#18181b',
          category: 'api',
          config: {
            owner: 'facebook',
            repo: 'react'
          },
          status: 'idle'
        }
      },
      {
        id: 'n3',
        type: 'customNode',
        position: { x: 600, y: 150 },
        data: {
          type: 'translateText',
          label: 'Traduction',
          icon: 'Languages',
          color: '#8b5cf6',
          category: 'ai',
          config: {
            targetLanguage: 'fr',
            text: '{{input.description}}'
          },
          status: 'idle'
        }
      },
      {
        id: 'n4',
        type: 'customNode',
        position: { x: 850, y: 150 },
        data: {
          type: 'writeFile',
          label: 'Sauvegarder JSON',
          icon: 'Save',
          color: '#34d399',
          category: 'core',
          config: {
            path: 'C:\\data\\react_repo.json',
            format: 'json'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep', animated: true },
      { id: 'e2-3', source: 'n2', target: 'n3', type: 'smoothstep', animated: true },
      { id: 'e3-4', source: 'n3', target: 'n4', type: 'smoothstep', animated: true }
    ]
  }
}
