export const demoImageGenerator = {
  id: 'demo-image',
  name: 'Générateur d\'images Discord',
  description: 'Génère automatiquement une description optimisée pour DALL-E 3 avec un Agent IA, puis produit l\'illustration correspondante et envoie une alerte avec l\'URL de l\'image.',
  tags: ['IA', 'DALL-E', 'Génération Image', 'Discord'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'triggerManual',
      position: { x: 50, y: 150 },
      data: { label: 'Déclencheur', type: 'triggerManual', color: '#f43f5e', config: {} }
    },
    {
      id: 'ai-prompt',
      type: 'aiAgent',
      position: { x: 300, y: 150 },
      data: {
        label: 'Création du Prompt',
        type: 'aiAgent',
        color: '#818cf8',
        config: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          systemPrompt: 'Tu es un prompt engineer pour DALL-E.',
          userPrompt: 'Génère une description détaillée en anglais pour une image de "Chat astronaute sur Mars". Limite à une phrase.'
        }
      }
    },
    {
      id: 'image-1',
      type: 'aiImageGenerator',
      position: { x: 600, y: 150 },
      data: {
        label: 'DALL-E 3',
        type: 'aiImageGenerator',
        color: '#d946ef',
        config: {
          prompt: '{{response}}',
          model: 'dall-e-3',
          size: '1024x1024'
        }
      }
    },
    {
      id: 'notify-1',
      type: 'notification',
      position: { x: 900, y: 150 },
      data: {
        label: 'Alerte Image',
        type: 'notification',
        color: '#f87171',
        config: {
          title: 'Image Prête',
          body: 'Votre image a été générée : {{url}}'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-1', target: 'ai-prompt', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e2', source: 'ai-prompt', target: 'image-1', sourceHandle: 'response', targetHandle: 'prompt', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
    { id: 'e3', source: 'image-1', target: 'notify-1', sourceHandle: 'url', targetHandle: 'body', animated: true, style: { stroke: '#d946ef', strokeWidth: 2 } }
  ]
}
