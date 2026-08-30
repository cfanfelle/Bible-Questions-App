import electron from 'electron';
const { contextBridge, ipcRenderer } = electron;
contextBridge.exposeInMainWorld('selah', {
  invoke: (channel:string, payload?:unknown) => ipcRenderer.invoke(channel, payload),
  activity: () => ipcRenderer.send('activity'),
  onUpdateStatus: (listener:(status:unknown)=>void) => {
    const handler=(_:Electron.IpcRendererEvent,status:unknown)=>listener(status);
    ipcRenderer.on('update:status',handler);
    return () => ipcRenderer.removeListener('update:status',handler);
  }
});
