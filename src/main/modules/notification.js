import { BrowserWindow, Notification } from 'electron'

export default {
  meta: {
    type: 'notification',
    name: 'Notification',
    description: 'Show an in-app notification',
    category: 'communication',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const title = config.title || 'FlowForge'
    const body = config.body || 'Workflow notification'

    // Send notification to renderer for in-app toast display
    try {
      if (Notification.isSupported()) {
        new Notification({ title, body }).show()
      }
      
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        windows[0].webContents.send('app-notification-history', { title, body, timestamp: Date.now() })
      }
    } catch (err) {
      console.log('Could not send notification:', err)
    }

    return { notified: true, title, body, timestamp: Date.now() }
  }
}
