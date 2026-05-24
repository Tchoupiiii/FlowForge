export const meta = {
  type: 'telegramSend',
  label: 'Envoi Telegram',
  category: 'telegram'
}

export async function execute(config, inputData) {
  try {
    const botToken = config.botToken || ''
    const chatId = config.chatId || inputData?.chatId || inputData?.chatid || ''
    const parseMode = config.parseMode || 'HTML'

    let text = config.message
    if (!text) {
      if (inputData?.price !== undefined && inputData?.symbol !== undefined) {
        text = `Bourse : ${inputData.symbol} est à ${inputData.price} ${inputData.currency || 'USD'}`
      } else if (inputData?.result) {
        text = inputData.result
      } else if (inputData?.latest) {
        text = `${inputData.latest.title || 'Nouvel article'}\n${inputData.latest.link || ''}`
      } else if (inputData?.items) {
        text = Array.isArray(inputData.items)
          ? inputData.items.slice(0, 5).map(item => `• ${item.title || item}`).join('\n')
          : String(inputData.items)
      } else {
        text = inputData?.text || inputData?.response || ''
      }
    }


    if (!botToken) {
      return {
        success: false,
        error: 'Token de bot Telegram requis. Créez un bot via @BotFather.'
      }
    }

    if (!chatId) {
      return {
        success: false,
        error: 'Chat ID requis. Envoyez un message à votre bot et utilisez le Trigger Telegram pour obtenir le chat_id.'
      }
    }

    if (!text) {
      return {
        success: false,
        error: 'Le message ne peut pas être vide.'
      }
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: typeof text === 'object' ? JSON.stringify(text, null, 2) : String(text),
        parse_mode: parseMode,
        disable_web_page_preview: config.disablePreview || false
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return {
        success: false,
        error: `Erreur Telegram: ${response.status} — ${err?.description || response.statusText}`
      }
    }

    const data = await response.json()

    if (!data.ok) {
      return {
        success: false,
        error: `Erreur: ${data.description || 'Envoi échoué'}`
      }
    }

    return {
      success: true,
      messageId: data.result?.message_id,
      chatId: data.result?.chat?.id,
      text: data.result?.text,
      date: data.result?.date,
      sentTo: data.result?.chat?.first_name || data.result?.chat?.title || chatId
    }
  } catch (error) {
    return {
      success: false,
      error: `Erreur: ${error.message}`
    }
  }
}
