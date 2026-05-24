import { getEvents } from '../calendarStore.js'

export default {
  meta: {
    type: 'googleCalendarGet',
    name: 'Request Google Calendar',
    description: 'Récupère la liste des événements enregistrés dans Google Calendar (simulé).',
    category: 'planning',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const filter = config.filter || inputData.filter || ''
    
    // Simulation API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let events = getEvents()
    if (filter) {
      const lowerFilter = filter.toLowerCase()
      events = events.filter(e => e.summary.toLowerCase().includes(lowerFilter))
    }
    
    return {
      success: true,
      events: events,
      count: events.length,
      result: `Récupéré ${events.length} événement(s) du calendrier.${filter ? ' (Filtre: ' + filter + ')' : ''}`
    }
  }
}
