import * as triggerManual from './triggerManual.js'
import * as timerCron from './timerCron.js'
import * as httpRequest from './httpRequest.js'
import * as webhook from './webhook.js'
import * as condition from './condition.js'
import * as transformJson from './transformJson.js'
import * as email from './email.js'
import * as readFile from './readFile.js'
import * as writeFile from './writeFile.js'
import * as codeJs from './codeJs.js'
import * as delay from './delay.js'
import * as notification from './notification.js'
import * as aiAgent from './aiAgent.js'
import * as aiTextAnalyzer from './aiTextAnalyzer.js'
import * as aiImageGenerator from './aiImageGenerator.js'
import * as aiClassifier from './aiClassifier.js'
import * as mapSearch from './mapSearch.js'
import * as telegramTrigger from './telegramTrigger.js'
import * as telegramSend from './telegramSend.js'
import * as discordWebhook from './discordWebhook.js'
import * as slackWebhook from './slackWebhook.js'
import * as rssParser from './rssParser.js'
import * as dataFilter from './dataFilter.js'
import * as cryptoPrice from './cryptoPrice.js'
import * as githubRepoInfo from './githubRepoInfo.js'
import * as translateText from './translateText.js'
import * as openFda from './openFda.js'
import * as stockPrice from './stockPrice.js'
import * as googleCalendar from './googleCalendar.js'
import * as googleCalendarGet from './googleCalendarGet.js'
import * as notionDatabase from './notionDatabase.js'
import * as executeCommand from './executeCommand.js'
import * as regexMatch from './regexMatch.js'
import * as jsonToCsv from './jsonToCsv.js'
import * as csvToJson from './csvToJson.js'
import * as base64 from './base64.js'
import * as uuidGenerator from './uuidGenerator.js'
import * as mathOperation from './mathOperation.js'
import * as stringManipulation from './stringManipulation.js'
import * as trelloCard from './trelloCard.js'
import * as githubCreateIssue from './githubCreateIssue.js'
import * as openAiChat from './openAiChat.js'
import * as anthropicClaude from './anthropicClaude.js'
import * as loopForEach from './loopForEach.js'
import * as webScraper from './webScraper.js'
import * as youtubeTranscript from './youtubeTranscript.js'
import * as pdfParser from './pdfParser.js'
import * as phoneAgent from './phoneAgent.js'
import * as tts from './tts.js'
import * as twilioTrigger from './twilioTrigger.js'

const modules = {
  phoneAgent,
  tts,
  webScraper,
  youtubeTranscript,
  pdfParser,
  triggerManual,
  timerCron,
  httpRequest,
  webhook,
  condition,
  transformJson,
  email,
  readFile,
  writeFile,
  codeJs,
  delay,
  notification,
  aiAgent,
  aiTextAnalyzer,
  aiImageGenerator,
  aiClassifier,
  mapSearch,
  telegramTrigger,
  telegramSend,
  discordWebhook,
  slackWebhook,
  rssParser,
  dataFilter,
  cryptoPrice,
  githubRepoInfo,
  translateText,
  openFda,
  stockPrice,
  googleCalendar,
  googleCalendarGet,
  notionDatabase,
  executeCommand,
  regexMatch,
  jsonToCsv,
  csvToJson,
  base64,
  uuidGenerator,
  mathOperation,
  stringManipulation,
  trelloCard,
  githubCreateIssue,
  openAiChat,
  anthropicClaude,
  loopForEach,
  twilioTrigger
}

export function getModule(type) {
  return modules[type] || null
}

export function getModuleExecutor(type) {
  const mod = modules[type]
  if (!mod) return null

  // deep search for execute
  const findExecute = (obj, depth = 0) => {
    if (!obj || depth > 3) return null
    if (typeof obj.execute === 'function') return obj.execute
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' || typeof obj[key] === 'function') {
          const found = findExecute(obj[key], depth + 1)
          if (found) return found
        }
      }
    }
    return null
  }
  
  return findExecute(mod) || null
}

export function listModules() {
  return Object.entries(modules).map(([type, mod]) => {
    // deep search for meta
    const findMeta = (obj, depth = 0) => {
      if (!obj || depth > 3) return null
      if (obj.meta) return obj.meta
      if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (typeof obj[key] === 'object' || typeof obj[key] === 'function') {
            const found = findMeta(obj[key], depth + 1)
            if (found) return found
          }
        }
      }
      return null
    }

    const meta = findMeta(mod) || {}
    return {
      type,
      label: meta.label || type,
      category: meta.category || 'core'
    }
  })
}

export default modules
