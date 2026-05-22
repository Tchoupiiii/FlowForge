import { app, BrowserWindow, ipcMain } from 'electron'
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

  // Chercher des mises à jour (silently, no crash if fails)
  if (!isDev) {
    autoUpdater.checkForUpdates().catch(err => {
      console.log('Update check failed (normal in dev):', err?.message)
    })
  }

  // Events d'auto-update — send to renderer for in-app toasts
  autoUpdater.on('error', (err) => {
    console.log('Auto-update error:', err?.message)
    mainWindow?.webContents.send('update-error', err?.message || 'Unknown error')
  })

  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-available')
  })

  autoUpdater.on('update-downloaded', () => {
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
    const res = await (typeof fetch !== 'undefined' ? fetch('http://127.0.0.1:11434/api/tags') : global.fetch('http://127.0.0.1:11434/api/tags'))
    if (!res.ok) return { success: false, error: 'Ollama API error' }
    const data = await res.json()
    return { success: true, models: data.models }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('ollama:generate', async (_event, prompt, model, options = {}) => {
  try {
    const body = { model: model || 'llama3', prompt, stream: false, ...options }
    const res = await (typeof fetch !== 'undefined' ? fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }) : global.fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }))
    if (!res.ok) return { success: false, error: 'Ollama API error' }
    const data = await res.json()
    return { success: true, response: data.response }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Workflow export/import (file dialog)
ipcMain.handle('workflow:export', async (_event, workflow) => {
  const { dialog } = require('electron')
  const { writeFileSync } = require('fs')
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Exporter le workflow',
      defaultPath: `${(workflow.name || 'workflow').replace(/[^a-zA-Z0-9]/g, '_')}.flowforge.json`,
      filters: [{ name: 'FlowForge Workflow', extensions: ['flowforge.json', 'json'] }]
    })
    if (result.canceled || !result.filePath) return { success: false, canceled: true }
    writeFileSync(result.filePath, JSON.stringify(workflow, null, 2), 'utf-8')
    return { success: true, path: result.filePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('workflow:import', async () => {
  const { dialog } = require('electron')
  const { readFileSync } = require('fs')
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Importer un workflow',
      filters: [{ name: 'FlowForge Workflow', extensions: ['flowforge.json', 'json'] }],
      properties: ['openFile']
    })
    if (result.canceled || !result.filePaths.length) return { success: false, canceled: true }
    const data = readFileSync(result.filePaths[0], 'utf-8')
    const workflow = JSON.parse(data)
    return { success: true, workflow }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
