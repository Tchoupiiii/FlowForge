
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
    
    try {
      const electron = await import('electron').catch(() => null)
      if (electron) {
        if (electron.Notification && electron.Notification.isSupported()) {
          new electron.Notification({ title, body }).show()
        }
        
        if (electron.BrowserWindow) {
          const windows = electron.BrowserWindow.getAllWindows()
          if (windows.length > 0) {
            windows[0].webContents.send('app-notification-history', { title, body, timestamp: Date.now() })
          }
        }
      } else {
        console.log(`[NOTIFICATION] ${title}: ${body}`)
      }
    } catch (err) {
      console.log(`[NOTIFICATION] ${title}: ${body}`)
    }

    return { notified: true, title, body, timestamp: Date.now() }
  }
}
