/**
 * Timer / Cron Trigger Module
 * Simulates a cron-based trigger. In a real scenario this would set up a recurring timer,
 * but during workflow execution it simply fires once and returns metadata.
 */
export default {
  meta: {
    type: 'timerCron',
    name: 'Timer / Cron',
    description: 'Triggers the workflow on a schedule or interval',
    category: 'triggers',
    inputs: 0,
    outputs: 1
  },

  async execute(config, _inputData) {
    const interval = config.interval || '*/5 * * * *'
    const timezone = config.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

    return {
      triggered: true,
      timestamp: Date.now(),
      interval,
      timezone,
      source: 'cron'
    }
  }
}
