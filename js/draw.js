/* Amatu Chart — drawing tools */
(function () {
'use strict';
const AC = window.AC, U = AC.U, PN = window.AC_PINE;
const FONT = AC.FONT || '"Inter",sans-serif';
const FIB = [[0, '#787b86'], [0.236, '#f23645'], [0.382, '#ff9800'], [0.5, '#4caf50'], [0.618, '#089981'], [0.786, '#00bcd4'], [1, '#787b86'], [1.272, '#673ab7'], [1.414, '#5b9cf6', 0], [1.618, '#2962ff'], [2, '#9575cd', 0], [2.618, '#f23645'], [3.618, '#9c27b0'], [4.236, '#e91e63']];
const FIBX = [[0, '#787b86'], [0.236, '#f23645', 0], [0.382, '#ff9800'], [0.5, '#4caf50', 0], [0.618, '#089981'], [0.786, '#00bcd4', 0], [1, '#787b86'], [1.272, '#673ab7'], [1.618, '#2962ff'], [2, '#9575cd'], [2.618, '#f23645'], [3.618, '#9c27b0', 0], [4.236, '#e91e63', 0]];
const lv = l => l.map(x => ({ v: x[0], c: x[1], on: x[2] !== 0 }));
const BL = '#2f7bff';
/* type: [label, points, defaults] */
const T = {
  trend: ['Garis tren', 2], ray: ['Sinar', 2], info: ['Garis info', 2], ext: ['Garis diperpanjang', 2], angle: ['Sudut tren', 2], hline: ['Garis horizontal', 1], hray: ['Sinar horizontal', 1], vline: ['Garis vertikal', 1], cross: ['Garis silang', 1],
  channel: ['Kanal paralel', 3, { fill: '#2f7bff22', mid: true }], regression: ['Tren regresi', 2, { fill: '#2f7bff1c', dev: 2 }], flat: ['Atas/bawah datar', 3, { fill: '#ff980022', color: '#ff9800' }], disjoint: ['Kanal terpisah', 4, { fill: '#08998122', color: '#089981' }],
  pitchfork: ['Pitchfork', 3, { color: '#f23645' }], schiff: ['Schiff pitchfork', 3, { color: '#f23645' }], mschiff: ['Schiff pitchfork modifikasi', 3, { color: '#f23645' }], inside: ['Inside pitchfork', 3, { color: '#f23645' }],
  fib: ['Fib retracement', 2, { levels: lv(FIB), fillA: 12, color: '#787b86', w: 1 }], fibext: ['Fib ekstensi berbasis tren', 3, { levels: lv(FIBX), fillA: 12, color: '#787b86', w: 1 }], fibchan: ['Fib kanal', 3, { levels: lv(FIBX), fillA: 10, color: '#787b86', w: 1 }], fibtime: ['Fib zona waktu', 2, { color: '#2f7bff', w: 1 }], fibtimeext: ['Fib waktu berbasis tren', 3, { levels: lv([[0, '#787b86'], [0.382, '#f23645'], [0.5, '#ff9800'], [0.618, '#4caf50'], [1, '#089981'], [1.382, '#00bcd4'], [1.618, '#2962ff'], [2, '#9c27b0'], [2.618, '#e91e63']]), fillA: 8, color: '#787b86', w: 1 }], fibfan: ['Fib speed resistance fan', 2, { levels: lv([[0, '#787b86'], [0.25, '#ff9800'], [0.382, '#4caf50'], [0.5, '#089981'], [0.618, '#00bcd4'], [0.75, '#2962ff'], [1, '#787b86']]), fillA: 10, color: '#787b86', w: 1 }], fibcircle: ['Fib lingkaran', 2, { levels: lv([[0.236, '#f23645'], [0.382, '#ff9800'], [0.5, '#4caf50'], [0.618, '#089981'], [0.786, '#00bcd4'], [1, '#787b86'], [1.618, '#2962ff'], [2.618, '#9c27b0']]), fillA: 6, color: '#787b86', w: 1 }], fibarc: ['Fib speed resistance arc', 2, { levels: lv([[0.236, '#f23645'], [0.382, '#ff9800'], [0.5, '#4caf50'], [0.618, '#089981'], [0.786, '#00bcd4'], [1, '#787b86'], [1.618, '#2962ff']]), color: '#787b86', w: 1 }], fibspiral: ['Fib spiral', 2, { color: '#00bcd4', w: 1 }], fibwedge: ['Fib wedge', 3, { levels: lv([[0.236, '#f23645'], [0.382, '#ff9800'], [0.5, '#4caf50'], [0.618, '#089981'], [0.786, '#00bcd4'], [1, '#787b86']]), color: '#787b86', w: 1 }],
  gannbox: ['Gann box', 2, { color: '#787b86', w: 1, fill: '#2f7bff12' }], gannfan: ['Gann fan', 2, { color: '#4caf50', w: 1 }], gannsq: ['Gann square', 2, { color: '#ff9800', w: 1 }],
  xabcd: ['Pola XABCD', 5, { fill: '#2f7bff33' }], cypher: ['Pola Cypher', 5, { fill: '#2f7bff33' }], hns: ['Head & shoulders', 7, { color: '#089981', fill: '#08998133' }], abcd: ['Pola ABCD', 4, { color: '#089981' }], tripat: ['Pola segitiga', 4, { color: '#673ab7', fill: '#673ab733' }], threedrives: ['Three drives', 7, { color: '#673ab7' }],
  ew5: ['Elliott impuls 1-2-3-4-5', 6, { color: '#2f7bff' }], ewabc: ['Elliott koreksi A-B-C', 4, { color: '#ff9800' }], ewtri: ['Elliott segitiga A-B-C-D-E', 6, { color: '#ff9800' }], ewwxy: ['Elliott kombo W-X-Y', 4, { color: '#9c27b0' }], ewwxyxz: ['Elliott kombo W-X-Y-X-Z', 6, { color: '#9c27b0' }],
  cyclic: ['Garis siklus', 2, { color: '#5b9cf6', w: 1 }], timecycle: ['Siklus waktu', 2, { color: '#089981', fill: '#08998118', w: 1 }], sine: ['Garis sinus', 2, { color: '#089981' }],
  long: ['Posisi long', 1, { risk: 1, acc: 1000 }], short: ['Posisi short', 1, { risk: 1, acc: 1000 }], forecast: ['Prakiraan', 2, { color: '#2f7bff' }], proj: ['Proyeksi', 3, { color: '#2f7bff', fill: '#2f7bff22' }], barspat: ['Pola bar', 2, { color: '#5b9cf6' }], avwap: ['Anchored VWAP', 1, { color: '#2f7bff', bands: true }], frvp: ['Profil volume rentang tetap', 2, {}], avp: ['Profil volume jangkar', 1, {}],
  prange: ['Rentang harga', 2, { fill: '#2f7bff1c' }], drange: ['Rentang tanggal', 2, { fill: '#2f7bff1c' }], dprange: ['Rentang tanggal & harga', 2, { fill: '#2f7bff1c' }],
  brush: ['Kuas', -1, { color: '#00bcd4' }], highlighter: ['Penanda', -1, { color: '#fdd83566', w: 18 }], arrow: ['Panah', 2], arrowmark: ['Penanda panah', 2, { fill: '#2f7bff', color: '#2f7bff' }], arrup: ['Tanda panah naik', 1, { color: '#089981' }], arrdn: ['Tanda panah turun', 1, { color: '#f23645' }],
  rect: ['Persegi', 2, { fill: '#9c27b022', color: '#9c27b0' }], rotrect: ['Persegi putar', 3, { fill: '#9c27b022', color: '#9c27b0' }], path: ['Path', -2], circle: ['Lingkaran', 2, { fill: '#ff980022', color: '#ff9800' }], ellipse: ['Elips', 2, { fill: '#f2364522', color: '#f23645' }], polyline: ['Polyline', -2, { fill: '#00bcd422', color: '#00bcd4' }], triangle: ['Segitiga', 3, { fill: '#08998122', color: '#089981' }], arc: ['Busur', 3, { fill: '#e91e6322', color: '#e91e63' }], curve: ['Kurva', 3], dcurve: ['Kurva ganda', 4],
  text: ['Teks', 1, { color: BL, fs: 14 }], atext: ['Teks jangkar (layar)', 1, { color: BL, fs: 14, anchor: true }], note: ['Catatan', 1, { color: '#2f7bff' }], pnote: ['Catatan harga', 2, { color: '#2f7bff' }], pin: ['Pin', 1, { color: '#2f7bff' }], callout: ['Callout', 2, { color: '#089981' }], comment: ['Komentar', 1, { color: '#2f7bff' }], plabel: ['Label harga', 1, { color: '#2f7bff' }], signpost: ['Signpost', 1, { color: '#2f7bff' }], flag: ['Tanda bendera', 1, { color: '#2f7bff' }], emoji: ['Emoji', 1, { txt: '🚀', fs: 34 }], image: ['Gambar', 2, {}]
};
AC.TOOLS = T;
AC.TOOL_GROUPS = [
  ['trend', 'Garis', ['trend', 'ray', 'info', 'ext', 'angle', 'hline', 'hray', 'vline', 'cross', '-Kanal', 'channel', 'regression', 'flat', 'disjoint', '-Pitchfork', 'pitchfork', 'schiff', 'mschiff', 'inside']],
  ['fib', 'Fibonacci & Gann', ['fib', 'fibext', 'fibchan', 'fibtime', 'fibfan', 'fibtimeext', 'fibcircle', 'fibspiral', 'fibarc', 'fibwedge', '-Gann', 'gannbox', 'gannsq', 'gannfan']],
  ['xabcd', 'Pola', ['xabcd', 'cypher', 'hns', 'abcd', 'tripat', 'threedrives', '-Elliott', 'ew5', 'ewabc', 'ewtri', 'ewwxy', 'ewwxyxz', '-Siklus', 'cyclic', 'timecycle', 'sine']],
  ['long', 'Prediksi & ukur', ['long', 'short', 'forecast', 'barspat', 'proj', '-Berbasis volume', 'avwap', 'frvp', 'avp', '-Pengukur', 'prange', 'drange', 'dprange']],
  ['brush', 'Bentuk', ['brush', 'highlighter', '-Panah', 'arrowmark', 'arrow', 'arrup', 'arrdn', '-Bentuk', 'rect', 'rotrect', 'path', 'circle', 'ellipse', 'polyline', 'triangle', 'arc', 'curve', 'dcurve']],
  ['text', 'Teks & catatan', ['text', 'atext', 'note', 'pnote', 'pin', 'callout', 'comment', 'plabel', 'signpost', 'flag', 'image']],
  ['emoji', 'Emoji', ['emoji']]
];
AC.drawDefaults = (type, app) => Object.assign({ color: BL, w: 2, dash: 'solid' }, U.clone(T[type] && T[type][2] || {}), U.clone(app.settings.toolDef && app.settings.toolDef[type] || {}));

/* ---------- geometry builder ---------- */
class Geo {
  constructor(ch, p, s, d) { this.ch = ch; this.p = p; this.sc = s; this.d = d; this.st = d.s; this.L = []; this.xl = ch.axL; this.xr = ch.axL + ch.pw; this.yt = p.y; this.yb = p.y + p.h; }
  line(a, b, o) { this.L.push(Object.assign({ k: 'l', x1: a[0], y1: a[1], x2: b[0], y2: b[1], c: this.st.color, w: this.st.w, d: this.st.dash }, o)); }
  ext(a, b, l, r, o) { const [p, q] = this.extPts(a, b, l, r); this.line(p, q, o); }
  extPts(a, b, l, r) { let [x1, y1] = a, [x2, y2] = b; const dx = x2 - x1, dy = y2 - y1; if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return [a, b]; const D = 8000 / Math.hypot(dx, dy); return [l ? [x1 - dx * D, y1 - dy * D] : a, r ? [x2 + dx * D, y2 + dy * D] : b]; }
  poly(pts, o) { this.L.push(Object.assign({ k: 'p', pts, c: this.st.color, w: this.st.w, d: this.st.dash, fill: null, closed: false }, o)); }
  rect(x1, y1, x2, y2, o) { this.poly([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], Object.assign({ closed: true }, o)); }
  ell(x, y, rx, ry, o) { this.L.push(Object.assign({ k: 'e', x, y, rx: Math.abs(rx), ry: Math.abs(ry), c: this.st.color, w: this.st.w, d: this.st.dash, fill: null, a0: 0, a1: Math.PI * 2 }, o)); }
  text(t, x, y, o) { this.L.push(Object.assign({ k: 't', t: String(t), x, y, c: this.st.color, fs: 12, al: 'left', bl: 'middle' }, o)); }
  fn(f, hit) { this.L.push({ k: 'f', f, hit }); }
}
const P2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const fmtDur = ms => { const a = Math.abs(ms); const d = Math.floor(a / 864e5), h = Math.floor(a % 864e5 / 36e5), m = Math.floor(a % 36e5 / 6e4), s = Math.floor(a % 6e4 / 1000); return (d ? d + 'h ' : '') + (h ? h + 'j ' : '') + (m && d < 3 ? m + 'm ' : '') + (!d && !h && !m ? s + 'd' : ''); };
/* builders: (g, pts px, d, ch, raw) */
const B = {
  trend(g, q) { g.ext(q[0], q[1], g.st.exl, g.st.exr); caption(g, q[0], q[1]); if (g.st.mp) g.ell((q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2, 3, 3, { fill: g.st.color }); if (g.st.arr) g.fn((c) => { c.fillStyle = g.st.color; AC.head(c, q[0][0], q[0][1], q[1][0], q[1][1], 8 + g.st.w * 2); }); if (g.st.stats) stats(g, q); },
  ray(g, q) { g.ext(q[0], q[1], false, true); caption(g, q[0], q[1]); }, ext(g, q) { g.ext(q[0], q[1], true, true); caption(g, q[0], q[1]); },
  info(g, q) { g.line(q[0], q[1]); stats(g, q); },
  angle(g, q) { g.line(q[0], q[1]); const a = Math.atan2(q[0][1] - q[1][1], q[1][0] - q[0][0]); g.line(q[0], [q[0][0] + 60, q[0][1]], { w: 1, d: 'dotted' }); g.ell(q[0][0], q[0][1], 45, 45, { a0: Math.min(0, -a), a1: Math.max(0, -a), w: 1, arc: true }); g.text((a * 180 / Math.PI).toFixed(2) + '°', q[0][0] + 52, q[0][1] - 10); },
  hline(g, q) { g.line([g.xl, q[0][1]], [g.xr, q[0][1]]); if (g.d.txt) g.text(g.d.txt, g.xr - 8, q[0][1] - 9, { al: 'right' }); },
  hray(g, q) { g.line(q[0], [g.xr + 5, q[0][1]]); if (g.d.txt) g.text(g.d.txt, g.xr - 8, q[0][1] - 9, { al: 'right' }); },
  vline(g, q) { g.line([q[0][0], g.yt], [q[0][0], g.yb]); if (g.d.txt) g.text(g.d.txt, q[0][0] + 6, g.yt + 60); },
  cross(g, q) { B.hline(g, q); B.vline(g, q); },
  channel(g, q) { const dy = q[2] ? q[2][1] - (q[0][1] + (q[1][1] - q[0][1]) * ((q[2][0] - q[0][0]) / ((q[1][0] - q[0][0]) || 1))) : 0; const [a, b] = g.extPts(q[0], q[1], g.st.exl, g.st.exr); const c = [a[0], a[1] + dy], d = [b[0], b[1] + dy]; if (g.st.fill) g.poly([a, b, d, c], { closed: true, fill: g.st.fill, c: null }); g.line(a, b); g.line(c, d); if (g.st.mid) g.line([a[0], a[1] + dy / 2], [b[0], b[1] + dy / 2], { d: 'dashed', w: 1 }); },
  regression(g, q, d, ch, raw) { const b = ch.bars; let i0 = Math.round(ch.iOf(Math.min(raw[0].t, raw[1].t))), i1 = Math.round(ch.iOf(Math.max(raw[0].t, raw[1].t))); i0 = Math.max(0, i0); i1 = Math.min(b.T.length - 1, i1); const n = i1 - i0 + 1; if (n < 2) return g.line(q[0], q[1]); let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0; for (let k = 0; k < n; k++) { const y = b.C[i0 + k]; sx += k; sy += y; sxx += k * k; sxy += k * y; syy += y * y; } const m = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1), a = (sy - m * sx) / n; let v = 0; for (let k = 0; k < n; k++) { const e = b.C[i0 + k] - a - m * k; v += e * e; } const sd = Math.sqrt(v / n) * (g.st.dev || 2); const X0 = ch.x(i0), X1 = ch.x(i1); const L = o => [[X0, g.sc.y(a + o)], [X1, g.sc.y(a + m * (n - 1) + o)]]; const u = L(sd), l = L(-sd), c = L(0); g.poly([u[0], u[1], l[1], l[0]], { closed: true, fill: g.st.fill, c: null }); g.ext(u[0], u[1], false, g.st.exr); g.ext(l[0], l[1], false, g.st.exr); g.ext(c[0], c[1], false, g.st.exr, { d: 'dashed', w: 1 }); const r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy) || 1); g.text('R ' + r.toFixed(4), l[0][0], l[0][1] + 14, { fs: 11 }); },
  flat(g, q) { const y = q[2] ? q[2][1] : q[1][1]; g.poly([q[0], q[1], [q[1][0], y], [q[0][0], y]], { closed: true, fill: g.st.fill, c: null }); g.line(q[0], q[1]); g.line([q[0][0], y], [q[1][0], y]); },
  disjoint(g, q) { if (q.length < 4) return g.poly(q); g.poly([q[0], q[1], q[3], q[2]], { closed: true, fill: g.st.fill, c: null }); g.line(q[0], q[1]); g.line(q[2], q[3]); },
  pitchfork(g, q, d, ch, raw, mode) { if (q.length < 3) return g.line(q[0], q[1]); let o = q[0]; if (mode === 'schiff') o = [q[0][0], (q[0][1] + q[1][1]) / 2]; if (mode === 'mschiff') o = P2(q[0], q[1], 0.5); const m = P2(q[1], q[2], 0.5); if (mode === 'inside') { o = P2(q[0], q[1], 0.5); } const dx = m[0] - o[0], dy = m[1] - o[1]; g.line(q[1], q[2]); if (o !== q[0]) g.line(q[0], o, { d: 'dotted', w: 1 }); const L = (p, c, w) => g.ext(p, [p[0] + dx, p[1] + dy], false, true, { c, w }); L(o, g.st.color, g.st.w); for (const [k, c] of [[0.5, '#089981'], [1, '#2f7bff']]) { const a = [m[0] + (q[1][0] - m[0]) * k, m[1] + (q[1][1] - m[1]) * k], b = [m[0] + (q[2][0] - m[0]) * k, m[1] + (q[2][1] - m[1]) * k]; L(a, c, 1); L(b, c, 1); const ea = g.extPts(a, [a[0] + dx, a[1] + dy], false, true)[1], eb = g.extPts(b, [b[0] + dx, b[1] + dy], false, true)[1]; g.poly([a, ea, eb, b], { closed: true, fill: U.withA(c, 8), c: null }); } },
  schiff(g, q, d, ch, r) { B.pitchfork(g, q, d, ch, r, 'schiff'); }, mschiff(g, q, d, ch, r) { B.pitchfork(g, q, d, ch, r, 'mschiff'); }, inside(g, q, d, ch, r) { B.pitchfork(g, q, d, ch, r, 'inside'); },
  fib(g, q, d, ch, raw) { fibLevels(g, d, ch, raw[1].v, raw[0].v, Math.min(q[0][0], q[1][0]), Math.max(q[0][0], q[1][0])); g.line(q[0], q[1], { d: 'dashed', w: 1 }); },
  fibext(g, q, d, ch, raw) { g.line(q[0], q[1], { d: 'dashed', w: 1 }); if (q.length < 3) return; g.line(q[1], q[2], { d: 'dashed', w: 1 }); fibLevels(g, d, ch, raw[2].v, raw[2].v + (raw[1].v - raw[0].v), Math.min(q[1][0], q[2][0]), Math.max(q[1][0], q[2][0]) + 60); },
  fibchan(g, q) { g.line(q[0], q[1], { d: 'dashed' }); if (q.length < 3) return; const dy = q[2][1] - (q[0][1] + (q[1][1] - q[0][1]) * ((q[2][0] - q[0][0]) / ((q[1][0] - q[0][0]) || 1))); let pr = null; for (const l of g.st.levels.filter(x => x.on)) { const a = [q[0][0], q[0][1] + dy * l.v], b = [q[1][0], q[1][1] + dy * l.v]; g.ext(a, b, false, g.st.exr, { c: l.c }); if (pr) g.poly([pr[0], pr[1], b, a], { closed: true, fill: U.withA(l.c, g.st.fillA), c: null }); pr = [a, b]; g.text(l.v, a[0] - 6, a[1], { al: 'right', c: l.c, fs: 11 }); } },
  fibtime(g, q) { const w = q[1][0] - q[0][0]; let a = 0, b = 1; for (const n of [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]) { const x = q[0][0] + w * n; if (x < g.xl - 10 || x > g.xr + 10) continue; g.line([x, g.yt], [x, g.yb]); g.text(n, x + 4, g.yb - 12, { fs: 11 }); } g.line(q[0], q[1], { d: 'dashed', w: 1 }); },
  fibtimeext(g, q) { g.line(q[0], q[1], { d: 'dashed', w: 1 }); if (q.length < 3) return; g.line(q[1], q[2], { d: 'dashed', w: 1 }); const w = q[1][0] - q[0][0]; let px = null; for (const l of g.st.levels.filter(x => x.on)) { const x = q[2][0] + w * l.v; g.line([x, g.yt], [x, g.yb], { c: l.c }); if (px !== null) g.rect(px, g.yt, x, g.yb, { fill: U.withA(l.c, g.st.fillA), c: null }); px = x; g.text(l.v, x + 4, g.yb - 12, { c: l.c, fs: 11 }); } },
  fibfan(g, q) { const [a, b] = q; for (const l of g.st.levels.filter(x => x.on)) { const x = a[0] + (b[0] - a[0]) * l.v, y = a[1] + (b[1] - a[1]) * l.v; g.ext(a, [b[0], y], false, true, { c: l.c }); g.ext(a, [x, b[1]], false, true, { c: l.c }); g.line([x, a[1]], [x, b[1]], { c: l.c, w: 0.5 }); g.line([a[0], y], [b[0], y], { c: l.c, w: 0.5 }); g.text(l.v, x, a[1] + (b[1] > a[1] ? -8 : 10), { fs: 10, c: l.c, al: 'center' }); g.text(l.v, a[0] - 6, y, { fs: 10, c: l.c, al: 'right' }); } },
  fibcircle(g, q) { const cx = (q[0][0] + q[1][0]) / 2, cy = (q[0][1] + q[1][1]) / 2, rx = Math.abs(q[1][0] - q[0][0]) / 2, ry = Math.abs(q[1][1] - q[0][1]) / 2; for (const l of g.st.levels.filter(x => x.on)) { g.ell(cx, cy, rx * l.v, ry * l.v, { c: l.c, fill: U.withA(l.c, g.st.fillA) }); g.text(l.v, cx, cy + ry * l.v - 8, { c: l.c, fs: 10, al: 'center' }); } g.line(q[0], q[1], { d: 'dashed' }); },
  fibarc(g, q) { const r = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]); const dn = q[1][1] > q[0][1]; for (const l of g.st.levels.filter(x => x.on)) { g.ell(q[1][0], q[1][1], r * l.v, r * l.v, { c: l.c, a0: dn ? Math.PI : 0, a1: dn ? Math.PI * 2 : Math.PI, arc: true }); g.text(l.v, q[1][0], q[1][1] + (dn ? -1 : 1) * r * l.v, { c: l.c, fs: 10, al: 'center' }); } g.line(q[0], q[1], { d: 'dashed' }); },
  fibspiral(g, q) { const r0 = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]), a0 = Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]), phi = 1.618034, pts = []; for (let t = -6 * Math.PI; t < 3 * Math.PI; t += 0.12) { const r = r0 * Math.pow(phi, t / (Math.PI / 2)); if (r > 6000) break; pts.push([q[0][0] + r * Math.cos(a0 + t), q[0][1] + r * Math.sin(a0 + t)]); } g.poly(pts); g.line(q[0], q[1], { d: 'dashed' }); },
  fibwedge(g, q) { g.line(q[0], q[1]); if (q.length < 3) return; g.line(q[0], q[2]); const a0 = Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]), a1 = Math.atan2(q[2][1] - q[0][1], q[2][0] - q[0][0]), r = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]); for (const l of g.st.levels.filter(x => x.on)) { g.ell(q[0][0], q[0][1], r * l.v, r * l.v, { c: l.c, a0: Math.min(a0, a1), a1: Math.max(a0, a1), arc: true }); g.text(l.v, q[0][0] + r * l.v * Math.cos((a0 + a1) / 2), q[0][1] + r * l.v * Math.sin((a0 + a1) / 2), { c: l.c, fs: 10 }); } },
  gannbox(g, q) { const K = [0, 0.25, 0.382, 0.5, 0.618, 0.75, 1]; const [a, b] = q; g.rect(a[0], a[1], b[0], b[1], { fill: g.st.fill }); for (const k of K) { const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k; g.line([x, a[1]], [x, b[1]]); g.line([a[0], y], [b[0], y]); g.text(k, x, Math.min(a[1], b[1]) - 8, { fs: 10, al: 'center' }); g.text(k, Math.min(a[0], b[0]) - 4, y, { fs: 10, al: 'right' }); } },
  gannsq(g, q) { const [a, b] = q; g.rect(a[0], a[1], b[0], b[1], {}); for (let k = 1; k < 5; k++) { const x = a[0] + (b[0] - a[0]) * k / 5, y = a[1] + (b[1] - a[1]) * k / 5; g.line([x, a[1]], [x, b[1]], { w: 0.6 }); g.line([a[0], y], [b[0], y], { w: 0.6 }); } for (const [x, y] of [[8, 1], [5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 8]]) { const m = Math.max(x, y); g.line(a, [a[0] + (b[0] - a[0]) * x / m, a[1] + (b[1] - a[1]) * y / m], { c: U.withA(g.st.color, 60), w: 1 }); } const rx = b[0] - a[0], ry = b[1] - a[1]; for (const k of [0.2, 0.4, 0.6, 0.8, 1]) g.ell(a[0], a[1], rx * k, ry * k, { a0: rx > 0 ? (ry > 0 ? 0 : -Math.PI / 2) : (ry > 0 ? Math.PI / 2 : Math.PI), a1: rx > 0 ? (ry > 0 ? Math.PI / 2 : 0) : (ry > 0 ? Math.PI : Math.PI * 1.5), arc: true, w: 1, c: '#089981' }); },
  gannfan(g, q) { const [a, b] = q, C = ['#ff9800', '#00bcd4', '#4caf50', '#e91e63', '#f23645', '#2962ff', '#9c27b0', '#673ab7', '#fdd835']; [[8, 1], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 8]].forEach(([x, y], k) => { const m = [a[0] + (b[0] - a[0]) * (x >= y ? 1 : x / y), a[1] + (b[1] - a[1]) * (y >= x ? 1 : y / x)]; g.ext(a, m, false, true, { c: C[k] }); g.text(x + '/' + y, m[0] + 4, m[1], { fs: 10, c: C[k] }); }); },
  xabcd(g, q, d, ch, raw) { pat(g, q, 'XABCD', raw, (q) => { if (q.length >= 3) g.poly([q[0], q[1], q[2]], { closed: true, fill: g.st.fill, c: null }); if (q.length >= 5) g.poly([q[2], q[3], q[4]], { closed: true, fill: g.st.fill, c: null }); }); const R = (a, b, c, e) => (Math.abs(raw[c].v - raw[e].v) / Math.abs(raw[a].v - raw[b].v)).toFixed(3); const mid = (a, b, t) => { g.line(q[a], q[b], { d: 'dotted', w: 1 }); g.text(t, (q[a][0] + q[b][0]) / 2, (q[a][1] + q[b][1]) / 2, { bg: g.st.color, c: '#fff', al: 'center', fs: 11 }); }; if (raw.length >= 3) mid(0, 2, R(0, 1, 1, 2)); if (raw.length >= 4) mid(1, 3, R(1, 2, 2, 3)); if (raw.length >= 5) { mid(2, 4, R(2, 3, 3, 4)); mid(0, 4, R(0, 1, 1, 4)); } },
  cypher(g, q, d, ch, raw) { B.xabcd(g, q, d, ch, raw); },
  hns(g, q, d, ch, raw) { pat(g, q, ['', 'Bahu kiri', '', 'Kepala', '', 'Bahu kanan', ''], raw); if (q.length >= 5) { g.ext(q[2], q[4], true, true, { d: 'dashed', w: 1 }); } if (q.length === 7 && g.st.fill) { g.poly([q[0], q[1], q[2]], { closed: true, fill: g.st.fill, c: null }); g.poly([q[2], q[3], q[4]], { closed: true, fill: g.st.fill, c: null }); g.poly([q[4], q[5], q[6]], { closed: true, fill: g.st.fill, c: null }); } },
  abcd(g, q, d, ch, raw) { pat(g, q, 'ABCD', raw); const R = (a, b, c, e) => (Math.abs(raw[c].v - raw[e].v) / Math.abs(raw[a].v - raw[b].v)).toFixed(3); if (raw.length >= 3) { g.line(q[0], q[2], { d: 'dotted', w: 1 }); g.text(R(0, 1, 1, 2), (q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, { bg: g.st.color, c: '#fff', al: 'center', fs: 11 }); } if (raw.length >= 4) { g.line(q[1], q[3], { d: 'dotted', w: 1 }); g.text(R(1, 2, 2, 3), (q[1][0] + q[3][0]) / 2, (q[1][1] + q[3][1]) / 2, { bg: g.st.color, c: '#fff', al: 'center', fs: 11 }); } },
  tripat(g, q, d, ch, raw) { pat(g, q, 'ABCD', raw); if (q.length >= 4) { g.ext(q[0], q[2], false, true, { w: 1 }); g.ext(q[1], q[3], false, true, { w: 1 }); } },
  threedrives(g, q, d, ch, raw) { pat(g, q, ['', '1', '', '2', '', '3', ''], raw); if (q.length >= 6) { g.line(q[1], q[3], { d: 'dotted', w: 1 }); g.line(q[3], q[5], { d: 'dotted', w: 1 }); } },
  ew5(g, q, d, c, r) { pat(g, q, ['0', '1', '2', '3', '4', '5'], r, null, true); }, ewabc(g, q, d, c, r) { pat(g, q, ['0', 'A', 'B', 'C'], r, null, true); }, ewtri(g, q, d, c, r) { pat(g, q, ['0', 'A', 'B', 'C', 'D', 'E'], r, null, true); }, ewwxy(g, q, d, c, r) { pat(g, q, ['0', 'W', 'X', 'Y'], r, null, true); }, ewwxyxz(g, q, d, c, r) { pat(g, q, ['0', 'W', 'X', 'Y', 'X', 'Z'], r, null, true); },
  cyclic(g, q) { const w = q[1][0] - q[0][0]; if (Math.abs(w) < 4) return g.line(q[0], q[1]); for (let k = 0, x = q[0][0]; k < 300 && x > g.xl - 10 && x < g.xr + 2000; k++, x += w) { if (x > g.xr) break; g.line([x, g.yt], [x, g.yb]); } },
  timecycle(g, q) { const w = Math.abs(q[1][0] - q[0][0]); if (w < 6) return g.line(q[0], q[1]); for (let k = 0, x = q[0][0]; k < 200 && x < g.xr; k++, x += w) g.ell(x + w / 2, q[0][1], w / 2, w / 2, { a0: Math.PI, a1: Math.PI * 2, arc: true, fill: g.st.fill }); },
  sine(g, q) { const w = q[1][0] - q[0][0], A = (q[1][1] - q[0][1]) / 2, m = (q[0][1] + q[1][1]) / 2; if (Math.abs(w) < 3) return g.line(q[0], q[1]); const pts = []; for (let x = g.xl; x <= g.xr; x += 4) pts.push([x, m - A * Math.cos(Math.PI * (x - q[0][0]) / w)]); g.poly(pts); },
  long(g, q, d, ch, raw) { posTool(g, d, ch, raw, 1); }, short(g, q, d, ch, raw) { posTool(g, d, ch, raw, -1); },
  forecast(g, q, d, ch, raw) { g.line(q[0], q[1], { d: 'dashed' }); g.fn(c => { c.fillStyle = g.st.color; AC.head(c, q[0][0], q[0][1], q[1][0], q[1][1], 10); }); const dv = raw[1].v - raw[0].v; const up = dv >= 0; g.text((up ? '+' : '') + fp(g, dv) + ' (' + U.pct(dv / raw[0].v * 100) + ') dalam ' + fmtDur(raw[1].t - raw[0].t), q[1][0], q[1][1] + (up ? -16 : 16), { bg: up ? '#089981' : '#f23645', c: '#fff', al: 'center', fs: 11 }); const last = ch.bars.C[ch.bars.C.length - 1], done = ch.bars.T[ch.bars.T.length - 1] >= raw[1].t; if (done) { let hit = false; const i0 = Math.max(0, Math.ceil(ch.iOf(raw[0].t))), i1 = Math.min(ch.bars.T.length - 1, Math.floor(ch.iOf(raw[1].t))); for (let i = i0; i <= i1; i++) if (up ? ch.bars.H[i] >= raw[1].v : ch.bars.L[i] <= raw[1].v) hit = true; g.text(hit ? '✓ tercapai' : '✗ gagal', q[1][0], q[1][1] + (up ? -34 : 34), { bg: hit ? '#089981' : '#f23645', c: '#fff', al: 'center', fs: 11 }); } },
  proj(g, q, d, ch, raw) { g.line(q[0], q[1], { d: 'dashed' }); if (q.length < 3) return; g.poly([q[0], q[1], q[2]], { closed: true, fill: g.st.fill }); g.text((Math.abs(raw[2].v - raw[1].v) / Math.abs(raw[1].v - raw[0].v || 1)).toFixed(3), (q[1][0] + q[2][0]) / 2, (q[1][1] + q[2][1]) / 2, { bg: g.st.color, c: '#fff', al: 'center', fs: 11 }); },
  barspat(g, q, d, ch, raw) { const pts = d.s.data; g.line(q[0], q[1], { d: 'dotted', w: 1, c: U.withA(g.st.color, 40) }); if (!pts) return; const ox = q[0][0], k = g.st.mir ? -1 : 1; const X = i => ox + i * ch.bs; const p = []; pts.forEach((v, i) => { const base = raw[0].v; const f = r => g.sc.y(base + (r - pts[0][3]) * k); g.line([X(i), f(v[1])], [X(i), f(v[2])], { w: 1 }); g.line([X(i) - ch.bs * 0.3, f(v[0])], [X(i), f(v[0])], { w: 1 }); g.line([X(i), f(v[3])], [X(i) + ch.bs * 0.3, f(v[3])], { w: 1 }); }); },
  avwap(g, q, d, ch, raw) { const b = ch.bars; const i0 = Math.max(0, Math.round(ch.iOf(raw[0].t))); let s = 0, v = 0, qq = 0; const M = [], Up = [], Dn = []; const [a, z] = ch.range(); for (let i = i0; i < b.T.length; i++) { const p = (b.H[i] + b.L[i] + b.C[i]) / 3, w = b.V[i] > 0 ? b.V[i] : 1; s += p * w; v += w; qq += p * p * w; if (i >= a - 1 && i <= z + 1) { const m = s / v, sd = Math.sqrt(Math.max(0, qq / v - m * m)); const x = ch.x(i); M.push([x, g.sc.y(m)]); Up.push([x, g.sc.y(m + sd)]); Dn.push([x, g.sc.y(m - sd)]); } } g.poly(M); if (g.st.bands) { g.poly(Up, { w: 1, c: U.withA(g.st.color, 60) }); g.poly(Dn, { w: 1, c: U.withA(g.st.color, 60) }); g.poly(Up.concat(Dn.slice().reverse()), { closed: true, fill: U.withA(g.st.color, 6), c: null }); } g.ell(q[0][0], q[0][1], 3, 3, { fill: g.st.color }); },
  frvp(g, q, d, ch, raw) { vpTool(g, d, ch, Math.min(raw[0].t, raw[1].t), Math.max(raw[0].t, raw[1].t), Math.min(q[0][0], q[1][0]), Math.max(q[0][0], q[1][0])); },
  avp(g, q, d, ch, raw) { vpTool(g, d, ch, raw[0].t, ch.bars.T[ch.bars.T.length - 1] + ch.ser.ms, q[0][0], g.xr); },
  prange(g, q, d, ch, raw) { measure(g, q, raw, ch, true, false); }, drange(g, q, d, ch, raw) { measure(g, q, raw, ch, false, true); }, dprange(g, q, d, ch, raw) { measure(g, q, raw, ch, true, true); }, measure(g, q, d, ch, raw) { measure(g, q, raw, ch, true, true, true); },
  brush(g, q) { g.poly(q, { smooth: true }); }, highlighter(g, q) { g.poly(q, { smooth: true }); },
  arrow(g, q) { g.line(q[0], q[1]); g.fn(c => { c.fillStyle = g.st.color; AC.head(c, q[0][0], q[0][1], q[1][0], q[1][1], 9 + g.st.w * 2); }); caption(g, q[0], q[1]); },
  arrowmark(g, q) { const [a, b] = q, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, w = Math.min(14, L / 6), hl = Math.min(34, L / 2.2), N = (p, k) => [p[0] - uy * k, p[1] + ux * k], m = [b[0] - ux * hl, b[1] - uy * hl]; g.poly([N(a, w * 0.35), N(m, w * 0.8), N(m, w * 1.9), b, N(m, -w * 1.9), N(m, -w * 0.8), N(a, -w * 0.35)], { closed: true, fill: g.st.fill, w: 1 }); if (g.d.txt) g.text(g.d.txt, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 26, { al: 'center' }); },
  arrup(g, q) { mark(g, q[0], 1); }, arrdn(g, q) { mark(g, q[0], -1); },
  rect(g, q) { const x2 = g.st.exr ? g.xr + 5 : q[1][0]; g.rect(q[0][0], q[0][1], x2, q[1][1], { fill: g.st.fill }); if (g.st.mid) g.line([q[0][0], (q[0][1] + q[1][1]) / 2], [x2, (q[0][1] + q[1][1]) / 2], { d: 'dashed', w: 1 }); if (g.d.txt) g.text(g.d.txt, (q[0][0] + Math.min(x2, g.xr)) / 2, (q[0][1] + q[1][1]) / 2, { al: 'center', fs: g.st.fs || 13 }); },
  rotrect(g, q) { if (q.length < 3) return g.line(q[0], q[1]); const [a, b, c] = q, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, h = (c[0] - b[0]) * nx + (c[1] - b[1]) * ny; const N = (p, k) => [p[0] + nx * k, p[1] + ny * k]; g.poly([N(a, h), N(b, h), N(b, -h), N(a, -h)], { closed: true, fill: g.st.fill }); },
  path(g, q) { g.poly(q); if (q.length > 1) { const a = q[q.length - 2], b = q[q.length - 1]; g.fn(c => { c.fillStyle = g.st.color; AC.head(c, a[0], a[1], b[0], b[1], 8 + g.st.w * 2); }); } },
  polyline(g, q, d) { g.poly(q, { closed: !d.draft && q.length > 2 && g.st.closed !== false, fill: g.st.fill }); },
  circle(g, q) { const r = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]); g.ell(q[0][0], q[0][1], r, r, { fill: g.st.fill }); if (g.d.txt) g.text(g.d.txt, q[0][0], q[0][1], { al: 'center' }); },
  ellipse(g, q) { g.ell((q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2, (q[1][0] - q[0][0]) / 2, (q[1][1] - q[0][1]) / 2, { fill: g.st.fill }); if (g.d.txt) g.text(g.d.txt, (q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2, { al: 'center' }); },
  triangle(g, q) { g.poly(q, { closed: q.length > 2, fill: g.st.fill }); },
  arc(g, q) { if (q.length < 3) return g.line(q[0], q[1]); const m = [2 * q[2][0] - (q[0][0] + q[1][0]) / 2, 2 * q[2][1] - (q[0][1] + q[1][1]) / 2]; g.poly(bez(q[0], m, q[1]), { fill: g.st.fill }); },
  curve(g, q) { if (q.length < 3) return g.line(q[0], q[1]); const m = [2 * q[2][0] - (q[0][0] + q[1][0]) / 2, 2 * q[2][1] - (q[0][1] + q[1][1]) / 2]; g.poly(bez(q[0], m, q[1])); },
  dcurve(g, q) { if (q.length < 4) return g.poly(q); const pts = []; for (let t = 0; t <= 1.001; t += 0.03) { const u = 1 - t; pts.push([u * u * u * q[0][0] + 3 * u * u * t * q[2][0] + 3 * u * t * t * q[3][0] + t * t * t * q[1][0], u * u * u * q[0][1] + 3 * u * u * t * q[2][1] + 3 * u * t * t * q[3][1] + t * t * t * q[1][1]]); } g.poly(pts); },
  text(g, q) { g.text(g.d.txt || 'Teks', q[0][0], q[0][1], { fs: g.st.fs || 14, bg: g.st.bg, bold: g.st.bold }); }, atext(g, q, d, ch) { g.text(g.d.txt || 'Teks', g.xl + (d.ax || 0.1) * ch.pw, g.yt + (d.ay || 0.2) * g.p.h, { fs: g.st.fs || 14, bg: g.st.bg, bold: g.st.bold }); },
  note(g, q) { bubble(g, q[0], '📝', g.d.txt); }, pin(g, q) { bubble(g, q[0], '📍', g.d.txt); }, flag(g, q) { g.line(q[0], [q[0][0], q[0][1] - 26], { w: 2 }); g.poly([[q[0][0], q[0][1] - 26], [q[0][0] + 16, q[0][1] - 21], [q[0][0], q[0][1] - 15]], { closed: true, fill: g.st.color }); if (g.d.txt) g.text(g.d.txt, q[0][0] + 8, q[0][1] - 34); },
  pnote(g, q, d, ch, raw) { g.line(q[0], q[1]); g.ell(q[0][0], q[0][1], 3, 3, { fill: g.st.color }); g.text((d.txt ? d.txt + '\n' : '') + fp(g, raw[0].v), q[1][0], q[1][1], { bg: g.st.color, c: '#fff' }); },
  callout(g, q) { g.line(q[0], q[1]); g.text(g.d.txt || 'Callout', q[1][0], q[1][1], { bg: g.st.color, c: '#fff', fs: g.st.fs || 13 }); },
  comment(g, q) { g.text(g.d.txt || 'Komentar', q[0][0] + 6, q[0][1] - 14, { bg: g.st.color, c: '#fff', round: 1 }); g.ell(q[0][0], q[0][1], 2, 2, { fill: g.st.color }); },
  plabel(g, q, d, ch, raw) { g.text(fp(g, raw[0].v) + (d.txt ? '  ' + d.txt : ''), q[0][0] + 8, q[0][1] - 16, { bg: g.st.color, c: '#fff' }); g.line(q[0], [q[0][0] + 8, q[0][1] - 10], { w: 1 }); },
  signpost(g, q) { g.line(q[0], [q[0][0], q[0][1] - 50], { w: 1 }); g.text(g.d.txt || 'Signpost', q[0][0], q[0][1] - 58, { bg: g.st.color, c: '#fff', al: 'center' }); },
  emoji(g, q) { g.text(g.d.txt || g.st.txt || '🚀', q[0][0], q[0][1], { fs: g.st.fs || 34, al: 'center' }); },
  image(g, q, d, ch) { const im = imgOf(d.s.src, ch); g.rect(q[0][0], q[0][1], q[1][0], q[1][1], { c: im ? null : g.st.color, fill: '#00000001' }); if (im) g.fn(c => { c.globalAlpha = (d.s.op === undefined ? 100 : d.s.op) / 100; c.drawImage(im, Math.min(q[0][0], q[1][0]), Math.min(q[0][1], q[1][1]), Math.abs(q[1][0] - q[0][0]), Math.abs(q[1][1] - q[0][1])); c.globalAlpha = 1; }); }
};
const imgs = new Map(); function imgOf(src, ch) { if (!src) return null; let i = imgs.get(src); if (!i) { i = new Image(); i.onload = () => { i.ok = true; ch.invalidate(); }; i.src = src; imgs.set(src, i); } return i.ok ? i : null; }
function bez(a, m, b) { const o = []; for (let t = 0; t <= 1.001; t += 0.04) { const u = 1 - t; o.push([u * u * a[0] + 2 * u * t * m[0] + t * t * b[0], u * u * a[1] + 2 * u * t * m[1] + t * t * b[1]]); } return o; }
const fp = (g, v) => g.p.id === 'main' ? U.fmt(v, g.ch.ser.sym.prec) : g.ch.fmtP(g.p, v);
function caption(g, a, b) { if (!g.d.txt) return; g.text(g.d.txt, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 10, { al: 'center', fs: g.st.fs || 13 }); }
function stats(g, q) { const r = g.d.p; const dv = r[1].v - r[0].v, bars = Math.round(g.ch.iOf(r[1].t) - g.ch.iOf(r[0].t)); const a = Math.atan2(q[0][1] - q[1][1], q[1][0] - q[0][0]) * 180 / Math.PI; g.text(fp(g, dv) + ' (' + U.pct(dv / r[0].v * 100) + ')\n' + bars + ' bar, ' + fmtDur(r[1].t - r[0].t) + '\n' + a.toFixed(1) + '°', q[1][0] + 10, q[1][1], { bg: '#2c3646', c: '#fff', fs: 11 }); }
function mark(g, p, d) { const w = 8, h = 26, y = p[1]; g.poly([[p[0], y], [p[0] + w, y + d * 10], [p[0] + w / 2.2, y + d * 10], [p[0] + w / 2.2, y + d * h], [p[0] - w / 2.2, y + d * h], [p[0] - w / 2.2, y + d * 10], [p[0] - w, y + d * 10]], { closed: true, fill: g.st.color, w: 0.5 }); if (g.d.txt) g.text(g.d.txt, p[0], y + d * (h + 10), { al: 'center' }); }
function bubble(g, p, ic, txt) { g.text(ic, p[0], p[1] - 10, { fs: 18, al: 'center' }); if (txt) g.text(txt, p[0] + 14, p[1] - 24, { bg: g.st.color, c: '#fff' }); }
function pat(g, q, names, raw, extra, bg) { if (extra) extra(q); g.poly(q); const N = Array.isArray(names) ? names : names.split(''); q.forEach((p, i) => { const t = N[i]; if (!t) return; const up = i > 0 ? raw[i].v >= raw[i - 1].v : raw[1] ? raw[0].v > raw[1].v : true; const s = bg ? '(' + t + ')' : t; g.text(s, p[0], p[1] + (up ? -14 : 14), { al: 'center', c: bg ? g.st.color : '#fff', bg: bg ? null : g.st.color, fs: 12, bold: true }); }); }
function fibLevels(g, d, ch, v0, v1, x0, x1) {
  const L = g.st.levels.filter(l => l.on).sort((a, b) => a.v - b.v); let py = null; const xe = g.st.exr ? g.xr + 5 : x1, xs = g.st.exl ? g.xl - 5 : x0;
  for (const l of L) { const v = g.st.log && v0 > 0 && v1 > 0 ? Math.exp(Math.log(v0) + (Math.log(v1) - Math.log(v0)) * l.v) : v0 + (v1 - v0) * (g.st.rev ? 1 - l.v : l.v), y = g.sc.y(v); if (py !== null && g.st.fillA) g.rect(xs, py, xe, y, { fill: U.withA(l.c, g.st.fillA), c: null }); g.line([xs, y], [xe, y], { c: l.c, w: g.st.w }); g.text(l.v + ' (' + fp(g, v) + ')', xs + 4, y - 7, { c: l.c, fs: 11 }); py = y; }
}
function measure(g, q, raw, ch, pr, dt, tmp) {
  const [a, b] = q, dv = raw[1].v - raw[0].v, up = dv >= 0, col = pr && !up ? '#f23645' : '#2f7bff'; g.rect(a[0], a[1], b[0], b[1], { fill: U.withA(col, 14), c: null });
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const hd = (p, r) => { g.line(p, r, { c: col, w: 1.2 }); g.fn(c => { c.fillStyle = col; AC.head(c, p[0], p[1], r[0], r[1], 8); }); };
  if (pr) { g.line(a, [b[0], a[1]], { c: col, w: 1 }); g.line([a[0], b[1]], b, { c: col, w: 1 }); hd([mx, a[1]], [mx, b[1]]); } if (dt) { if (!pr) { g.line([a[0], g.yt], [a[0], g.yb], { c: col, w: 1 }); g.line([b[0], g.yt], [b[0], g.yb], { c: col, w: 1 }); } hd([a[0], my], [b[0], my]); }
  const bars = Math.round(ch.iOf(raw[1].t) - ch.iOf(raw[0].t)); let vol = 0; if (dt) { const i0 = Math.max(0, Math.round(ch.iOf(Math.min(raw[0].t, raw[1].t)))), i1 = Math.min(ch.bars.T.length - 1, Math.round(ch.iOf(Math.max(raw[0].t, raw[1].t)))); for (let i = i0; i <= i1; i++) vol += ch.bars.V[i] || 0; }
  const t = []; if (pr) t.push((up ? '+' : '') + fp(g, dv) + ' (' + U.pct(dv / raw[0].v * 100) + ')  ' + Math.round(dv / ch.ser.sym.mintick) + ' tick'); if (dt) { t.push(bars + ' bar, ' + fmtDur(raw[1].t - raw[0].t)); if (vol) t.push('Vol ' + U.big(vol)); }
  g.text(t.join('\n'), mx, Math.max(a[1], b[1]) + 12 + t.length * 8, { al: 'center', bg: '#2c3646', c: '#fff', fs: 11 });
}
function posTool(g, d, ch, raw, dir) {
  const s = d.s; const e = raw[0].v, x0 = ch.xT(raw[0].t), x1 = ch.xT(raw[0].t + (s.len || 20) * ch.ser.ms); const tp = g.sc.y(s.tp), sl = g.sc.y(s.sl), ye = g.sc.y(e);
  g.rect(x0, ye, x1, tp, { fill: '#08998133', c: null }); g.rect(x0, ye, x1, sl, { fill: '#f2364533', c: null }); g.line([x0, ye], [x1, ye], { c: '#787b86', w: 1 });
  const rw = Math.abs(s.tp - e), rk = Math.abs(e - s.sl) || 1e-9, rr = rw / rk, amt = s.acc * s.risk / 100, qty = amt / rk;
  /* outcome */
  const b = ch.bars; let res = null; const i0 = Math.max(0, Math.ceil(ch.iOf(raw[0].t))); let act = -1; for (let i = i0; i < b.T.length; i++) { if (act < 0 && b.L[i] <= e && b.H[i] >= e) act = i; if (act >= 0) { const hitS = dir > 0 ? b.L[i] <= s.sl : b.H[i] >= s.sl, hitT = dir > 0 ? b.H[i] >= s.tp : b.L[i] <= s.tp; if (hitS && i > act || hitS && !hitT) { res = ['SL kena', -amt, i]; break; } if (hitT && i > act) { res = ['TP kena', amt * rr, i]; break; } } }
  if (act >= 0) { const i = res ? res[2] : b.T.length - 1, pv = res ? (res[1] > 0 ? s.tp : s.sl) : b.C[i]; g.line([ch.x(act), ye], [ch.x(i), g.sc.y(pv)], { c: '#787b86', d: 'dashed', w: 1 }); if (!res) res = ['Berjalan', (pv - e) * dir * qty]; }
  const mx = (x0 + x1) / 2, upT = tp < sl; const lab = (t, y, c, o) => g.text(t, mx, y, { al: 'center', bg: c, c: '#fff', fs: 11, ...o });
  lab('Target ' + fp(g, s.tp) + ' (' + U.pct(rw / e * 100 * 1) + ')  +' + U.fmt(amt * rr, 2), tp + (upT ? -12 : 12), '#089981'); lab('Stop ' + fp(g, s.sl) + ' (' + U.pct(-rk / e * 100) + ')  -' + U.fmt(amt, 2), sl + (upT ? 12 : -12), '#f23645'); lab((res ? res[0] + ' ' + (res[1] >= 0 ? '+' : '') + U.fmt(res[1], 2) + '   ' : '') + 'R/R ' + rr.toFixed(2) + '   Qty ' + (qty >= 1 ? U.fmt(qty, 3) : qty.toPrecision(4)), ye, res ? (res[1] >= 0 ? '#089981' : '#f23645') : '#4a5568');
}
function vpTool(g, d, ch, t0, t1, x0, x1) {
  const ltf = ch.ltf(); const span = (t1 - t0); let tf = span > 60 * 864e5 ? '60' : span > 10 * 864e5 ? '15' : span > 2 * 864e5 ? '5' : '1'; if (PN.tfParse(tf).ms > ch.ser.ms) tf = ch.cell.tf;
  let ser = d._ser; if (!ser || ser.tf !== tf || ser.id !== ch.ser.id) { if (d._un) d._un(); ser = AC.F.series(ch.ser.id, tf); Object.defineProperty(d, '_ser', { value: ser, writable: true, configurable: true, enumerable: false }); Object.defineProperty(d, '_un', { value: ser.on(k => { if (k !== 'tick') ch.invalidate(); }), writable: true, configurable: true, enumerable: false }); }
  g.line([x0, g.yt], [x0, g.yb], { w: 1, d: 'dotted' }); if (d.type === 'frvp') g.line([x1, g.yt], [x1, g.yb], { w: 1, d: 'dotted' });
  const lb = ser.ready ? ser.bars : ch.bars; if (ser.ready && lb.T[0] > t0 && !ser.noMore) ser.more();
  const k0 = PN.lb(lb.T, t0), k1 = PN.lb(lb.T, t1); if (k1 <= k0) return; let hi = -Infinity, lo = Infinity; for (let k = k0; k < k1; k++) { hi = Math.max(hi, lb.H[k]); lo = Math.min(lo, lb.L[k]); } const rows = d.s.rows || 100; const row = Math.max(ch.ser.sym.mintick, (hi - lo) / rows); const m = ch.rowsFor(lb, k0, k1, row);
  g.fn(() => { ch.profile(m, row, g.sc, x0, Math.min(x1 - x0, 260) * (d.s.width || 0.6), { lineTo: Math.min(x1, g.xr) }); }, [x0, g.sc.y(hi), x1, g.sc.y(lo)]);
}
/* ---------- render / hit ---------- */
function dash(c, s, w) { c.setLineDash(s === 'dashed' ? [6, 5] : s === 'dotted' ? [Math.max(1.5, w), 4] : []); }
function render(c, L) {
  for (const o of L) {
    if (o.k === 'f') { o.f(c); continue; }
    c.lineWidth = o.w || 1; c.lineJoin = 'round'; c.lineCap = 'round';
    if (o.k === 'l') { if (!o.c) continue; c.strokeStyle = o.c; dash(c, o.d, o.w); c.beginPath(); c.moveTo(o.x1, o.y1); c.lineTo(o.x2, o.y2); c.stroke(); }
    else if (o.k === 'p') { if (!o.pts.length) continue; c.beginPath(); if (o.smooth && o.pts.length > 2) { c.moveTo(o.pts[0][0], o.pts[0][1]); for (let k = 1; k < o.pts.length - 1; k++) { const p = o.pts[k], q = o.pts[k + 1]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } const e = o.pts[o.pts.length - 1]; c.lineTo(e[0], e[1]); } else o.pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (o.closed) c.closePath(); if (o.fill) { c.fillStyle = o.fill; c.fill(); } if (o.c) { c.strokeStyle = o.c; dash(c, o.d, o.w); c.stroke(); } }
    else if (o.k === 'e') { c.beginPath(); c.ellipse(o.x, o.y, o.rx, o.ry, 0, o.a0, o.a1); if (o.fill) { c.fillStyle = o.fill; c.fill(); } if (o.c) { c.strokeStyle = o.c; dash(c, o.d, o.w); c.stroke(); } }
    else if (o.k === 't') { c.setLineDash([]); c.font = (o.bold ? '700 ' : '') + o.fs + 'px ' + FONT; const ls = o.t.split('\n'); let w = 0; for (const t of ls) w = Math.max(w, c.measureText(t).width); const lh = o.fs * 1.3, h = ls.length * lh; const x0 = o.al === 'center' ? o.x - w / 2 : o.al === 'right' ? o.x - w : o.x, y0 = o.y - h / 2; o.box = [x0 - 6, y0 - 3, x0 + w + 6, y0 + h + 3]; if (o.bg) { c.fillStyle = o.bg; AC.rr(c, x0 - 6, y0 - 3, w + 12, h + 6, o.round ? 10 : 4); c.fill(); } c.fillStyle = o.c || '#fff'; c.textAlign = 'left'; c.textBaseline = 'middle'; ls.forEach((t, k) => c.fillText(t, o.al === 'center' ? o.x - c.measureText(t).width / 2 : o.al === 'right' ? o.x - c.measureText(t).width : x0, y0 + (k + 0.5) * lh)); }
  }
  c.setLineDash([]);
}
function segD(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy; const t = L2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / L2)) : 0; return Math.hypot(px - x1 - t * dx, py - y1 - t * dy); }
function inPoly(x, y, p) { let r = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) r = !r; return r; }
function hitGeo(L, x, y) {
  let best = 99;
  for (const o of L) {
    if (o.k === 'l') best = Math.min(best, segD(x, y, o.x1, o.y1, o.x2, o.y2) - (o.w || 1) / 2);
    else if (o.k === 'p') { for (let k = 1; k < o.pts.length; k++) best = Math.min(best, segD(x, y, o.pts[k - 1][0], o.pts[k - 1][1], o.pts[k][0], o.pts[k][1]) - (o.w || 1) / 2); if (o.closed && o.pts.length > 2) { const a = o.pts[o.pts.length - 1], b = o.pts[0]; best = Math.min(best, segD(x, y, a[0], a[1], b[0], b[1])); if (o.fill && U.alpha(o.fill) > 4 && inPoly(x, y, o.pts)) best = Math.min(best, 4.5); } }
    else if (o.k === 'e') { const d = Math.hypot((x - o.x) / (o.rx || 1), (y - o.y) / (o.ry || 1)); best = Math.min(best, Math.abs(d - 1) * Math.min(o.rx, o.ry)); if (o.fill && d < 1 && !o.arc) best = Math.min(best, 4.5); }
    else if (o.k === 't' && o.box) { if (x >= o.box[0] && x <= o.box[2] && y >= o.box[1] && y <= o.box[3]) best = Math.min(best, 1); }
    else if (o.k === 'f' && o.hit) { const h = o.hit; if (x >= h[0] && x <= h[2] && y >= Math.min(h[1], h[3]) && y <= Math.max(h[1], h[3])) best = Math.min(best, 4.6); }
  }
  return best;
}

