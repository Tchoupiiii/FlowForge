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
    category: 'trigger',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const repetition = config.repetition || 'interval'
    const hour = config.hour || 15
    const minute = config.minute || 0
    const timezone = config.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Si on a un inputData, ça veut dire qu'il est utilisé au milieu du flow,
    // on va simuler l'attente pour donner l'effet de décompte.
    if (Object.keys(inputData || {}).length > 0 && repetition === 'interval') {
      const val = Number(config.intervalValue) || 1
      const unit = config.intervalUnit || 'seconds'
      let multiplier = 1
      if (unit === 'minutes') multiplier = 60
      if (unit === 'hours') multiplier = 3600
      
      const waitTime = Math.min(val * multiplier, 10) // On limite à 10s max pour la démo
      await new Promise(r => setTimeout(r, waitTime * 1000))
    }

    return {
      ...inputData,
      triggered: true,
      trigger: true,
      timestamp: Date.now(),
      repetition,
      hour,
      minute,
      timezone,
      source: 'cron'
    }
  }
}
