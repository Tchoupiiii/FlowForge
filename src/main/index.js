import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { ExecutionEngine } from './executionEngine.js'
import * as storage from './storage.js'

const isDev = !app.isPackaged

let mainWindow = null
const engine = new ExecutionEngine()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 950,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    backgroundColor: '#0f0f14',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // Load renderer
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Open DevTools in dev
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()

  // Auto Updater config
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = false
  autoUpdater.allowDowngrade = false

  // Chercher des mises à jour
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    console.log('Update check failed:', err)
  })

  // Events d'auto-update
  autoUpdater.on('error', (err) => {
    if (Notification.isSupported()) {
      new Notification({ title: 'Erreur de mise à jour', body: err.message }).show()
    }
  })

  autoUpdater.on('update-available', () => {
    if (Notification.isSupported()) {
      new Notification({ title: 'Mise à jour disponible', body: 'Une nouvelle version de FlowForge est en cours de téléchargement...' }).show()
    }
  })

  autoUpdater.on('update-downloaded', () => {
    if (Notification.isSupported()) {
      new Notification({ title: 'Mise à jour prête', body: 'FlowForge sera mis à jour au prochain démarrage.' }).show()
    }
    // Also notify renderer if needed
    mainWindow?.webContents.send('update-downloaded')
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============ IPC Handlers ============

// Window controls
ipcMain.on('app:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('app:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('app:close', () => {
  mainWindow?.close()
})

ipcMain.handle('app:get-version', () => {
  return app.getVersion()
})

ipcMain.handle('app:install-update', () => {
  autoUpdater.quitAndInstall(false, true)
})

// Settings
ipcMain.handle('app:get-settings', async () => {
  return storage.loadSettings()
})

ipcMain.handle('app:set-settings', async (_event, settings) => {
  return storage.saveSettings(settings)
})

// Theme
ipcMain.handle('app:get-theme', async () => {
  try {
    const settings = storage.loadSettings()
    return settings.theme || 'dark'
  } catch {
    return 'dark'
  }
})

ipcMain.handle('app:set-theme', async (_event, theme) => {
  try {
    const settings = storage.loadSettings()
    settings.theme = theme
    storage.saveSettings(settings)
    return true
  } catch {
    return false
  }
})

// Workflow CRUD
ipcMain.handle('workflow:save', async (_event, workflow) => {
  try {
    return storage.save(workflow)
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('workflow:load', async (_event, id) => {
  try {
    return storage.load(id)
  } catch (error) {
    return null
  }
})

ipcMain.handle('workflow:list', async () => {
  try {
    return storage.list()
  } catch (error) {
    return []
  }
})

ipcMain.handle('workflow:delete', async (_event, id) => {
  try {
    return storage.remove(id)
  } catch (error) {
    return false
  }
})

// Workflow execution
ipcMain.handle('workflow:execute', async (_event, workflow) => {
  try {
    const result = await engine.execute(workflow, (nodeId, status, data) => {
      mainWindow?.webContents.send('execution:progress', {
        nodeId,
        status,
        data,
        timestamp: Date.now()
      })
    })
    return result
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('workflow:stop', async () => {
  engine.stop()
  return true
})

// Ollama API
ipcMain.handle('ollama:get-tags', async () => {
  try {
    const res = await (typeof fetch !== 'undefined' ? fetch('http://localhost:11434/api/tags') : global.fetch('http://localhost:11434/api/tags'))
    if (!res.ok) return { success: false, error: 'Ollama API error' }
    const data = await res.json()
    return { success: true, models: data.models }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
