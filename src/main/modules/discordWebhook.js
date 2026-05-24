export const meta = {
  type: 'discordWebhook',
  label: 'Discord Webhook',
  category: 'core'
}

export async function execute(config, inputData) {
  try {
    const webhookUrl = config.webhookUrl || ''
    const username = config.username || 'FlowForge Bot'

    let content = config.content
    if (!content) {
      if (inputData?.result) {
        content = inputData.result
      } else if (inputData?.latest) {
        content = `**${inputData.latest.title || 'Nouvel article'}**\n${inputData.latest.link || ''}`
      } else if (inputData?.items) {
        content = Array.isArray(inputData.items)
          ? inputData.items.slice(0, 5).map(item => `• ${item.title || item}`).join('\n')
          : String(inputData.items)
      } else {
        content = inputData?.message || inputData?.text || inputData?.response || ''
      }
    }

    if (!webhookUrl) {
      return { success: false, error: 'URL du Webhook Discord requise' }
    }
    if (!content) {
      return { success: false, error: 'Le contenu du message ne peut pas être vide' }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content),
        username
      })
    })

    if (!response.ok) {
      return { success: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` }
    }

    return { success: true, message: 'Message envoyé sur Discord', result: 'Message envoyé sur Discord' }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}` }
  }
}

