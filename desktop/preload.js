const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('KiboDesktop', {
  quit: () => ipcRenderer.send('kibo:quit'),
  openExternal: (url) => ipcRenderer.invoke('kibo:vlc', url),
  probe: (url) => ipcRenderer.invoke('kibo:probe', url),
  stream: () => ipcRenderer.invoke('kibo:stream'),
  vtt: (url, idx) => ipcRenderer.invoke('kibo:vtt', url, idx)
});
