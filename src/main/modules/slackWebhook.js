export const meta = {
  type: 'slackWebhook',
  label: 'Slack Webhook',
  category: 'core'
}

export async function execute(config, inputData) {
  try {
    const webhookUrl = config.webhookUrl || ''

    let text = config.text
    if (!text) {
      if (inputData?.result) {
        text = inputData.result
      } else if (inputData?.latest) {
        text = `*${inputData.latest.title || 'Nouvel article'}*\n${inputData.latest.link || ''}`
      } else if (inputData?.items) {
        text = Array.isArray(inputData.items)
          ? inputData.items.slice(0, 5).map(item => `• ${item.title || item}`).join('\n')
          : String(inputData.items)
      } else {
        text = inputData?.message || inputData?.text || inputData?.response || ''
      }
    }

    if (!webhookUrl) {
      return { success: false, error: 'URL du Webhook Slack requise' }
    }
    if (!text) {
      return { success: false, error: 'Le texte du message ne peut pas être vide' }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })


    if (!response.ok) {
      return { success: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` }
    }

    return { success: true, message: 'Message envoyé sur Slack', result: 'Message envoyé sur Slack' }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}` }
  }
}
