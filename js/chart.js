/* Amatu Chart — canvas chart engine: panes, scales, chart types, Pine study rendering, interaction */
(function () {
'use strict';
const AC = window.AC, U = AC.U, F = AC.F, PN = window.AC_PINE, L = window.AC_LIB;
const DPR = () => Math.min(3, window.devicePixelRatio || 1);
const FONT = '"Inter",-apple-system,"Segoe UI",Roboto,sans-serif';
const isNum = x => typeof x === 'number' && x === x && x !== Infinity && x !== -Infinity;

AC.THEMES = {
  dark: { bg: '#0f141c', fg: '#cfd5e1', mut: '#7c8596', grid: '#1b222d', axis: '#252d3a', cross: '#8b95a7', lab: '#2c3646', up: '#089981', dn: '#f23645', sel: '#f5b301', wm: '#1c2430', panel: '#151b25' },
  light: { bg: '#ffffff', fg: '#1b2230', mut: '#6a7384', grid: '#f0f2f6', axis: '#dfe3ea', cross: '#8b95a7', lab: '#2c3646', up: '#089981', dn: '#f23645', sel: '#c98500', wm: '#eef1f6', panel: '#f7f8fb' }
};
AC.chartTypes = [
  ['candles', 'Candle', 'candles'], ['hollow', 'Candle berongga', 'hollow'], ['bars', 'Bar', 'bars'], ['volcandles', 'Candle volume', 'candles'], ['ha', 'Heikin Ashi', 'ha'], ['line', 'Garis', 'line'], ['linem', 'Garis + titik', 'line'], ['step', 'Garis tangga', 'step'], ['area', 'Area', 'area'], ['hlcarea', 'Area HLC', 'area'], ['baseline', 'Baseline', 'baseline'], ['columns', 'Kolom', 'columns'], ['highlow', 'High-Low', 'bars'],
  ['footprint', 'Volume footprint', 'footprint'], ['svp', 'Profil volume per sesi', 'vp'], ['tpo', 'TPO (Market Profile)', 'vp'],
  ['renko', 'Renko', 'renko'], ['linebreak', 'Line break', 'renko'], ['kagi', 'Kagi', 'step'], ['pnf', 'Point & Figure', 'pnf'], ['range', 'Range bar', 'bars']
];
const SYNTH = new Set(['renko', 'linebreak', 'kagi', 'pnf', 'range']);

/* ---------- synthetic price charts ---------- */
function atrOf(b, n) { const N = b.T.length; let a = 0, c = 0; for (let i = Math.max(1, N - n); i < N; i++) { a += Math.max(b.H[i] - b.L[i], Math.abs(b.H[i] - b.C[i - 1]), Math.abs(b.L[i] - b.C[i - 1])); c++; } return c ? a / c : 1; }
AC.atrOf = atrOf;
function synth(b, type, o, mt) {
  const out = { T: [], O: [], H: [], L: [], C: [], V: [], B: [], X: [] };
  const N = b.T.length; if (!N) return out;
  const add = (i, op, cl, h, l) => { let t = b.T[i]; const n = out.T.length; if (n && t <= out.T[n - 1]) t = out.T[n - 1] + 1; out.T.push(t); out.O.push(op); out.C.push(cl); out.H.push(h === undefined ? Math.max(op, cl) : h); out.L.push(l === undefined ? Math.min(op, cl) : l); out.V.push(b.V[i]); out.B.push(b.B[i]); };
  let box = o.box > 0 ? o.box : Math.max(mt, atrOf(b, 200) * (type === 'range' ? 0.8 : 1)); const p10 = Math.pow(10, Math.floor(Math.log10(box)) - 1); box = Math.max(mt, Math.round(box / p10) * p10);
  out.box = box;
  if (type === 'renko') { let c = Math.round(b.C[0] / box) * box, dir = 0; for (let i = 1; i < N; i++) { const p = b.C[i]; for (let g = 0; g < 500; g++) { if (dir >= 0 && p >= c + box) { add(i, c, c + box); c += box; dir = 1; } else if (dir <= 0 && p <= c - box) { add(i, c, c - box); c -= box; dir = -1; } else if (dir > 0 && p <= c - 2 * box) { add(i, c - box, c - 2 * box); c -= 2 * box; dir = -1; } else if (dir < 0 && p >= c + 2 * box) { add(i, c + box, c + 2 * box); c += 2 * box; dir = 1; } else break; } } }
  else if (type === 'range') { let op = b.O[0], h = op, l = op; for (let i = 0; i < N; i++) { const path = b.C[i] >= b.O[i] ? [b.O[i], b.L[i], b.H[i], b.C[i]] : [b.O[i], b.H[i], b.L[i], b.C[i]]; for (const p of path) { for (let g = 0; g < 300; g++) { if (p > l + box) { add(i, op, l + box, l + box, l); op = l + box; h = op; l = op; } else if (p < h - box) { add(i, op, h - box, h, h - box); op = h - box; h = op; l = op; } else { h = Math.max(h, p); l = Math.min(l, p); break; } } } } add(N - 1, op, b.C[N - 1], h, l); }
  else if (type === 'linebreak') { const k = o.lines || 3; add(0, b.O[0], b.C[0]); for (let i = 1; i < N; i++) { const n = out.T.length, p = b.C[i], a = Math.max(0, n - k); let hi = -Infinity, lo = Infinity; for (let j = a; j < n; j++) { hi = Math.max(hi, out.H[j]); lo = Math.min(lo, out.L[j]); } const up = out.C[n - 1] >= out.O[n - 1]; if (p > hi) add(i, up ? out.C[n - 1] : out.O[n - 1], p); else if (p < lo) add(i, up ? out.O[n - 1] : out.C[n - 1], p); } }
  else if (type === 'kagi') { let dir = b.C[N > 1 ? 1 : 0] >= b.C[0] ? 1 : -1, st = b.C[0], ex = b.C[0]; for (let i = 1; i < N; i++) { const p = b.C[i]; if (dir > 0) { if (p > ex) ex = p; else if (p <= ex - box) { add(i, st, ex); st = ex; ex = p; dir = -1; } } else { if (p < ex) ex = p; else if (p >= ex + box) { add(i, st, ex); st = ex; ex = p; dir = 1; } } } add(N - 1, st, ex); }
  else if (type === 'pnf') { const rev = o.rev || 3; let dir = 0, top = Math.floor(b.C[0] / box) * box, bot = top, i0 = 0; for (let i = 1; i < N; i++) { const h = Math.floor(b.H[i] / box) * box, l = Math.ceil(b.L[i] / box) * box; if (dir === 0) { if (h >= top + box) { dir = 1; top = h; } else if (l <= bot - box) { dir = -1; bot = l; } } else if (dir > 0) { if (h > top) top = h; else if (l <= top - rev * box) { add(i, bot, top, top, bot); dir = -1; bot = l; top = top - box; i0 = i; } } else { if (l < bot) bot = l; else if (h >= bot + rev * box) { add(i, top, bot, top, bot); dir = 1; top = h; bot = bot + box; i0 = i; } } } add(N - 1, dir > 0 ? bot : top, dir > 0 ? top : bot, top, bot); }
  return out;
}

/* ---------- nice ticks ---------- */
function niceStep(range, target) { const raw = range / Math.max(1, target); const p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f < 1.5 ? 1 : f < 2.25 ? 2 : f < 3.5 ? 2.5 : f < 7.5 ? 5 : 10) * p; }

/* ---------- price scale ---------- */
class Scale {
  constructor(o) { this.min = 0; this.max = 1; this.log = false; this.mode = 'price'; this.inv = false; this.base = 1; this.auto = true; this.top = 0; this.h = 100; Object.assign(this, o || {}); }
  f(p) { return this.mode === 'pct' ? (p / this.base - 1) * 100 : this.mode === 'idx' ? p / this.base * 100 : this.log ? (p > 0 ? Math.log(p) : -50) : p; }
  g(v) { return this.mode === 'pct' ? (v / 100 + 1) * this.base : this.mode === 'idx' ? v / 100 * this.base : this.log ? Math.exp(v) : v; }
  y(p) { const a = this.f(this.min), b = this.f(this.max); let k = (this.f(p) - a) / (b - a || 1); if (this.inv) k = 1 - k; return this.top + (1 - k) * this.h; }
  p(y) { const a = this.f(this.min), b = this.f(this.max); let k = 1 - (y - this.top) / this.h; if (this.inv) k = 1 - k; return this.g(a + k * (b - a)); }
}
AC.Scale = Scale;

/* ============================================================ Study ============================================================ */
let studySeq = 0;
class Study {
  constructor(chart, cfg) { this.chart = chart; this.cfg = cfg; this.id = cfg.id; this.rt = null; this.err = null; this.prog = null; this.cost = 5; this.lastRun = 0; this.waits = new Set(); this.compile(); }
  get code() { return AC.Ind.code(this.cfg); }
  compile() {
    this.err = null; this.prog = null; this.rt = null; this.dirty = true;
    const code = this.code;
    if (code == null) { this.err = { message: 'Script tidak ditemukan' }; return; }
    try { this.prog = AC.Ind.compile(code); } catch (e) { this.err = e; }
    if (this.prog && this.cfg.overlay === undefined) this.cfg.overlay = !!this.prog.decl.overlay;
  }
  get title() { return this.cfg.title || (this.prog ? (this.prog.decl.shorttitle || this.prog.decl.title) : this.cfg.name) || 'Script'; }
  host() {
    const c = this.chart;
    return {
      sym: c.ser.sym, tf: c.cell.tf, theme: { bg: c.th.bg, fg: c.th.fg }, stratOpt: this.cfg.strat,
      series: (s, t) => { if (s === c.ser.id && t === c.cell.tf && !c.synthOn) return { ready: true, get ver() { return c.ser.ver + '|' + c.bars.T.length; }, get bars() { return c.bars; }, get live() { return c.live(); }, tf: c.cell.tf, get sym() { return c.ser.sym; } }; const x = F.series(s, t); this.hook(x); return x; },
      source: key => c.sourceArr(key)
    };
  }
  hook(ser) { if (this.waits.has(ser)) return; this.waits.add(ser); const un = ser.on((k) => { if (k === 'load' || k === 'more') { this.dirty = true; this.chart.queue(this); } else if (k === 'fail') { this.chart.queue(this); } }); (this.uns || (this.uns = [])).push(un); }
  run(full) {
    if (!this.prog || this.cfg.hidden && !full) return;
    const c = this.chart, t0 = performance.now();
    try {
      if (!this.rt || this.dirty || full) { this.rt = new PN.Runtime(this.prog, this.host(), this.cfg.inputs || {}); this.rt.vis = c.visTimes(); this.rt.run(c.bars, c.live()); this.dirty = false; this.full = performance.now() - t0; }
      else { this.rt.sym = c.ser.sym; this.rt.update(c.bars, c.live()); this.cost = this.cost * 0.7 + (performance.now() - t0) * 0.3; this.alerts(); }
      this.err = null;
    } catch (e) { this.err = { message: (this.rt && this.rt.ln ? 'Baris ' + this.rt.ln + ': ' : '') + e.message, line: this.rt && this.rt.ln }; this.rt = this.rt && this.rt.plotList.length ? this.rt : null; this.dirty = false; this.failVer = c.ser.ver; console.warn(this.title, e); }
    this.lastRun = performance.now();
    if (this.rt) { this.upDown = null; }
    c.legendDirty = true;
  }
  alerts() { const q = this.rt.alertQ; if (q.length) { const l = q.splice(0); AC.Alerts && AC.Alerts.fromStudy(this, l); } }
  plotStyle(p) { return (this.cfg.style && this.cfg.style[p.kind + ':' + p.title]) || null; }
  destroy() { (this.uns || []).forEach(f => f()); this.uns = null; this.dead = true; }
}
AC.Study = Study;

/* ============================================================ Chart ============================================================ */
const AXW_MIN = 58, TH = 26;
class Chart {
  constructor(el, cell, app) {
    this.el = el; this.cell = cell; this.app = app; this.id = U.uid();
    el.classList.add('chart');
    this.cv = U.h('canvas.cbase'); this.ov = U.h('canvas.cover'); this.lg = U.h('div.legend'); this.tip = U.h('div.ctip');
    el.append(this.cv, this.ov, this.lg, this.tip);
    this.cx = this.cv.getContext('2d'); this.ox = this.ov.getContext('2d');
    this.bars = { T: [], O: [], H: [], L: [], C: [], V: [], B: [] };
    this.panes = []; this.studies = []; this.compares = []; this.w = 0; this.hh = 0; this.axR = 64; this.axL = 0;
    this.bs = cell.bs || 8; this.ro = cell.ro === undefined ? 8 : cell.ro; this.mouse = null; this.drag = null;
    this.draw_ = new AC.DrawLayer(this);
    this.queueSet = new Set();
    this.applyTheme();
    this.bind();
    this.rsz = new ResizeObserver(() => this.resize()); this.rsz.observe(el);
    this.resize();
    for (const s of cell.studies || (cell.studies = [])) this.studies.push(new Study(this, s));
    this.loadSymbol(true);
    for (const c of cell.compares || (cell.compares = [])) this.hookCompare(c);
  }
  applyTheme() { const s = this.app.settings; const t = AC.THEMES[this.app.theme]; this.th = Object.assign({}, t, (s.colors && s.colors[this.app.theme]) || {}); }
  get set() { return this.app.settings; }
  get synthOn() { return SYNTH.has(this.cell.type); }
  live() { return F.isOpen(this.ser.id) && !this.replay; }
  /* ---------- data ---------- */
  loadSymbol(first) {
    if (this.unser) this.unser();
    this.replayStop && this.replayStop(true);
    this.cell.sym = F.norm(this.cell.sym); this.cell.tf = PN.tfNorm(this.cell.tf);
    const s = this.ser = F.series(this.cell.sym, this.cell.tf);
    this.unser = s.on((k) => this.onSer(k));
    if (this.unq) this.unq(); this.unq = F.quote(this.cell.sym);
    this.bars = { T: [], O: [], H: [], L: [], C: [], V: [], B: [] }; this.loaded = false;
    if (!first) { if (!this.cell.keepView) this.ro = Math.max(5, Math.min(30, this.ro > 0 ? this.ro : 8)); const sc = this.cell.scale || (this.cell.scale = {}); sc.auto = true; for (const p of this.panes) for (const k in p.sc) p.sc[k].auto = true; }
    for (const x of this.studies) { x.rt = null; x.dirty = true; }
    for (const c of this.compares) { c.un(); } this.compares = []; for (const c of this.cell.compares || []) this.hookCompare(c);
    if (this.fpSer) { this.fpUn && this.fpUn(); this.fpSer = null; }
    if (s.ready) this.onSer('load');
    this.legendBuild(); this.invalidate();
    this.app.onCellData && this.app.onCellData(this, 'symbol');
  }
  onSer(k) {
    if (k === 'fail') { this.failMsg = this.ser.failed && this.ser.failed.message; this.invalidate(); return; }
    this.failMsg = null;
    const oldN = this.bars.T.length, oldFirst = this.bars.T[0];
    if (k === 'tick' || k === 'newbar') {
      if (this.replay) return;
      if (this.synthOn || this.cell.type === 'ha') this.rebuildBars(); else this.bars = this.ser.bars;
      const add = this.bars.T.length - oldN;
      if (add > 0 && this.ro < 0) this.ro -= add;         // keep the viewed area still
      this.runStudies(false);
      this.app.onCellData && this.app.onCellData(this, 'tick');
    } else {
      this.rebuildBars(); this.loaded = true;
      for (const s of this.studies) s.dirty = true;
      this.runStudies(true);
      this.app.onCellData && this.app.onCellData(this, k);
    }
    this.legendDirty = true; this.invalidate();
  }
  rebuildBars() {
    let b = this.ser.bars; const t = this.cell.type;
    if (this.replay) { const n = PN.lb(b.T, this.replay.t + 1); const c = {}; for (const k in b) c[k] = b[k].slice(0, n); b = c; if (this.replay.part && n) { const p = this.replay.part; const j = n - 1; b.H[j] = p.h; b.L[j] = p.l; b.C[j] = p.c; b.V[j] = p.v; } }
    if (t === 'ha') b = AC.toHA(b);
    else if (SYNTH.has(t)) b = synth(b, t, this.cell.synth || {}, this.ser.sym.mintick);
    this.bars = b;
  }
  visTimes() { const b = this.bars; if (!b.T.length) return null; const a = Math.max(0, Math.floor(this.iX(0))), z = Math.min(b.T.length - 1, Math.ceil(this.iX(this.pw))); return [b.T[a], b.T[Math.max(0, z)]]; }
  runStudies(full) {
    if (!this.bars.T.length) return;
    if (full) { for (const s of this.studies) this.queue(s); return; }
    const now = performance.now();
    let budget = 10;
    for (const s of this.studies) {
      if (s.cfg.hidden) continue;
      if (s.dirty || !s.rt) { if (!(s.err && s.failVer)) this.queue(s); continue; }
      if (s.cost > 4 && now - s.lastRun < s.cost * 60) continue;   // heavy scripts update less often
      if (budget < 0 && now - s.lastRun < 2500) continue;
      const t0 = performance.now(); s.run(false); budget -= performance.now() - t0;
    }
  }
  queue(s) { if (s.dead) return; this.queueSet.add(s); if (this.qt) return; this.qt = setTimeout(() => this.drain(), 0); }
  drain() {
    this.qt = null; const t0 = performance.now();
    for (const s of Array.from(this.queueSet)) {
      this.queueSet.delete(s);
      if (!s.dead && this.bars.T.length && !s.cfg.hidden) s.run(true);
      if (performance.now() - t0 > 24) break;
    }
    this.invalidate(); this.legendDirty = true;
    if (this.queueSet.size) this.qt = setTimeout(() => this.drain(), 4); else { this.app.onStudiesDone && this.app.onStudiesDone(this); }
  }
  sourceArr(key) { /* '@studyId:plotTitle' */ const m = /^@([^:]+):(.+)$/.exec(key); if (!m) return null; const s = this.studies.find(x => x.id === m[1]); if (!s || !s.rt) return null; const p = s.rt.plotList.find(q => q.title === m[2]); return p ? p.data : null; }
  hookCompare(c) { const ser = F.series(c.sym, this.cell.tf); const o = { c, ser, un: null }; o.un = ser.on(() => this.invalidate()); this.compares.push(o); }
  addStudy(cfg) { cfg.id = cfg.id || 's' + (++studySeq) + U.uid(); this.cell.studies.push(cfg); const s = new Study(this, cfg); this.studies.push(s); this.queue(s); this.legendBuild(); this.invalidate(); return s; }
  removeStudy(id) { const s = this.studies.find(x => x.id === id); if (!s) return; s.destroy(); this.studies = this.studies.filter(x => x !== s); this.cell.studies = this.cell.studies.filter(x => x.id !== id); this.legendBuild(); this.invalidate(); }
  destroy() { this.dead = true; this.rsz.disconnect(); this.unser && this.unser(); this.unq && this.unq(); this.fpUn && this.fpUn(); for (const s of this.studies) s.destroy(); for (const c of this.compares) c.un(); this.unbind && this.unbind(); this.el.innerHTML = ''; }
  /* ---------- geometry ---------- */
  resize() { const r = this.el.getBoundingClientRect(); const w = Math.max(60, Math.floor(r.width)), h = Math.max(60, Math.floor(r.height)), d = DPR(); if (!r.width) return; this.w = w; this.hh = h; for (const c of [this.cv, this.ov]) { c.width = w * d; c.height = h * d; c.style.width = w + 'px'; c.style.height = h + 'px'; } this.cx.setTransform(d, 0, 0, d, 0, 0); this.ox.setTransform(d, 0, 0, d, 0, 0); this.paint(); }
  get pw() { return Math.max(20, this.w - this.axR - this.axL); }
  x(i) { return this.axL + this.pw - (this.bars.T.length - 1 + this.ro - i + 0.5) * this.bs; }
  iX(x) { return this.bars.T.length - 1 + this.ro + 0.5 - (this.axL + this.pw - x) / this.bs; }
  tOf(i) { const T = this.bars.T, n = T.length; if (!n) return 0; const ms = this.ser.ms; if (i <= 0) return T[0] + i * ms; if (i >= n - 1) return T[n - 1] + (i - n + 1) * ms; const k = Math.floor(i); return T[k] + (T[k + 1] - T[k]) * (i - k); }
  iOf(t) { const T = this.bars.T, n = T.length; if (!n) return 0; const ms = this.ser.ms; if (t >= T[n - 1]) return n - 1 + (t - T[n - 1]) / ms; if (t <= T[0]) return (t - T[0]) / ms; const k = PN.lb(T, t); if (T[k] === t) return k; return k - 1 + (t - T[k - 1]) / (T[k] - T[k - 1]); }
  xT(t) { return this.x(this.iOf(t)); }
  range() { const n = this.bars.T.length; return [Math.max(0, Math.floor(this.iX(this.axL)) - 1), Math.min(n - 1, Math.ceil(this.iX(this.axL + this.pw)) + 1)]; }
  /* ---------- panes ---------- */
  layout() {
    const want = [{ id: 'main' }];
    for (const s of this.studies) { if (s.cfg.overlay && !s.cfg.pane) continue; const pid = s.cfg.pane || s.id; if (pid === 'main') continue; if (!want.find(p => p.id === pid)) want.push({ id: pid }); }
    const ph = this.cell.ph || (this.cell.ph = {});
    const order = this.cell.order || []; want.sort((a, b) => { if (a.id === 'main' && !order.includes('main')) return -1; const x = order.indexOf(a.id), y = order.indexOf(b.id); return (x < 0 ? 999 : x) - (y < 0 ? 999 : y); });
    const H = this.hh - TH; const max = this.cell.max && want.find(p => p.id === this.cell.max) ? this.cell.max : null;
    let tot = 0; for (const p of want) { if (ph[p.id] === undefined) ph[p.id] = p.id === 'main' ? 3 : 1; const st = this.studies.filter(s => (s.cfg.pane || s.id) === p.id); p.mini = p.id !== 'main' && st.length && st.every(s => s.cfg.hidden); tot += p.mini ? 0 : ph[p.id]; }
    const minis = want.filter(p => p.mini).length * 24;
    let y = 0; const olds = this.panes; this.panes = [];
    for (const p of want) {
      let h = max ? (p.id === max ? H : 0) : p.mini ? 24 : Math.max(30, (H - minis) * ph[p.id] / tot);
      if (max && p.id !== max) h = 0;
      const o = olds.find(q => q.id === p.id) || { id: p.id, sc: {} };
      o.y = y; o.h = h; o.mini = p.mini; this.panes.push(o); y += h;
    }
    /* many panes: keep the price pane pinned and let the others scroll */
    const others = this.panes.filter(p => p.id !== 'main' && p.h > 0), MIN = 72; const mainP = this.panes.find(p => p.id === 'main');
    this.rTop = 0; this.scrollH = 0;
    if (!max && mainP && others.length && others.filter(p => !p.mini).some(p => p.h < MIN) && others.length * MIN > H * 0.55) {
      const mh = Math.max(150, Math.round(H * (this.cell.mainFrac || 0.5))); const rh = H - mh; let tt = 0; for (const p of others) { p.h = p.mini ? 24 : Math.max(MIN, Math.min(rh, MIN * (ph[p.id] || 1) * 1.15)); tt += p.h; }
      this.rTop = mh; this.scrollH = tt; this.sy = U.clamp(this.sy || 0, 0, Math.max(0, tt - rh)); mainP.y = 0; mainP.h = mh; let yy = mh - this.sy; this.panes = [mainP].concat(others.filter(p => p !== mainP)); for (const p of others) { p.y = yy; yy += p.h; }
    } else { const sum = this.panes.reduce((s, p) => s + p.h, 0); if (sum > H + 0.5) { const k = H / sum; let yy = 0; for (const p of this.panes) { p.h *= k; p.y = yy; yy += p.h; } } }
    this.scrollUi();
  }
  scrollUi() {
    let e = this.psc; if (!this.scrollH) { if (e) { e.remove(); this.psc = null; this.sy = 0; } return; }
    if (!e) { e = this.psc = U.h('div.pscroll', null, U.h('i')); e.onscroll = () => { if (Math.abs(this.sy - e.scrollTop) > 0.5) { this.sy = e.scrollTop; this.lgKey = null; this.invalidate(); } }; this.el.append(e); }
    const rh = this.hh - TH - this.rTop; e.style.top = this.rTop + 'px'; e.style.height = rh + 'px'; e.firstChild.style.height = this.scrollH + 'px'; if (Math.abs(e.scrollTop - this.sy) > 1) e.scrollTop = this.sy;
  }
  /* visible vertical part of a pane */
  clipOf(p) { const H = this.hh - TH; if (!this.rTop || p.id === 'main') return [p.y, Math.min(p.h, H - p.y)]; const a = Math.max(p.y, this.rTop), b = Math.min(p.y + p.h, H); return [a, b - a]; }
  paneOf(s) { return s.cfg.overlay && !s.cfg.pane ? 'main' : s.cfg.pane || s.id; }
  scaleKey(s) { return s.cfg.scale === 'own' ? 'own:' + s.id : s.cfg.scale === 'left' ? 'left' : 'right'; }
  sc(p, key) { return p.sc[key] || (p.sc[key] = new Scale({ key })); }
  scaleOf(p) { return this.sc(p, 'right'); }
  ranges() {
    const [a, z] = this.range(), b = this.bars, st = this.cell.scale || (this.cell.scale = { auto: true });
    for (const p of this.panes) {
      const need = new Map(); const ext = (k, v) => { if (!isNum(v)) return; let r = need.get(k); if (!r) need.set(k, r = [Infinity, -Infinity]); if (v < r[0]) r[0] = v; if (v > r[1]) r[1] = v; };
      const mainHere = p.id === 'main';
      if (mainHere) {
        const s = this.sc(p, 'right'); s.log = !!st.log; s.mode = this.compares.some(c => c.c.mode !== 'own' && c.c.mode !== 'price') ? 'pct' : st.mode || 'price'; s.inv = !!st.inv;
        const fi = b.C[Math.max(0, a)] || 1; s.base = fi;
        const lineT = /^(line|linem|step|area|baseline|columns)$/.test(this.cell.type);
        for (let i = a; i <= z; i++) { if (lineT) ext('right', b.C[i]); else { ext('right', b.L[i]); ext('right', b.H[i]); } }
        for (const c of this.compares) { const cb = c.ser.bars; if (!cb.T.length) continue; const t0 = b.T[Math.max(0, a)], t1 = b.T[Math.max(0, z)]; const k0 = Math.max(0, PN.lb(cb.T, t0)), k1 = Math.min(cb.T.length - 1, PN.lb(cb.T, t1)); c.base = cb.C[k0]; for (let k = k0; k <= k1; k++) { if (c.c.mode === 'own') ext('cmp:' + c.c.sym, cb.C[k]); else if (c.c.mode === 'price') ext('right', cb.C[k]); else ext('right', cb.C[k] / c.base * fi); } }
        if (this.app.trade && this.set.scaleTrades) for (const v of this.app.trade.levels(this.ser.id)) ext('right', v.p);
      }
      for (const s of this.studies) {
        if (this.paneOf(s) !== p.id || s.cfg.hidden || !s.rt) continue;
        const k = this.scaleKey(s); if (mainHere && k === 'right' && st.priceOnly) continue;
        for (const q of s.rt.plotList) {
          if (q.kind === 'bg' || q.kind === 'barcolor' || q.kind === 'fill' || q.display === 'none') continue;
          const sty = s.plotStyle(q); if (sty && sty.vis === false) continue;
          if (q.kind === 'hline') { if (!mainHere || k !== 'right') ext(k, q.price); continue; }
          if ((q.kind === 'shape' || q.kind === 'char') && q.loc !== 'absolute') continue;
          if (q.kind === 'arrow') continue;
          const d = q.data, off = q.offset || 0; let a2 = Math.max(0, a - off), z2 = Math.min(d.length - 1, z - off);
          if (q.showLast) a2 = Math.max(a2, b.T.length - q.showLast);
          for (let i = a2; i <= z2; i++) ext(k, d[i]);
          if (q.h) for (let i = a2; i <= z2; i++) { ext(k, q.h[i]); ext(k, q.l[i]); }
          if (q.style === 'histogram' || q.style === 'columns' || q.style === 'area') ext(k, q.base);
        }
        if (!mainHere) { for (const ln of s.rt.lines) if (ln.xloc !== 'bar_time' && ln.x2 >= a && ln.x1 <= z) { ext(k, ln.y1); ext(k, ln.y2); } for (const bx of s.rt.boxes) if (bx.xloc !== 'bar_time' && bx.right >= a && bx.left <= z) { ext(k, bx.top); ext(k, bx.bottom); } }
      }
      for (const k in p.sc) if (!need.has(k) && k !== 'right') { if (!p.sc[k].keep) delete p.sc[k]; }
      for (const [k, r] of need) {
        const s = this.sc(p, k); s.top = p.y; s.h = p.h;
        if (k !== 'right') { s.log = false; s.mode = 'price'; }
        const au = mainHere && k === 'right' ? st.auto !== false : s.auto !== false;
        if (au && isNum(r[0])) {
          let lo = s.f(r[0]), hi = s.f(r[1]); if (hi - lo < 1e-12) { const e = Math.abs(hi) * 0.01 || 1; lo -= e; hi += e; }
          const isOwn = k.startsWith('own:'), stu = isOwn ? this.studies.find(x => 'own:' + x.id === k) : null;
          const isVol = stu && mainHere && stu.rt && stu.rt.prog.decl.format === 'volume';
          const padT = isVol ? 4.0 : p.h < 120 ? 0.1 : (this.set.marginTop || 10) / 100, padB = isVol ? 0 : p.h < 120 ? 0.08 : (this.set.marginBottom || 8) / 100, rg = hi - lo;
          if (isVol) lo = 0;
          s.min = s.g(lo - rg * padB); s.max = s.g(hi + (isVol ? hi : rg) * padT);
        }
      }
      const r = this.sc(p, 'right'); r.top = p.y; r.h = p.h; if (!need.has('right')) { r.auto = true; }
      if (mainHere && st.auto === false && isNum(st.min) && isNum(st.max) && st.sym === this.ser.id) { r.min = st.min; r.max = st.max; }
    }
  }
  fmtP(p, v, key) {
    if (!isNum(v)) return '—';
    if (p && p.id !== 'main' || (key && key !== 'right')) {
      const s = this.studies.find(x => this.paneOf(x) === (p ? p.id : 'main') && (!key || this.scaleKey(x) === key));
      if (s && s.prog) { const d = s.prog.decl; if (d.format === 'volume') return U.big(v); if (d.precision !== undefined) return U.fmt(v, d.precision); }
      const sc = p && p.sc[key || 'right']; const rg = sc ? Math.abs(sc.max - sc.min) : 1; if (Math.abs(v) >= 1e5 && rg > 100) return U.big(v);
      return U.fmt(v, rg > 2e5 ? 0 : rg > 5 ? 2 : rg > 0.05 ? 4 : 6);
    }
    return U.fmt(v, this.ser.sym.prec);
  }
  /* ---------- painting ---------- */
  invalidate() { if (this.pq || this.dead) return; this.pq = true; const run = () => { if (!this.pq) return; this.pq = false; if (!this.dead) this.paint(); }; requestAnimationFrame(run); if (document.hidden) return; setTimeout(run, 200); }
  paint() {
    if (!this.w || !this.ser) return;
    const c = this.cx, th = this.th;
    this.layout(); this.ranges(); this.measureAxis();
    c.fillStyle = th.bg; c.fillRect(0, 0, this.w, this.hh);
    if (!this.bars.T.length) { c.fillStyle = th.mut; c.font = '13px ' + FONT; c.textAlign = 'center'; c.fillText(this.failMsg ? 'Gagal memuat ' + this.cell.sym + ': ' + this.failMsg + ' — mencoba lagi…' : 'Memuat ' + this.cell.sym + '…', this.w / 2, this.hh / 2); this.legendUpdate(); return; }
    if (this.ro < 0 && this.iX(this.axL) < 60 || this.iX(this.axL) < 20) this.needMore();
    const ticks = this.timeTicks();
    for (const p of this.panes) { if (p.h < 2 || this.clipOf(p)[1] < 1) continue; this.paintPane(p, ticks); }
    this.paintTimeAxis(ticks);
    for (const p of this.panes) if (p.h >= 2 && this.clipOf(p)[1] >= 1) this.paintPriceAxis(p);
    /* pane separators */
    c.fillStyle = th.axis; for (let k = 1; k < this.panes.length; k++) if (this.panes[k].h > 0 && this.panes[k].y >= this.rTop - 0.5 && this.panes[k].y < this.hh - TH) c.fillRect(0, Math.round(this.panes[k].y), this.w, 1);
    c.fillRect(this.axL + this.pw, 0, 1, this.hh); if (this.axL) c.fillRect(this.axL, 0, 1, this.hh);
    if (this.legendDirty || this.lgKey !== this.legendKey()) this.legendUpdate();
    this.paintOver();
    this.cell.bs = this.bs; this.cell.ro = this.ro;
  }
  needMore() { if (this.moreT && Date.now() - this.moreT < 900 || this.replay) return; this.moreT = Date.now(); this.ser.more(); }
  measureAxis() {
    const c = this.cx; c.font = '11px ' + FONT; let w = AXW_MIN;
    for (const p of this.panes) { if (p.h < 10) continue; const s = p.sc.right; if (!s) continue; for (const v of [s.min, s.max, (s.min + s.max) / 2]) { const t = s.mode === 'pct' ? '+100.00%' : this.fmtP(p, v); const m = c.measureText(t).width + 16; if (m > w) w = m; } }
    w = Math.ceil(Math.max(w, this.axHold || 0)); this.axHold = w > this.axR ? w : Math.max(AXW_MIN, this.axR - 0.2); this.axR = w;
    let L0 = 0; for (const p of this.panes) if (p.sc.left) L0 = 56; this.axL = L0;
  }
  timeTicks() {
    const [a, z] = this.range(), T = this.bars.T, tz = this.app.tz, n = T.length, out = [];
    const end = Math.min(Math.ceil(this.iX(this.axL + this.pw)), z + 400);
    const minPx = 70; const cand = [];
    const step = Math.max(1, Math.floor(6 / this.bs));
    let prev = null;
    for (let i = a; i <= end; i++) {
      const t = this.tOf(i); const l = t + PN.tzOff(tz, t); const d = new Date(l);
      const k = { i, t, y: d.getUTCFullYear(), mo: d.getUTCMonth(), dd: d.getUTCDate(), h: d.getUTCHours(), m: d.getUTCMinutes(), s: d.getUTCSeconds() };
      if (prev) { const w = k.y !== prev.y ? 9 : k.mo !== prev.mo ? 8 : k.dd !== prev.dd ? 7 : k.h !== prev.h ? (k.h % 12 === 0 ? 6 : k.h % 6 === 0 ? 5.6 : k.h % 3 === 0 ? 5.3 : 5) : k.m !== prev.m ? (k.m % 30 === 0 ? 4 : k.m % 15 === 0 ? 3.5 : k.m % 5 === 0 ? 3 : 2) : k.s !== prev.s ? (k.s % 30 === 0 ? 1.5 : 1) : 0; if (w > 0) { k.w = w; cand.push(k); } }
      prev = k;
    }
    cand.sort((p, q) => q.w - p.w || p.i - q.i);
    const taken = [];
    for (const k of cand) { const x = this.x(k.i); if (taken.some(q => Math.abs(q - x) < minPx)) continue; taken.push(x); out.push([x, k]); if (taken.length > 40) break; }
    out.sort((p, q) => p[0] - q[0]);
    this.dayBreaks = this.set.sessBreak && this.ser.ms < 864e5 ? cand.filter(k => k.w >= 7) : [];
    return out;
  }
  paintTimeAxis(ticks) {
    const c = this.cx, th = this.th, y = this.hh - TH;
    c.fillStyle = th.bg; c.fillRect(0, y, this.w, TH); c.fillStyle = th.axis; c.fillRect(0, y, this.w, 1);
    c.font = '11px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    const M = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    c.save(); c.beginPath(); c.rect(this.axL, y, this.pw, TH); c.clip();
    for (const [x, k] of ticks) { const big = k.w >= 7; c.fillStyle = big ? th.fg : th.mut; c.font = (k.w >= 8 ? '600 ' : '') + '11px ' + FONT; c.fillText(k.w === 9 ? k.y : k.w === 8 ? M[k.mo] : k.w === 7 ? k.dd : k.w >= 2 ? String(k.h).padStart(2, '0') + ':' + String(k.m).padStart(2, '0') : String(k.m).padStart(2, '0') + ':' + String(k.s).padStart(2, '0'), x, y + TH / 2 + 1); }
    c.restore();
  }
  priceTicks(s, h) {
    const a = s.f(s.min), b = s.f(s.max); const out = []; const target = Math.max(1, Math.floor(h / 52));
    if (s.log && s.mode === 'price') { const st = niceStep(s.max - s.min, target); if (s.max / Math.max(1e-12, s.min) < 3) { for (let v = Math.ceil(s.min / st) * st; v <= s.max && out.length < 60; v += st) out.push(v); } else { let v = Math.pow(10, Math.floor(Math.log10(Math.max(s.min, 1e-12)))); while (v < s.max && out.length < 60) { for (const m of [1, 2, 5]) if (v * m >= s.min && v * m <= s.max) out.push(v * m); v *= 10; } } return out; }
    const st = niceStep(b - a, target); for (let v = Math.ceil(a / st) * st; v <= b + 1e-9 && out.length < 60; v += st) out.push(s.g(Math.abs(v) < st * 1e-6 ? 0 : v)); return out;
  }
  paintPane(p, ticks) {
    const c = this.cx, th = this.th, main = p.id === 'main', s = this.sc(p, 'right');
    const cl = this.clipOf(p); c.save(); c.beginPath(); c.rect(this.axL, cl[0], this.pw, cl[1]); c.clip();
    if (p.mini) { c.restore(); return; }
    /* bg colors */
    for (const st of this.studies) if (!st.cfg.hidden && st.rt) for (const q of st.rt.plotList) if (q.kind === 'bg' && (this.paneOf(st) === p.id || (main && q.force))) this.paintBg(p, st, q);
    /* grid */
    c.fillStyle = th.grid;
    if (this.set.gridV !== false) for (const [x] of ticks) c.fillRect(Math.round(x), p.y, 1, p.h);
    if (this.set.gridH !== false) for (const v of this.priceTicks(s, p.h)) c.fillRect(this.axL, Math.round(s.y(v)), this.pw, 1);
    for (const k of this.dayBreaks || []) { c.fillStyle = th.axis; const x = Math.round(this.x(k.i) - this.bs / 2); for (let y = p.y; y < p.y + p.h; y += 6) c.fillRect(x, y, 1, 3); }
    if (main && this.set.watermark) { c.fillStyle = th.wm; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 ' + Math.min(72, this.pw / 9) + 'px ' + FONT; c.fillText(this.ser.sym.ticker + ', ' + AC.tfLabel(this.cell.tf), this.axL + this.pw / 2, p.y + p.h / 2); }
    const [a, z] = this.range();
    this.draw_.paint(c, p, 'back');
    /* studies: fills first, then back plots */
    const sts = this.studies.filter(st => !st.cfg.hidden && st.rt && (this.paneOf(st) === p.id || (main && st.rt.prog.version)));
    const front = [];
    for (const st of sts) {
      const here = this.paneOf(st) === p.id; const sc = this.sc(p, here ? this.scaleKey(st) : 'right');
      for (const q of st.rt.plotList) { const inP = here ? !(q.force && !main) : main && q.force; if (inP && q.kind === 'fill') this.paintFill(p, sc, st, q, a, z); }
      if (here) front.push([st, sc]); else if (st.rt.plotList.some(q => q.force)) front.push([st, sc, true]);
    }
    const back = main ? front.filter(f => f[0].cfg.z === 'back' || (f[0].prog && f[0].prog.decl.format === 'volume')) : [];
    for (const f of back) this.paintStudy(p, f[0], f[1], a, z, f[2]);
    if (main) { this.paintMain(p, s, a, z); this.paintCompares(p, s); }
    for (const f of front) if (!back.includes(f)) this.paintStudy(p, f[0], f[1], a, z, f[2]);
    if (main) { this.paintTradeLines(p, s); AC.Extras && AC.Extras.paint(this, c, p, s, a, z); }
    this.draw_.paint(c, p, 'front');
    for (const st of sts) if (this.paneOf(st) === p.id) this.paintTables(p, st);
    c.restore();
  }
  paintBg(p, st, q) { const c = this.cx, sty = st.plotStyle(q); if (sty && sty.vis === false) return; const [a, z] = this.range(), n = this.bars.T.length; const off = q.offset || 0; for (let i = a; i <= z; i++) { const v = q.data[i - off]; if (!v || v !== v || (q.showLast && i < n - q.showLast)) continue; const x0 = Math.round(this.x(i) - this.bs / 2), x1 = Math.round(this.x(i) + this.bs / 2); c.fillStyle = v; c.fillRect(x0, p.y, Math.max(1, x1 - x0), p.h); } }
  barColors(a, z) { let out = null; for (const st of this.studies) { if (st.cfg.hidden || !st.rt) continue; for (const q of st.rt.plotList) if (q.kind === 'barcolor') { const sty = st.plotStyle(q); if (sty && sty.vis === false) continue; out = out || []; for (let i = a; i <= z; i++) { const v = q.data[i - (q.offset || 0)]; if (v && v === v) out[i] = v; } } } return out; }
  paintMain(p, s, a, z) {
    const c = this.cx, b = this.bars, th = this.th, ty = this.cell.type, bs = this.bs, set = this.set;
    if (this.cell.hideMain) return;
    const up = th.up, dn = th.dn;
    let w = Math.max(1, Math.floor(bs * 0.8)); if (bs > 3) { if (w % 2 === 0) w--; } const hw = (w - 1) / 2;
    const bc = this.barColors(a, z);
    const colAt = i => bc && bc[i] ? bc[i] : (set.colorPrev && i ? b.C[i] >= b.C[i - 1] : b.C[i] >= b.O[i]) ? up : dn;
    if (ty === 'line' || ty === 'linem' || ty === 'step' || ty === 'area' || ty === 'baseline' || ty === 'hlcarea') {
      const col = set.lineColor || '#2f7bff';
      const path = (arr, step) => { c.beginPath(); let st = false, py; for (let i = a; i <= z; i++) { const x = this.x(i), y = s.y(arr[i]); if (!st) { c.moveTo(x, y); st = true; } else { if (step) c.lineTo(x, py); c.lineTo(x, y); } py = y; } };
      c.lineJoin = 'round'; c.lineWidth = 2;
      if (ty === 'hlcarea') { c.beginPath(); for (let i = a; i <= z; i++) c.lineTo(this.x(i), s.y(b.H[i])); for (let i = z; i >= a; i--) c.lineTo(this.x(i), s.y(b.C[i])); c.fillStyle = U.rgba(up, 0.18); c.fill(); c.beginPath(); for (let i = a; i <= z; i++) c.lineTo(this.x(i), s.y(b.C[i])); for (let i = z; i >= a; i--) c.lineTo(this.x(i), s.y(b.L[i])); c.fillStyle = U.rgba(dn, 0.18); c.fill(); c.lineWidth = 1; path(b.H); c.strokeStyle = up; c.stroke(); path(b.L); c.strokeStyle = dn; c.stroke(); path(b.C); c.strokeStyle = th.mut; c.lineWidth = 2; c.stroke(); return; }
      if (ty === 'baseline') { const by = p.y + p.h * (1 - (this.cell.basePct === undefined ? 50 : this.cell.basePct) / 100); for (const [cc, y0, hh] of [[up, p.y, by - p.y], [dn, by, p.y + p.h - by]]) { c.save(); c.beginPath(); c.rect(this.axL, y0, this.pw, hh); c.clip(); path(b.C); c.strokeStyle = cc; c.stroke(); c.lineTo(this.x(z), by); c.lineTo(this.x(a), by); c.fillStyle = U.rgba(cc, 0.14); c.fill(); c.restore(); } c.strokeStyle = th.mut; c.setLineDash([2, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(this.axL, by); c.lineTo(this.axL + this.pw, by); c.stroke(); c.setLineDash([]); return; }
      path(b.C, ty === 'step'); c.strokeStyle = col; c.stroke();
      if (ty === 'area') { c.lineTo(this.x(z), p.y + p.h); c.lineTo(this.x(a), p.y + p.h); const g = c.createLinearGradient(0, p.y, 0, p.y + p.h); g.addColorStop(0, U.rgba(col, 0.32)); g.addColorStop(1, U.rgba(col, 0.02)); c.fillStyle = g; c.fill(); }
      if (ty === 'linem' && bs > 5) { c.fillStyle = col; for (let i = a; i <= z; i++) { c.beginPath(); c.arc(this.x(i), s.y(b.C[i]), Math.min(3.5, bs / 3), 0, 7); c.fill(); } }
      return;
    }
    if (ty === 'columns') { for (let i = a; i <= z; i++) { c.fillStyle = colAt(i); const y = s.y(b.C[i]); c.fillRect(Math.round(this.x(i)) - hw, y, w, p.y + p.h - y); } return; }
    if (ty === 'bars') { const t = Math.max(1, Math.min(3, Math.floor(bs / 5))); for (let i = a; i <= z; i++) { const x = Math.round(this.x(i)); c.fillStyle = colAt(i); const yh = s.y(b.H[i]), yl = s.y(b.L[i]); c.fillRect(x - Math.floor(t / 2), yh, t, Math.max(1, yl - yh)); if (bs > 2.5) { c.fillRect(x - hw, s.y(b.O[i]) - t / 2, hw, t); c.fillRect(x, s.y(b.C[i]) - t / 2, hw + 1, t); } } return; }
    if (ty === 'highlow') { c.font = '10px ' + FONT; c.textAlign = 'center'; for (let i = a; i <= z; i++) { const x = Math.round(this.x(i)); const yh = s.y(b.H[i]), yl = s.y(b.L[i]); c.fillStyle = U.rgba(colAt(i), 0.8); c.fillRect(x - hw, Math.min(yh, yl), w, Math.max(1, Math.abs(yl - yh))); if (bs > 54) { c.fillStyle = th.fg; c.textBaseline = 'bottom'; c.fillText(U.fmt(b.H[i], this.ser.sym.prec), x, yh - 2); c.textBaseline = 'top'; c.fillText(U.fmt(b.L[i], this.ser.sym.prec), x, yl + 2); } } return; }
    if (ty === 'kagi') { c.lineJoin = 'miter'; let thick = false, pk = null, vl = null; for (let i = a; i <= z; i++) { const x = this.x(i), upk = b.C[i] >= b.O[i]; if (upk && pk !== null && b.C[i] > pk) thick = true; if (!upk && vl !== null && b.C[i] < vl) thick = false; c.strokeStyle = thick ? up : dn; c.lineWidth = thick ? 2.5 : 1.2; c.beginPath(); c.moveTo(x, s.y(b.O[i])); c.lineTo(x, s.y(b.C[i])); if (i < z) c.lineTo(this.x(i + 1), s.y(b.C[i])); c.stroke(); if (upk) pk = b.C[i]; else vl = b.C[i]; } return; }
    if (ty === 'pnf') { const box = b.box || 1; for (let i = a; i <= z; i++) { const upk = b.C[i] >= b.O[i], x = this.x(i), r = Math.max(1.5, Math.min(bs * 0.42, Math.abs(s.y(0 + b.L[i]) - s.y(b.L[i] + box)) * 0.45)); c.strokeStyle = upk ? up : dn; c.lineWidth = 1.3; for (let q = b.L[i], g = 0; q <= b.H[i] + box * 0.01 && g < 300; q += box, g++) { const y = s.y(q); c.beginPath(); if (upk) { c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); } else c.arc(x, y, r, 0, 7); c.stroke(); } } return; }
    if (ty === 'footprint' && this.paintFootprint(p, s, a, z)) return;
    if (ty === 'svp' || ty === 'tpo') { this.paintProfiles(p, s, a, z, ty); c.globalAlpha = ty === 'tpo' ? 0.25 : 1; }
    /* candles family */
    let vmax = 0, vol = ty === 'volcandles'; if (vol) for (let i = a; i <= z; i++) if (b.V[i] > vmax) vmax = b.V[i];
    const hollow = ty === 'hollow', brick = ty === 'renko' || ty === 'linebreak';
    const wick = set.wick !== false && !brick, border = set.border !== false;
    for (let i = a; i <= z; i++) {
      const x = Math.round(this.x(i)); let col = colAt(i);
      if (hollow) col = bc && bc[i] ? bc[i] : i && b.C[i] < b.C[i - 1] ? dn : up;
      const yo = s.y(b.O[i]), yc = s.y(b.C[i]); let y0 = Math.min(yo, yc), hh = Math.max(1, Math.abs(yc - yo));
      let ww = w, h2 = hw; if (vol && vmax) { ww = Math.max(1, Math.round(w * 1.15 * Math.sqrt(b.V[i] / vmax))); h2 = Math.floor(ww / 2); }
      if (wick) { c.fillStyle = set.wickUp && set.wickDn && !(bc && bc[i]) ? (b.C[i] >= b.O[i] ? set.wickUp : set.wickDn) : col; const yh = s.y(b.H[i]), yl = s.y(b.L[i]); const t = Math.min(yh, yl), q = Math.max(yh, yl); if (hollow && b.C[i] >= b.O[i]) { c.fillRect(x, t, 1, Math.max(0, y0 - t)); c.fillRect(x, y0 + hh, 1, Math.max(0, q - y0 - hh)); } else c.fillRect(x, t, 1, Math.max(1, q - t)); }
      if (ww <= 1 && !brick) { c.fillStyle = col; c.fillRect(x, y0, 1, hh); continue; }
      if (hollow && b.C[i] >= b.O[i]) { c.strokeStyle = col; c.lineWidth = 1; c.strokeRect(x - h2 + 0.5, Math.round(y0) + 0.5, Math.max(0, ww - 1), Math.max(0, Math.round(hh) - 1)); }
      else { c.fillStyle = col; c.fillRect(x - h2, Math.round(y0), ww, Math.max(1, Math.round(hh))); }
    }
    c.globalAlpha = 1;
  }
  /* lower timeframe volume split per bar (taker buy when the exchange gives it) */
  ltf() { const ms = this.ser.ms; return ms <= 60000 ? '1S' : ms <= 36e5 ? '1' : ms <= 4 * 36e5 ? '5' : '15'; }
  ensureLtf(tf) { if (this.fpSer && this.fpSer.tf === tf && this.fpSer.id === this.ser.id) return this.fpSer.ready ? this.fpSer : null; this.fpUn && this.fpUn(); this.fpSer = F.series(this.ser.id, tf); let t = 0; this.fpUn = this.fpSer.on(k => { if (k === 'load' || Date.now() - t > 1000) { t = Date.now(); this.invalidate(); } }); return this.fpSer.ready ? this.fpSer : null; }
  rowsFor(b, i0, i1, row) { const m = new Map(); for (let k = i0; k < i1; k++) { const lo = Math.floor(b.L[k] / row), hi = Math.floor(b.H[k] / row), n = hi - lo + 1, v = b.V[k] || 0, f = b.B[k] >= 0 && v ? b.B[k] / v : b.H[k] > b.L[k] ? (b.C[k] - b.L[k]) / (b.H[k] - b.L[k]) : 0.5; for (let r = lo; r <= hi; r++) { let x = m.get(r); if (!x) m.set(r, x = [0, 0]); x[0] += v * f / n; x[1] += v * (1 - f) / n; } } return m; }
  paintFootprint(p, s, a, z) {
    const L2 = this.ensureLtf(this.ltf()); if (!L2) return false;
    if (this.bs < 26) return false;
    const c = this.cx, th = this.th, b = this.bars, lb = L2.bars, w = this.bs * 0.92;
    const tickPx = 15, pr = Math.abs(s.p(0) - s.p(tickPx)); const p10 = Math.pow(10, Math.floor(Math.log10(pr))); const f = pr / p10; let row = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p10; row = Math.max(row, this.ser.sym.mintick);
    if (lb.T[0] > b.T[z]) { this.fpSer.more(); return false; }
    if (lb.T[0] > b.T[a]) this.fpSer.more();
    c.textBaseline = 'middle'; c.font = '10px ' + FONT;
    for (let i = a; i <= z; i++) {
      const t0 = b.T[i], t1 = i + 1 < b.T.length ? b.T[i + 1] : t0 + this.ser.ms; const k0 = PN.lb(lb.T, t0), k1 = PN.lb(lb.T, t1);
      const x = this.x(i), x0 = x - w / 2; const col = b.C[i] >= b.O[i] ? th.up : th.dn;
      c.fillStyle = col; const yo = s.y(b.O[i]), yc = s.y(b.C[i]); c.fillRect(x0, Math.min(yo, yc), 3, Math.max(1, Math.abs(yo - yc))); c.fillRect(x0 + 1, s.y(b.H[i]), 1, s.y(b.L[i]) - s.y(b.H[i]));
      if (k1 <= k0) { continue; }
      const m = this.rowsFor(lb, k0, k1, row); let mx = 0, tb = 0, ts = 0, poc = null; for (const [r, v] of m) { const t = v[0] + v[1]; tb += v[0]; ts += v[1]; if (t > mx) { mx = t; poc = r; } }
      for (const [r, v] of m) { const y1 = s.y((r + 1) * row), y2 = s.y(r * row), h = Math.max(1, y2 - y1 - 1), t = v[0] + v[1]; const d = t ? (v[0] - v[1]) / t : 0; c.fillStyle = U.rgba(d >= 0 ? th.up : th.dn, 0.08 + 0.5 * t / mx); c.fillRect(x0 + 5, y1, w - 6, h); if (r === poc) { c.strokeStyle = th.sel; c.lineWidth = 1; c.strokeRect(x0 + 5.5, y1 + 0.5, w - 7, h - 1); } if (this.bs > 74 && h > 9) { c.fillStyle = th.fg; c.textAlign = 'right'; c.fillText(U.big(v[1]), x - 3 + 2, (y1 + y2) / 2); c.textAlign = 'left'; c.fillText(U.big(v[0]), x + 5 + 2, (y1 + y2) / 2); c.fillStyle = th.mut; c.fillText('×', x - 1 + 2, (y1 + y2) / 2); } }
      if (this.bs > 50) { const yb = s.y(b.L[i]) + 14; c.textAlign = 'center'; c.fillStyle = tb >= ts ? th.up : th.dn; c.fillText('Δ ' + U.big(tb - ts), x, yb); c.fillStyle = th.mut; c.fillText(U.big(tb + ts), x, yb + 13); }
    }
    return true;
  }
  paintProfiles(p, s, a, z, ty) {
    const L2 = this.ensureLtf(ty === 'tpo' ? '30' : '5'); if (!L2) return; const lb = L2.bars, b = this.bars, c = this.cx, th = this.th;
    const day = 864e5; const d0 = Math.floor(b.T[a] / day), d1 = Math.floor(b.T[z] / day); if (d1 - d0 > 60) return;
    if (lb.T[0] > b.T[a]) this.fpSer.more();
    const pr = Math.abs(s.p(0) - s.p(ty === 'tpo' ? 11 : 4)); const p10 = Math.pow(10, Math.floor(Math.log10(pr))), f = pr / p10; const row = Math.max(this.ser.sym.mintick, (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p10);
    for (let d = d0; d <= d1; d++) {
      const k0 = PN.lb(lb.T, d * day), k1 = PN.lb(lb.T, (d + 1) * day); if (k1 <= k0) continue;
      const x0 = this.xT(d * day) - this.bs / 2, x1 = this.xT((d + 1) * day) - this.bs / 2, W = (x1 - x0) * (ty === 'tpo' ? 0.95 : 0.7);
      if (ty === 'svp') { const m = this.rowsFor(lb, k0, k1, row); this.profile(m, row, s, x0, W, {}); }
      else { const m = new Map(); for (let k = k0; k < k1; k++) { const lo = Math.floor(lb.L[k] / row), hi = Math.floor(lb.H[k] / row); for (let r = lo; r <= hi; r++) { if (!m.has(r)) m.set(r, []); m.get(r).push(k - k0); } } let mx = 0, poc = null; for (const [r, l] of m) if (l.length > mx) { mx = l.length; poc = r; } const cw = Math.min(11, W / Math.max(8, mx)); c.font = Math.min(11, cw + 2) + 'px ui-monospace,Menlo,monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (const [r, l] of m) { const y = s.y((r + 0.5) * row); l.forEach((q, j) => { const hue = q / 48 * 260 + 190; c.fillStyle = r === poc ? th.sel : 'hsl(' + hue + ',60%,' + (this.app.theme === 'dark' ? 62 : 42) + '%)'; if (cw > 5) c.fillText(q < 26 ? String.fromCharCode(65 + q) : String.fromCharCode(97 + q - 26), x0 + (j + 0.5) * cw, y); else c.fillRect(x0 + j * cw, y - 2, Math.max(1, cw - 0.5), 4); }); } }
    }
  }
  /* volume profile histogram with POC / value area */
  profile(m, row, s, x0, W, o) {
    const c = this.cx, th = this.th; let mx = 0, tot = 0, poc = null; const keys = Array.from(m.keys()).sort((x, y) => x - y); if (!keys.length) return null;
    for (const r of keys) { const v = m.get(r), t = v[0] + v[1]; tot += t; if (t > mx) { mx = t; poc = r; } }
    /* value area 70% */
    let lo = keys.indexOf(poc), hi = lo, acc = mx; const T = k => { const v = m.get(keys[k]); return v ? v[0] + v[1] : 0; }; while (acc < tot * 0.7 && (lo > 0 || hi < keys.length - 1)) { const u = hi < keys.length - 1 ? T(hi + 1) : -1, d = lo > 0 ? T(lo - 1) : -1; if (u >= d) { hi++; acc += u; } else { lo--; acc += d; } }
    const vah = (keys[hi] + 1) * row, val = keys[lo] * row, pocP = (poc + 0.5) * row;
    const right = o.right;
    for (let k = 0; k < keys.length; k++) { const r = keys[k], v = m.get(r), y1 = s.y((r + 1) * row), y2 = s.y(r * row), h = Math.max(1, y2 - y1 - (y2 - y1 > 3 ? 1 : 0)); const inVA = k >= lo && k <= hi, al = inVA ? 0.62 : 0.28; const w1 = v[0] / mx * W, w2 = v[1] / mx * W; c.fillStyle = U.rgba(th.up, al); if (right) { c.fillRect(x0 + W - w1, y1, w1, h); c.fillStyle = U.rgba(th.dn, al); c.fillRect(x0 + W - w1 - w2, y1, w2, h); } else { c.fillRect(x0, y1, w1, h); c.fillStyle = U.rgba(th.dn, al); c.fillRect(x0 + w1, y1, w2, h); } }
    const xe = o.lineTo !== undefined ? o.lineTo : x0 + W;
    c.lineWidth = 1; c.strokeStyle = th.sel; c.beginPath(); c.moveTo(x0, s.y(pocP)); c.lineTo(xe, s.y(pocP)); c.stroke(); c.setLineDash([3, 3]); c.strokeStyle = th.mut; c.beginPath(); for (const v of [vah, val]) { c.moveTo(x0, s.y(v)); c.lineTo(xe, s.y(v)); } c.stroke(); c.setLineDash([]);
    return { poc: pocP, vah, val, tot };
  }
  paintCompares(p, s) {
    const c = this.cx, b = this.bars; const [a, z] = this.range();
    for (const o of this.compares) { if (o.c.hidden) continue; const cb = o.ser.bars; if (!cb.T.length || !b.T.length) continue; const sc = o.c.mode === 'own' ? this.sc(p, 'cmp:' + o.c.sym) : s; const f = o.c.mode === 'own' || o.c.mode === 'price' ? 1 : b.C[Math.max(0, a)] / (o.base || 1); const k0 = Math.max(0, PN.lb(cb.T, b.T[a]) - 1), k1 = Math.min(cb.T.length - 1, PN.lb(cb.T, b.T[z]) + 1); c.beginPath(); let st = false; for (let k = k0; k <= k1; k++) { const x = this.xT(cb.T[k]), y = sc.y(cb.C[k] * f); if (!st) { c.moveTo(x, y); st = true; } else c.lineTo(x, y); } c.strokeStyle = o.c.color; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke(); }
  }
  /* ---------- study plots ---------- */
  pcol(st, q, i, key) { const sty = st.plotStyle(q); if (sty && sty.color && !key) return sty.color; const k = key || 'color'; const arr = q[k + 's']; const v = arr ? arr[i] : q[k + '0']; return v && v === v ? v : null; }
  paintStudy(p, st, sc, a, z, forcedOnly) {
    const main = p.id === 'main';
    for (const q of st.rt.plotList) {
      if (forcedOnly ? !q.force : (q.force && !main)) continue;
      if (q.display === 'none' || q.display === 'data_window' || q.display === 'status_line' || q.display === 'price_scale') continue;
      const sty = st.plotStyle(q); if (sty && sty.vis === false) continue;
      if (q.kind === 'plot') this.paintPlot(p, st, sc, q, a, z, sty);
      else if (q.kind === 'hline') this.paintHline(p, st, sc, q, sty);
      else if (q.kind === 'shape' || q.kind === 'char') this.paintShape(p, st, sc, q, a, z);
      else if (q.kind === 'candle' || q.kind === 'bar') this.paintOHLC(p, st, sc, q, a, z);
      else if (q.kind === 'arrow') this.paintArrow(p, st, sc, q, a, z);
    }
    if (forcedOnly) return;
    if (st.rt.strat) this.paintStrat(p, st, sc, a, z);
    this.paintObjects(p, st, sc, a, z);
  }
  dash(style, w) { this.cx.setLineDash(style === 'dashed' ? [4 + w, 4 + w] : style === 'dotted' ? [w, 2 + w] : []); }
  paintPlot(p, st, sc, q, a, z, sty) {
    const c = this.cx, d = q.data, off = q.offset || 0, n = this.bars.T.length, w = (sty && sty.width) || q.width || 1, style = (sty && sty.style) || q.style;
    let i0 = Math.max(0, a - off - 1), i1 = Math.min(d.length - 1, z - off + 1);
    if (off > 0) i1 = Math.min(d.length - 1, Math.ceil(this.iX(this.axL + this.pw)) - off + 1);
    if (q.showLast) i0 = Math.max(i0, n - q.showLast);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (style === 'histogram' || style === 'columns') {
      const bw = style === 'columns' ? Math.max(1, Math.floor(this.bs * 0.75)) : Math.max(1, w), y0 = sc.y(q.base);
      for (let i = i0; i <= i1; i++) { const v = d[i]; if (!isNum(v)) continue; const cc = this.pcol(st, q, i); if (!cc) continue; const y = sc.y(v); c.fillStyle = cc; c.fillRect(Math.round(this.x(i + off) - bw / 2), Math.min(y, y0), bw, Math.max(1, Math.abs(y - y0))); }
      return;
    }
    if (style === 'circles' || style === 'cross') { const r = Math.max(1.2, w * (style === 'circles' ? 0.9 : 1.6)); for (let i = i0; i <= i1; i++) { const v = d[i]; if (!isNum(v)) continue; const cc = this.pcol(st, q, i); if (!cc) continue; const x = this.x(i + off), y = sc.y(v); if (style === 'circles') { c.fillStyle = cc; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } else { c.fillStyle = cc; c.fillRect(x - r * 1.5, y - 0.6, r * 3, 1.3); c.fillRect(x - 0.6, y - r * 1.5, 1.3, r * 3); } } return; }
    const step = /^step/.test(style), br = style === 'linebr' || style === 'areabr' || style === 'steplinebr';
    if (style === 'area' || style === 'areabr') { const y0 = U.clamp(sc.y(q.base), p.y, p.y + p.h); let open = false, lx = 0, col = null; c.beginPath(); for (let i = i0; i <= i1; i++) { const v = d[i]; if (!isNum(v)) { if (open && br) { c.lineTo(lx, y0); c.closePath(); c.fillStyle = col; c.fill(); c.beginPath(); open = false; } continue; } const x = this.x(i + off); col = this.pcol(st, q, i) || col; if (!open) { c.moveTo(x, y0); open = true; } c.lineTo(x, sc.y(v)); lx = x; } if (open && col) { c.lineTo(lx, y0); c.closePath(); c.fillStyle = col; c.fill(); } return; }
    c.lineWidth = w; this.dash((sty && sty.ls) || q.linestyle, w);
    let px = null, py = null, pv = false, cur = null, open = false;
    const flush = () => { if (open && cur) { c.strokeStyle = cur; c.stroke(); } open = false; };
    for (let i = i0; i <= i1; i++) {
      const v = d[i];
      if (!isNum(v)) { if (br) { flush(); px = null; } continue; }
      const x = this.x(i + off), y = sc.y(v), cc = this.pcol(st, q, i);
      if (px === null) { px = x; py = y; cur = cc; if (i === i1 || !isNum(d[i + 1])) { if (br && cc) { c.fillStyle = cc; c.fillRect(x - w / 2, y - w / 2, Math.max(w, 2), w); } } c.beginPath(); c.moveTo(x, y); open = true; continue; }
      if (cc !== cur) { flush(); cur = cc; c.beginPath(); c.moveTo(px, py); open = true; }
      if (cc) { if (step) { if (style === 'stepline_diamond') { /* plain step */ } c.lineTo(x - this.bs / 2, py); c.lineTo(x - this.bs / 2, y); c.lineTo(x, y); } else c.lineTo(x, y); }
      px = x; py = y;
    }
    flush(); c.setLineDash([]);
    if (q.track || (sty && sty.track)) { const v = d[d.length - 1]; if (isNum(v)) { c.strokeStyle = this.pcol(st, q, d.length - 1) || this.th.mut; c.setLineDash([2, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(this.axL, sc.y(v)); c.lineTo(this.axL + this.pw, sc.y(v)); c.stroke(); c.setLineDash([]); } }
  }
  paintHline(p, st, sc, q, sty) { if (!isNum(q.price)) return; const c = this.cx, y = Math.round(sc.y(q.price)) + 0.5; c.strokeStyle = (sty && sty.color) || q.color0 || this.th.mut; if (q.color0 !== q.color0) return; c.lineWidth = q.width || 1; this.dash(q.linestyle, 1); c.beginPath(); c.moveTo(this.axL, y); c.lineTo(this.axL + this.pw, y); c.stroke(); c.setLineDash([]); }
  paintFill(p, sc, st, q, a, z) {
    const c = this.cx; if (!q.a || !q.b) return; const sty = st.plotStyle(q); if (sty && sty.vis === false) return; if (q.display === 'none') return;
    if (q.a.kind === 'hline' && q.b.kind === 'hline') { const cc = q.colors ? q.colors[q.colors.length - 1] : q.color0; if (!cc || cc !== cc) return; const y1 = sc.y(q.a.price), y2 = sc.y(q.b.price); c.fillStyle = (sty && sty.color) || cc; c.fillRect(this.axL, Math.min(y1, y2), this.pw, Math.abs(y2 - y1)); return; }
    const off = q.a.offset || 0, get = (o, i) => o.kind === 'hline' ? o.price : o.data[i];
    const i0 = Math.max(0, a - off - 1), i1 = Math.min(this.bars.T.length - 1, z - off + 1);
    if (q.grad) { for (let i = i0; i < i1; i++) { const t = q.tv[i], bt = q.bv[i], v1 = get(q.a, i), v2 = get(q.b, i), w1 = get(q.a, i + 1), w2 = get(q.b, i + 1); if (![t, bt, v1, v2, w1, w2].every(isNum) || !q.tc[i] || !q.bc[i] || q.tc[i] !== q.tc[i]) continue; const yt = sc.y(t), yb = sc.y(bt); if (!(Math.abs(yt - yb) > 0.01)) continue; const g = c.createLinearGradient(0, yt, 0, yb); g.addColorStop(0, q.tc[i]); g.addColorStop(1, q.bc[i] === q.bc[i] ? q.bc[i] : '#00000000'); c.fillStyle = g; const x = this.x(i + off), x2 = this.x(i + 1 + off); c.beginPath(); c.moveTo(x, sc.y(v1)); c.lineTo(x2, sc.y(w1)); c.lineTo(x2, sc.y(w2)); c.lineTo(x, sc.y(v2)); c.fill(); } return; }
    let cur = null, seg = [];
    const flush = () => { if (seg.length > 1 && cur) { c.beginPath(); seg.forEach((s, k) => k ? c.lineTo(s[0], s[1]) : c.moveTo(s[0], s[1])); for (let k = seg.length - 1; k >= 0; k--) c.lineTo(seg[k][0], seg[k][2]); c.closePath(); c.fillStyle = cur; c.fill(); } };
    for (let i = i0; i <= i1; i++) {
      const u = get(q.a, i), v = get(q.b, i);
      if (!isNum(u) || !isNum(v)) { flush(); seg = []; cur = null; continue; }
      let cc = sty && sty.color ? sty.color : q.colors ? q.colors[i] : q.color0; if (!cc || cc !== cc) cc = null;
      const pt = [this.x(i + off), sc.y(u), sc.y(v)];
      if (seg.length && cc !== cur) { flush(); seg = [seg[seg.length - 1]]; if (cur === null) seg = []; }
      cur = cc; seg.push(pt);
    }
    flush();
  }
  shapeSize(s) { return { tiny: 4, small: 5.5, auto: 5.5, normal: 7.5, large: 11, huge: 15 }[s] || 5.5; }
  stackAt(m, i, dir, need) { const k = i + '|' + dir; const v = m.get(k) || 0; m.set(k, v + need); return v; }
  paintShape(p, st, sc, q, a, z) {
    const c = this.cx, b = this.bars, off = q.offset || 0, n = b.T.length; const r = this.shapeSize(q.size);
    const stack = this.stk && this.stkP === this.paintId ? this.stk : (this.stk = new Map());
    let lastX = -99;
    const i0 = Math.max(0, a - off), i1 = Math.min(q.data.length - 1, z - off);
    for (let i = i0; i <= i1; i++) {
      const v = q.data[i]; if (!isNum(v)) continue; if (q.showLast && i < n - q.showLast) continue;
      const cc = this.pcol(st, q, i); if (!cc) continue; const j = i + off; if (j < 0 || j >= n && q.loc !== 'absolute') continue;
      const x = this.x(j); const lines = q.text && q.text === q.text ? String(q.text).split('\n') : null; const th = lines ? lines.length * 12 : 0;
      let y; let dir = 0;
      const lbl = q.style === 'labelup' || q.style === 'labeldown';
      const tall = lbl && lines ? th + 8 + 5 : r * 2;
      if (q.loc === 'abovebar') { y = sc.y(b.H[j]) - 4; dir = -1; } else if (q.loc === 'belowbar') { y = sc.y(b.L[j]) + 4; dir = 1; } else if (q.loc === 'top') { y = p.y + 8 + r; dir = 0; } else if (q.loc === 'bottom') { y = p.y + p.h - 8 - r; dir = 0; } else { y = sc.y(v); dir = 0; }
      const tc = this.pcol(st, q, i, 'tcolor') || (lbl ? '#ffffff' : cc);
      c.font = '10px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (q.kind === 'char') { c.fillStyle = cc; c.font = (r * 2.2) + 'px ' + FONT; const yy = dir ? y + dir * (r + 2) : y; c.fillText(q.char, x, yy); if (lines) { c.font = '10px ' + FONT; c.fillStyle = tc; lines.forEach((t, k) => c.fillText(t, x, dir < 0 ? yy - r - 8 - (lines.length - 1 - k) * 12 : yy + r + 8 + k * 12)); } continue; }
      if (lbl && lines) { let w = 0; for (const t of lines) w = Math.max(w, c.measureText(t).width); w += 10; const h = th + 4; const upL = q.style === 'labelup'; const y0 = upL ? y + 5 : y - 5 - h; c.fillStyle = cc; c.beginPath(); if (upL) { c.moveTo(x, y); c.lineTo(x - 4, y0); c.lineTo(x + 4, y0); } else { c.moveTo(x, y); c.lineTo(x - 4, y0 + h); c.lineTo(x + 4, y0 + h); } c.fill(); rr(c, x - w / 2, y0, w, h, 3); c.fill(); c.fillStyle = tc; lines.forEach((t, k) => c.fillText(t, x, y0 + 8 + k * 12)); continue; }
      const yc = dir ? y + dir * r : y; c.fillStyle = cc; c.strokeStyle = cc; this.glyph(q.style, x, yc, r);
      if (lines) { c.fillStyle = tc; lines.forEach((t, k) => c.fillText(t, x, dir < 0 ? yc - r - 7 - (lines.length - 1 - k) * 12 : yc + r + 7 + k * 12)); }
    }
  }
  glyph(s, x, y, r) {
    const c = this.cx; c.beginPath();
    switch (s) {
      case 'triangleup': c.moveTo(x, y - r); c.lineTo(x + r, y + r * 0.8); c.lineTo(x - r, y + r * 0.8); c.fill(); break;
      case 'triangledown': c.moveTo(x, y + r); c.lineTo(x + r, y - r * 0.8); c.lineTo(x - r, y - r * 0.8); c.fill(); break;
      case 'circle': c.arc(x, y, r * 0.9, 0, 7); c.fill(); break;
      case 'square': c.fillRect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7); break;
      case 'diamond': c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.fill(); break;
      case 'cross': c.lineWidth = Math.max(1.5, r / 3); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke(); break;
      case 'flag': c.fillRect(x - r, y - r, 1.5, r * 2); c.moveTo(x - r, y - r); c.lineTo(x + r, y - r * 0.4); c.lineTo(x - r, y + r * 0.2); c.fill(); break;
      case 'arrowup': c.moveTo(x, y - r); c.lineTo(x + r * 0.8, y); c.lineTo(x + r * 0.3, y); c.lineTo(x + r * 0.3, y + r); c.lineTo(x - r * 0.3, y + r); c.lineTo(x - r * 0.3, y); c.lineTo(x - r * 0.8, y); c.fill(); break;
      case 'arrowdown': c.moveTo(x, y + r); c.lineTo(x + r * 0.8, y); c.lineTo(x + r * 0.3, y); c.lineTo(x + r * 0.3, y - r); c.lineTo(x - r * 0.3, y - r); c.lineTo(x - r * 0.3, y); c.lineTo(x - r * 0.8, y); c.fill(); break;
      case 'labelup': c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x + r, y + r); c.lineTo(x - r, y + r); c.lineTo(x - r, y); c.fill(); break;
      case 'labeldown': c.moveTo(x, y + r); c.lineTo(x + r, y); c.lineTo(x + r, y - r); c.lineTo(x - r, y - r); c.lineTo(x - r, y); c.fill(); break;
      default: c.lineWidth = Math.max(1.5, r / 3.5); c.moveTo(x - r * 0.75, y - r * 0.75); c.lineTo(x + r * 0.75, y + r * 0.75); c.moveTo(x + r * 0.75, y - r * 0.75); c.lineTo(x - r * 0.75, y + r * 0.75); c.stroke();
    }
  }
  paintArrow(p, st, sc, q, a, z) { const c = this.cx, b = this.bars; let m = 0; for (let i = a; i <= z; i++) if (isNum(q.data[i])) m = Math.max(m, Math.abs(q.data[i])); if (!m) return; for (let i = a; i <= z; i++) { const v = q.data[i]; if (!isNum(v) || !v) continue; const len = q.minh + (Math.min(q.maxh, 60) - q.minh) * Math.abs(v) / m, x = this.x(i), up = v > 0, y = up ? sc.y(b.L[i]) + 6 : sc.y(b.H[i]) - 6, d = up ? 1 : -1, w = Math.max(3, this.bs * 0.4); c.fillStyle = up ? q.up : q.dn; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y + d * w); c.lineTo(x + w / 2, y + d * w); c.lineTo(x + w / 2, y + d * len); c.lineTo(x - w / 2, y + d * len); c.lineTo(x - w / 2, y + d * w); c.lineTo(x - w, y + d * w); c.fill(); } }
  paintOHLC(p, st, sc, q, a, z) { const c = this.cx; let w = Math.max(1, Math.floor(this.bs * 0.8)); if (w % 2 === 0) w--; const hw = (w - 1) / 2; for (let i = a; i <= Math.min(z, q.data.length - 1); i++) { const o = q.o[i], h = q.h[i], l = q.l[i], cl = q.data[i]; if (!isNum(o) || !isNum(cl)) continue; const cc = this.pcol(st, q, i), wc = this.pcol(st, q, i, 'wcolor') || cc, x = Math.round(this.x(i)); if (q.kind === 'bar') { if (!cc) continue; c.fillStyle = cc; c.fillRect(x, sc.y(h), 1, Math.max(1, sc.y(l) - sc.y(h))); c.fillRect(x - hw, sc.y(o), hw, 1); c.fillRect(x, sc.y(cl), hw, 1); continue; } if (wc) { c.fillStyle = wc; c.fillRect(x, sc.y(h), 1, Math.max(1, sc.y(l) - sc.y(h))); } const y0 = Math.min(sc.y(o), sc.y(cl)), hh = Math.max(1, Math.abs(sc.y(o) - sc.y(cl))); if (cc) { c.fillStyle = cc; c.fillRect(x - hw, y0, w, hh); } const bc = this.pcol(st, q, i, 'bcolor'); if (bc && bc !== cc && w > 2) { c.strokeStyle = bc; c.lineWidth = 1; c.strokeRect(x - hw + 0.5, y0 + 0.5, w - 1, Math.max(0, hh - 1)); } } }
  paintStrat(p, st, sc, a, z) {
    if (this.paneOf(st) !== 'main' && p.id !== 'main') return; if (st.cfg.hideTrades) return;
    const c = this.cx, b = this.bars, th = this.th; c.font = '10px ' + FONT; c.textAlign = 'center'; const seen = {};
    for (const f of st.rt.strat.fills) { if (f.i < a || f.i > z) continue; const up = f.dir > 0, k = f.i + (up ? 'u' : 'd'), n = seen[k] = (seen[k] || 0) + 1, x = this.x(f.i), y = up ? sc.y(b.L[f.i]) + 6 + (n - 1) * 26 : sc.y(b.H[f.i]) - 6 - (n - 1) * 26, d = up ? 1 : -1; c.fillStyle = f.exit ? '#b07cf7' : up ? '#2f7bff' : '#f23645'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y + 5 * d); c.lineTo(x + 1.2, y + 5 * d); c.lineTo(x + 1.2, y + 11 * d); c.lineTo(x - 1.2, y + 11 * d); c.lineTo(x - 1.2, y + 5 * d); c.lineTo(x - 4, y + 5 * d); c.fill(); if (this.bs > 5) { c.textBaseline = up ? 'top' : 'bottom'; c.fillText(String(f.label).slice(0, 16), x, y + 13 * d); } c.fillRect(x - 3, sc.y(f.p) - 0.5, 6, 1.5); }
  }
  /* pine drawings */
  px(o, x) { return o.xloc === 'bar_time' ? this.xT(x) : this.x(x); }
  paintObjects(p, st, sc, a, z) {
    const c = this.cx, R = st.rt, xl = this.axL, xr = this.axL + this.pw;
    const size = s => typeof s === 'number' ? Math.max(6, s) : { auto: 11, tiny: 9, small: 10, normal: 12, large: 17, huge: 24 }[s] || 12;
    for (const lf of R.linefills) { const l = lf.line1, m = lf.line2; if (!(l instanceof L.Draw) || !(m instanceof L.Draw) || l.__del || m.__del) continue; const g = this.lineEnds(l, sc), h = this.lineEnds(m, sc); if (!g || !h || !lf.color || lf.color !== lf.color) continue; c.fillStyle = lf.color; c.beginPath(); c.moveTo(g[0], g[1]); c.lineTo(g[2], g[3]); c.lineTo(h[2], h[3]); c.lineTo(h[0], h[1]); c.fill(); }
    for (const bx of R.boxes) {
      if (!isNum(bx.left) || !isNum(bx.right) || !isNum(bx.top) || !isNum(bx.bottom)) continue;
      let x1 = this.px(bx, bx.left), x2 = this.px(bx, bx.right); if (x1 > x2) [x1, x2] = [x2, x1]; if (bx.extend === 'left' || bx.extend === 'both') x1 = xl - 2; if (bx.extend === 'right' || bx.extend === 'both') x2 = xr + 2;
      if (x2 < xl || x1 > xr) continue; let y1 = sc.y(bx.top), y2 = sc.y(bx.bottom); if (y1 > y2) [y1, y2] = [y2, y1];
      if (y2 < p.y - 50 || y1 > p.y + p.h + 50) continue;
      if (bx.bgcolor && bx.bgcolor === bx.bgcolor) { c.fillStyle = bx.bgcolor; c.fillRect(x1, y1, x2 - x1, Math.max(1, y2 - y1)); }
      if (bx.border_width > 0 && bx.border_color && bx.border_color === bx.border_color) { c.strokeStyle = bx.border_color; c.lineWidth = bx.border_width; this.dash(bx.border_style, bx.border_width); c.strokeRect(Math.round(x1) + 0.5, Math.round(y1) + 0.5, x2 - x1, Math.max(0, y2 - y1)); c.setLineDash([]); }
      if (bx.text) { const ls = String(bx.text).split('\n'); let fs = bx.text_size === 'auto' ? U.clamp((y2 - y1) / ls.length * 0.7, 7, 16) : size(bx.text_size); c.font = fs + 'px ' + FONT; if (bx.text_size === 'auto') { let mw = 0; for (const t of ls) mw = Math.max(mw, c.measureText(t).width); if (mw > x2 - x1 - 4) { fs = Math.max(6, fs * (x2 - x1 - 4) / mw); c.font = fs + 'px ' + FONT; } } c.fillStyle = bx.text_color && bx.text_color === bx.text_color ? bx.text_color : this.th.fg; c.textAlign = bx.text_halign === 'align_left' ? 'left' : bx.text_halign === 'align_right' ? 'right' : 'center'; c.textBaseline = 'middle'; const tx = c.textAlign === 'left' ? x1 + 4 : c.textAlign === 'right' ? x2 - 4 : (Math.max(x1, xl) + Math.min(x2, xr)) / 2, tot = ls.length * fs * 1.2; let ty = bx.text_valign === 'align_top' ? y1 + fs * 0.7 + 2 : bx.text_valign === 'align_bottom' ? y2 - tot + fs * 0.5 : (y1 + y2) / 2 - tot / 2 + fs * 0.6; for (const t of ls) { c.fillText(t, tx, ty); ty += fs * 1.2; } }
    }
    for (const pl of R.polylines) { const pts = (pl.points || []).map(q => [pl.xloc === 'bar_time' ? this.xT(q.f_time) : this.x(q.f_index), sc.y(q.f_price)]).filter(q => isNum(q[0]) && isNum(q[1])); if (pts.length < 2) continue; c.beginPath(); if (pl.curved) { c.moveTo(pts[0][0], pts[0][1]); const N = pts.length; for (let k = 0; k < N - 1; k++) { const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(N - 1, k + 2)]; c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); } } else pts.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); if (pl.closed) c.closePath(); if (pl.fill_color && pl.fill_color === pl.fill_color) { c.fillStyle = pl.fill_color; c.fill(); } if (pl.line_color && pl.line_color === pl.line_color) { c.strokeStyle = pl.line_color; c.lineWidth = pl.line_width; this.dash(pl.line_style, pl.line_width); c.stroke(); c.setLineDash([]); } }
    for (const l of R.lines) {
      const g = this.lineEnds(l, sc); if (!g) continue; if (Math.max(g[0], g[2]) < xl || Math.min(g[0], g[2]) > xr) continue; if (!l.color || l.color !== l.color) continue;
      c.strokeStyle = l.color; c.lineWidth = l.width || 1; const arrow = /^arrow/.test(l.style); this.dash(l.style, l.width || 1); c.beginPath(); c.moveTo(g[0], g[1]); c.lineTo(g[2], g[3]); c.stroke(); c.setLineDash([]);
      if (arrow) { c.fillStyle = l.color; if (l.style !== 'arrow_left') head(c, g[0], g[1], g[2], g[3], 6 + l.width * 2); if (l.style !== 'arrow_right') head(c, g[2], g[3], g[0], g[1], 6 + l.width * 2); }
    }
    for (const lb of R.labels) {
      if (!isNum(lb.x)) continue; const x = this.px(lb, lb.x); if (x < xl - 300 || x > xr + 300) continue;
      let y; if (lb.yloc === 'price') { if (!isNum(lb.y)) continue; y = sc.y(lb.y); } else { const i = Math.round(lb.xloc === 'bar_time' ? this.iOf(lb.x) : lb.x); if (i < 0 || i >= this.bars.T.length) continue; y = lb.yloc === 'abovebar' ? sc.y(this.bars.H[i]) - 4 : sc.y(this.bars.L[i]) + 4; }
      if (y < p.y - 400 || y > p.y + p.h + 400) continue;
      const fs = size(lb.size), txt = lb.text && lb.text === lb.text ? String(lb.text) : '', ls = txt.split('\n'); c.font = (/bold/.test(String(lb.text_formatting)) ? '700 ' : '') + fs + 'px ' + (lb.text_font_family === 'family_monospace' ? 'ui-monospace,Menlo,monospace' : FONT);
      let w = 0; for (const t of ls) w = Math.max(w, c.measureText(t).width); const lh = fs * 1.25, h = txt ? ls.length * lh : 0; const sty = lb.style, bg = lb.color && lb.color === lb.color ? lb.color : null, tc = lb.textcolor && lb.textcolor === lb.textcolor ? lb.textcolor : null;
      let bx, by, bw = w + fs * 0.9, bh = h + fs * 0.45; const ar = 5;
      const tip = (pts) => { c.beginPath(); pts.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.fill(); };
      const boxy = /^label_/.test(sty);
      if (boxy) {
        if (!txt) { bw = fs * 1.2; bh = fs * 1.1; }
        c.fillStyle = bg || 'transparent';
        switch (sty) {
          case 'label_up': bx = x - bw / 2; by = y + ar; if (bg) tip([[x, y], [x - ar, by + 1], [x + ar, by + 1]]); break;
          case 'label_down': bx = x - bw / 2; by = y - ar - bh; if (bg) tip([[x, y], [x - ar, by + bh - 1], [x + ar, by + bh - 1]]); break;
          case 'label_left': bx = x + ar; by = y - bh / 2; if (bg) tip([[x, y], [bx + 1, y - ar], [bx + 1, y + ar]]); break;
          case 'label_right': bx = x - ar - bw; by = y - bh / 2; if (bg) tip([[x, y], [bx + bw - 1, y - ar], [bx + bw - 1, y + ar]]); break;
          case 'label_center': bx = x - bw / 2; by = y - bh / 2; break;
          case 'label_upper_left': bx = x; by = y; break; case 'label_upper_right': bx = x - bw; by = y; break; case 'label_lower_left': bx = x; by = y - bh; break; case 'label_lower_right': bx = x - bw; by = y - bh; break;
        }
        if (bg) { rr(c, bx, by, bw, bh, 3); c.fill(); }
        if (txt && tc) { c.fillStyle = tc; c.textBaseline = 'middle'; const al = lb.textalign; c.textAlign = al === 'align_left' ? 'left' : al === 'align_right' ? 'right' : 'center'; const tx = al === 'align_left' ? bx + fs * 0.45 : al === 'align_right' ? bx + bw - fs * 0.45 : bx + bw / 2; ls.forEach((t, k) => c.fillText(t, tx, by + fs * 0.22 + (k + 0.5) * lh)); }
      } else {
        const r = fs * 0.55; if (sty !== 'none' && sty !== 'text_outline' && bg) { c.fillStyle = bg; c.strokeStyle = bg; this.glyph(sty, x, lb.yloc === 'belowbar' ? y + r : lb.yloc === 'abovebar' ? y - r : y, r); }
        if (txt && tc) { c.textAlign = 'center'; c.textBaseline = 'middle'; const dn = lb.yloc === 'belowbar' || sty === 'arrowup' || sty === 'triangleup'; const y0 = sty === 'none' || sty === 'text_outline' ? y - h / 2 + (lb.yloc === 'abovebar' ? -h / 2 : lb.yloc === 'belowbar' ? h / 2 : 0) : dn ? y + r * 2 + 3 : y - r * 2 - 3 - h; if (sty === 'text_outline' && bg) { c.strokeStyle = bg; c.lineWidth = 3; ls.forEach((t, k) => c.strokeText(t, x, y0 + (k + 0.5) * lh)); } c.fillStyle = tc; ls.forEach((t, k) => c.fillText(t, x, y0 + (k + 0.5) * lh)); }
      }
    }
  }
  lineEnds(l, sc) { if (!isNum(l.x1) || !isNum(l.x2) || !isNum(l.y1) || !isNum(l.y2)) return null; let x1 = this.px(l, l.x1), x2 = this.px(l, l.x2), y1 = sc.y(l.y1), y2 = sc.y(l.y2); if (x1 > x2) { [x1, x2] = [x2, x1]; [y1, y2] = [y2, y1]; } const xl = this.axL - 5, xr = this.axL + this.pw + 5; if (x2 !== x1) { const m = (y2 - y1) / (x2 - x1); if (l.extend === 'right' || l.extend === 'both') { if (xr > x2) { y2 = y1 + m * (xr - x1); x2 = xr; } } if (l.extend === 'left' || l.extend === 'both') { if (xl < x1) { y1 = y2 - m * (x2 - xl); x1 = xl; } } } else if (l.extend === 'both') { y1 = -9999; y2 = 9999; } return [x1, y1, x2, y2]; }
  paintTables(p, st) {
    const c = this.cx, th = this.th;
    const FS = s => typeof s === 'number' ? Math.max(6, s) : { auto: 12, tiny: 9, small: 10.5, normal: 13, large: 18, huge: 26 }[s] || 12;
    for (const t of st.rt.tables) {
      const cells = Object.values(t.cells); if (!cells.length) continue;
      const nc = Math.max(...cells.map(x => x.c + (x.cs || 1))), nr = Math.max(...cells.map(x => x.r + (x.rs || 1))); const cw = new Array(nc).fill(0), rh = new Array(nr).fill(0);
      for (const x of cells) { const fs = FS(x.text_size || 'normal'); c.font = fs + 'px ' + (x.text_font_family === 'family_monospace' ? 'ui-monospace,Menlo,monospace' : FONT); const ls = x.text.split('\n'); let w = 0; for (const q of ls) w = Math.max(w, c.measureText(q).width); w += x.text ? 12 : 6; let h = x.text ? ls.length * fs * 1.25 + 5 : 6; if (x.width > 0) w = Math.max(w, x.width / 100 * this.pw); if (x.height > 0) h = Math.max(h, x.height / 100 * p.h); x._fs = fs; x._ls = ls; if ((x.cs || 1) === 1) cw[x.c] = Math.max(cw[x.c], w); if ((x.rs || 1) === 1) rh[x.r] = Math.max(rh[x.r], h); }
      const W = cw.reduce((q, w) => q + w, 0), H = rh.reduce((q, w) => q + w, 0); const [v, hz] = t.position.split('_');
      let X = hz === 'left' ? this.axL + 6 : hz === 'center' ? this.axL + (this.pw - W) / 2 : this.axL + this.pw - W - 6, Y = v === 'top' ? p.y + 6 : v === 'middle' ? p.y + (p.h - H) / 2 : p.y + p.h - H - 6;
      if (v === 'top' && hz === 'left') Y += this.legendH || 0;
      if (t.bgcolor && t.bgcolor === t.bgcolor) { c.fillStyle = t.bgcolor; c.fillRect(X, Y, W, H); }
      const xs = [X]; for (const w of cw) xs.push(xs[xs.length - 1] + w); const ys = [Y]; for (const h of rh) ys.push(ys[ys.length - 1] + h);
      const covered = new Set(); for (const x of cells) if (x.cs > 1 || x.rs > 1) for (let q = 0; q < (x.cs || 1); q++) for (let r = 0; r < (x.rs || 1); r++) if (q || r) covered.add((x.c + q) + ',' + (x.r + r));
      for (const x of cells) { if (covered.has(x.c + ',' + x.r)) continue; const x0 = xs[x.c], y0 = ys[x.r], x1 = xs[x.c + (x.cs || 1)], y1 = ys[x.r + (x.rs || 1)]; if (x.bgcolor && x.bgcolor === x.bgcolor) { c.fillStyle = x.bgcolor; c.fillRect(x0, y0, x1 - x0, y1 - y0); } if (t.border_width > 0 && t.border_color && t.border_color === t.border_color) { c.strokeStyle = t.border_color; c.lineWidth = t.border_width; c.strokeRect(x0, y0, x1 - x0, y1 - y0); } if (x.text) { c.font = x._fs + 'px ' + (x.text_font_family === 'family_monospace' ? 'ui-monospace,Menlo,monospace' : FONT); c.fillStyle = x.text_color && x.text_color === x.text_color ? x.text_color : th.fg; c.textAlign = x.text_halign === 'align_left' ? 'left' : x.text_halign === 'align_right' ? 'right' : 'center'; c.textBaseline = 'middle'; const tx = c.textAlign === 'left' ? x0 + 6 : c.textAlign === 'right' ? x1 - 6 : (x0 + x1) / 2, lh = x._fs * 1.25, ty = (y0 + y1) / 2 - (x._ls.length - 1) * lh / 2; x._ls.forEach((q, k) => c.fillText(q, tx, ty + k * lh)); } }
      if (t.frame_width > 0 && t.frame_color && t.frame_color === t.frame_color) { c.strokeStyle = t.frame_color; c.lineWidth = t.frame_width; c.strokeRect(X, Y, W, H); }
    }
  }
  /* ---------- axis labels ---------- */
  paintPriceAxis(p) {
    const c = this.cx, th = this.th, x0 = this.axL + this.pw, s = this.sc(p, 'right');
    const cl = this.clipOf(p); c.save(); c.beginPath(); c.rect(x0, cl[0], this.axR, cl[1]); c.clip();
    c.fillStyle = th.bg; c.fillRect(x0, cl[0], this.axR, cl[1]);
    if (p.mini) { c.restore(); return; }
    c.font = '11px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = th.mut;
    for (const v of this.priceTicks(s, p.h)) { const y = s.y(v); if (y < p.y + 8 || y > p.y + p.h - 8) continue; c.fillText(s.mode === 'pct' ? U.pct(s.f(v)) : s.mode === 'idx' ? s.f(v).toFixed(2) : this.fmtP(p, v), x0 + 7, y); }
    const labs = [];
    if (p.id === 'main') {
      const b = this.bars, n = b.T.length;
      if (n && this.set.lastLabel !== false) { const v = b.C[n - 1], col = this.lastCol(); let cd = ''; if (this.set.countdown !== false && !this.replay && F.isOpen(this.ser.id) && !this.synthOn) cd = this.countdown(); labs.push({ y: s.y(v), t: s.mode === 'pct' ? U.pct(s.f(v)) : s.mode === 'idx' ? s.f(v).toFixed(2) : this.fmtP(p, v), bg: col, sub: cd, pri: 10 }); }
      const q = F.quotes[this.ser.id];
      for (const o of this.compares) { const cb = o.ser.bars; if (!cb.T.length || o.c.hidden) continue; const v = cb.C[cb.C.length - 1]; const sc = o.c.mode === 'own' ? this.sc(p, 'cmp:' + o.c.sym) : s; const vv = o.c.mode === 'own' || o.c.mode === 'price' ? v : v / (o.base || 1) * s.base; labs.push({ y: sc.y(vv), t: o.c.mode === 'own' || o.c.mode === 'price' ? U.fmt(v, o.ser.sym.prec) : U.pct((v / o.base - 1) * 100), bg: o.c.color, pri: 5, nm: o.ser.sym.ticker }); }
      const [a, z] = this.range(); if (this.set.hiLo && z >= a) { let hi = -Infinity, lo = Infinity, hi_i = a, lo_i = a; for (let i = a; i <= z; i++) { if (b.H[i] > hi) { hi = b.H[i]; hi_i = i; } if (b.L[i] < lo) { lo = b.L[i]; lo_i = i; } } labs.push({ y: s.y(hi), t: this.fmtP(p, hi), bg: th.lab, pri: 3 }, { y: s.y(lo), t: this.fmtP(p, lo), bg: th.lab, pri: 3 }); }
      if (AC.Alerts) for (const al of AC.Alerts.levels(this.ser.id)) labs.push({ y: s.y(al.v), t: '🔔 ' + this.fmtP(p, al.v), bg: '#c98500', pri: 4 });
      if (this.app.trade) for (const l of this.app.trade.levels(this.ser.id)) labs.push({ y: s.y(l.p), t: this.fmtP(p, l.p), bg: l.col, pri: 6 });
    }
    if (this.set.indLabels !== false) for (const st of this.studies) { if (this.paneOf(st) !== p.id || st.cfg.hidden || !st.rt) continue; const k = this.scaleKey(st), sc = p.sc[k]; if (!sc) continue; const own = k !== 'right'; for (const q of st.rt.plotList) { if (q.kind !== 'plot' || q.display === 'none' || q.display === 'data_window' || q.display === 'status_line' || q.display === 'pane') continue; const sty = st.plotStyle(q); if (sty && sty.vis === false) continue; const i = this.bars.T.length - 1 - (q.offset > 0 ? q.offset : 0); const v = q.data[i]; if (!isNum(v)) continue; const col = this.pcol(st, q, i); if (!col || U.alpha(col) < 12) continue; const solid = col.slice(0, 7); labs.push({ y: sc.y(v), t: own ? U.big(v) : this.fmtP(p, v), bg: solid, pri: 1 }); } }
    for (const l of this.draw_.axisLabels(p)) labs.push(l);
    const vis = labs.filter(l => l.y > p.y - 2 && l.y < p.y + p.h + 2).sort((q, r) => r.pri - q.pri).slice(0, 40); const placed = [];
    for (const l of vis) { const h = l.sub ? 30 : 17; let y = l.y; l.h = h; l.top = U.clamp(y - 8.5, p.y, p.y + p.h - h); let tries = 0; while (placed.some(q => l.top < q.top + q.h && l.top + h > q.top) && tries++ < 14) { const hit = placed.find(q => l.top < q.top + q.h && l.top + h > q.top); l.top = l.y > hit.y ? hit.top + hit.h : hit.top - h; } if (tries >= 14) continue; placed.push(l); }
    for (const l of placed.reverse()) { c.fillStyle = l.bg; c.fillRect(x0 + 1, l.top, this.axR - 1, l.h); c.fillStyle = U.ink(l.bg); c.font = (l.pri >= 10 ? '600 ' : '') + '11px ' + FONT; c.fillText(l.t, x0 + 7, l.top + 9); if (l.sub) { c.font = '10px ' + FONT; c.globalAlpha = 0.85; c.fillText(l.sub, x0 + 7, l.top + 22); c.globalAlpha = 1; } }
    /* main last price line */
    c.restore();
    if (p.id === 'main' && this.bars.T.length && this.set.lastLine !== false) { const v = this.bars.C[this.bars.T.length - 1], y = Math.round(s.y(v)) + 0.5; if (y > p.y && y < p.y + p.h) { c.strokeStyle = this.lastCol(); c.setLineDash([1, 2]); c.lineWidth = 1; c.beginPath(); c.moveTo(this.axL, y); c.lineTo(x0, y); c.stroke(); c.setLineDash([]); } }
    if (p.sc.left) { const l = p.sc.left; c.fillStyle = th.bg; c.fillRect(0, p.y, this.axL, p.h); c.fillStyle = th.mut; c.font = '11px ' + FONT; c.textAlign = 'right'; for (const v of this.priceTicks(l, p.h)) { const y = l.y(v); if (y > p.y + 8 && y < p.y + p.h - 8) c.fillText(this.fmtP(p, v, 'left'), this.axL - 6, y); } }
  }
  lastCol() { const b = this.bars, n = b.T.length; return b.C[n - 1] >= b.O[n - 1] ? this.th.up : this.th.dn; }
  countdown() { const T = this.bars.T; const end = PN.tfNext(T[T.length - 1], this.cell.tf); let s = Math.max(0, Math.floor((end - Date.now()) / 1000)); if (s > 864e2 * 40) return ''; const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60; const P = x => String(x).padStart(2, '0'); return d ? d + 'd ' + P(h) + ':' + P(m) : (h ? P(h) + ':' : '') + P(m) + ':' + P(s); }
  paintTradeLines(p, s) {
    const c = this.cx; if (!this.app.trade) return;
    for (const l of this.app.trade.levels(this.ser.id)) { const y = Math.round(s.y(l.p)) + 0.5; if (y < p.y || y > p.y + p.h) continue; c.strokeStyle = l.col; c.setLineDash(l.solid ? [] : [4, 3]); c.lineWidth = 1; c.beginPath(); c.moveTo(this.axL, y); c.lineTo(this.axL + this.pw, y); c.stroke(); c.setLineDash([]); c.font = '11px ' + FONT; const w = c.measureText(l.t).width + 12; c.fillStyle = l.col; rr(c, this.axL + this.pw * 0.62, y - 9, w, 18, 3); c.fill(); c.fillStyle = U.ink(l.col); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(l.t, this.axL + this.pw * 0.62 + 6, y + 0.5); l._x = this.axL + this.pw * 0.62; l._w = w; l._y = y; }
    if (AC.Alerts) for (const a of AC.Alerts.levels(this.ser.id)) { const y = Math.round(s.y(a.v)) + 0.5; c.strokeStyle = '#c98500'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(this.axL, y); c.lineTo(this.axL + this.pw, y); c.stroke(); c.setLineDash([]); }
  }
  /* ---------- overlay: crosshair ---------- */
  paintOver() {
    const c = this.ox, th = this.th; c.clearRect(0, 0, this.w, this.hh);
    if (!this.bars.T.length) return;
    this.draw_.paintOver(c);
    let m = this.mouse; const sync = !m && this.app.sync.cross && this.app.crossT !== undefined && this.app.crossFrom !== this;
    if (sync) { const x = this.xT(this.app.crossT); let y = null; if (this.app.crossSym === this.ser.id && isNum(this.app.crossP)) { const p = this.panes[0]; y = this.sc(this.panes.find(q => q.id === 'main') || p, 'right').y(this.app.crossP); } m = { x, y, sync: true }; }
    if (!m || this.drag && this.drag.k === 'axis') { if (this.hovI !== undefined) { this.hovI = undefined; this.legendValues(); } return; }
    const i = U.clamp(Math.round(this.iX(m.x)), 0, this.bars.T.length - 1), ri = Math.round(this.iX(m.x));
    const tool = this.app.tool, cm = this.app.cursor;
    const xs = Math.round(this.x(ri)) + 0.5; const H = this.hh - TH;
    if (m.x < this.axL || m.x > this.axL + this.pw) { if (!m.sync) return; }
    const pane = m.y != null ? this.paneAt(m.y) : null;
    if (cm !== 'arrow' || tool || m.sync) {
      c.strokeStyle = th.cross; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); if (cm === 'dot' && !tool && !m.sync) { c.setLineDash([]); c.fillStyle = th.cross; c.arc(m.x, m.y, 3, 0, 7); c.fill(); } else { c.moveTo(xs, 0); c.lineTo(xs, H); if (m.y != null && m.y < H) { const y = Math.round(m.y) + 0.5; c.moveTo(this.axL, y); c.lineTo(this.axL + this.pw, y); } c.stroke(); } c.setLineDash([]);
    }
    c.font = '11px ' + FONT; c.textBaseline = 'middle';
    /* time label */
    const t = this.tOf(ri), txt = this.fmtT(t); const w = c.measureText(txt).width + 14; c.fillStyle = th.lab; const lx = U.clamp(xs - w / 2, 0, this.w - this.axR - w); c.fillRect(lx, this.hh - TH + 1, w, TH - 4); c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(txt, lx + 7, this.hh - TH / 2);
    if (pane && m.y < H) { const s = this.sc(pane, 'right'), v = s.p(m.y); const pt = s.mode === 'pct' ? U.pct(s.f(v)) : s.mode === 'idx' ? s.f(v).toFixed(2) : this.fmtP(pane, v); c.fillStyle = th.lab; c.fillRect(this.axL + this.pw + 1, m.y - 9, this.axR - 1, 18); c.fillStyle = '#fff'; c.fillText(pt, this.axL + this.pw + 7, m.y + 0.5); }
    if (this.hovI !== i) { this.hovI = i; this.legendValues(); }
  }
  fmtT(t) { const tz = this.app.tz, D = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], M = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], d = new Date(t + PN.tzOff(tz, t)), P = x => String(x).padStart(2, '0'); const day = D[d.getUTCDay()] + ' ' + P(d.getUTCDate()) + ' ' + M[d.getUTCMonth()] + " '" + P(d.getUTCFullYear() % 100); return this.ser.ms < 864e5 ? day + '  ' + P(d.getUTCHours()) + ':' + P(d.getUTCMinutes()) + (this.ser.ms < 60000 ? ':' + P(d.getUTCSeconds()) : '') : day; }
  /* ---------- legend ---------- */
  legendKey() { return this.panes.map(p => p.id + ':' + Math.round(p.y)).join(',') + '|' + this.studies.map(s => s.id + s.cfg.hidden + (s.err ? 'e' : '') + this.paneOf(s)).join(',') + this.app.selStudy + this.compares.length; }
  legendBuild() { this.lgKey = null; }
  legendUpdate() {
    this.legendDirty = false; const k = this.legendKey();
    if (k !== this.lgKey) {
      this.lgKey = k; this.lg.innerHTML = ''; this.rows = [];
      for (const p of this.panes) {
        if (p.h < 12 || (p.id !== 'main' && this.rTop && (p.y < this.rTop - 2 || p.y > this.hh - TH - 14))) { for (const s of this.studies) if (this.paneOf(s) === p.id) s.vEl = null; continue; }
        const box = U.h('div.lgp', { style: { top: (p.y + 4) + 'px', left: (this.axL + 8) + 'px', maxWidth: (this.pw - 16) + 'px', maxHeight: Math.max(22, p.h - 8) + 'px' } });
        if (p.id === 'main') {
          const r = U.h('div.lgr.lgm'); const sy = this.ser.sym;
          r.append(U.h('b.lgs', { text: sy.desc, onclick: () => this.app.openSearch(this) }), U.h('span.lgt', { text: ' · ' + AC.tfLabel(this.cell.tf) + ' · ' + F.source(this.ser.id) }), this.stEl = U.h('i.lgdot', { title: '' }), this.ohlc = U.h('span.lgv'));
          box.append(r);
          if (this.set.buySell) { const q = U.h('div.lgr.bs'); q.append(this.bsS = U.h('button.sell', { onclick: () => this.app.trade && this.app.trade.quick(this, -1) }), this.bsB = U.h('button.buy', { onclick: () => this.app.trade && this.app.trade.quick(this, 1) })); box.append(q); }
          for (const o of this.compares) { const row = U.h('div.lgr.st', null, U.h('span.lgn', { text: o.ser.sym.ticker + ' · ' + F.source(o.ser.id), style: { color: o.c.color } }), o.vEl = U.h('span.lgv'), U.h('span.lgb', null, U.h('button', { html: U.ic(o.c.hidden ? 'eyeoff' : 'eye'), title: 'Sembunyikan', onclick: () => { o.c.hidden = !o.c.hidden; this.lgKey = null; this.invalidate(); this.app.touch(); } }), U.h('button', { html: U.ic('gear'), title: 'Mode skala', onclick: e => U.menu([['pct', 'Persen (skala sama)'], ['price', 'Harga (skala sama)'], ['own', 'Skala sendiri']].map(m => ({ t: m[1], chk: (o.c.mode || 'pct') === m[0], on: () => { o.c.mode = m[0]; this.invalidate(); this.app.touch(); } })).concat([{ sep: 1 }, { el: U.h('label.crow', null, 'Warna', U.colorBtn(o.c.color, v => { o.c.color = v; this.lgKey = null; this.invalidate(); this.app.touch(); })) }]), e.currentTarget) }), U.h('button', { html: U.ic('x'), title: 'Hapus', onclick: () => { o.un(); this.compares = this.compares.filter(q => q !== o); this.cell.compares = this.cell.compares.filter(q => q !== o.c); this.lgKey = null; this.invalidate(); this.app.touch(); } }))); box.append(row); }
        } else {
          const pb = U.h('div.pbtn', { style: { top: (p.y + 4) + 'px', right: (this.axR + 6) + 'px' } });
          const ids = this.panes.map(q => q.id), ix = ids.indexOf(p.id);
          pb.append(U.h('button', { html: U.ic('up'), title: 'Pindah ke atas', onclick: () => this.movePane(p.id, -1) }), U.h('button', { html: U.ic('down'), title: 'Pindah ke bawah', onclick: () => this.movePane(p.id, 1) }), U.h('button', { html: U.ic(this.cell.max === p.id ? 'restore' : 'max'), title: 'Perbesar panel (klik ganda)', onclick: () => { this.cell.max = this.cell.max === p.id ? null : p.id; this.lgKey = null; this.invalidate(); this.app.touch(); } }));
          this.lg.append(pb);
        }
        const list = this.studies.filter(s => this.paneOf(s) === p.id);
        const coll = p.id === 'main' && this.cell.lgColl;
        if (p.id === 'main' && list.length > 1) { box.append(U.h('button.lgcol', { html: U.ic(coll ? 'down' : 'up') + (coll ? '<span>' + list.length + '</span>' : ''), title: coll ? 'Tampilkan ' + list.length + ' indikator' : 'Ringkas daftar indikator', onclick: () => { this.cell.lgColl = !this.cell.lgColl; this.lgKey = null; this.invalidate(); this.app.touch(); } })); }
        if (!coll) for (const s of list) {
          const row = U.h('div.lgr.st' + (s.cfg.hidden ? '.hid' : '') + (s.err ? '.err' : '') + (this.app.selStudy === s.id ? '.sel' : ''));
          const v = U.h('span.lgv'), n = U.h('span.lgn', { text: s.title, title: s.err ? s.err.message : s.prog && s.prog.decl.title });
          const bt = U.h('span.lgb');
          const B = (ic, tt, fn) => bt.append(U.h('button', { html: U.ic(ic), title: tt, 'aria-label': tt, onclick: e => { e.stopPropagation(); fn(e); } }));
          B(s.cfg.hidden ? 'eyeoff' : 'eye', s.cfg.hidden ? 'Tampilkan' : 'Sembunyikan', () => { s.cfg.hidden = !s.cfg.hidden; if (!s.cfg.hidden) this.queue(s); this.lgKey = null; this.invalidate(); this.app.touch(); });
          B('gear', 'Pengaturan', () => this.app.studyDialog(this, s)); B('code', 'Kode Pine', () => this.app.openCode(s)); B('dots', 'Lainnya', e => this.app.studyMenu(this, s, e.currentTarget)); B('x', 'Hapus', () => { this.app.pushUndo(); this.removeStudy(s.id); this.app.touch(); });
          if (s.err) row.append(n, U.h('span.lge', { text: '!', title: s.err.message, onclick: () => this.app.openCode(s) }), bt); else row.append(n, v, bt);
          row.onclick = () => { this.app.selStudy = this.app.selStudy === s.id ? null : s.id; this.lgKey = null; this.invalidate(); };
          row.ondblclick = () => this.app.studyDialog(this, s);
          row.oncontextmenu = e => { e.preventDefault(); this.app.studyMenu(this, s, { x: e.clientX, y: e.clientY }); };
          s.vEl = v; box.append(row);
        } else for (const s of list) s.vEl = null;
        this.lg.append(box);
      }
      const m0 = this.lg.querySelector('.lgp'); this.legendH = m0 ? m0.offsetHeight + 4 : 0;
    }
    this.legendValues();
  }
  legendValues() {
    const b = this.bars, n = b.T.length; if (!this.ohlc) return; const i = this.hovI === undefined || this.hovI >= n ? n - 1 : this.hovI;
    const open = F.isOpen(this.ser.id); if (this.stEl) { this.stEl.className = 'lgdot ' + (this.replay ? 'rep' : !open ? 'cl' : F.status.state === 'live' ? 'ok' : 'bad'); this.stEl.title = this.replay ? 'Replay' : !open ? 'Pasar tutup' : F.status.state === 'live' ? 'Data real-time' : 'Koneksi terputus'; }
    if (n && i >= 0) { const pr = this.ser.sym.prec, o = b.O[i], c = b.C[i], pc = i ? b.C[i - 1] : o, ch = c - pc, col = c >= o ? this.th.up : this.th.dn; const line = /^(line|linem|step|area|baseline|columns)$/.test(this.cell.type); const F2 = x => U.fmt(x, pr); this.ohlc.innerHTML = (line ? '' : 'O<em>' + F2(o) + '</em> H<em>' + F2(b.H[i]) + '</em> L<em>' + F2(b.L[i]) + '</em> ') + 'C<em>' + F2(c) + '</em> <em>' + (ch >= 0 ? '+' : '') + F2(ch) + ' (' + U.pct(ch / pc * 100) + ')</em>' + (b.V[i] > 0 && this.set.legendVol !== false ? ' Vol<em>' + U.big(b.V[i]) + '</em>' : ''); this.ohlc.style.setProperty('--vc', col); }
    if (this.bsB && n) { const q = F.quotes[this.ser.id]; const p = q && q.last || b.C[n - 1]; this.bsS.innerHTML = '<b>' + U.fmt(p, this.ser.sym.prec) + '</b><span>JUAL</span>'; this.bsB.innerHTML = '<b>' + U.fmt(p, this.ser.sym.prec) + '</b><span>BELI</span>'; }
    for (const o of this.compares) if (o.vEl && o.ser.bars.T.length) { const cb = o.ser.bars, k = n && i >= 0 ? Math.max(0, PN.lb(cb.T, b.T[i] + 1) - 1) : cb.T.length - 1; o.vEl.textContent = U.fmt(cb.C[k], o.ser.sym.prec) + (o.base && o.c.mode !== 'own' && o.c.mode !== 'price' ? '  ' + U.pct((cb.C[k] / o.base - 1) * 100) : ''); }
    for (const s of this.studies) { if (!s.vEl) continue; if (!s.rt || s.cfg.hidden) { if (s.vEl._t !== '') { s.vEl.textContent = s._t = s.vEl._t = this.queueSet.has(s) ? '…' : ''; } continue; } let h = '', k = 0; for (const q of s.rt.plotList) { if (q.kind === 'fill' || q.kind === 'bg' || q.kind === 'barcolor' || q.kind === 'hline' || q.kind === 'arrow' || q.kind === 'shape' || q.kind === 'char') continue; if (q.display === 'none') continue; if (++k > 8) { h += ' …'; break; } const v = q.data[i - (q.offset || 0)]; const col = this.pcol(s, q, i - (q.offset || 0)) || this.th.mut; const pn = this.panes.find(p => p.id === this.paneOf(s)); h += '<em style="color:' + (U.alpha(col) < 35 ? U.rgba(col.slice(0, 7), 1) : U.rgba(col.slice(0, 7), 1)) + '">' + (isNum(v) ? this.fmtP(pn, v, this.scaleKey(s)) : '∅') + '</em> '; } if (s.vEl._t !== h) { s.vEl._t = h; s.vEl.innerHTML = h; } }
    if (this.app.active === this) U.emit('hover', { chart: this, i });
  }
  movePane(id, d) { const ids = this.panes.map(p => p.id), i = ids.indexOf(id), j = i + d; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; this.cell.order = ids; this.lgKey = null; this.invalidate(); this.app.touch(); }
  /* ---------- view control ---------- */
  zoom(f, x) { const i = this.iX(x === undefined ? this.axL + this.pw * 0.9 : x); const nb = U.clamp(this.bs * f, 0.35, 220); this.bs = nb; const i2 = this.iX(x === undefined ? this.axL + this.pw * 0.9 : x); this.ro += i - i2; this.clampRo(); this.invalidate(); this.app.onView(this); }
  clampRo() { const n = this.bars.T.length, vis = this.pw / this.bs; this.ro = U.clamp(this.ro, -(n - 3), vis - 2); }
  scroll(bars) { this.ro += bars; this.clampRo(); this.invalidate(); this.app.onView(this); }
  toLast() { const a = this.ro; const t0 = performance.now(), b = 8; const st = () => { const k = Math.min(1, (performance.now() - t0) / 220); this.ro = a + (b - a) * (1 - Math.pow(1 - k, 3)); this.invalidate(); if (k < 1) requestAnimationFrame(st); else this.app.onView(this); }; st(); }
  reset() { this.bs = 8; this.ro = 8; const s = this.cell.scale; s.auto = true; for (const p of this.panes) for (const k in p.sc) p.sc[k].auto = true; this.invalidate(); this.app.onView(this); }
  fit(t0, t1) { const a = this.iOf(t0), z = this.iOf(t1); this.bs = U.clamp(this.pw / Math.max(5, z - a + 1), 0.35, 220); this.ro = z - (this.bars.T.length - 1) ; this.cell.scale.auto = true; this.invalidate(); this.app.onView(this); }
  async goTo(t) { let g = 0; while (this.bars.T.length && this.bars.T[0] > t && !this.ser.noMore && g++ < 25) { const ok = await this.ser.more(); if (!ok) { await new Promise(r => setTimeout(r, 250)); } } const i = this.iOf(t); this.ro = i + this.pw / this.bs / 2 - this.bars.T.length; this.clampRo(); this.invalidate(); return this.bars.T[0] <= t; }
  paneAt(y) { return this.panes.find(p => { const c = this.clipOf(p); return c[1] > 2 && y >= c[0] && y < c[0] + c[1]; }); }
  sepAt(y) { if (this.rTop) { if (Math.abs(this.rTop - y) < 4) return -1; return 0; } for (let k = 1; k < this.panes.length; k++) if (this.panes[k].h > 0 && Math.abs(this.panes[k].y - y) < 4) return k; return 0; }
  /* ---------- events ---------- */
  bind() {
    const el = this.ov, A = this.app; const pos = e => { const r = this.el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, e }; };
    const ptr = new Map(); let pinch = null, longT = null, vel = 0, lastMv = 0, kin = 0;
    el.style.touchAction = 'none';
    el.addEventListener('pointerenter', () => { this.hover = true; });
    el.addEventListener('pointermove', e => {
      const m = pos(e); if (ptr.has(e.pointerId)) ptr.set(e.pointerId, m);
      if (pinch && ptr.size >= 2) { const [p, q] = Array.from(ptr.values()); const d = Math.hypot(p.x - q.x, p.y - q.y), cx = (p.x + q.x) / 2; if (pinch.d > 5) { this.zoom(d / pinch.d, cx); this.ro -= (cx - pinch.cx) / this.bs; this.clampRo(); } pinch = { d, cx }; return; }
      if (longT && this.down && Math.hypot(m.x - this.down.x, m.y - this.down.y) > 8) { clearTimeout(longT); longT = null; }
      if (this.drag) { this.onDrag(m, e); return; }
      this.mouse = m; this.hoverCursor(m);
      if (this.draw_.move(m, e)) { this.paintOver(); } else this.paintOver();
      this.syncCross(m);
    });
    el.addEventListener('pointerleave', () => { this.hover = false; if (!this.drag) { this.mouse = null; this.draw_.hov = null; this.paintOver(); if (A.sync.cross) { A.crossT = undefined; A.eachChart(c => c !== this && c.paintOver()); } } });
    el.addEventListener('pointerdown', e => {
      const m = pos(e); A.setActive(this); U.closeMenu(); this.kinStop = true;
      ptr.set(e.pointerId, m); try { el.setPointerCapture(e.pointerId); } catch (x) { /* */ }
      if (ptr.size === 2) { const [p, q] = Array.from(ptr.values()); pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), cx: (p.x + q.x) / 2 }; this.drag = null; clearTimeout(longT); return; }
      if (e.button === 1) { e.preventDefault(); } 
      if (e.button === 2) return;
      this.down = m; this.mouse = m;
      if (e.pointerType === 'touch') { clearTimeout(longT); longT = setTimeout(() => { longT = null; if (this.drag && this.drag.k === 'pan' && !this.drag.moved) { this.drag = { k: 'cross' }; this.paintOver(); } }, 350); }
      const sep = this.sepAt(m.y);
      if (sep === -1 && m.x < this.axL + this.pw) { this.drag = { k: 'msep' }; return; }
      if (sep && m.x < this.axL + this.pw) { this.drag = { k: 'sep', i: sep, y: m.y, h0: this.panes[sep - 1].h, h1: this.panes[sep].h }; return; }
      if (m.x > this.axL + this.pw && m.y < this.hh - TH) { const p = this.paneAt(m.y); if (p) { const s = this.sc(p, 'right'); this.drag = { k: 'axis', p, s, y: m.y, a: s.f(s.min), b: s.f(s.max) }; } return; }
      if (m.x < this.axL && m.y < this.hh - TH) { const p = this.paneAt(m.y); if (p && p.sc.left) { const s = p.sc.left; this.drag = { k: 'axis', p, s, y: m.y, a: s.f(s.min), b: s.f(s.max) }; } return; }
      if (m.y >= this.hh - TH) { this.drag = { k: 'time', x: m.x, bs: this.bs, i: this.iX(this.axL + this.pw) }; return; }
      if (e.shiftKey && !A.tool) { A.setTool('measure'); }
      if (this.draw_.down(m, e)) { this.drag = { k: 'draw' }; return; }
      if (A.trade && A.trade.grab(this, m)) { this.drag = { k: 'trade' }; return; }
      const p = this.paneAt(m.y); const s = p && this.sc(p, 'right');
      this.drag = { k: 'pan', x: m.x, y: m.y, ro: this.ro, p, s, a: s ? s.f(s.min) : 0, b: s ? s.f(s.max) : 0, moved: false };
      vel = 0; lastMv = performance.now();
    });
    const up = e => {
      const m = pos(e); ptr.delete(e.pointerId); clearTimeout(longT); longT = null; if (pinch) { if (ptr.size < 2) pinch = null; this.drag = null; A.touch('view'); return; }
      const d = this.drag; this.drag = null; if (!d) return;
      if (d.k === 'draw') { this.draw_.up(m, e); }
      else if (d.k === 'trade') A.trade.drop(this, m);
      else if (d.k === 'sep' || d.k === 'msep') A.touch(); else if (d.k === 'axis' || d.k === 'time') A.touch('view');
      else if (d.k === 'pan') {
        if (!d.moved) { this.draw_.click(m, e); this.clickStudy(m); }
        else { A.touch('view'); if (e.pointerType === 'touch' && Math.abs(d.vx || 0) > 0.3 && performance.now() - d.tl < 60) this.kinetic(d.vx); }
      }
      if (e.pointerType === 'touch') { this.mouse = null; }
      this.hoverCursor(m); this.paintOver();
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', e => { ptr.delete(e.pointerId); pinch = null; this.drag = null; });
    el.addEventListener('wheel', e => {
      e.preventDefault(); this.kinStop = true; const m = pos(e);
      if (m.x > this.axL + this.pw && m.y < this.hh - TH) { const p = this.paneAt(m.y); if (p) this.scaleY(p, this.sc(p, 'right'), Math.exp(e.deltaY * 0.0015)); return; }
      const dx = e.deltaMode ? e.deltaX * 16 : e.deltaX, dy = e.deltaMode ? e.deltaY * 16 : e.deltaY;
      if (e.ctrlKey || e.metaKey) { this.zoom(Math.exp(-dy * 0.01), m.x); this.app.touch('view'); return; }
      if (Math.abs(dx) > Math.abs(dy) * 1.2 || e.shiftKey) { this.ro += (e.shiftKey && !dx ? dy : dx) / this.bs; this.clampRo(); this.invalidate(); A.onView(this); }
      else this.zoom(Math.exp(-U.clamp(dy, -120, 120) * 0.0022), A.settings.zoomRight ? undefined : m.x);
      A.touch('view');
    }, { passive: false });
    el.addEventListener('dblclick', e => {
      const m = pos(e);
      if (m.x > this.axL + this.pw) { const p = this.paneAt(m.y); if (p) this.autoScale(p); return; }
      if (m.y >= this.hh - TH) { this.reset(); A.touch('view'); return; }
      if (this.draw_.dbl(m, e)) return;
      const st = this.studyAt(m); if (st) { A.studyDialog(this, st); return; }
      const p = this.paneAt(m.y); if (p && this.panes.length > 1) { this.cell.max = this.cell.max ? null : p.id; this.lgKey = null; this.invalidate(); A.touch(); }
    });
    el.addEventListener('contextmenu', e => { e.preventDefault(); const m = pos(e); if (this.draw_.cancelTool()) return; A.contextMenu(this, m, e); });
  }
  kinetic(v) { this.kinStop = false; let last = performance.now(); const st = () => { if (this.kinStop || this.dead) return; const n = performance.now(), dt = n - last; last = n; this.ro -= v * dt / this.bs; v *= Math.pow(0.95, dt / 16); this.clampRo(); this.invalidate(); if (Math.abs(v) > 0.02) requestAnimationFrame(st); else this.app.onView(this); }; requestAnimationFrame(st); }
  hoverCursor(m) { const t = this.app.tool; let c = 'crosshair'; if (m.x > this.axL + this.pw || m.x < this.axL) c = m.y < this.hh - TH ? 'ns-resize' : 'default'; else if (m.y >= this.hh - TH) c = 'ew-resize'; else if (this.sepAt(m.y)) c = 'row-resize'; else if (!t) { const h = this.draw_.hit(m); if (h) c = h.handle != null ? 'grab' : 'pointer'; else if (this.app.trade && this.app.trade.hit(this, m)) c = 'ns-resize'; else if (this.app.cursor === 'arrow') c = 'default'; else if (this.app.cursor === 'dot') c = 'none'; } else if (t === 'eraser') c = 'cell'; this.ov.style.cursor = c; }
  onDrag(m, e) {
    const d = this.drag, A = this.app;
    if (d.k === 'pan') {
      if (!d.moved && Math.hypot(m.x - d.x, m.y - d.y) < 4) return; d.moved = true;
      const now = performance.now(); if (d.tl) { d.vx = (m.x - d.lx) / Math.max(1, now - d.tl); } d.tl = now; d.lx = m.x;
      this.ro = d.ro - (m.x - d.x) / this.bs; this.clampRo();
      const st = this.cell.scale; const isMain = d.p && d.p.id === 'main'; const au = isMain ? st.auto !== false : d.s && d.s.auto !== false;
      if (d.s && (!au || (e && (e.ctrlKey || e.metaKey)))) { const k = (m.y - d.y) / d.s.h * (d.b - d.a) * (d.s.inv ? -1 : 1); this.setRange(d.p, d.s, d.a + k, d.b + k); }
      this.mouse = m; this.invalidate(); A.onView(this); this.syncCross(m);
    } else if (d.k === 'axis') { const f = Math.exp((m.y - d.y) * 0.006); const mid = (d.a + d.b) / 2, h = (d.b - d.a) / 2 * f; this.setRange(d.p, d.s, mid - h, mid + h); this.invalidate(); }
    else if (d.k === 'time') { const f = Math.exp((m.x - d.x) * -0.006 * -1); this.bs = U.clamp(d.bs * Math.exp((m.x - d.x) * 0.006), 0.35, 220); this.ro = d.i - (this.bars.T.length - 1) - 0.5; this.clampRo(); this.invalidate(); A.onView(this); }
    else if (d.k === 'sep') { const dy = m.y - d.y, tot = d.h0 + d.h1, h0 = U.clamp(d.h0 + dy, 30, tot - 30); const ph = this.cell.ph, p0 = this.panes[d.i - 1], p1 = this.panes[d.i]; const sum = ph[p0.id] + ph[p1.id]; ph[p0.id] = sum * h0 / tot; ph[p1.id] = sum * (1 - h0 / tot); this.lgKey = null; this.invalidate(); }
    else if (d.k === 'msep') { this.cell.mainFrac = U.clamp(m.y / (this.hh - TH), 0.2, 0.85); this.lgKey = null; this.invalidate(); }
    else if (d.k === 'draw') { this.mouse = m; this.draw_.dragTo(m, e); this.paintOver(); }
    else if (d.k === 'trade') { A.trade.dragTo(this, m); this.invalidate(); }
    else if (d.k === 'cross') { this.mouse = m; this.paintOver(); this.syncCross(m); }
  }
  setRange(p, s, a, b) { s.min = s.g(a); s.max = s.g(b); if (p.id === 'main' && s.key === 'right') { const st = this.cell.scale; st.auto = false; st.min = s.min; st.max = s.max; st.sym = this.ser.id; this.app.onScale && this.app.onScale(this); } else s.auto = false; }
  scaleY(p, s, f) { const a = s.f(s.min), b = s.f(s.max), mid = (a + b) / 2, h = (b - a) / 2 * f; this.setRange(p, s, mid - h, mid + h); this.invalidate(); this.app.touch('view'); }
  autoScale(p) { if (p.id === 'main') this.cell.scale.auto = true; for (const k in p.sc) p.sc[k].auto = true; this.invalidate(); this.app.onScale && this.app.onScale(this); this.app.touch('view'); }
  syncCross(m) { const A = this.app; if (!A.sync.cross || A.charts.length < 2) return; const p = this.paneAt(m.y); A.crossT = this.tOf(Math.round(this.iX(m.x))); A.crossFrom = this; A.crossSym = this.ser.id; A.crossP = p && p.id === 'main' ? this.sc(p, 'right').p(m.y) : NaN; A.eachChart(c => c !== this && c.paintOver()); }
  studyAt(m) {
    const p = this.paneAt(m.y); if (!p) return null; const i = Math.round(this.iX(m.x)); let best = null, bd = 6;
    for (const s of this.studies) { if (s.cfg.hidden || !s.rt || this.paneOf(s) !== p.id) continue; const sc = p.sc[this.scaleKey(s)]; if (!sc) continue; for (const q of s.rt.plotList) { if (q.kind !== 'plot') continue; const v = q.data[i - (q.offset || 0)]; if (!isNum(v)) continue; let dist; if (q.style === 'histogram' || q.style === 'columns') { const y = sc.y(v), y0 = sc.y(q.base); dist = m.y >= Math.min(y, y0) - 2 && m.y <= Math.max(y, y0) + 2 ? 3 : 99; } else { const w = q.data[i + 1 - (q.offset || 0)]; dist = Math.abs(sc.y(v) - m.y); if (isNum(w)) { const a = Math.min(sc.y(v), sc.y(w)), b = Math.max(sc.y(v), sc.y(w)); if (m.y >= a - 3 && m.y <= b + 3) dist = Math.min(dist, 3); } } if (dist < bd) { bd = dist; best = s; } } }
    return best;
  }
  clickStudy(m) { if (this.app.tool || this.draw_.sel.size) return; const s = this.studyAt(m); const id = s ? s.id : null; if (id !== this.app.selStudy) { this.app.selStudy = id; this.lgKey = null; this.invalidate(); } }
  /* snapshot of the whole cell */
  snapshot() { const d = DPR(), c = U.h('canvas'); c.width = this.cv.width; c.height = this.cv.height; const x = c.getContext('2d'); x.drawImage(this.cv, 0, 0); x.scale(d, d); x.font = '600 13px ' + FONT; x.fillStyle = this.th.fg; x.textBaseline = 'top'; let y = 8; x.fillText(this.ser.sym.desc + ' · ' + AC.tfLabel(this.cell.tf) + ' · ' + F.source(this.ser.id), this.axL + 10, y); y += 18; x.font = '11px ' + FONT; for (const p of this.panes) { let yy = p.id === 'main' ? y : p.y + 6; for (const s of this.studies) if (this.paneOf(s) === p.id && !s.cfg.hidden) { x.fillText(s.title, this.axL + 10, yy); yy += 14; } } x.textAlign = 'right'; x.globalAlpha = 0.5; x.fillText('Amatu Chart · ' + new Date().toLocaleString('id-ID'), this.w - this.axR - 8, this.hh - TH - 18); return c; }
}
function rr(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function head(c, x1, y1, x2, y2, s) { const a = Math.atan2(y2 - y1, x2 - x1); c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * Math.cos(a - 0.42), y2 - s * Math.sin(a - 0.42)); c.lineTo(x2 - s * Math.cos(a + 0.42), y2 - s * Math.sin(a + 0.42)); c.closePath(); c.fill(); }
AC.rr = rr; AC.head = head; AC.FONT = FONT; AC.TH = TH;
AC.Chart = Chart;
AC.tfLabel = tf => { const p = PN.tfParse(tf); if (p.unit === 'm') return p.mult < 60 ? p.mult + 'm' : p.mult % 60 === 0 ? p.mult / 60 + 'h' : Math.floor(p.mult / 60) + 'h' + p.mult % 60 + 'm'; return p.mult + (p.unit === 'S' ? 's' : p.unit); };
})();
