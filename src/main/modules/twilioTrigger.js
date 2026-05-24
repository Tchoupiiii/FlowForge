export default {
  meta: {
    type: 'twilioTrigger',
    name: 'Appel Entrant (Twilio)',
    description: 'Déclenche le workflow lors d\'un appel entrant via un Webhook Twilio.',
    category: 'triggers',
    inputs: 0,
    outputs: 1
  },

  async execute(config, inputData) {
    // During a real execution in background mode, this would wait for an incoming HTTP POST from Twilio.
    // In our manual workflow execution or simulated environment, we just mock the payload.
    const fromNumber = config.mockFrom || '+33612345678'
    const toNumber = config.mockTo || '+33987654321'
    const callSid = 'CA' + Date.now().toString()

    return {
      triggered: true,
      trigger: true,
      timestamp: Date.now(),
      source: 'twilio',
      From: fromNumber,
      To: toNumber,
      CallSid: callSid,
      message: `Appel entrant de ${fromNumber}`
    }
  }
}
