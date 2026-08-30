const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('selah', {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  activity: () => ipcRenderer.send('activity'),
  onUpdateStatus: (listener) => {
    const handler = (_event, status) => listener(status);
    ipcRenderer.on('update:status', handler);
    return () => ipcRenderer.removeListener('update:status', handler);
  }
});
