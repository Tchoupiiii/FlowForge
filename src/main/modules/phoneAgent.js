import { getEvents, addEvent } from '../calendarStore.js'
import { loadSettings } from '../storage.js'
import fs from 'fs'
import path from 'path'
import http from 'http'
import querystring from 'querystring'

// Dynamically require pdf-parse if available in packaged app
let pdfParse;
try {
  pdfParse = require('pdf-parse')
} catch (e) {
  console.error("Impossible de charger 'pdf-parse' dans phoneAgent.js:", e.message)
}

export const meta = {
  type: 'phoneAgent',
  name: 'Agent Téléphonique',
  description: 'Démarre un serveur webhook Twilio pour répondre en temps réel à des appels de vrais numéros de téléphone.',
  category: 'ai',
  inputs: 1,
  outputs: 1
}

const activeServers = new Map()
const activeCalls = new Map()

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

// Global helper for conversation processing
async function runAiDialogue(config, inputData, userQuery, chatHistory) {
  // 1. Compile file contents from config.files and inputData
  let filesContent = ''
  
  // Inject text data from upstream node (e.g., readFile) connected to "source" handle
  if (inputData && inputData.data && typeof inputData.data === 'string') {
    filesContent += `\n[Données Sources (Connexion entrante)]\n${inputData.data.substring(0, 8000)}\n`
  }

  const filesList = config.files || []
  if (Array.isArray(filesList) && filesList.length > 0) {
    for (const filePath of filesList) {
      if (!filePath) continue
      try {
        const resolvedPath = path.resolve(filePath)
        if (fs.existsSync(resolvedPath)) {
          const ext = path.extname(resolvedPath).toLowerCase()
          if (ext === '.pdf') {
            if (pdfParse) {
              const buffer = fs.readFileSync(resolvedPath)
              const pdfData = await pdfParse(buffer)
              filesContent += `\n[Fichier PDF: ${path.basename(resolvedPath)}]\n${pdfData.text.substring(0, 8000)}\n`
            } else {
              filesContent += `\n[Fichier PDF: ${path.basename(resolvedPath)} - (Module pdf-parse manquant)]\n`
            }
          } else {
            const txt = fs.readFileSync(resolvedPath, 'utf8')
            filesContent += `\n[Fichier: ${path.basename(resolvedPath)}]\n${txt.substring(0, 8000)}\n`
          }
        }
      } catch (err) {
        console.error(`Erreur de lecture de ${filePath}:`, err)
      }
    }
  }

  // 2. Fetch live calendar events
  const liveEvents = getEvents()
  // Inject events from upstream node (e.g. googleCalendarGet) connected to "source" handle
  if (inputData && Array.isArray(inputData.events)) {
    inputData.events.forEach(e => liveEvents.push(e))
  }

  // Fetch true Google Calendar iCal if configured
  if (config.icalUrl) {
    try {
      const res = await fetch(config.icalUrl)
      if (res.ok) {
        const text = await res.text()
        const events = text.split('BEGIN:VEVENT')
        events.shift() // Enlever l'entête
        events.forEach(evBlock => {
          const summaryMatch = evBlock.match(/SUMMARY:(.*)/)
          const dtstartMatch = evBlock.match(/DTSTART(?:[^:]*):([0-9TZ]+)/)
          if (summaryMatch && dtstartMatch) {
            let dateStr = dtstartMatch[1]
            let d
            if (dateStr.length === 8) { // YYYYMMDD
              d = new Date(dateStr.slice(0,4) + '-' + dateStr.slice(4,6) + '-' + dateStr.slice(6,8))
            } else {
              // Format YYYYMMDDTHHMMSSZ
              d = new Date(dateStr.slice(0,4) + '-' + dateStr.slice(4,6) + '-' + dateStr.slice(6,8) + 'T' + dateStr.slice(9,11) + ':' + dateStr.slice(11,13) + ':' + dateStr.slice(13,15) + 'Z')
            }
            if (d.getTime() > Date.now() - 86400000) { // Ne garder que les événements futurs ou très récents
              liveEvents.push({
                id: 'ical-' + Math.random().toString(36),
                summary: summaryMatch[1].trim(),
                date: d.toISOString()
              })
            }
          }
        })
      }
    } catch (err) {
      console.error("Erreur téléchargement iCal:", err)
    }
  }

  // Sort events chronologically to give better context to LLM
  liveEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const formattedEvents = liveEvents.map(e => {
    const d = new Date(e.date)
    return `- ${e.summary} le ${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }).join('\n')

  const provider = (config.provider || 'openai').toLowerCase()
  const model = config.model || 'gpt-4o'
  const systemPrompt = config.systemPrompt || 'Tu es un assistant vocal téléphonique poli et concis.'

  const settings = loadSettings()
  const apiKey = config.apiKey || settings.openaiApiKey

  let responseText = ''
  let actionConsequence = 'Aucune action'
  let appointmentBooked = false
  let appointmentDate = null

  if ((provider === 'openai' && apiKey) || (provider === 'ollama')) {
    const promptSystemAugmented = `
${systemPrompt}

Voici tes sources de données disponibles en temps réel :
=== SOURCES DE FICHIERS ===
${filesContent || 'Aucun fichier source connecté.'}

=== PLANNING DE L'AGENDA (Google Calendar simulé) ===
${formattedEvents || 'Aucun rendez-vous planifié.'}

INSTRUCTIONS :
- Réponds de manière très courte, polie, et naturelle, comme au téléphone.
- Ne mentionne pas de balises XML ni de code dans tes paroles.
- Si le client te demande de prendre un rendez-vous (RDV), vérifie s'il y a un conflit avec le planning existant. S'il n'y a pas de conflit, planifie-le. Si le créneau est pris, propose une alternative.
- À la fin de ta réponse, ajoute TOUJOURS un bloc indiquant la finalité ou conséquence de l'appel sous la forme exacte :
CONSEQUENCE: [Description de l'action à faire, ex: 'Prendre un rendez-vous pour mardi 26 mai à 14:00']
Si aucune action finale ou modification n'est décidée, termine par :
CONSEQUENCE: Aucune action
`
    const messages = []
    messages.push({ role: 'system', content: promptSystemAugmented })

    // Add conversation history
    for (const turn of chatHistory) {
      messages.push({
        role: turn.role === 'agent' ? 'assistant' : 'user',
        content: turn.text
      })
    }
    // Add current user query
    messages.push({ role: 'user', content: userQuery })

    try {
      if (provider === 'openai') {
        const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o',
            messages,
            temperature: 0.5
          }),
          signal: AbortSignal.timeout(30000)
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`OpenAI API error ${res.status}: ${errText}`)
        }
        const data = await res.json()
        responseText = data.choices?.[0]?.message?.content || ''
      } else {
        // Ollama
        const baseUrl = config.baseUrl || 'http://127.0.0.1:11434'
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'llama3',
            messages,
            stream: false,
            options: { temperature: 0.5 }
          }),
          signal: AbortSignal.timeout(45000)
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Ollama API error ${res.status}: ${errText}`)
        }
        const data = await res.json()
        responseText = data.message?.content || ''
      }

      // Parse CONSEQUENCE
      const consequenceIdx = responseText.indexOf('CONSEQUENCE:')
      if (consequenceIdx !== -1) {
        actionConsequence = responseText.substring(consequenceIdx + 12).trim()
        responseText = responseText.substring(0, consequenceIdx).trim()
      }

      // Check if LLM decided to book a meeting
      if (actionConsequence.toLowerCase().includes('prendre') || actionConsequence.toLowerCase().includes('rendez-vous') || actionConsequence.toLowerCase().includes('rdv')) {
        const matchTime = actionConsequence.match(/(\d{1,2})h(\d{2})?/i) || actionConsequence.match(/(\d{1,2}):(\d{2})?/i)
        let hour = 14
        let minute = 0
        if (matchTime) {
          hour = parseInt(matchTime[1], 10)
          if (matchTime[2]) minute = parseInt(matchTime[2], 10)
        }

        let targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + 1)
        targetDate.setHours(hour, minute, 0, 0)

        const queryLower = actionConsequence.toLowerCase()
        if (queryLower.includes('lundi')) {
          const dayOffset = (1 + 7 - new Date().getDay()) % 7 || 7
          targetDate.setDate(targetDate.getDate() + dayOffset)
        } else if (queryLower.includes('mardi')) {
          const dayOffset = (2 + 7 - new Date().getDay()) % 7 || 7
          targetDate.setDate(targetDate.getDate() + dayOffset)
        } else if (queryLower.includes('mercredi')) {
          const dayOffset = (3 + 7 - new Date().getDay()) % 7 || 7
          targetDate.setDate(targetDate.getDate() + dayOffset)
        } else if (queryLower.includes('jeudi')) {
          const dayOffset = (4 + 7 - new Date().getDay()) % 7 || 7
          targetDate.setDate(targetDate.getDate() + dayOffset)
        } else if (queryLower.includes('vendredi')) {
          const dayOffset = (5 + 7 - new Date().getDay()) % 7 || 7
          targetDate.setDate(targetDate.getDate() + dayOffset)
        }

        appointmentBooked = true
        appointmentDate = targetDate.toISOString()
        addEvent(`Rendez-vous vocal: ${actionConsequence}`, appointmentDate)
      }
    } catch (e) {
      console.error("Erreur LLM, fallback local:", e)
      responseText = ''
    }
  }

  // Fallback Matching
  if (!responseText) {
    const query = userQuery.toLowerCase()
    if (query.includes('bonjour') || query.includes('salut') || query.includes('allô') || query.includes('allo')) {
      responseText = `Bonjour ! Bienvenue. Je suis l'assistant vocal téléphonique. Comment puis-je vous aider ?`
      actionConsequence = 'Aucune action'
    } else if (['rdv', 'rendez-vous', 'rendez vous', 'reserver', 'réserver', 'creneau', 'créneau', 'planning'].some(k => query.includes(k))) {
      let hour = 14
      const matchHour = query.match(/(\d{1,2})\s*h/) || query.match(/à\s*(\d{1,2})/)
      if (matchHour) hour = parseInt(matchHour[1], 10)

      let targetDate = new Date()
      targetDate.setDate(targetDate.getDate() + 1)
      targetDate.setHours(hour, 0, 0, 0)

      const queryLower = query.toLowerCase()
      if (queryLower.includes('lundi')) {
        const dayOffset = (1 + 7 - new Date().getDay()) % 7 || 7
        targetDate.setDate(targetDate.getDate() + dayOffset)
      } else if (queryLower.includes('mardi')) {
        const dayOffset = (2 + 7 - new Date().getDay()) % 7 || 7
        targetDate.setDate(targetDate.getDate() + dayOffset)
      } else if (queryLower.includes('mercredi')) {
        const dayOffset = (3 + 7 - new Date().getDay()) % 7 || 7
        targetDate.setDate(targetDate.getDate() + dayOffset)
      } else if (queryLower.includes('jeudi')) {
        const dayOffset = (4 + 7 - new Date().getDay()) % 7 || 7
        targetDate.setDate(targetDate.getDate() + dayOffset)
      } else if (queryLower.includes('vendredi')) {
        const dayOffset = (5 + 7 - new Date().getDay()) % 7 || 7
        targetDate.setDate(targetDate.getDate() + dayOffset)
      }

      const dateStr = targetDate.toISOString()
      const existingEvents = getEvents()
      const hasConflict = existingEvents.some(event => {
        const eventTime = new Date(event.date).getTime()
        return Math.abs(eventTime - targetDate.getTime()) < 1800000
      })

      const formattedDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

      if (hasConflict) {
        targetDate.setHours(targetDate.getHours() + 2)
        const alternateDateStr = targetDate.toISOString()
        const formattedAltDate = targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
        
        addEvent('Rendez-vous téléphonique client', alternateDateStr)
        appointmentBooked = true
        appointmentDate = alternateDateStr
        responseText = `Allô ? Le créneau initial était déjà réservé, mais j'ai pu bloquer un rendez-vous pour le ${formattedAltDate}. Est-ce convenable ?`
        actionConsequence = `Rendez-vous replanifié le ${formattedAltDate}`
      } else {
        addEvent('Rendez-vous téléphonique client', dateStr)
        appointmentBooked = true
        appointmentDate = dateStr
        responseText = `D'accord, c'est fait. J'ai bloqué votre rendez-vous pour le ${formattedDate}. On se reparle à ce moment-là !`
        actionConsequence = `Rendez-vous pris le ${formattedDate}`
      }
    } else if (filesContent && ['prix', 'tarif', 'carte', 'menu', 'acheter', 'standard', 'premium', 'pizza', 'licence'].some(k => query.includes(k))) {
      const lines = filesContent.split('\n').map(l => l.trim()).filter(Boolean)
      const matchingLines = lines.filter(line => ['pizza', 'licence', 'prix', '€', 'tarif'].some(kw => line.toLowerCase().includes(kw)))
      if (matchingLines.length > 0) {
        const info = matchingLines.slice(0, 2).join(' / ')
        responseText = `Allô ? Oui, j'ai les détails de nos tarifs sous les yeux : ${info}. Voulez-vous que je prenne une commande ou un rendez-vous ?`
        actionConsequence = 'Consultation des tarifs'
      } else {
        responseText = `Allô ? Oui, j'ai bien accès aux fichiers sources de l'entreprise mais je ne trouve pas d'informations de prix spécifiques. Que cherchez-vous précisément ?`
        actionConsequence = 'Recherche infructueuse'
      }
    } else {
      responseText = `Allô ? J'ai bien noté votre question. En tant qu'agent vocal intelligent avec le modèle ${model}, je suis connecté à vos fichiers et à votre planning. Pouvez-vous préciser votre demande ?`
      actionConsequence = 'Demande d\'information générale'
    }
  }

  return {
    response: responseText,
    result: actionConsequence,
    appointmentBooked,
    appointmentDate
  }
}

