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

  // 1. Scan for local document text / PDF Menu context passed from parents
  let documentText = inputData?.text || inputData?.content || inputData?.result || ''
  if (documentText.trim() === userQuery.trim()) {
    documentText = '' // avoid self-loop
  }

  let pdfLookup = 'Aucun document PDF/Menu connecté.'
  let matchedInfo = ''

  if (documentText) {
    pdfLookup = 'Analyse du document PDF/Menu...'
    const lines = documentText.split('\n').map(l => l.trim()).filter(Boolean)
    const matches = []
    const queryWords = query.split(/\s+/).filter(w => w.length > 3)
    
    for (const line of lines) {
      if (queryWords.some(w => line.toLowerCase().includes(w))) {
        matches.push(line)
      }
    }
    
    if (matches.length > 0) {
      matchedInfo = matches.slice(0, 2).join(' / ')
      pdfLookup = `Match trouvé dans le PDF : "${matchedInfo}"`
    } else {
      // Fallback to first few lines of document
      matchedInfo = lines.slice(0, 2).join(' / ')
      pdfLookup = `Lecture des premières lignes : "${matchedInfo}"`
    }
  }

  // 2. Check for Appointment Booking / Agenda inquiries
  const bookingKeywords = ['rdv', 'rendez-vous', 'rendez vous', 'reserver', 'réserver', 'book', 'agenda', 'calendrier', 'creneau', 'créneau', 'rencontrer']
  const matchesBooking = bookingKeywords.some(kw => query.includes(kw))

  if (matchesBooking && calendarCheck === 'Oui') {
    let targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 1) // Tomorrow
    targetDate.setHours(14, 0, 0, 0) // 14:00

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
    const existingEvents = getEvents()
    const hasConflict = existingEvents.some(event => {
      const eventTime = new Date(event.date).getTime()
      return Math.abs(eventTime - targetDate.getTime()) < 1800000 // 30 min window
    })

    if (hasConflict) {
      targetDate.setHours(targetDate.getHours() + 2)
      const alternateDateStr = targetDate.toISOString()
      const formattedDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      
      addEvent('Rendez-vous téléphonique client', alternateDateStr)
      appointmentBooked = true
      appointmentDate = alternateDateStr
      response = `Allô ? Le créneau initial était déjà réservé, mais j'ai pu libérer un rendez-vous pour vous le ${formattedDate}. Est-ce que cela vous convient ?`
    } else {
      const formattedDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
      addEvent('Rendez-vous téléphonique client', dateStr)
      appointmentBooked = true
      appointmentDate = dateStr
      response = `Allô ? Parfait, j'ai vérifié notre agenda et c'est tout à fait libre. J'ai bloqué votre rendez-vous pour le ${formattedDate}. On se reparle à ce moment-là !`
    }
  } 
  // 3. Query relates to products / menu with PDF content present
  else if (matchedInfo && (query.includes('menu') || query.includes('plat') || query.includes('vend') || query.includes('carte') || query.includes('manger') || query.includes('pizza') || query.includes('tarif') || query.includes('prix'))) {
    response = `Allô ? Oui, j'ai notre carte sous les yeux : ${matchedInfo}. Souhaitez-vous réserver une table ou commander ?`
  }
  // 4. What does the company do
  else if (query.includes('fait') || query.includes('propose') || query.includes('activité') || query.includes('entreprise') || query.includes('c\'est quoi') || query.includes('est-ce que vous faites')) {
    response = `Allô ? Alors, en quelques mots : ${businessDescription} Nous aidons nos clients à automatiser tous leurs processus quotidiens facilement.`
  }
  // 5. Products and Pricing (without specific PDF matches)
  else if (query.includes('vend') || query.includes('prix') || query.includes('tarif') || query.includes('combien') || query.includes('offre') || query.includes('produit')) {
    response = `Allô ? Concernant nos offres et nos tarifs, nous proposons : ${businessProducts} N'hésitez pas si vous souhaitez que l'on planifie un appel de démo !`
  }
  // 6. Default / Greetings
  else if (query.includes('bonjour') || query.includes('salut') || query.includes('allo') || query.includes('allô')) {
    response = `Bonjour ! Bienvenue chez nous. Je suis l'assistant vocal de l'entreprise. Comment puis-je vous aider aujourd'hui ? Prendre rendez-vous, découvrir nos tarifs ?`
  } 
  // 7. General fallback
  else {
    response = `Allô ? J'ai bien reçu votre demande. Pour votre information : ${businessDescription} Je peux aussi prendre vos rendez-vous directement par téléphone, demandez-moi !`
  }

  const latencyMs = Date.now() - startTime

  // Compile detailed, human-looking call log transcript
  const transcript = `
[📞 APPEL TÉLÉPHONIQUE ENTRANT]
Tonalité... Clic.

[APPELANT]: "${userQuery}"
🎙️ STT (Transcription vocale) : "${userQuery}" [Fiabilité : 98%]
🧠 Détermination intention : ${matchesBooking ? 'Planification de RDV' : documentText ? 'Consultation Menu/PDF' : 'Demande d\'information'}
🔍 Lecture Document : ${pdfLookup}
📅 Consultation Agenda : ${matchesBooking ? `Vérification de disponibilité (${calendarCheck === 'Oui' ? 'Active' : 'Désactivée'}). Création d'événement...` : 'Aucune action requise'}

[AGENT VOCAL IA] : "${response}"

[⏱️ Latence système : ${latencyMs}ms | Statut RDV : ${appointmentBooked ? 'Confirmé' : 'Aucun'}]
[Fin de l'appel]
`.trim()

  return {
    success: true,
    response,
    result: response,
    transcript,
    latencyMs,
    appointmentBooked,
    appointmentDate,
    timestamp: Date.now()
  }
}
