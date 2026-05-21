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
import * as notionDatabase from './notionDatabase.js'

const modules = {
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
  notionDatabase
}

export function getModule(type) {
  return modules[type] || null
}

export function getModuleExecutor(type) {
  const mod = modules[type]
  if (mod && typeof mod.execute === 'function') {
    return mod.execute
  }
  return null
}

export function listModules() {
  return Object.entries(modules).map(([type, mod]) => ({
    type,
    label: mod.meta?.label || type,
    category: mod.meta?.category || 'core'
  }))
}

export default modules
