const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Nombre fijo: los datos (ajustes, favoritos, usuarios, guía) quedan en la carpeta de usuario del sistema
// (Windows: %APPDATA%\Kibo IPTV, Linux: ~/.config/Kibo IPTV), nunca junto al .exe.
app.setName('Kibo IPTV');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-features', 'PlatformHEVCDecoderSupport');
app.commandLine.appendSwitch('enable-blink-features', 'AudioVideoTracks');
if (process.platform === 'linux') app.commandLine.appendSwitch('no-sandbox');

const lock = app.requestSingleInstanceLock();
if (!lock) app.quit();

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    show: false,
    backgroundColor: '#0b1030',
    title: 'Kibo IPTV',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // La app solo carga su propia interfaz local; así puede hablar con cualquier servicio IPTV (HTTP, sin CORS).
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });
}

app.whenReady().then(createWindow);

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('window-all-closed', () => app.quit());

ipcMain.on('kibo:quit', () => app.quit());

// Abrir el video actual en VLC (si está instalado). Útil para MKV/AC3/DTS que el navegador no reproduce.
ipcMain.handle('kibo:vlc', (e, url) => new Promise((resolve) => {
  const candidates = [];
  if (process.platform === 'win32') {
    for (const base of [process.env['ProgramFiles'], process.env['ProgramFiles(x86)'], process.env['LOCALAPPDATA']]) {
      if (base) candidates.push(path.join(base, 'VideoLAN', 'VLC', 'vlc.exe'));
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/VLC.app/Contents/MacOS/VLC');
  } else {
    candidates.push('vlc');
  }
  const tryNext = (i) => {
    if (i >= candidates.length) return resolve(false);
    const c = candidates[i];
    if (c.includes(path.sep) && !fs.existsSync(c)) return tryNext(i + 1);
    try {
      const p = spawn(c, [url], { detached: true, stdio: 'ignore' });
      p.once('error', () => tryNext(i + 1));
      p.once('spawn', () => { p.unref(); resolve(true); });
    } catch (err) {
      tryNext(i + 1);
    }
  };
  tryNext(0);
}));