export async function execute(config, inputData) {
  // 1. Direct executions (like the call simulator in UI)
  if (inputData?.text || inputData?.chatHistory || inputData?.hangup) {
    if (inputData.hangup && config.logPath) {
      try {
        const resolvedPath = path.resolve(config.logPath)
        const uniquePath = getUniqueFilePath(resolvedPath)
        const dir = path.dirname(uniquePath)
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(uniquePath, inputData.transcript || '', 'utf8')
        return { success: true, logged: true, path: uniquePath }
      } catch (e) {
        console.error("Erreur lors de l'écriture du log final:", e)
        return { success: false, error: e.message }
      }
    }

    const chatHistory = inputData.chatHistory || []
    const userQuery = inputData.text || ''
    const result = await runAiDialogue(config, inputData, userQuery, chatHistory)

    return {
      success: true,
      response: result.response,
      result: result.result,
      transcript: `[🎙️ APPELANT]: "${userQuery}"\n[🤖 AGENT VOCAL IA]: "${result.response}"\n[Action Décidée]: ${result.result}`,
      appointmentBooked: result.appointmentBooked,
      appointmentDate: result.appointmentDate,
      timestamp: Date.now()
    }
  }

  // If executing standard workflow using previously saved values:
  if (config.lastTranscript && config.lastResult) {
    return {
      success: true,
      transcript: config.lastTranscript,
      result: config.lastResult,
      response: config.lastResult,
      timestamp: Date.now()
    }
  }

  // 2. Real Telephony Server Mode (Twilio Gateway Webhook listener)
  const port = config.twilioPort || 9090
  const pathPrefix = config.twilioPath || '/twilio-voice'

  return new Promise((resolve) => {
    // If a server is already listening, just bind the resolution promise of this workflow execution run
    if (activeServers.has(port)) {
      const serverEntry = activeServers.get(port)
      serverEntry.config = config
      serverEntry.inputData = inputData
      serverEntry.resolvePromise = resolve
      console.log(`Twilio Server port ${port} already active. Listening for real call...`)
      return
    }

    const server = http.createServer((req, res) => {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const params = querystring.parse(body)
          const reqPath = req.url.split('?')[0]

          if (req.method !== 'POST') {
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end('FlowForge Twilio Phone Agent Webhook is Listening')
            return
          }

          const isInitial = reqPath === pathPrefix
          const isHandleSpeech = reqPath === `${pathPrefix}/handle-speech`
          const isStatus = reqPath === `${pathPrefix}/status` || params.CallStatus === 'completed'

          if (!isInitial && !isHandleSpeech && !isStatus) {
            res.writeHead(404, { 'Content-Type': 'text/xml' })
            res.end('<Response><Reject /></Response>')
            return
          }

          const callSid = params.CallSid || 'default'
          
          // Use config and inputData from the active context!
          const activeContext = activeServers.get(port)
          const currentConfig = activeContext ? activeContext.config : config
          const currentInputData = activeContext ? activeContext.inputData : inputData

          const voice = currentConfig.voice || 'Polly.Celine'
          const twilioVoice = voice.startsWith('Polly') ? voice : 'Polly.Celine'

          if (isStatus || params.CallStatus === 'completed') {
            // Call hung up
            const callData = activeCalls.get(callSid)
            if (callData) {
              const fullTranscript = callData.chatHistory.map(turn => {
                const speaker = turn.role === 'agent' ? '🤖 AGENT IA' : '🎙️ APPELANT'
                return `[${speaker}]: ${turn.text}`
              }).join('\n')

              // Write log file
              if (currentConfig.logPath) {
                try {
                  const resolvedPath = path.resolve(currentConfig.logPath)
                  const uniquePath = getUniqueFilePath(resolvedPath)
                  const dir = path.dirname(uniquePath)
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                  }
                  fs.writeFileSync(uniquePath, fullTranscript, 'utf8')
                } catch (e) {
                  console.error("Failed to write Twilio Call Log:", e)
                }
              }

              // Resolve the workflow execution node promise!
              const currentResolve = activeContext?.resolvePromise
              if (currentResolve) {
                currentResolve({
                  success: true,
                  transcript: fullTranscript,
                  result: callData.lastResult || 'Aucune action',
                  response: callData.lastResult || 'Aucune action',
                  timestamp: Date.now()
                })
              }

              activeCalls.delete(callSid)
            }

            res.writeHead(200, { 'Content-Type': 'text/xml' })
            res.end('<Response />')
            return
          }

          let replyText = ''
          let callData = activeCalls.get(callSid)

          if (!callData || isInitial) {
            const greeting = `Allô ? Bonjour, je suis votre assistant vocal téléphonique. Comment puis-je vous aider aujourd'hui ?`
            callData = {
              chatHistory: [{ role: 'agent', text: greeting }],
              lastResult: 'Aucune action finale'
            }
            activeCalls.set(callSid, callData)
            replyText = greeting
          } else if (isHandleSpeech && params.SpeechResult) {
            const userSpeech = params.SpeechResult
            callData.chatHistory.push({ role: 'caller', text: userSpeech })

            const executionResult = await runAiDialogue(currentConfig, currentInputData, userSpeech, callData.chatHistory)
            replyText = executionResult.response
            callData.lastResult = executionResult.result
            
            callData.chatHistory.push({ role: 'agent', text: replyText })
          } else {
            replyText = "Allô ? Je ne vous entends pas bien. Pourriez-vous répéter ?"
            callData.chatHistory.push({ role: 'agent', text: replyText })
          }

          const concludeKeywords = ['au revoir', 'bonne journée', 'merci beaucoup', 'ciao', 'a bientôt']
          const shouldHangup = concludeKeywords.some(k => replyText.toLowerCase().includes(k))

          let twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n`
          twiml += `  <Say language="fr-FR" voice="${twilioVoice}">${replyText}</Say>\n`
          if (shouldHangup) {
            twiml += `  <Hangup />\n`
          } else {
            twiml += `  <Gather input="speech" language="fr-FR" action="${pathPrefix}/handle-speech" timeout="5" speechTimeout="auto" />\n`
          }
          twiml += `</Response>`

          res.writeHead(200, { 'Content-Type': 'text/xml' })
          res.end(twiml)

        } catch (err) {
          console.error("Twilio server handling error:", err)
          res.writeHead(500, { 'Content-Type': 'text/xml' })
          res.end('<Response><Say language="fr-FR">Erreur interne de serveur.</Say><Hangup /></Response>')
        }
      })
    })

    server.listen(port, async () => {
      console.log(`Persistent Twilio Webhook Server started on port ${port} at path ${pathPrefix}`)
      try {
        const localtunnel = require('localtunnel');
        const tunnel = await localtunnel({ port, subdomain: 'flowforge-ai-agent' });
        console.log(`Tunnel ouvert sur : ${tunnel.url}`);
        
        // Notify user via console log or store it in activeServers context
        if (activeServers.has(port)) {
          const entry = activeServers.get(port);
          entry.publicUrl = tunnel.url;
        }
      } catch (err) {
        console.error("Localtunnel error:", err);
      }
    })

    activeServers.set(port, {
      server,
      config,
      resolvePromise: resolve
    })
  })
}
