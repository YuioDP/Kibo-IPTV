const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');
const { parseProbe } = require('./probe');

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
  // F12 abre las herramientas de desarrollo (útil para diagnosticar)
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') win.webContents.toggleDevTools();
  });
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

// ---------------- FFmpeg: pistas de audio, subtítulos y conversión (AC3/DTS/MKV -> algo que el navegador reproduce) ----------------
function ffPath() {
  let p = null;
  try { p = require('ffmpeg-static'); } catch (e) { p = null; }
  if (p && p.includes('app.asar')) p = p.replace('app.asar', 'app.asar.unpacked');
  return (p && fs.existsSync(p)) ? p : null;
}

ipcMain.handle('kibo:probe', (e, url) => new Promise((resolve) => {
  const f = ffPath();
  if (!f) return resolve(null);
  let err = '';
  const p = spawn(f, ['-hide_banner', '-analyzeduration', '10000000', '-probesize', '20000000', '-i', url], { windowsHide: true });
  const to = setTimeout(() => { try { p.kill(); } catch (x) {} }, 25000);
  p.stderr.on('data', (d) => { err += d; });
  p.on('close', () => {
    clearTimeout(to);
    const r = parseProbe(err);
    resolve((r.a.length || r.v.length) ? r : null);
  });
  p.on('error', () => { clearTimeout(to); resolve(null); });
}));

// Extrae un subtítulo de texto a WebVTT (lee el archivo completo, puede tardar).
ipcMain.handle('kibo:vtt', (e, url, idx) => new Promise((resolve) => {
  const f = ffPath();
  if (!f) return resolve('');
  let out = '';
  const p = spawn(f, ['-hide_banner', '-loglevel', 'error', '-i', url, '-map', '0:' + idx, '-f', 'webvtt', 'pipe:1'],
    { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  const to = setTimeout(() => { try { p.kill(); } catch (x) {} }, 15 * 60 * 1000);
  p.stdout.setEncoding('utf8');
  p.stdout.on('data', (d) => { out += d; });
  p.on('close', () => { clearTimeout(to); resolve(out); });
  p.on('error', () => { clearTimeout(to); resolve(''); });
}));

// Servidor local (solo 127.0.0.1): entrega el video con el audio elegido convertido a AAC dentro de un MP4 fragmentado.
const token = crypto.randomBytes(8).toString('hex');
let srv = null;
let srvPort = 0;

function startServer() {
  return new Promise((resolve) => {
    if (srv) return resolve(srvPort);
    srv = http.createServer((req, rsp) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (u.pathname !== '/s' || u.searchParams.get('t') !== token) { rsp.statusCode = 403; return rsp.end(); }
      const src = u.searchParams.get('u');
      const a = u.searchParams.get('a');
      const ss = parseFloat(u.searchParams.get('ss') || '0');
      const vc = u.searchParams.get('v') || 'copy';
      const copyts = u.searchParams.get('c') === '1';
      const f = ffPath();
      if (!f || !src) { rsp.statusCode = 500; return rsp.end(); }
      const args = ['-hide_banner', '-loglevel', 'error'];
      if (ss > 0) args.push('-ss', String(ss));
      // -noaccurate_seek: audio y video empiezan en el mismo punto (evita el desfase tras saltar)
      if (ss > 0) args.push('-noaccurate_seek');
      if (/^https?:/i.test(src)) args.push('-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_delay_max', '3');
      args.push('-analyzeduration', '2000000', '-probesize', '3000000', '-i', src, '-map', '0:v:0', '-map', '0:' + a, '-sn', '-dn');
      if (copyts) args.push('-copyts');
      if (vc === 'copy') args.push('-c:v', 'copy');
      else args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p');
      args.push('-c:a', 'aac', '-b:a', '192k', '-ac', '2',
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof', '-f', 'mp4', 'pipe:1');
      const p = spawn(f, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
      rsp.writeHead(200, { 'Content-Type': 'video/mp4', 'Cache-Control': 'no-store' });
      p.stdout.pipe(rsp);
      const kill = () => { try { p.kill('SIGKILL'); } catch (x) {} };
      req.on('close', kill);
      rsp.on('close', kill);
      p.on('close', () => { try { rsp.end(); } catch (x) {} });
    });
    srv.listen(0, '127.0.0.1', () => { srvPort = srv.address().port; resolve(srvPort); });
  });
}

ipcMain.handle('kibo:stream', async () => ({ port: await startServer(), token, ok: !!ffPath() }));
