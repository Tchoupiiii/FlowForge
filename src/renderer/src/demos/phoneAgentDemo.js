export const demoPhoneAgent = {
  id: 'demo-phone-agent',
  name: 'Agent Téléphonique & TTS',
  description: 'Simule un appel téléphonique entrant, gère la réservation en direct sur l\'agenda en moins de 500ms, et convertit la réponse en synthèse vocale.',
  tags: ['Téléphonie', 'IA', 'TTS', 'Agenda'],
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 100, y: 220 },
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
      position: { x: 420, y: 220 },
      data: {
        type: 'phoneAgent',
        label: 'Agent Vocal IA',
        color: '#10b981',
        config: {
          userQuery: "Bonjour, je voudrais prendre rendez-vous pour mardi s'il vous plait.",
          businessDescription: "FlowForge Inc. propose des solutions d'automatisation sans code de niveau entreprise.",
          businessProducts: "FlowForge Pro à 49€/mois, FlowForge Enterprise sur devis.",
          calendarCheck: "Oui"
        }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 740, y: 120 },
      data: {
        type: 'tts',
        label: 'Synthèse Vocale (TTS)',
        color: '#a78bfa',
        config: {
          text: "{{input.response}}",
          language: "fr"
        }
      }
    },
    {
      id: 'n4',
      type: 'customNode',
      position: { x: 740, y: 320 },
      data: {
        type: 'notification',
        label: 'Alerte Notification',
        color: '#f87171',
        config: {
          title: "Rendez-vous Téléphonique",
          body: "Création RDV: {{input.appointmentBooked}} le {{input.appointmentDate}} (Latence: {{input.latencyMs}}ms)"
        }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    { id: 'e2-4', source: 'n2', target: 'n4', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
  ]
}
