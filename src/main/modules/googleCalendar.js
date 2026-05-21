export default {
  meta: {
    type: 'googleCalendar',
    name: 'Google Calendar (Planning)',
    description: 'Crée un évènement dans Google Calendar (simulé).',
    category: 'planning',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const summary = config.summary || inputData.summary || 'Nouvel Événement'
    const date = config.date || inputData.date || new Date().toISOString()
    
    // Simulation API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      success: true,
      eventId: `gcal_${Math.random().toString(36).substr(2, 9)}`,
      summary: summary,
      date: date,
      link: 'https://calendar.google.com/calendar/u/0/r/eventedit',
      timestamp: Date.now()
    }
  }
}
