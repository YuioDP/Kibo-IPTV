const { contextBridge, ipcRenderer } = require('electron');

const listeners = {};
ipcRenderer.on('kibo:vttData', (e, id, d) => { if (listeners[id]) listeners[id]('data', d); });
ipcRenderer.on('kibo:vttEnd', (e, id) => { if (listeners[id]) { const f = listeners[id]; delete listeners[id]; f('end'); } });

contextBridge.exposeInMainWorld('KiboDesktop', {
  quit: () => ipcRenderer.send('kibo:quit'),
  openExternal: (url) => ipcRenderer.invoke('kibo:vlc', url),
  probe: (url) => ipcRenderer.invoke('kibo:probe', url),
  stream: () => ipcRenderer.invoke('kibo:stream'),
  vtt: (url, idx) => ipcRenderer.invoke('kibo:vtt', url, idx),
  vttStart: (id, url, idx, ss, dur, cb) => { listeners[id] = cb; return ipcRenderer.invoke('kibo:vttStart', id, url, idx, ss, dur); },
  vttStop: (id) => { delete listeners[id]; ipcRenderer.send('kibo:vttStop', id); }
});