/* ============================================================ layer ============================================================ */
const TFC = ms => ms < 60000 ? 's' : ms < 36e5 ? 'm' : ms < 864e5 ? 'h' : ms < 6048e5 ? 'D' : ms < 25e8 ? 'W' : 'M';
class DrawLayer {
  constructor(ch) { this.ch = ch; this.sel = new Set(); this.hov = null; this.draft = null; this.cache = new Map(); this.drag = null; }
  get app() { return this.ch.app; }
  list() { return this.app.drawings(this.ch.ser.id); }
  visible(d) { if (d.hide || this.app.hideDraw || (d.cell && d.cell !== this.ch.cell.id)) return false; if (d.vis && !d.vis.includes(TFC(this.ch.ser.ms))) return false; return true; }
  pane(d) { return this.ch.panes.find(p => p.id === (d.pane || 'main')); }
  toPx(d, p) { const s = this.ch.sc(p, 'right'); return d.p.map(q => [this.ch.xT(q.t), s.y(q.v)]); }
  geo(d) { const p = this.pane(d); if (!p || p.h < 2 || p.mini) return null; const g = new Geo(this.ch, p, this.ch.sc(p, 'right'), d); if (!d.p.length) return null; const q = this.toPx(d, p); if (q.length < 2 && !/^(hline|hray|vline|cross|long|short|avwap|avp|text|atext|note|pin|comment|plabel|signpost|flag|emoji|arrup|arrdn)$/.test(d.type)) { if (q.length) g.ell(q[0][0], q[0][1], 2, 2, { fill: d.s.color }); return g; } try { (B[d.type] || B.trend)(g, q, d, this.ch, d.p); } catch (e) { console.warn(d.type, e); } return g; }
  paint(c, p, layer) {
    if (layer === 'back') this.cache.clear();
    for (const d of this.list()) { if ((d.pane || 'main') !== p.id || !this.visible(d)) continue; if ((d.z === 'back') !== (layer === 'back')) continue; const g = this.geo(d); if (!g) continue; render(c, g.L); this.cache.set(d.id, g); }
  }
  handles(d) { const p = this.pane(d); if (!p) return []; if (d.type === 'long' || d.type === 'short') { const s = this.ch.sc(p, 'right'), x0 = this.ch.xT(d.p[0].t), x1 = this.ch.xT(d.p[0].t + (d.s.len || 20) * this.ch.ser.ms); return [[x0, s.y(d.p[0].v), 'e'], [x0, s.y(d.s.tp), 'tp'], [x0, s.y(d.s.sl), 'sl'], [x1, s.y(d.p[0].v), 'r']]; } if (d.type === 'atext') return [[this.ch.axL + (d.ax || 0.1) * this.ch.pw, p.y + (d.ay || 0.2) * p.h, 0]]; if (d.type === 'brush' || d.type === 'highlighter') { const q = this.toPx(d, p); return [q[0].concat('m'), q[q.length - 1].concat('m')]; } const q = this.toPx(d, p).map((x, i) => x.concat(i)); if (d.type === 'rect' || d.type === 'ellipse' || d.type === 'image' || d.type === 'gannbox') { q.push([q[0][0], q[1][1], 'c01'], [q[1][0], q[0][1], 'c10']); if (d.type !== 'ellipse') { const mx = (q[0][0] + q[1][0]) / 2, my = (q[0][1] + q[1][1]) / 2; q.push([mx, q[0][1], 't'], [mx, q[1][1], 'b'], [q[0][0], my, 'l'], [q[1][0], my, 'rr']); } } return q; }
  paintOver(c) {
    const ch = this.ch; const show = new Set(this.sel); if (this.hov) show.add(this.hov.id);
    c.save(); c.beginPath(); c.rect(ch.axL, 0, ch.pw, ch.hh - AC.TH); c.clip();
    if (this.draft) { const g = this.geo(this.draft); if (g) render(c, g.L); }
    for (const d of this.list()) { if (!show.has(d.id) || !this.visible(d)) continue; for (const h of this.handles(d)) { c.beginPath(); c.arc(h[0], h[1], 5, 0, 7); c.fillStyle = ch.th.bg; c.fill(); c.lineWidth = this.sel.has(d.id) ? 2 : 1.3; c.strokeStyle = d.lock ? '#8b95a7' : '#2f7bff'; c.stroke(); } }
    c.restore();
  }
  axisLabels(p) { const out = []; if (this.ch.set.drawLabels === false) return out; for (const d of this.list()) { if ((d.pane || 'main') !== p.id || !this.visible(d)) continue; if (d.type === 'hline' || d.type === 'hray' || d.type === 'cross') { const v = d.p[0].v; out.push({ y: this.ch.sc(p, 'right').y(v), t: this.ch.fmtP(p, v), bg: d.s.color.slice(0, 7), pri: 2 }); } else if (this.sel.has(d.id)) for (const q of d.p.slice(0, 5)) out.push({ y: this.ch.sc(p, 'right').y(q.v), t: this.ch.fmtP(p, q.v), bg: '#2f7bff', pri: 2 }); } return out; }
  hit(m) {
    const l = this.list();
    for (let k = l.length - 1; k >= 0; k--) { const d = l[k]; if (!this.sel.has(d.id) || !this.visible(d)) continue; for (const h of this.handles(d)) if (Math.hypot(h[0] - m.x, h[1] - m.y) < (m.e && m.e.pointerType === 'touch' ? 16 : 8)) return { d, handle: h[2] }; }
    let best = null, bd = m.e && m.e.pointerType === 'touch' ? 14 : 7; const p = this.ch.paneAt(m.y); if (!p) return null;
    for (let k = l.length - 1; k >= 0; k--) { const d = l[k]; if ((d.pane || 'main') !== p.id || !this.visible(d)) continue; const g = this.cache.get(d.id); if (!g) continue; const v = hitGeo(g.L, m.x, m.y); if (v < bd) { bd = v; best = d; } }
    return best ? { d: best } : null;
  }
  /* mouse -> data point with magnet */
  pt(m, e, prev) {
    const ch = this.ch, p = this.draftPane || ch.paneAt(m.y) || ch.panes[0]; const s = ch.sc(p, 'right'); let i = ch.iX(m.x); let y = m.y;
    let ri = Math.round(i); let v = s.p(y);
    const mag = this.app.magnet ^ ((e && (e.ctrlKey || e.metaKey)) ? (this.app.magnet ? this.app.magnet : 1) : 0);
    if (mag && p.id === 'main' && ri >= 0 && ri < ch.bars.T.length) { const b = ch.bars; let bd = mag === 2 ? 1e9 : 18, bv = null; for (const k of ['O', 'H', 'L', 'C']) { const d = Math.abs(s.y(b[k][ri]) - y); if (d < bd) { bd = d; bv = b[k][ri]; } } if (bv !== null) v = bv; }
    if (e && e.shiftKey && prev) { const pp = [ch.xT(prev.t), s.y(prev.v)]; const dx = m.x - pp[0], dy = y - pp[1]; const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4), r = Math.hypot(dx, dy); const nx = pp[0] + r * Math.cos(a), ny = pp[1] + r * Math.sin(a); ri = Math.round(ch.iX(nx)); v = s.p(ny); }
    if (p.id === 'main' && !mag) { const mt = ch.ser.sym.mintick; v = Math.round(v / mt) * mt; v = +v.toFixed(10); }
    return { t: ch.tOf(ri), v };
  }
  /* ---------- events ---------- */
  move(m, e) {
    if (this.draft && !this.drag) { const d = this.draft; const pr = d.p[d.p.length - 2]; d.p[d.p.length - 1] = this.pt(m, e, pr); return true; }
    const h = this.app.tool && this.app.tool !== 'eraser' ? null : this.hit(m); const nh = h ? h.d : null;
    if (nh !== this.hov) { this.hov = nh; return true; }
    return false;
  }
  down(m, e) {
    const ch = this.ch, A = this.app, tool = A.tool;
    if (tool === 'zoom') { this.drag = { k: 'zoom', x: m.x, y: m.y }; return true; }
    if (tool === 'eraser') { const h = this.hit(m); if (h && !h.d.lock) { A.pushUndo(); this.remove([h.d.id]); } this.drag = { k: 'erase' }; return true; }
    if (tool) {
      const p = this.draftPane || ch.paneAt(m.y); if (!p || m.x > ch.axL + ch.pw) return false;
      if (tool === 'measure' && this.draft) { this.draft = null; this.draftPane = null; A.setTool(null); return true; }
      if (!this.draft) {
        this.draftPane = p; const s = tool === 'measure' ? { color: BL, w: 1 } : AC.drawDefaults(tool, A);
        this.draft = { id: U.uid(), type: tool, p: [], s, pane: p.id === 'main' ? undefined : p.id, draft: true };
        const n = tool === 'measure' ? 2 : T[tool][1];
        const q = this.pt(m, e); this.draft.p.push(q);
        if (n === 1) { this.drag = { k: 'one' }; return true; }
        if (n === -1) { this.drag = { k: 'brush', last: [m.x, m.y] }; return true; }
        this.draft.p.push(U.clone(q)); this.drag = { k: 'new', x: m.x, y: m.y };
        return true;
      }
      const d = this.draft, n = T[tool] ? T[tool][1] : 2; const q = this.pt(m, e, d.p[d.p.length - 2]); d.p[d.p.length - 1] = q;
      if (n === -2) { const p0 = [ch.xT(d.p[0].t), ch.sc(this.draftPane, 'right').y(d.p[0].v)]; if (d.p.length > 3 && Math.hypot(p0[0] - m.x, p0[1] - m.y) < 10) { d.p.pop(); this.commit(); return true; } const pl = d.p[d.p.length - 2]; if (d.p.length > 2 && pl.t === q.t && Math.abs(ch.sc(this.draftPane, 'right').y(pl.v) - m.y) < 4) { d.p.pop(); if (d.p.length > 1) this.commit(); return true; } d.p.push(U.clone(q)); this.drag = { k: 'np' }; return true; }
      if (d.p.length >= n) { this.drag = { k: 'last' }; return true; }
      d.p.push(U.clone(q)); this.drag = { k: 'np' }; return true;
    }
    const h = this.hit(m);
    if (!h) { if (this.sel.size) { this.select([]); } return false; }
    if (e.ctrlKey || e.metaKey) { if (e.shiftKey || this.sel.size) { const s = new Set(this.sel); s.has(h.d.id) ? s.delete(h.d.id) : s.add(h.d.id); this.select(Array.from(s)); return true; } }
    if (!this.sel.has(h.d.id)) this.select([h.d.id]);
    if (h.d.lock || A.lockAll) { return true; }
    let ids = Array.from(this.sel), L = this.list().filter(d => ids.includes(d.id) && !d.lock);
    if (e.altKey && h.handle == null) { A.pushUndo(); const cl = L.map(d => { const c = U.clone(d); c.id = U.uid(); return c; }); this.list().push(...cl); this.select(cl.map(d => d.id)); L = cl; }
    this.drag = { k: h.handle != null ? 'handle' : 'move', h: h.handle, d: h.d, x: m.x, y: m.y, o: L.map(d => [d, U.clone({ p: d.p, s: d.s, ax: d.ax, ay: d.ay })]), moved: false };
    return true;
  }
  dragTo(m, e) {
    const g = this.drag, ch = this.ch; if (!g) return;
    if (g.k === 'zoom') { const c = ch.ox; ch.paintOver(); c.fillStyle = '#2f7bff22'; c.strokeStyle = '#2f7bff'; c.fillRect(g.x, g.y, m.x - g.x, m.y - g.y); c.strokeRect(g.x, g.y, m.x - g.x, m.y - g.y); g.m = m; requestAnimationFrame(() => { if (this.drag === g) { c.fillStyle = '#2f7bff22'; c.strokeStyle = '#2f7bff'; c.fillRect(g.x, g.y, m.x - g.x, m.y - g.y); c.strokeRect(g.x, g.y, m.x - g.x, m.y - g.y); } }); return; }
    if (g.k === 'erase') { const h = this.hit(m); if (h && !h.d.lock) this.remove([h.d.id]); return; }
    if (g.k === 'brush') { if (Math.hypot(m.x - g.last[0], m.y - g.last[1]) > 3) { g.last = [m.x, m.y]; const s = ch.sc(this.draftPane, 'right'); this.draft.p.push({ t: ch.tOf(ch.iX(m.x)), v: s.p(m.y) }); } return; }
    if (g.k === 'one') { this.draft.p[0] = this.pt(m, e); return; }
    if (g.k === 'new' || g.k === 'np' || g.k === 'last') { const d = this.draft; if (!d) return; d.p[d.p.length - 1] = this.pt(m, e, d.p[d.p.length - 2]); return; }
    if (g.k === 'handle' || g.k === 'move') {
      if (!g.moved && Math.hypot(m.x - g.x, m.y - g.y) < 3) return;
      if (!g.moved) { g.moved = true; this.app.pushUndo(); }
      const p = this.pane(g.d), s = ch.sc(p, 'right');
      if (g.k === 'move') { const di = Math.round((m.x - g.x) / ch.bs), dy = m.y - g.y; for (const [d, o] of g.o) { if (d.type === 'atext') { d.ax = U.clamp((o.ax || 0.1) + (m.x - g.x) / ch.pw, 0, 0.98); d.ay = U.clamp((o.ay || 0.2) + (m.y - g.y) / p.h, 0, 0.98); continue; } const sc = ch.sc(this.pane(d) || p, 'right'); d.p = o.p.map(q => ({ t: ch.tOf(ch.iOf(q.t) + di), v: d.type === 'vline' ? q.v : sc.p(sc.y(q.v) + dy) })); if (d.type === 'long' || d.type === 'short') { d.s.tp = sc.p(sc.y(o.s.tp) + dy); d.s.sl = sc.p(sc.y(o.s.sl) + dy); } } }
      else { const d = g.d, h = g.h; this.draftPane = p; const q = this.pt(m, e, typeof h === 'number' && d.p.length > 1 ? d.p[h ? h - 1 : 1] : null); this.draftPane = null; if (typeof h === 'number') d.p[h] = q; else if (h === 'e') { d.p[0] = q; } else if (h === 'tp') d.s.tp = q.v; else if (h === 'sl') d.s.sl = q.v; else if (h === 'r') d.s.len = Math.max(1, Math.round(ch.iOf(q.t) - ch.iOf(d.p[0].t))); else if (h === 'c01') { d.p[0].t = q.t; d.p[1].v = q.v; } else if (h === 'c10') { d.p[1].t = q.t; d.p[0].v = q.v; } else if (h === 't') d.p[0].v = q.v; else if (h === 'b') d.p[1].v = q.v; else if (h === 'l') d.p[0].t = q.t; else if (h === 'rr') d.p[1].t = q.t; else if (h === 'm') { const di = Math.round((m.x - g.x) / ch.bs), dy = m.y - g.y; d.p = g.o[0][1].p.map(x => ({ t: ch.tOf(ch.iOf(x.t) + di), v: s.p(s.y(x.v) + dy) })); } }
      this.app.eachChart(c => c.ser.id === ch.ser.id && c.invalidate()); this.bar(); ch.mouse = m;
    }
  }
  up(m, e) {
    const g = this.drag; this.drag = null; if (!g) return;
    if (g.k === 'zoom') { this.app.setTool(null); if (g.m && Math.abs(g.m.x - g.x) > 8) { const ch = this.ch; const a = ch.iX(Math.min(g.x, g.m.x)), z = ch.iX(Math.max(g.x, g.m.x)), p = ch.paneAt(g.y); if (p) { const s = ch.sc(p, 'right'); const v1 = s.p(Math.min(g.y, g.m.y)), v2 = s.p(Math.max(g.y, g.m.y)); ch.bs = U.clamp(ch.pw / (z - a), 0.35, 220); ch.ro = z - (ch.bars.T.length - 1) - 0.5; ch.setRange(p, s, Math.min(s.f(v1), s.f(v2)), Math.max(s.f(v1), s.f(v2))); } ch.invalidate(); this.app.touch('view'); } return; }
    if (g.k === 'erase') { this.app.touch(); return; }
    if (g.k === 'one') { this.commit(); return; }
    if (g.k === 'brush') { if (this.draft.p.length > 2) this.commit(); else { this.draft = null; this.draftPane = null; } return; }
    if (g.k === 'new') { if (Math.hypot(m.x - g.x, m.y - g.y) > 8) { const n = this.draft.type === 'measure' ? 2 : T[this.draft.type][1]; if (n === 2) { if (this.draft.type === 'measure') { this.draft.done = true; this.ch.paintOver(); return; } this.commit(); } else if (n !== -2 || true) this.draft.p.push(U.clone(this.draft.p[this.draft.p.length - 1])); } return; }
    if (g.k === 'last') { if (this.draft.type === 'measure') return; this.commit(); return; }
    if (g.k === 'move' || g.k === 'handle') { if (g.moved) { this.app.touch(); U.emit('drawings'); } this.bar(); }
  }
  click() { }
  dbl(m, e) { if (this.draft) { const n = T[this.draft.type] && T[this.draft.type][1]; if (n === -2) { while (this.draft.p.length > 2) { const a = this.draft.p[this.draft.p.length - 1], b = this.draft.p[this.draft.p.length - 2]; if (a.t === b.t && a.v === b.v) this.draft.p.pop(); else break; } this.commit(); } return true; } const h = this.hit(m); if (h) { this.settings(h.d); return true; } return false; }
  commit() {
    const d = this.draft; this.draft = null; this.draftPane = null; if (!d) return; delete d.draft; const A = this.app, ch = this.ch;
    if (d.type === 'long' || d.type === 'short') { const a = AC.atrOf(ch.bars, 50) * 1.5, e = d.p[0].v, k = d.type === 'long' ? 1 : -1; d.s.tp = e + k * a * 2; d.s.sl = e - k * a; d.s.len = Math.max(10, Math.round(140 / ch.bs)); }
    if (d.type === 'barspat') { const i0 = Math.max(0, Math.round(Math.min(ch.iOf(d.p[0].t), ch.iOf(d.p[1].t)))), i1 = Math.min(ch.bars.T.length - 1, Math.round(Math.max(ch.iOf(d.p[0].t), ch.iOf(d.p[1].t)))); const b = ch.bars; d.s.data = []; for (let i = i0; i <= i1 && d.s.data.length < 300; i++) d.s.data.push([b.O[i], b.H[i], b.L[i], b.C[i]]); d.p[0].v = b.C[i0]; }
    if (d.type === 'atext') { const p = this.pane(d); d.ax = (ch.mouse ? ch.mouse.x - ch.axL : 60) / ch.pw; d.ay = ((ch.mouse ? ch.mouse.y : 60) - p.y) / p.h; }
    if (d.type === 'emoji') d.txt = A.emoji || '🚀';
    if (!A.sync.draw && A.charts.length > 1) d.cell = ch.cell.id;
    d.ct = Date.now();
    A.pushUndo(); this.list().push(d); this.select([d.id]); A.lastTool = d.type;
    if (!A.stay || d.type === 'brush' && false) { if (d.type !== 'brush' && d.type !== 'highlighter') A.setTool(null); else if (!A.stay) { /* brush keeps drawing */ } } else this.select([]);
    if (/^(text|atext|note|pnote|pin|callout|comment|signpost)$/.test(d.type)) this.editText(d);
    if (d.type === 'image') this.pickImage(d);
    A.eachChart(c => c.ser.id === ch.ser.id && c.invalidate()); A.touch(); U.emit('drawings');
  }
  async pickImage(d) { const f = await U.pickFile('image/*'); if (!f) { this.remove([d.id]); return; } const im = new Image(); im.onload = () => { const k = Math.min(1, 700 / Math.max(im.width, im.height)); const c = U.h('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); d.s.src = c.toDataURL('image/webp', 0.82); this.ch.invalidate(); this.app.touch(); }; im.src = URL.createObjectURL(f); }
  editText(d) { const ta = U.h('textarea.inp', { value: d.txt || '', rows: 4, placeholder: 'Tulis teks…' }); const dl = U.dialog(T[d.type][0], ta, { w: 360, foot: [U.h('button.btn.pri', { text: 'OK', onclick: () => dl.close() })], onclose: () => { d.txt = ta.value; if (!d.txt && d.type === 'text') this.remove([d.id]); this.ch.invalidate(); this.app.touch(); } }); setTimeout(() => { ta.focus(); ta.select(); }, 40); }
  cancelTool() { if (this.draft || this.app.tool) { if (this.draft && T[this.draft.type] && T[this.draft.type][1] === -2 && this.draft.p.length > 2) { this.draft.p.pop(); this.commit(); return true; } this.draft = null; this.draftPane = null; this.drag = null; this.app.setTool(null); this.ch.paintOver(); return true; } return false; }
  select(ids) { this.sel = new Set(ids); this.ch.invalidate(); this.app.eachChart(c => { if (c !== this.ch && c.draw_.sel.size) { c.draw_.sel.clear(); c.invalidate(); c.draw_.bar(); } }); this.bar(); U.emit('drawsel'); }
  remove(ids) { const l = this.list(); for (const id of ids) { const k = l.findIndex(d => d.id === id); if (k >= 0) { const d = l[k]; if (d._un) d._un(); AC.Alerts && AC.Alerts.onDrawRemoved(id); l.splice(k, 1); } this.sel.delete(id); } this.hov = null; this.app.eachChart(c => c.ser.id === this.ch.ser.id && c.invalidate()); this.bar(); this.app.touch(); U.emit('drawings'); }
  selected() { return this.list().filter(d => this.sel.has(d.id)); }
  /* floating toolbar for the selection */
  bar() {
    const L = this.selected(); let b = this.tb; if (!L.length || this.app.tool) { if (b) { b.remove(); this.tb = null; this.tbKey = null; } return; }
    const key = L.map(d => d.id + d.lock + d.s.w + d.s.dash).join();
    if (b && this.tbKey === key) return; if (b) b.remove(); this.tbKey = key;
    const d0 = L[0], each = f => { this.app.pushUndo(); L.forEach(f); this.app.eachChart(c => c.ser.id === this.ch.ser.id && c.invalidate()); this.app.touch(); this.tbKey = null; this.bar(); };
    b = this.tb = U.h('div.dbar'); const pos = this.app.ui && this.app.ui.dbar; if (pos) { b.style.left = Math.min(pos[0], this.ch.w - 200) + 'px'; b.style.top = pos[1] + 'px'; }
    const grip = U.h('span.grip', { text: '⠿' }); grip.onpointerdown = e => { const r = b.getBoundingClientRect(), R = this.ch.el.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top; const mv = ev => { b.style.left = U.clamp(ev.clientX - R.left - ox, 0, R.width - 60) + 'px'; b.style.top = U.clamp(ev.clientY - R.top - oy, 0, R.height - 40) + 'px'; }; const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); this.app.ui.dbar = [b.offsetLeft, b.offsetTop]; }; addEventListener('pointermove', mv); addEventListener('pointerup', up); };
    b.append(grip);
    const ib = (ic, t, fn) => U.h('button', { html: U.ic(ic), title: t, 'aria-label': t, onclick: fn });
    b.append(U.colorBtn(d0.s.color, v => { L.forEach(d => { d.s.color = v; if (d.s.levels) d.s.levels.forEach(l => { l.c = v; }); }); this.saveDef(d0); this.ch.invalidate(); this.app.touch(); }));
    if (d0.s.fill) b.append(U.colorBtn(d0.s.fill, v => { L.forEach(d => { if (d.s.fill) d.s.fill = v; }); this.saveDef(d0); this.ch.invalidate(); this.app.touch(); }));
    b.append(U.h('button.tx', { text: (d0.s.w || 1) + 'px', title: 'Tebal garis', onclick: e => U.menu([1, 2, 3, 4, 6, 8].map(w => ({ t: w + ' px', chk: d0.s.w === w, on: () => { each(d => { d.s.w = w; }); this.saveDef(d0); } })), e.currentTarget) }));
    b.append(U.h('button.tx', { text: { solid: '—', dashed: '- -', dotted: '···' }[d0.s.dash || 'solid'], title: 'Gaya garis', onclick: e => U.menu([['solid', 'Garis penuh'], ['dashed', 'Putus-putus'], ['dotted', 'Titik-titik']].map(w => ({ t: w[1], chk: d0.s.dash === w[0], on: () => { each(d => { d.s.dash = w[0]; }); this.saveDef(d0); } })), e.currentTarget) }));
    if (L.length === 1) { b.append(ib('gear', 'Pengaturan', () => this.settings(d0)), ib('bell', 'Buat alert di gambar ini', () => this.app.alertDialog(this.ch, { draw: d0 }))); }
    b.append(ib(d0.lock ? 'lock' : 'unlock', d0.lock ? 'Buka kunci' : 'Kunci', () => each(d => { d.lock = !d0.lock; })), ib('copy', 'Duplikat', () => { this.app.pushUndo(); const cl = L.map(d => { const c = U.clone(d); c.id = U.uid(); c.p.forEach(q => { q.t = this.ch.tOf(this.ch.iOf(q.t) + 4); }); return c; }); this.list().push(...cl); this.select(cl.map(d => d.id)); this.app.touch(); U.emit('drawings'); }), ib('trash', 'Hapus (Del)', () => { this.app.pushUndo(); this.remove(L.filter(d => !d.lock).map(d => d.id)); }), ib('dots', 'Lainnya', e => this.menu(d0, e.currentTarget)));
    this.ch.el.append(b);
  }
  saveDef(d) { const s = this.app.settings; s.toolDef = s.toolDef || {}; const { tp, sl, len, data, src, ...r } = d.s; s.toolDef[d.type] = U.clone(r); this.app.saveSettings(); }
  menu(d, at) { const l = this.list(), k = l.indexOf(d); const A = this.app; U.menu([{ t: 'Pengaturan…', ic: 'gear', on: () => this.settings(d) }, { t: 'Edit teks…', ic: 'text', on: () => this.editText(d) }, { t: 'Buat alert…', ic: 'bell', on: () => A.alertDialog(this.ch, { draw: d }) }, { sep: 1 }, { t: 'Bawa ke depan', on: () => { l.splice(k, 1); l.push(d); d.z = undefined; this.ch.invalidate(); A.touch(); } }, { t: 'Kirim ke belakang chart', on: () => { d.z = 'back'; this.ch.invalidate(); A.touch(); } }, { t: 'Salin', k: '⌘C', on: () => this.copy() }, { t: d.lock ? 'Buka kunci' : 'Kunci', ic: 'lock', on: () => { d.lock = !d.lock; this.ch.invalidate(); A.touch(); } }, { t: 'Sembunyikan', ic: 'eyeoff', on: () => { d.hide = true; this.select([]); A.touch(); U.emit('drawings'); } }, { t: 'Salin sebagai Pine Script', ic: 'code', on: () => A.tv.exportDrawings(this.ch, [d]) }, { sep: 1 }, { t: 'Hapus', ic: 'trash', k: 'Del', red: 1, on: () => { A.pushUndo(); this.remove([d.id]); } }], at); }
  copy() { const L = this.selected(); if (!L.length) return; this.app.clip = U.clone(L); try { navigator.clipboard.writeText('AC-DRAW:' + JSON.stringify(L)); } catch (e) { /* */ } U.toast(L.length + ' gambar disalin'); }
  paste(L) { const ch = this.ch; this.app.pushUndo(); const cl = L.map(d => { const c = U.clone(d); c.id = U.uid(); delete c.cell; c.p.forEach(q => { q.t = ch.tOf(ch.iOf(q.t) + 3); }); return c; }); this.list().push(...cl); this.select(cl.map(d => d.id)); this.app.touch(); U.emit('drawings'); }
  /* settings dialog */
  settings(d) {
    const s = d.s, A = this.app, ch = this.ch; const upd = () => { A.eachChart(c => c.ser.id === ch.ser.id && c.invalidate()); A.touch(); }; A.pushUndo();
    const row = (l, ...e) => U.h('label.frow', null, U.h('span', { text: l }), U.h('span.fr', null, e));
    const num = (o, k, st, after) => { const i = U.h('input.inp.sm', { type: 'number', step: st || 'any', value: o[k] === undefined ? '' : o[k] }); i.oninput = () => { if (i.value !== '') { o[k] = +i.value; after && after(); upd(); } }; return i; };
    const chk = (k, def) => { const i = U.h('input', { type: 'checkbox', checked: s[k] === undefined ? !!def : !!s[k] }); i.onchange = () => { s[k] = i.checked; upd(); }; return i; };
    const b = [];
    b.push(row('Warna', U.colorBtn(s.color, v => { s.color = v; upd(); })));
    if (s.fill !== undefined) b.push(row('Isi', U.colorBtn(s.fill, v => { s.fill = v; upd(); })));
    b.push(row('Tebal', num(s, 'w', 1))); const ds = U.h('select.inp.sm', null, [['solid', 'Penuh'], ['dashed', 'Putus'], ['dotted', 'Titik']].map(x => U.h('option', { value: x[0], text: x[1], selected: s.dash === x[0] }))); ds.onchange = () => { s.dash = ds.value; upd(); }; b.push(row('Gaya', ds));
    if (/^(trend|channel|regression|rect|fib|fibext|fibchan)$/.test(d.type)) { if (d.type !== 'rect' && d.type !== 'regression') b.push(row('Perpanjang kiri', chk('exl'))); b.push(row('Perpanjang kanan', chk('exr'))); }
    if (d.type === 'trend') b.push(row('Titik tengah', chk('mp')), row('Ujung panah', chk('arr')), row('Tampilkan statistik', chk('stats')));
    if (/^(channel|rect)$/.test(d.type)) b.push(row('Garis tengah', chk('mid')));
    if (d.type === 'regression') b.push(row('Deviasi', num(s, 'dev', 0.1))); if (d.type === 'avwap') b.push(row('Pita deviasi', chk('bands')));
    if (d.type === 'frvp' || d.type === 'avp') b.push(row('Jumlah baris', num(s, 'rows', 10)), row('Lebar (0–1)', num(s, 'width', 0.05)));
    if (d.type === 'long' || d.type === 'short') b.push(row('Harga entry', num(d.p[0], 'v')), row('Target', num(s, 'tp')), row('Stop', num(s, 'sl')), row('Saldo akun', num(s, 'acc')), row('Risiko %', num(s, 'risk', 0.1)), row('Lebar (bar)', num(s, 'len', 1)));
    if (d.type === 'barspat') b.push(row('Cermin', chk('mir'))); if (d.type === 'image') b.push(row('Opasitas %', num(s, 'op', 5)));
    if (/text|note|callout|rect|trend|emoji/.test(d.type)) { b.push(row('Ukuran huruf', num(s, 'fs', 1))); if (/text/.test(d.type)) b.push(row('Tebal', chk('bold')), row('Latar', U.colorBtn(s.bg || '#00000000', v => { s.bg = v; upd(); }))); }
    const ta = U.h('textarea.inp', { rows: 2, value: d.txt || '', placeholder: 'Teks pada gambar' }); ta.oninput = () => { d.txt = ta.value; upd(); }; if (!/^(fib|gann|frvp|avp|long|short)/.test(d.type)) b.push(row('Teks', ta));
    if (s.levels) { const box = U.h('div.lvls'); const build = () => { box.innerHTML = ''; s.levels.forEach((l, k) => { const c = U.h('input', { type: 'checkbox', checked: l.on }); c.onchange = () => { l.on = c.checked; upd(); }; box.append(U.h('div.lv', null, c, num(l, 'v', 0.001), U.colorBtn(l.c, v => { l.c = v; upd(); }), U.h('button.ib', { html: U.ic('x'), onclick: () => { s.levels.splice(k, 1); build(); upd(); } }))); }); box.append(U.h('button.btn', { text: '+ Level', onclick: () => { s.levels.push({ v: 1, c: '#2f7bff', on: true }); build(); upd(); } })); }; build(); b.push(U.h('div.fsec', { text: 'Level' }), box); if (s.fillA !== undefined) b.push(row('Opasitas isi %', num(s, 'fillA', 1))); if (d.type === 'fib') b.push(row('Dibalik', chk('rev')), row('Skala log', chk('log'))); }
    b.push(U.h('div.fsec', { text: 'Koordinat' })); d.p.slice(0, 8).forEach((q, i) => { const dt = U.h('input.inp', { type: 'datetime-local', step: 1, value: new Date(q.t + PN.tzOff(A.tz, q.t)).toISOString().slice(0, 19) }); dt.onchange = () => { const u = Date.parse(dt.value + 'Z'); if (u) { q.t = u - PN.tzOff(A.tz, u); upd(); } }; b.push(row('#' + (i + 1), num(q, 'v'), dt)); });
    b.push(U.h('div.fsec', { text: 'Tampil di timeframe' })); const vis = new Set((d.vis || 'smhDWM').split('')); const vr = U.h('div.vis'); for (const [k, n] of [['s', 'Detik'], ['m', 'Menit'], ['h', 'Jam'], ['D', 'Hari'], ['W', 'Minggu'], ['M', 'Bulan']]) { const c = U.h('input', { type: 'checkbox', checked: vis.has(k) }); c.onchange = () => { c.checked ? vis.add(k) : vis.delete(k); d.vis = vis.size === 6 ? undefined : Array.from(vis).join(''); upd(); }; vr.append(U.h('label', null, c, n)); } b.push(vr);
    const dl = U.dialog(T[d.type] ? T[d.type][0] : d.type, b, { w: 400, foot: [U.h('button.btn', { text: 'Jadikan default', onclick: () => { this.saveDef(d); U.toast('Default ' + T[d.type][0] + ' disimpan'); } }), U.h('button.btn', { text: 'Reset default', onclick: () => { if (A.settings.toolDef) delete A.settings.toolDef[d.type]; A.saveSettings(); U.toast('Default dikembalikan'); } }), U.h('button.btn.pri', { text: 'OK', onclick: () => dl.close() })], onclose: () => { this.tbKey = null; this.bar(); } });
  }
  /* price of a line drawing at time t (for alerts) */
  static priceAt(d, t) {
    const p = d.p; if (/^(hline|hray|cross|plabel)$/.test(d.type)) return [p[0].v]; if (d.type === 'rect') return [p[0].v, p[1].v];
    if (d.type === 'fib' && d.s.levels) return d.s.levels.filter(l => l.on).map(l => p[1].v + (p[0].v - p[1].v) * (d.s.rev ? 1 - l.v : l.v));
    if (d.type === 'long' || d.type === 'short') return [p[0].v, d.s.tp, d.s.sl];
    if (p.length >= 2) { const at = (a, b) => a.t === b.t ? b.v : a.v + (b.v - a.v) * (t - a.t) / (b.t - a.t); const v = at(p[0], p[1]); if (d.type === 'trend' && !d.s.exr && t > Math.max(p[0].t, p[1].t)) return []; if (d.type === 'channel' && p[2]) return [v, v + (p[2].v - at.call(null, p[0], Object.assign({}, p[1])) * 0 - (p[0].v + (p[1].v - p[0].v) * (p[2].t - p[0].t) / ((p[1].t - p[0].t) || 1)))]; return [v]; }
    return p.length ? [p[0].v] : [];
  }
}
AC.DrawLayer = DrawLayer;
})();
