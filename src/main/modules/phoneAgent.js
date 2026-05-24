import { getEvents, addEvent } from '../calendarStore.js'
import fs from 'fs'
import path from 'path'

export const meta = {
  type: 'phoneAgent',
  name: 'Agent Téléphonique',
  description: 'Simule un agent vocal intelligent répondant au téléphone en moins de 500ms.',
  category: 'ai',
  inputs: 1,
  outputs: 1
}

function getUniqueFilePath(originalPath) {
  if (!fs.existsSync(originalPath)) {
    return originalPath
  }
  const ext = path.extname(originalPath)
  const dir = path.dirname(originalPath)
  const base = path.basename(originalPath, ext)
  
  let counter = 1
  let newPath = path.join(dir, `${base} (${counter})${ext}`)
  while (fs.existsSync(newPath)) {
    counter++
    newPath = path.join(dir, `${base} (${counter})${ext}`)
  }
  return newPath
}

export async function execute(config, inputData) {
  const source = config.source || 'None'
  const provider = config.provider || 'openai'
  const model = config.model || 'gpt-4o'
  const voice = config.voice || 'Alloy'
  const systemPrompt = config.systemPrompt || 'Tu es un assistant vocal téléphonique poli et concis.'
  const userQuery = config.userPrompt || inputData?.text || inputData?.message || inputData?.result || 'Bonjour, je voudrais prendre un rendez-vous mardi s\'il vous plaît.'
  const logPath = config.logPath || ''

  const startTime = Date.now()

  // Simulate ultra-low human latency (<500ms)
  // We'll generate a random latency between 250ms and 420ms
  const targetLatency = Math.floor(Math.random() * 170) + 250
  await new Promise(resolve => setTimeout(resolve, targetLatency))

  const query = userQuery.toLowerCase()
  let response = ''
  let appointmentBooked = false
  let appointmentDate = null
  let sourceLookup = 'Aucune source de données connectée.'
  let matchedInfo = ''

  // 1. Scan for local document text / PDF / XLS context passed from parents or config
  let documentText = inputData?.text || inputData?.content || inputData?.result || ''
  if (documentText.trim() === userQuery.trim()) {
    documentText = '' // avoid self-loop
  }

  if (source === 'PDF' || source === 'XLS') {
    if (documentText) {
      sourceLookup = `Analyse du document ${source}...`
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
        sourceLookup = `Match trouvé dans le ${source} : "${matchedInfo}"`
      } else {
        matchedInfo = lines.slice(0, 2).join(' / ')
        sourceLookup = `Lecture des premières lignes du ${source} : "${matchedInfo}"`
      }
    } else {
      // Mock document text if none passed from parent node
      matchedInfo = source === 'PDF'
        ? "Menu de la Pizzeria : Pizza Margherita à 10€, Pizza Regina à 12€, Panna Cotta à 6€."
        : "Liste de Prix XLS : Licence Standard à 49€/mois, Licence Premium à 99€/mois."
      sourceLookup = `Lecture simulée du fichier ${source} (aucun nœud parent connecté)`
    }
  } else if (source === 'Calendar') {
    sourceLookup = 'Vérification de l\'agenda Google Calendar...'
  }

  // 2. Check for Appointment Booking / Agenda inquiries
  const bookingKeywords = ['rdv', 'rendez-vous', 'rendez vous', 'reserver', 'réserver', 'book', 'agenda', 'calendrier', 'creneau', 'créneau', 'rencontrer']
  const matchesBooking = bookingKeywords.some(kw => query.includes(kw))

  if (matchesBooking && source === 'Calendar') {
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
  // 3. Query relates to menu/prices and PDF/XLS context is present
  else if (matchedInfo && (query.includes('menu') || query.includes('plat') || query.includes('vend') || query.includes('carte') || query.includes('manger') || query.includes('pizza') || query.includes('tarif') || query.includes('prix') || query.includes('combien') || query.includes('produit'))) {
    response = `Allô ? Oui, j'ai les données de notre fichier ${source} sous les yeux : ${matchedInfo}. Souhaitez-vous commander ou réserver ?`
  }
  // 4. Default / Greetings
  else if (query.includes('bonjour') || query.includes('salut') || query.includes('allo') || query.includes('allô')) {
    response = `Bonjour ! Bienvenue. Je suis l'assistant vocal téléphonique (voix : ${voice}). Je suis connecté à notre source : ${source === 'None' ? 'Aucune' : source}. Comment puis-je vous aider ?`
  } 
  // 5. General fallback
  else {
    response = `Allô ? J'ai bien reçu votre demande. En tant qu'agent vocal intelligent avec le modèle ${model} via ${provider}, je suis configuré avec le prompt système : "${systemPrompt.substring(0, 35)}...". Comment puis-je vous renseigner ?`
  }

  const latencyMs = Date.now() - startTime

  // Compile detailed, human-looking call log transcript
  const transcript = `
[📞 APPEL TÉLÉPHONIQUE ENTRANT]
Tonalité... Clic.

[Fournisseur]: ${provider} | [Modèle]: ${model} | [Voix]: ${voice}
[Prompt Système]: "${systemPrompt}"

[APPELANT]: "${userQuery}"
🎙️ STT (Transcription vocale) : "${userQuery}" [Fiabilité : 99%]
🧠 Détermination intention : ${matchesBooking ? 'Planification de RDV' : source !== 'None' ? `Consultation source ${source}` : 'Demande d\'information'}
🔍 Source de données : ${sourceLookup}
📅 Action Agenda : ${matchesBooking && source === 'Calendar' ? `Création d'un rendez-vous le ${appointmentDate}.` : 'Aucune action agenda'}

[AGENT VOCAL IA] : "${response}"

[⏱️ Latence système : ${latencyMs}ms | Statut RDV : ${appointmentBooked ? 'Confirmé' : 'Aucun'}]
[Fin de l'appel]
`.trim()

  // Save log transcript if logPath is configured
  if (logPath) {
    try {
      const resolvedPath = path.resolve(logPath)
      const uniquePath = getUniqueFilePath(resolvedPath)
      // Ensure the parent directory exists
      const dir = path.dirname(uniquePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(uniquePath, transcript, 'utf8')
    } catch (e) {
      console.error('Erreur lors de l\'écriture du log d\'appel:', e)
    }
  }

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
