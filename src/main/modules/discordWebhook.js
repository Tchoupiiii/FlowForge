export const meta = {
  type: 'discordWebhook',
  label: 'Discord Webhook',
  category: 'core'
}

export async function execute(config, inputData) {
  try {
    const webhookUrl = config.webhookUrl || ''
    const content = config.content || inputData?.message || inputData?.text || ''
    const username = config.username || 'FlowForge Bot'

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
        content,
        username
      })
    })

    if (!response.ok) {
      return { success: false, error: `Erreur HTTP: ${response.status} ${response.statusText}` }
    }

    return { success: true, message: 'Message envoyé sur Discord' }
  } catch (error) {
    return { success: false, error: `Erreur: ${error.message}` }
  }
}
