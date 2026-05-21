/**
 * Manual Trigger Module
 * Initiates a workflow run manually. Returns trigger metadata.
 */
export default {
  meta: {
    type: 'triggerManual',
    name: 'Manual Trigger',
    description: 'Starts the workflow manually when the user clicks Execute',
    category: 'triggers',
    inputs: 0,
    outputs: 1
  },

  async execute(_config, _inputData) {
    return {
      triggered: true,
      timestamp: Date.now(),
      source: 'manual'
    }
  }
}
