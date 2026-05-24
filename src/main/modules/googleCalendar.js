import { addEvent } from '../calendarStore.js'

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
    
    const newEvent = addEvent(summary, date)
    
    return {
      success: true,
      eventId: newEvent.id,
      summary: summary,
      date: date,
      link: 'https://calendar.google.com/calendar/u/0/r/eventedit',
      timestamp: Date.now(),
      result: `Événement "${summary}" planifié pour le ${date}.`
    }
  }
}

