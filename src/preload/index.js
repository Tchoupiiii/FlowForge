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

  // Window controls
  minimize: () => ipcRenderer.send('app:minimize'),
  maximize: () => ipcRenderer.send('app:maximize'),
  close: () => ipcRenderer.send('app:close'),

  // Updates
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  installUpdate: () => ipcRenderer.invoke('app:install-update'),

  // Theme
  getTheme: () => ipcRenderer.invoke('app:get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('app:set-theme', theme),

  // AI APIs
  getOllamaModels: () => ipcRenderer.invoke('ollama:get-tags')
})
