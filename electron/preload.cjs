const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('selah', {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  activity: () => ipcRenderer.send('activity')
});
