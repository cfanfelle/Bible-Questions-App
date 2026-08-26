import electron from 'electron';
const { contextBridge, ipcRenderer } = electron;
contextBridge.exposeInMainWorld('selah', {
  invoke: (channel:string, payload?:unknown) => ipcRenderer.invoke(channel, payload),
  activity: () => ipcRenderer.send('activity')
});
