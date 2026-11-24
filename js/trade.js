/* Amatu Chart — paper trading + bar replay */
(function () {
'use strict';
const AC = window.AC, U = AC.U, F = AC.F, PN = window.AC_PINE;
/* ---------- paper account ---------- */
class Trade {
  constructor(app) {
    this.app = app; this.load(); this.subs = new Map(); this.resub();
    U.on('quotes', ids => { for (const id of ids) if (!app.charts.some(c => c.replay && c.ser.id === id)) this.tick(id, F.quotes[id].last); });
    addEventListener('storage', e => { if (e.key === 'tradingview.trade') { this.load(); this.resub(); this.refresh(); } });
  }
  load() { this.s = U.load('tradingview.trade', null) || { bal: 10000, start: 10000, lev: 10, fee: 0.05, pos: [], ord: [], hist: [], mode: 'risk', risk: 1, qty: 0.01 }; }
  save() { U.save('tradingview.trade', this.s); this.refresh(); }
  refresh() { this.app.eachChart(c => c.invalidate()); U.emit('trade'); }
  resub() { const w = new Set(this.s.pos.concat(this.s.ord).map(x => x.sym)); for (const [k, u] of this.subs) if (!w.has(k)) { u(); this.subs.delete(k); } for (const k of w) if (!this.subs.has(k)) this.subs.set(k, F.quote(k)); }
  price(sym) { const r = this.app.charts.find(c => c.replay && c.ser.id === sym); if (r) return r.bars.C[r.bars.C.length - 1]; const q = F.quotes[sym]; return q && q.last || null; }
  pnl(p) { const x = this.price(p.sym); return x ? (x - p.ep) * p.q * p.dir : 0; }
  equity() { return this.s.bal + this.s.pos.reduce((a, p) => a + this.pnl(p), 0); }
  margin() { return this.s.pos.reduce((a, p) => a + p.ep * p.q / this.s.lev, 0); }
  place(o) {
    const px = this.price(o.sym); if (!px) return U.toast('Harga belum ada', 'err'); if (!(o.q > 0)) return U.toast('Jumlah harus lebih dari 0', 'err');
    const need = (o.p || px) * o.q / this.s.lev; if (need > this.equity() - this.margin()) return U.toast('Margin tidak cukup: perlu ' + U.fmt(need, 2) + ' (leverage 1:' + this.s.lev + ')', 'err');
    o.id = U.uid(); o.t = Date.now();
    if (o.type === 'market') this.fill(o, px); else { this.s.ord.push(o); U.toast('Order ' + o.type + ' dipasang'); }
    this.resub(); this.save();
  }
  fill(o, px) {
    const fee = px * o.q * this.s.fee / 100; this.s.bal -= fee; const opp = this.s.pos.filter(p => p.sym === o.sym && p.dir !== o.dir); let q = o.q;
    for (const p of opp) { if (q <= 1e-12) break; const k = Math.min(q, p.q); this.closePart(p, k, px, 'Dibalik'); q -= k; }
    if (q > 1e-12) this.s.pos.push({ id: U.uid(), sym: o.sym, dir: o.dir, q, ep: px, t: this.now(o.sym), sl: o.sl || null, tp: o.tp || null, fee });
    if (this.app.settings.tradeSound !== false) AC.Alerts.beep(o.dir > 0 ? 'up' : 'down');
    U.toast((o.dir > 0 ? 'Beli ' : 'Jual ') + o.q + ' ' + F.info(o.sym).ticker + ' @ ' + U.fmt(px, F.info(o.sym).prec));
  }
  now(sym) { const r = this.app.charts.find(c => c.replay && c.ser.id === sym); return r ? r.bars.T[r.bars.T.length - 1] : Date.now(); }
  closePart(p, k, px, why) { const fee = px * k * this.s.fee / 100, g = (px - p.ep) * k * p.dir; this.s.bal += g - fee; this.s.hist.unshift({ sym: p.sym, dir: p.dir, q: k, ep: p.ep, xp: px, t: p.t, xt: this.now(p.sym), pnl: g - fee - (p.fee || 0) * k / p.q, why }); this.s.hist = this.s.hist.slice(0, 1000); p.fee = (p.fee || 0) * (1 - k / p.q); p.q -= k; if (p.q <= 1e-12) this.s.pos = this.s.pos.filter(x => x !== p); }
  close(id, frac) { const p = this.s.pos.find(x => x.id === id); if (!p) return; const px = this.price(p.sym); if (!px) return; this.closePart(p, p.q * (frac || 1), px, 'Manual'); this.resub(); this.save(); }
  tick(sym, px) {
    if (!(px > 0)) return; let ch = false;
    for (const o of this.s.ord.slice()) { if (o.sym !== sym) continue; const hit = o.type === 'limit' ? (o.dir > 0 ? px <= o.p : px >= o.p) : (o.dir > 0 ? px >= o.p : px <= o.p); if (hit) { this.s.ord = this.s.ord.filter(x => x !== o); this.fill(o, o.type === 'limit' ? o.p : px); ch = true; } }
    for (const p of this.s.pos.slice()) { if (p.sym !== sym) continue; if (p.sl && (p.dir > 0 ? px <= p.sl : px >= p.sl)) { this.closePart(p, p.q, px, 'Stop loss'); U.toast('Stop loss kena', 'err'); ch = true; } else if (p.tp && (p.dir > 0 ? px >= p.tp : px <= p.tp)) { this.closePart(p, p.q, p.tp, 'Take profit'); U.toast('Take profit kena', 'ok'); ch = true; } }
    const eq = this.equity(); if (this.s.pos.length && eq <= this.margin() * 0.5) { for (const p of this.s.pos.slice()) { const x = this.price(p.sym); if (x) this.closePart(p, p.q, x, 'Likuidasi'); } U.toast('Posisi dilikuidasi (margin habis)', 'err', 6000); ch = true; }
    if (ch) { this.resub(); this.save(); } else if (this.s.pos.some(p => p.sym === sym)) U.emit('trade-tick');
  }
  levels(sym) { const out = [], inf = F.info(sym); for (const p of this.s.pos) { if (p.sym !== sym) continue; const g = this.pnl(p); out.push({ p: p.ep, col: p.dir > 0 ? '#2f7bff' : '#f23645', t: (p.dir > 0 ? 'Long ' : 'Short ') + (+p.q.toFixed(6)) + '  ' + (g >= 0 ? '+' : '') + U.fmt(g, 2), solid: true, ref: p, k: 'ep' }); if (p.sl) out.push({ p: p.sl, col: '#f23645', t: 'SL ' + U.fmt((p.sl - p.ep) * p.q * p.dir, 2), ref: p, k: 'sl' }); if (p.tp) out.push({ p: p.tp, col: '#089981', t: 'TP +' + U.fmt((p.tp - p.ep) * p.q * p.dir, 2), ref: p, k: 'tp' }); } for (const o of this.s.ord) if (o.sym === sym) out.push({ p: o.p, col: '#c98500', t: (o.dir > 0 ? 'Beli ' : 'Jual ') + o.type + ' ' + o.q, ref: o, k: 'ord' }); return out; }
  hit(ch, m) { const s = ch.panes.find(p => p.id === 'main'); if (!s || !ch.bars.T.length) return null; const sc = ch.sc(s, 'right'); for (const l of this.levels(ch.ser.id)) { if (Math.abs(sc.y(l.p) - m.y) < 6 && m.x > ch.axL + ch.pw * 0.6 && m.x < ch.axL + ch.pw * 0.62 + 190) return l; } return null; }
  grab(ch, m) { const l = this.hit(ch, m); if (!l) return false; this.dr = { l, y: m.y, moved: false, p0: l.p }; return true; }
  dragTo(ch, m) { const d = this.dr; if (!d) return; if (Math.abs(m.y - d.y) > 3) d.moved = true; if (!d.moved) return; const sc = ch.sc(ch.panes.find(p => p.id === 'main'), 'right'), mt = ch.ser.sym.mintick; let v = +(Math.round(sc.p(m.y) / mt) * mt).toFixed(10); const r = d.l.ref; if (d.l.k === 'sl') r.sl = v; else if (d.l.k === 'tp') r.tp = v; else if (d.l.k === 'ord') r.p = v; else if (d.l.k === 'ep') { if ((v - r.ep) * r.dir > 0) { r.tp = v; } else r.sl = v; } }
  drop(ch, m) { const d = this.dr; this.dr = null; if (!d) return; if (!d.moved) { const r = d.l.ref; if (d.l.k === 'ord') U.menu([{ t: 'Batalkan order', red: 1, on: () => { this.s.ord = this.s.ord.filter(x => x !== r); this.save(); } }], { x: m.e.clientX, y: m.e.clientY }); else if (d.l.k === 'ep') U.menu([{ t: 'Tutup posisi', red: 1, on: () => this.close(r.id) }, { t: 'Tutup setengah', on: () => this.close(r.id, 0.5) }, { t: 'SL ke titik impas', on: () => { r.sl = r.ep; this.save(); } }], { x: m.e.clientX, y: m.e.clientY }); else U.menu([{ t: 'Hapus ' + d.l.k.toUpperCase(), red: 1, on: () => { r[d.l.k] = null; this.save(); } }], { x: m.e.clientX, y: m.e.clientY }); } else this.save(); }
  quick(ch, dir) { this.ticket(ch.ser.id, dir); }
  /* order ticket */
  ticket(sym, dir) {
    const s = this.s, inf = F.info(sym), px = this.price(sym); if (!px) return U.toast('Harga belum ada', 'err'); const ch = this.app.charts.find(c => c.ser.id === sym); const atr = ch ? AC.atrOf(ch.bars, 14) : px * 0.01;
    const o = { sym, dir, type: 'market', q: s.qty, p: px, sl: +(px - dir * atr * 1.5).toFixed(inf.prec), tp: +(px + dir * atr * 3).toFixed(inf.prec), useSl: true, useTp: true };
    const I = (k, st) => { const i = U.h('input.inp', { type: 'number', step: st || 'any', value: o[k] }); i.oninput = () => { o[k] = +i.value; calc(); }; return i; };
    const row = (l, ...e) => U.h('label.frow', null, U.h('span', { text: l }), U.h('span.fr', null, e)); const info = U.h('div.tinfo'), qI = I('q'), pI = I('p');
    const ty = U.h('select.inp', null, [['market', 'Market'], ['limit', 'Limit'], ['stop', 'Stop']].map(x => U.h('option', { value: x[0], text: x[1] }))); ty.onchange = () => { o.type = ty.value; pI.disabled = o.type === 'market'; calc(); }; pI.disabled = true;
    const ck = (k) => { const c = U.h('input', { type: 'checkbox', checked: o[k] }); c.onchange = () => { o[k] = c.checked; calc(); }; return c; };
    const rk = U.h('input.inp', { type: 'number', step: 0.1, value: s.risk }); const byRisk = U.h('button.btn', { text: 'Hitung dari risiko %', onclick: () => { s.risk = +rk.value || 1; const e = o.type === 'market' ? this.price(sym) : o.p, d = Math.abs(e - o.sl); if (!(d > 0)) return; o.q = +(this.equity() * s.risk / 100 / d).toPrecision(4); qI.value = o.q; calc(); } });
    const calc = () => { const e = o.type === 'market' ? this.price(sym) : o.p, rr = o.useSl && o.useTp ? Math.abs(o.tp - e) / Math.abs(e - o.sl) : 0; info.innerHTML = 'Nilai <b>' + U.fmt(e * o.q, 2) + '</b> · Margin <b>' + U.fmt(e * o.q / s.lev, 2) + '</b>' + (o.useSl ? ' · Risiko <b class="dn">' + U.fmt(Math.abs(e - o.sl) * o.q, 2) + '</b>' : '') + (o.useTp ? ' · Target <b class="up">' + U.fmt(Math.abs(o.tp - e) * o.q, 2) + '</b>' : '') + (rr ? ' · R/R <b>' + rr.toFixed(2) + '</b>' : ''); };
    calc();
    const go = d => { o.dir = d; s.qty = o.q; this.place({ sym, dir: d, type: o.type, q: o.q, p: o.type === 'market' ? null : o.p, sl: o.useSl ? o.sl : null, tp: o.useTp ? o.tp : null }); dl.close(); };
    const dl = U.dialog('Order simulasi · ' + inf.ticker, [row('Jenis', ty), row('Harga', pI), row('Jumlah (' + (inf.base || 'unit') + ')', qI), row('Risiko %', rk, byRisk), row('Stop loss', ck('useSl'), I('sl')), row('Take profit', ck('useTp'), I('tp')), info], { w: 400, foot: [U.h('button.btn.sell', { text: 'JUAL', onclick: () => go(-1) }), U.h('button.btn.buy', { text: 'BELI', onclick: () => go(1) })] });
  }
}
AC.Trade = Trade;

/* ---------- replay ---------- */
const CP = AC.Chart.prototype;
CP.replayStart = function (t) { this.replay = { t, play: false, speed: this.app.settings.repSpeed || 3 }; this.replayApply(); this.app.replayBar(this); };
CP.replayApply = function () { this.rebuildBars(); for (const s of this.studies) s.dirty = true; this.runStudies(true); this.legendDirty = true; if (this.ro < 0) this.ro = 8; this.invalidate(); const b = this.bars, n = b.T.length; if (n && this.app.trade) { const j = n - 1; const seq = b.C[j] >= b.O[j] ? [b.O[j], b.L[j], b.H[j], b.C[j]] : [b.O[j], b.H[j], b.L[j], b.C[j]]; for (const p of seq) this.app.trade.tick(this.ser.id, p); } };
CP.replayStep = function (d) {
  const r = this.replay; if (!r) return; const T = this.ser.bars.T; let k = PN.lb(T, r.t + 1) - 1 + (d || 1); k = U.clamp(k, 5, T.length - 1); if (d < 0) { r.t = T[k]; this.replayApply(); return; }
  if (T[k] === r.t) { r.play = false; clearInterval(r.iv); U.toast('Replay sudah di data terbaru'); this.app.replayBar(this); return; }
  r.t = T[k]; 
  /* append one bar incrementally */
  if (this.synthOn || this.cell.type === 'ha') return this.replayApply();
  const b = this.bars, s = this.ser.bars; for (const q of ['T', 'O', 'H', 'L', 'C', 'V', 'B']) b[q].push(s[q][k]);
  if (this.ro < 0) this.ro -= 1;
  for (const x of this.studies) if (!x.cfg.hidden) { if (x.rt && !x.dirty) x.run(false); else this.queue(x); }
  const j = b.T.length - 1; if (this.app.trade) for (const p of (b.C[j] >= b.O[j] ? [b.O[j], b.L[j], b.H[j], b.C[j]] : [b.O[j], b.H[j], b.L[j], b.C[j]])) this.app.trade.tick(this.ser.id, p);
  this.legendDirty = true; this.invalidate(); AC.Alerts.afterStudies(this);
};
CP.replayPlay = function () { const r = this.replay; if (!r) return; r.play = !r.play; clearInterval(r.iv); if (r.play) r.iv = setInterval(() => this.replayStep(1), [3000, 1500, 800, 400, 200, 100, 40][U.clamp(r.speed, 0, 6)]); this.app.replayBar(this); };
CP.replayStop = function (silent) { if (!this.replay) return; clearInterval(this.replay.iv); this.replay = null; this.rebuildBars(); for (const s of this.studies) s.dirty = true; if (!silent) { this.runStudies(true); this.ro = 8; this.invalidate(); this.legendDirty = true; } this.app.replayBar(null); };
})();
