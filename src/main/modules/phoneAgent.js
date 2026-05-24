import { getEvents, addEvent } from '../calendarStore.js'

export const meta = {
  type: 'phoneAgent',
  name: 'Agent Téléphonique',
  description: 'Simule un agent vocal intelligent répondant au téléphone en moins de 500ms.',
  category: 'ai',
  inputs: 1,
  outputs: 1
}

export async function execute(config, inputData) {
  const userQuery = config.userQuery || inputData?.text || inputData?.message || inputData?.result || 'Bonjour, que proposez-vous ?'
  const businessDescription = config.businessDescription || 'FlowForge Inc. propose des solutions d\'automatisation sans code de niveau entreprise.'
  const businessProducts = config.businessProducts || 'FlowForge Pro à 49€/mois, FlowForge Enterprise sur devis.'
  const calendarCheck = config.calendarCheck || 'Oui'

  const startTime = Date.now()

  // Simulate ultra-low human latency (<500ms)
  // We'll generate a random latency between 250ms and 420ms
  const targetLatency = Math.floor(Math.random() * 170) + 250
  await new Promise(resolve => setTimeout(resolve, targetLatency))

  const query = userQuery.toLowerCase()
  let response = ''
  let appointmentBooked = false
  let appointmentDate = null

  // 1. Check for Appointment Booking / Agenda inquiries
  const bookingKeywords = ['rdv', 'rendez-vous', 'rendez vous', 'reserver', 'réserver', 'book', 'agenda', 'calendrier', 'creneau', 'créneau', 'rencontrer']
  const matchesBooking = bookingKeywords.some(kw => query.includes(kw))

  if (matchesBooking && calendarCheck === 'Oui') {
    // Try to extract a simulated date or default to tomorrow at 14:00
    let targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 1) // Tomorrow
    targetDate.setHours(14, 0, 0, 0) // 14:00

    // Simple natural language date parsing for demo queries
    if (query.includes('lundi') || query.includes('monday')) {
      const dayOffset = (1 + 7 - new Date().getDay()) % 7 || 7
      targetDate.setDate(targetDate.getDate() + dayOffset)
    } else if (query.includes('mardi') || query.includes('tuesday')) {
      const dayOffset = (2 + 7 - new Date().getDay()) % 7 || 7
      targetDate.setDate(targetDate.getDate() + dayOffset)
    } else if (query.includes('mercredi') || query.includes('wednesday')) {
      const dayOffset = (3 + 7 - new Date().getDay()) % 7 || 7
      targetDate.setDate(targetDate.getDate() + dayOffset)
    } else if (query.includes('jeudi') || query.includes('thursday')) {
      const dayOffset = (4 + 7 - new Date().getDay()) % 7 || 7
      targetDate.setDate(targetDate.getDate() + dayOffset)
    } else if (query.includes('vendredi') || query.includes('friday')) {
      const dayOffset = (5 + 7 - new Date().getDay()) % 7 || 7
      targetDate.setDate(targetDate.getDate() + dayOffset)
    }

    const dateStr = targetDate.toISOString()
    
    // Check conflicts in simulated calendar
    const existingEvents = getEvents()
    const hasConflict = existingEvents.some(event => {
      const eventTime = new Date(event.date).getTime()
      return Math.abs(eventTime - targetDate.getTime()) < 1800000 // 30 min window
    })

    if (hasConflict) {
      // Propose alternate slot (tomorrow + 1 hour)
      targetDate.setHours(targetDate.getHours() + 2)
      const alternateDateStr = targetDate.toISOString()
      const formattedDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      
      const newEvent = addEvent('Rendez-vous téléphonique client', alternateDateStr)
      appointmentBooked = true
      appointmentDate = alternateDateStr
      response = `Allô ? Le créneau initial était déjà réservé, mais j'ai pu libérer un rendez-vous pour vous le ${formattedDate}. Est-ce que cela vous convient ?`
    } else {
      const formattedDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      const newEvent = addEvent('Rendez-vous téléphonique client', dateStr)
      appointmentBooked = true
      appointmentDate = dateStr
      response = `Allô ? Parfait, j'ai vérifié notre agenda et c'est tout à fait libre. J'ai bloqué votre rendez-vous pour le ${formattedDate}. On se reparle à ce moment-là !`
    }
  } 
  // 2. What does the company do
  else if (query.includes('fait') || query.includes('propose') || query.includes('activité') || query.includes('entreprise') || query.includes('c\'est quoi') || query.includes('est-ce que vous faites')) {
    response = `Allô ? Alors, en quelques mots : ${businessDescription} Nous aidons nos clients à automatiser tous leurs processus quotidiens facilement.`
  }
  // 3. Products and Pricing
  else if (query.includes('vend') || query.includes('prix') || query.includes('tarif') || query.includes('combien') || query.includes('offre') || query.includes('produit')) {
    response = `Allô ? Concernant nos offres et nos tarifs, nous proposons : ${businessProducts} N'hésitez pas si vous souhaitez que l'on planifie un appel de démo !`
  }
  // 4. Default / Greetings
  else if (query.includes('bonjour') || query.includes('salut') || query.includes('allo') || query.includes('allô')) {
    response = `Bonjour ! Bienvenue chez nous. Je suis l'assistant vocal de l'entreprise. Comment puis-je vous aider aujourd'hui ? Prendre rendez-vous, découvrir nos tarifs ?`
  } 
  // 5. General fallback
  else {
    response = `Allô ? J'ai bien reçu votre demande. Pour votre information : ${businessDescription} Je peux aussi prendre vos rendez-vous directement par téléphone, demandez-moi !`
  }

  const latencyMs = Date.now() - startTime

  return {
    success: true,
    response,
    result: response,
    latencyMs,
    appointmentBooked,
    appointmentDate,
    timestamp: Date.now()
  }
}
