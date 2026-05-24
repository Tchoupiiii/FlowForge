/**
 * Email Module
 * Simulates sending an email. In production, integrate with nodemailer or SMTP.
 */
export default {
  meta: {
    type: 'email',
    name: 'Send Email',
    description: 'Send an email via SMTP (simulated)',
    category: 'communication',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const to = config.to
    const subject = config.subject || 'No Subject'
    const body = config.body || ''
    const from = config.from || 'flowforge@localhost'
    const smtp = config.smtp || {}

    if (!to) {
      throw new Error('Email: "to" address is required')
    }

    // Fallback formatting for body content if empty
    let resolvedBody = config.body
    if (!resolvedBody) {
      if (inputData?.result) resolvedBody = inputData.result
      else if (inputData?.latest) {
        resolvedBody = `${inputData.latest.title}\n${inputData.latest.link || ''}`
      } else if (inputData?.items) {
        resolvedBody = Array.isArray(inputData.items)
          ? inputData.items.slice(0, 5).map(item => `- ${item.title || item}`).join('\n')
          : String(inputData.items)
      } else {
        resolvedBody = inputData?.message || inputData?.text || inputData?.response || ''
      }
    }

    const resolvedSubject = config.subject || 'No Subject'

    // If SMTP config is fully provided, attempt real send via fetch to an SMTP relay
    // For now, we simulate the send
    const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 9)}@flowforge>`

    console.log(`[Email Module] Sending email:`)
    console.log(`  From: ${from}`)
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${resolvedSubject}`)
    console.log(`  Body: ${resolvedBody.substring(0, 200)}${resolvedBody.length > 200 ? '...' : ''}`)
    console.log(`  SMTP Host: ${smtp.host || 'localhost'}:${smtp.port || 587}`)
    console.log(`  Message ID: ${messageId}`)

    return {
      sent: true,
      messageId,
      to,
      from,
      subject: resolvedSubject,
      body: resolvedBody,
      timestamp: Date.now()
    }
  }
}

