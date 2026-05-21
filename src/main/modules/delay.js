/**
 * Delay Module
 * Waits for a specified number of seconds before passing input data through unchanged.
 */
export default {
  meta: {
    type: 'delay',
    name: 'Delay',
    description: 'Wait for a specified number of seconds before continuing',
    category: 'flow',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const seconds = Number(config.seconds) || 1
    const maxSeconds = 300 // 5 minute max

    const waitTime = Math.min(Math.max(seconds, 0.1), maxSeconds)

    await new Promise((resolve) => setTimeout(resolve, waitTime * 1000))

    return {
      ...inputData,
      _delay: {
        waited: waitTime,
        timestamp: Date.now()
      }
    }
  }
}
