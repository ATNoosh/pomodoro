const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Data management
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  
  // Notifications
  requestNotificationPermission: () => ipcRenderer.invoke('request-notification-permission'),
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('toggle-maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Overlay and timer events
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),
  overlaySetIgnore: (ignore) => ipcRenderer.invoke('overlay-set-ignore', ignore),
  timerTick: (state) => ipcRenderer.send('timer-tick', state),
  onTimerUpdate: (callback) => ipcRenderer.on('timer-update', (_e, state) => callback(state)),
  
  // Utilities
  getDbPath: () => ipcRenderer.invoke('get-db-path'),
  flushDb: () => ipcRenderer.invoke('flush-db'),
  
  // Platform info
  platform: process.platform,
  
  // App info
  appVersion: process.env.npm_package_version || '1.0.0'
});
