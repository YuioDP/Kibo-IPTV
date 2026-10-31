const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('KiboDesktop', {
  quit: () => ipcRenderer.send('kibo:quit'),
  openExternal: (url) => ipcRenderer.invoke('kibo:vlc', url)
});
