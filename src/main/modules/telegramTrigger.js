export const meta = {
  type: 'telegramTrigger',
  label: 'Trigger Telegram',
  category: 'telegram'
}

const sessionOffsets = new Map()

export async function execute(config, inputData) {
  try {
    const botToken = config.botToken || ''
    const timeout = config.timeout || 30

    if (!botToken) {
      return {
        success: false,
        error: 'Token de bot Telegram requis. Créez un bot via @BotFather.',
        messages: []
      }
    }

    // Get updates via long polling
    const offset = sessionOffsets.get(botToken) || 0
    const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=${timeout}&limit=10`

    const response = await fetch(url)

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `Erreur Telegram API: ${response.status} — ${err?.description || response.statusText}`,
        messages: []
      }
    }

    const data = await response.json()

    if (!data.ok) {
      return {
        success: false,
        error: `Erreur: ${data.description || 'Réponse invalide'}`,
        messages: []
      }
    }

    const results = (data.result || []).map(update => ({
      updateId: update.update_id,
      messageId: update.message?.message_id,
      chatId: update.message?.chat?.id,
      chatType: update.message?.chat?.type,
      fromId: update.message?.from?.id,
      fromUsername: update.message?.from?.username || '',
      fromFirstName: update.message?.from?.first_name || '',
      text: update.message?.text || '',
      date: update.message?.date,
      dateFormatted: update.message?.date
        ? new Date(update.message.date * 1000).toLocaleString('fr-FR')
        : ''
    }))

    // Track the last offset for next poll
    if (results.length > 0) {
      const maxId = Math.max(...results.map(r => r.updateId))
      sessionOffsets.set(botToken, maxId + 1)
    }

    if (results.length === 0) {
      return { _skipped: true, message: 'Aucun nouveau message' }
    }

    const firstMsg = results[0] || {}

    return {
      success: true,
      messages: results,
      count: results.length,
      // Expose first message fields directly so {{text}} or {{chatId}} works out of the box
      ...firstMsg
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      messages: []
    }
  }
}
