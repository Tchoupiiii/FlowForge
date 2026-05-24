export const demoTelegramNotion = {
  id: 'demo-telegram-notion',
  title: 'Telegram -> Notion Task',
  description: 'Écoutez un bot Telegram, analysez le message avec l\'IA pour extraire la tâche, et ajoutez-la à Notion.',
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
          chatId: '{{chatId}}',
          text: '✅ Tâche ajoutée à Notion : {{response}}'
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-1', target: 'ai-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e2', source: 'ai-1', target: 'notion-1', sourceHandle: 'a', targetHandle: 'a' },
    { id: 'e3', source: 'notion-1', target: 'telegram-2', sourceHandle: 'a', targetHandle: 'a' }
  ]
}
