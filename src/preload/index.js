const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Workflow operations
  saveWorkflow: (workflow) => ipcRenderer.invoke('workflow:save', workflow),
  loadWorkflow: (id) => ipcRenderer.invoke('workflow:load', id),
  listWorkflows: () => ipcRenderer.invoke('workflow:list'),
  deleteWorkflow: (id) => ipcRenderer.invoke('workflow:delete', id),
  executeWorkflow: (workflow) => ipcRenderer.invoke('workflow:execute', workflow),
  stopWorkflow: () => ipcRenderer.invoke('workflow:stop'),

  // Execution progress listener
  onExecutionProgress: (callback) => {
    ipcRenderer.on('execution:progress', (_event, data) => callback(data))
  },
  removeExecutionProgress: () => {
    ipcRenderer.removeAllListeners('execution:progress')
  },

  // Window Controls
  minimize: () => ipcRenderer.send('app:minimize'),
  maximize: () => ipcRenderer.send('app:maximize'),
  close: () => ipcRenderer.send('app:close'),
  
  // App info & Settings
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getSettings: () => ipcRenderer.invoke('app:get-settings'),
  setSettings: (settings) => ipcRenderer.invoke('app:set-settings', settings),

  // Updates
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_event, msg) => callback(msg)),
  installUpdate: () => ipcRenderer.invoke('app:install-update'),

  // Theme
  getTheme: () => ipcRenderer.invoke('app:get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('app:set-theme', theme),

  // AI APIs
  getOllamaModels: () => ipcRenderer.invoke('ollama:get-tags'),
  generateOllama: (prompt, model, options = {}) => ipcRenderer.invoke('ollama:generate', prompt, model, options),

  // Workflow file export/import
  exportWorkflow: (workflow) => ipcRenderer.invoke('workflow:export', workflow),
  importWorkflow: () => ipcRenderer.invoke('workflow:import'),

  // In-app notifications from workflow modules
  onAppNotification: (callback) => ipcRenderer.on('app-notification', (_event, data) => callback(data))
})
