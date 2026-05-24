export const demoPhoneAgent = {
  id: 'demo-phone-agent',
  name: 'Agent Téléphonique & TTS',
  description: 'Simule un appel téléphonique entrant, planifie un rendez-vous sur Google Calendar en direct, et convertit la réponse en synthèse vocale (TTS).',
  tags: ['Téléphonie', 'IA', 'Agenda', 'Google Calendar'],
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 50, y: 200 },
      data: {
        type: 'triggerManual',
        label: 'Appel Téléphonique (Déclencheur)',
        color: '#f43f5e',
        config: {}
      }
    },
    {
      id: 'n2',
      type: 'customNode',
      position: { x: 350, y: 200 },
      data: {
        type: 'phoneAgent',
        label: 'Agent Vocal IA',
        color: '#10b981',
        config: {
          source: "Calendar",
          provider: "openai",
          model: "gpt-4o",
          voice: "Alloy",
          systemPrompt: "Tu es l'agent vocal de FlowForge Inc. qui propose des solutions d'automatisation sans code.",
          userPrompt: "Bonjour, je voudrais prendre rendez-vous pour mardi s'il vous plaît.",
          logPath: "C:\\Users\\Arthur\\Desktop\\appel_log.txt"
        }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 740, y: 80 },
      data: {
        type: 'tts',
        label: 'Synthèse Vocale (TTS)',
        color: '#a78bfa',
        config: {
          text: "{{response}}",
          language: "fr"
        }
      }
    },
    {
      id: 'n5',
      type: 'customNode',
      position: { x: 740, y: 320 },
      data: {
        type: 'googleCalendar',
        label: 'Google Calendar (Planning)',
        color: '#4285F4',
        config: {
          summary: "RDV Appelant FlowForge",
          date: "{{appointmentDate}}"
        }
      }
    },
    {
      id: 'n4',
      type: 'customNode',
      position: { x: 1100, y: 320 },
      data: {
        type: 'notification',
        label: 'Alerte Confirmation',
        color: '#f87171',
        config: {
          title: "Événement Google Calendar créé",
          body: "{{result}} (Latence: {{latencyMs}}ms)"
        }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'response', targetHandle: 'text', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e2-5', source: 'n2', target: 'n5', sourceHandle: 'appointmentDate', targetHandle: 'date', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e5-4', source: 'n5', target: 'n4', sourceHandle: 'result', targetHandle: 'body', animated: true, style: { stroke: '#4285F4', strokeWidth: 2 } }
  ]
}
