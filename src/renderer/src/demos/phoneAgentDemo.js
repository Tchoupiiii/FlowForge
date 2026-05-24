export const demoPhoneAgent = {
  id: 'demo-phone-agent',
  name: 'Agent Téléphonique Twilio (Réel)',
  description: 'Un véritable Agent Téléphonique IA branché à un vrai numéro Twilio. Configurez Twilio pour pointer vers l\'URL générée, et appelez !',
  tags: ['Téléphonie', 'IA', 'Twilio', 'Automatisé'],
  nodes: [
    {
      id: 'n1',
      type: 'customNode',
      position: { x: 50, y: 200 },
      data: {
        type: 'twilioTrigger',
        label: 'Appel Entrant (Twilio)',
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
          provider: "openai",
          model: "gpt-4o",
          voice: "Polly.Celine",
          systemPrompt: "Tu es l'agent vocal de l'entreprise. Réponds très brièvement et sois poli. Consulte le calendrier si on te demande un RDV.",
          icalUrl: "", // L'utilisateur mettra son vrai lien ical
          logPath: "C:\\Users\\Arthur\\Desktop\\appels_recus.txt",
          twilioPort: 9090
        }
      }
    },
    {
      id: 'n3',
      type: 'customNode',
      position: { x: 740, y: 200 },
      data: {
        type: 'telegramSend',
        label: 'Résumé Telegram',
        color: '#0ea5e9',
        config: {
          botToken: "", // Token Telegram
          chatId: "",
          message: "📞 **Nouvel Appel Terminé !**\n\n**Action décidée :** {{result}}\n\n**Transcription :**\n{{transcript}}"
        }
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
    { id: 'e2-3', source: 'n2', target: 'n3', sourceHandle: 'a', targetHandle: 'a', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }
  ]
}
