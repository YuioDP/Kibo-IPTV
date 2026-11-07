// Interpreta la salida de "ffmpeg -i <url>" (stderr) y devuelve duración, video, audios y subtítulos.
function parseProbe(txt) {
  const out = { dur: 0, v: [], a: [], s: [] };
  const dm = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(txt);
  if (dm) out.dur = (+dm[1]) * 3600 + (+dm[2]) * 60 + parseFloat(dm[3]);
  let cur = null;
  for (const line of txt.split(/\r?\n/)) {
    const m = /^\s*Stream #0:(\d+)(?:\[0x[0-9a-fA-F]+\])?(?:\(([^)]*)\))?:\s*(Video|Audio|Subtitle):\s*(.*)$/.exec(line);
    if (m) {
      const rest = m[4];
      const o = {
        i: +m[1],
        lang: (m[2] && m[2] !== 'und') ? m[2] : '',
        codec: rest.split(/[ ,(]/)[0],
        title: '',
        def: /\(default\)/.test(rest)
      };
      const pm = /^\w+\s*\(([^)]*)\)/.exec(rest);
      if (pm) o.prof = pm[1];
      const rm = /,\s*(\d{2,5})x(\d{2,5})/.exec(rest);
      if (rm) { o.w = +rm[1]; o.h = +rm[2]; }
      if (m[3] === 'Audio') {
        const ch = /,\s*(mono|stereo|\d(?:\.\d)?(?:\([^)]*\))?)\s*,/.exec(rest);
        o.ch = ch ? ch[1] : '';
        out.a.push(o);
      } else if (m[3] === 'Video') {
        out.v.push(o);
      } else {
        out.s.push(o);
      }
      cur = o;
      continue;
    }
    const t = /^\s+title\s*:\s*(.*)$/.exec(line);
    if (t && cur && !cur.title) cur.title = t[1].trim();
  }
  // el audio marcado como predeterminado va primero
  out.a.sort((x, y) => (y.def ? 1 : 0) - (x.def ? 1 : 0));
  return out;
}
module.exports = { parseProbe };
