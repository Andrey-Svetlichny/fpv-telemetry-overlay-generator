const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('getConfig'),
  chooseLog: () => ipcRenderer.invoke('chooseLog'),
  chooseVideoFiles: () => ipcRenderer.invoke('chooseVideoFiles'),
  setShift: (value) => ipcRenderer.invoke('setShift', value),
  generateSubtitles: () => ipcRenderer.invoke('generateSubtitles'),
  editConfig: () => ipcRenderer.invoke('editConfig'),

  configChanged: (callback) => ipcRenderer.on('configChanged', callback),
  handleError: (callback) => ipcRenderer.on('handleError', callback),
  handleMessage: (callback) => ipcRenderer.on('handleMessage', callback),
})
