/**
 * Notification Module
 * Shows a native OS notification using Electron's Notification API.
 */
import { Notification, BrowserWindow } from 'electron'

export default {
  meta: {
    type: 'notification',
    name: 'Notification',
    description: 'Show a native desktop notification',
    category: 'communication',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const title = interpolate(config.title || 'FlowForge', inputData)
    const body = interpolate(config.body || 'Workflow notification', inputData)
    const silent = config.silent || false
    const urgency = config.urgency || 'normal' // 'normal', 'critical', 'low'

    // Check if notifications are supported
    if (!Notification.isSupported()) {
      console.warn('[Notification Module] Notifications are not supported on this system')
      return {
        notified: false,
        reason: 'Notifications not supported',
        title,
        body,
        timestamp: Date.now()
      }
    }

    return new Promise((resolve) => {
      const notification = new Notification({
        title,
        body,
        silent,
        urgency,
        icon: undefined // Could be set to app icon path
      })

      notification.on('click', () => {
        // Bring the main window to focus when notification is clicked
        const windows = BrowserWindow.getAllWindows()
        if (windows.length > 0) {
          const mainWindow = windows[0]
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      })

      notification.on('show', () => {
        resolve({
          notified: true,
          title,
          body,
          timestamp: Date.now()
        })
      })

      notification.on('failed', (_, error) => {
        resolve({
          notified: false,
          reason: error || 'Notification failed',
          title,
          body,
          timestamp: Date.now()
        })
      })

      notification.show()

      // Fallback resolve after 2 seconds in case events don't fire
      setTimeout(() => {
        resolve({
          notified: true,
          title,
          body,
          timestamp: Date.now()
        })
      }, 2000)
    })
  }
}

function interpolate(template, data) {
  if (!data || typeof template !== 'string') return template

  return template.replace(/\{\{(.+?)\}\}/g, (_match, key) => {
    const trimmedKey = key.trim()
    const parts = trimmedKey.split('.')
    let value = data

    for (const part of parts) {
      if (value === null || value === undefined) return ''
      value = value[part]
    }

    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  })
}
