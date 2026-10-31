// Copia la interfaz web (../web) y las librerías de video dentro de desktop/app antes de ejecutar o compilar.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const web = path.join(root, '..', 'web');
const app = path.join(root, 'app');
const vend = path.join(app, 'vendor');

fs.rmSync(app, { recursive: true, force: true });
fs.mkdirSync(vend, { recursive: true });

for (const f of fs.readdirSync(web)) {
  const s = path.join(web, f);
  if (fs.statSync(s).isFile()) fs.copyFileSync(s, path.join(app, f));
}

// quitar la referencia a la API de Samsung (no existe aquí)
const idx = path.join(app, 'index.html');
const html = fs.readFileSync(idx, 'utf8').split('\n').filter(l => !l.includes('WEBAPIS')).join('\n');
fs.writeFileSync(idx, html);

const libs = [
  ['hls.js', 'dist/hls.min.js', 'hls.min.js'],
  ['mpegts.js', 'dist/mpegts.js', 'mpegts.js']
];
for (const [pkg, rel, out] of libs) {
  const p = path.join(root, 'node_modules', pkg, rel);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(vend, out));
  else console.warn('Falta ' + p + ' (instala dependencias con: npm install)');
}
console.log('Interfaz copiada en', app);
