export const demoTelegramNotion = {
  id: 'demo-telegram-notion',
  name: 'Bot Telegram vers Notion',
  description: 'Écoute les messages d\'un Bot Telegram, en extrait la tâche principale via l\'IA, l\'ajoute dans une base de données Notion, puis renvoie une confirmation de création par message Telegram.',
  tags: ['Telegram', 'Notion', 'IA', 'Productivité'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'telegramTrigger',
      position: { x: 50, y: 150 },
      data: {
        label: 'Bot Telegram',
        type: 'telegramTrigger',
        color: '#38bdf8',
        config: {
          botToken: ''
        }
      }
    },
    {
      id: 'ai-1',
      type: 'aiAgent',
      position: { x: 300, y: 150 },
      data: {
        label: 'Extraction de Tâche',
        type: 'aiAgent',
        color: '#818cf8',
        config: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          systemPrompt: 'Tu es un assistant de productivité. Ton but est d\'extraire la tâche principale du message de l\'utilisateur. Réponds UNIQUEMENT avec le titre court de la tâche, sans ponctuation ni formule de politesse.',
          userPrompt: 'Message: {{text}}'
        }
      }
    },
    {
      id: 'notion-1',
      type: 'notionDatabase',
      position: { x: 600, y: 150 },
      data: {
        label: 'Ajout Notion',
        type: 'notionDatabase',
        color: '#000000',
        config: {
          databaseId: '',
          title: '{{response}}'
        }
      }
    },
    {
      id: 'telegram-2',
      type: 'telegramSend',
      position: { x: 900, y: 150 },
      data: {
        label: 'Confirmation',
        type: 'telegramSend',
        color: '#38bdf8',
        config: {
          botToken: '',
          chatId: '{{chatid}}',
          message: '✅ Tâche ajoutée à Notion : {{response}}'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-1', target: 'ai-1', sourceHandle: 'text', targetHandle: 'userPrompt', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } },
    { id: 'e2', source: 'ai-1', target: 'notion-1', sourceHandle: 'response', targetHandle: 'title', animated: true, style: { stroke: '#818cf8', strokeWidth: 2 } },
    { id: 'e3', source: 'notion-1', target: 'telegram-2', sourceHandle: 'result', targetHandle: 'message', animated: true, style: { stroke: '#000000', strokeWidth: 2 } },
    { id: 'e1-4', source: 'trigger-1', target: 'telegram-2', sourceHandle: 'chatid', targetHandle: 'chatId', animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } }
  ]
}
