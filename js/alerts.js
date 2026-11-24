/* Amatu Chart — alerts: price, drawings, indicators; unlimited; sound + notification + webhook; missed-trigger check on load */
(function () {
'use strict';
const AC = window.AC, U = AC.U, F = AC.F, PN = window.AC_PINE;
const A = AC.Alerts = {};
let list = U.load('tradingview.alerts', []), log = U.load('tradingview.alertlog', []);
const subs = new Map();
let app = null;
A.list = () => list; A.log = () => log;
const save = () => { U.save('tradingview.alerts', list); U.emit('alerts'); };
A.save = save;
A.init = a => { app = a; addEventListener('storage', e => { if (e.key === 'tradingview.alerts') { list = U.load('tradingview.alerts', []); resub(); U.emit('alerts'); } if (e.key === 'tradingview.alertlog') { log = U.load('tradingview.alertlog', []); U.emit('alerts'); } }); resub(); setTimeout(catchUp, 4000); U.on('quotes', ids => { for (const id of ids) check(id); }); document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(catchUp, 1500); }); };
A.CONDS = [['cross', 'Menyilang'], ['up', 'Menyilang naik'], ['dn', 'Menyilang turun'], ['gt', 'Lebih besar dari'], ['lt', 'Lebih kecil dari'], ['in', 'Masuk kanal'], ['out', 'Keluar kanal'], ['pctup', 'Naik % dalam N menit'], ['pctdn', 'Turun % dalam N menit']];
A.FREQ = [['once', 'Sekali saja'], ['bar', 'Sekali per bar'], ['close', 'Sekali per penutupan bar'], ['min', 'Sekali per menit']];
A.add = a => { a.id = a.id || U.uid(); a.on = a.on !== false; a.ct = a.ct || Date.now(); a.chk = Date.now(); delete a.last; list.unshift(a); save(); resub(); if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => { }); app.eachChart(c => c.invalidate()); return a; };
A.update = a => { a.chk = Date.now(); save(); resub(); app.eachChart(c => c.invalidate()); };
A.remove = id => { list = list.filter(x => x.id !== id); save(); resub(); app.eachChart(c => c.invalidate()); };
A.clearLog = () => { log = []; U.save('tradingview.alertlog', log); U.emit('alerts'); };
A.levels = sym => list.filter(a => a.on && a.kind === 'price' && a.sym === sym && a.v > 0 && !/^pct/.test(a.cond)).map(a => ({ v: a.v, a }));
A.onDrawRemoved = id => { if (list.some(a => a.draw === id)) { list = list.filter(a => a.draw !== id); save(); } };
function resub() { const want = new Set(list.filter(a => a.on && (a.kind === 'price' || a.kind === 'draw')).map(a => a.sym)); for (const [s, un] of subs) if (!want.has(s)) { un(); subs.delete(s); } for (const s of want) if (!subs.has(s)) subs.set(s, F.quote(s)); }
const hist = new Map();
function test(a, p, q, v1, v2) {
  const lo = Math.min(v1, v2), hi = Math.max(v1, v2);
  switch (a.cond) {
    case 'up': return q < v1 && p >= v1; case 'dn': return q > v1 && p <= v1; case 'cross': return (q < v1 && p >= v1) || (q > v1 && p <= v1); case 'gt': return p > v1; case 'lt': return p < v1;
    case 'in': return (q < lo || q > hi) && p >= lo && p <= hi; case 'out': return q >= lo && q <= hi && (p < lo || p > hi);
  }
  return false;
}
function check(id) {
  const q = F.quotes[id]; if (!q || !(q.last > 0)) return; const p = q.last, now = Date.now();
  let h = hist.get(id); if (!h) hist.set(id, h = []); if (!h.length || now - h[h.length - 1][0] > 2000) { h.push([now, p]); while (h.length && now - h[0][0] > 4 * 36e5) h.shift(); }
  for (const a of list) {
    if (!a.on || a.sym !== id) continue;
    if (a.exp && now > a.exp) { a.on = false; save(); continue; }
    const prev = a.last; a.last = p;
    if (a.kind === 'price') {
      if (/^pct/.test(a.cond)) { const t0 = now - (a.mins || 5) * 60000; const b = h.find(x => x[0] >= t0); if (b) { const ch = (p / b[1] - 1) * 100; if (a.cond === 'pctup' ? ch >= a.v : ch <= -a.v) fire(a, p, U.pct(ch) + ' dalam ' + (a.mins || 5) + ' menit'); } continue; }
      if (prev === undefined) { if (/^[gl]t$/.test(a.cond) && test(a, p, p, a.v, a.v2)) fire(a, p); continue; }
      if (test(a, p, prev, a.v, a.v2)) { if (a.freq === 'close') a.wait = true; else fire(a, p); }
    } else if (a.kind === 'draw') {
      if (prev === undefined) continue; const d = findDraw(a); if (!d) continue;
      const vs = AC.DrawLayer.priceAt(d, now);
      for (let k = 0; k < vs.length; k++) if (test(Object.assign({}, a, { cond: /^(up|dn|cross)$/.test(a.cond) ? a.cond : 'cross' }), p, prev, vs[k])) { fire(a, p, 'level ' + U.fmt(vs[k], F.info(id).prec)); break; }
    }
  }
}
function findDraw(a) { const doc = app.doc; for (const s in doc.draw) { const d = doc.draw[s].find(x => x.id === a.draw); if (d) return d; } return a.snap || null; }
const lastFire = new Map();
function fire(a, price, extra, ts) {
  const now = ts || Date.now(); const bar = PN.tfFloor(now, a.tf || '1');
  if (a.freq === 'bar' && a.lf && PN.tfFloor(a.lf, a.tf || '1') === bar) return;
  if (a.freq === 'min' && a.lf && now - a.lf < 60000) return;
  if ((a.freq === 'bar' || a.freq === 'min' || a.freq === 'close') && a.lf && now - a.lf < 5000) return;
  const fk = U.load('pt.tradingview.fired', {}); if (fk[a.id] && Math.abs(now - fk[a.id]) < 4000) { if (a.freq === 'once') a.on = false; return; } fk[a.id] = now; for (const k in fk) if (Date.now() - fk[k] > 864e5) delete fk[k]; U.save('pt.tradingview.fired', fk);   // another tab already fired it
  a.lf = now; a.n = (a.n || 0) + 1; if (a.freq === 'once') a.on = false;
  const inf = F.info(a.sym);
  const msg = (a.msg || inf.ticker + ' ' + A.desc(a)).replace(/\{\{ticker\}\}/g, inf.ticker).replace(/\{\{exchange\}\}/g, inf.prefix).replace(/\{\{close\}\}|\{\{price\}\}/g, U.fmt(price, inf.prec)).replace(/\{\{interval\}\}/g, a.tf || '').replace(/\{\{time\}\}|\{\{timenow\}\}/g, new Date(now).toISOString()) + (extra ? ' (' + extra + ')' : '');
  save(); resub(); A.notify({ sym: a.sym, tf: a.tf, msg, price, t: now, name: a.name, id: a.id, late: !!ts }, a);
  app.eachChart(c => c.invalidate());
}
/* shared by price alerts, script alerts and incoming webhooks */
A.notify = (n, a) => {
  a = a || {};
  log.unshift({ t: n.t || Date.now(), sym: n.sym, tf: n.tf, msg: n.msg, p: n.price, src: n.src, id: n.id }); log = log.slice(0, 500); U.save('tradingview.alertlog', log); U.emit('alerts'); U.emit('alert-fired', n);
  if (a.sound !== false && app.settings.alertSound !== false) A.beep(a.snd || app.settings.alertSnd || 'ding');
  if (a.popup !== false) { const t = U.h('div.alpop', null, U.h('div.alh', { html: U.ic('bell') }, U.h('b', { text: n.src === 'tv' ? 'TradingView' : n.sym ? F.info(n.sym).ticker : 'Alert' }), U.h('span', { text: new Date(n.t || Date.now()).toLocaleTimeString('id-ID') + (n.late ? ' · saat Anda pergi' : '') }), U.h('button.ib', { html: U.ic('x'), onclick: () => t.remove() })), U.h('div.alm', { text: n.msg })); t.querySelector('.alm').onclick = () => { if (n.sym) app.setSymbol(n.sym); t.remove(); }; (U.$('#alpops') || document.body.appendChild(U.h('div', { id: 'alpops' }))).prepend(t); setTimeout(() => t.remove(), 60000); }
  if ('Notification' in window && Notification.permission === 'granted' && app.settings.alertNotif !== false) { try { const x = new Notification(n.sym ? F.info(n.sym).ticker + ' — Amatu Chart' : 'Amatu Chart', { body: n.msg, tag: n.id || 'ac' }); x.onclick = () => { window.focus(); if (n.sym) app.setSymbol(n.sym); }; } catch (e) { /* mobile */ } }
  if (a.hook) { try { fetch(a.hook, { method: 'POST', mode: 'no-cors', headers: { 'content-type': 'text/plain' }, body: n.msg }); } catch (e) { /* */ } }
};
let ac = null;
A.beep = kind => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); const seq = { ding: [[880, 0, .25], [1320, .12, .35]], alarm: [[700, 0, .18], [900, .2, .18], [700, .4, .18], [900, .6, .18]], soft: [[520, 0, .5]], up: [[523, 0, .12], [659, .12, .12], [784, .24, .3]], down: [[784, 0, .12], [659, .12, .12], [523, .24, .3]] }[kind] || [[880, 0, .3]]; for (const [f, d, l] of seq) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ac.destination); const t = ac.currentTime + d; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + l); o.start(t); o.stop(t + l + 0.02); } } catch (e) { /* no audio yet */ } };
A.desc = a => { const inf = F.info(a.sym || 'BINANCE:BTCUSDT'); const c = (A.CONDS.find(x => x[0] === a.cond) || ['', ''])[1]; if (a.kind === 'study') return (a.study || '') + ': ' + (a.ctitle || 'alert()'); if (a.kind === 'draw') return c + ' gambar ' + (a.dname || ''); if (/^pct/.test(a.cond)) return (a.cond === 'pctup' ? 'Naik ' : 'Turun ') + a.v + '% dalam ' + (a.mins || 5) + ' menit'; return c + ' ' + U.fmt(a.v, inf.prec) + (a.cond === 'in' || a.cond === 'out' ? ' – ' + U.fmt(a.v2, inf.prec) : ''); };
/* script alerts: alertcondition() + alert() */
A.fromStudy = (study, queue) => { const al = list.filter(a => a.on && a.kind === 'study' && a.sid === study.id); if (!al.length) return; for (const a of al) if (a.cid === 'fn') for (const q of queue) { const key = a.id + q.id + (q.freq === 'freq_all' ? Math.random() : q.time); if (lastFire.has(key)) continue; lastFire.set(key, 1); fireS(a, study, q.message); } };
A.afterStudies = chart => {
  for (const a of list) { if (!a.on || a.kind !== 'study' || a.cid === 'fn') continue; const s = chart.studies.find(x => x.id === a.sid); if (!s || !s.rt) continue;
    if (a.cid === 'plot') { const p = s.rt.plotList.find(x => x.title === a.plot); if (!p) continue; const n = p.data.length, i = a.freq === 'close' ? n - 2 : n - 1; if (i < 1) continue; const v = p.data[i], w = p.data[i - 1]; if (test(a, v, w, a.v, a.v2)) { const k = a.id + chart.bars.T[i]; if (!lastFire.has(k)) { lastFire.set(k, 1); if (chart.bars.T[i] >= (a.chk || 0) - chart.ser.ms * 2) fireS(a, s, s.title + ' ' + a.plot + ' ' + U.fmt(v, 4)); } } continue; }
    const c = Object.values(s.rt.acs).find(x => x.title === a.ctitle); if (!c) continue; const n = chart.bars.T.length, i = a.freq === 'close' || a.freq === 'bar' || a.freq === 'once' ? (a.freq === 'close' ? n - 2 : n - 1) : n - 1;
    if (c.data[i]) { const k = a.id + chart.bars.T[i]; if (lastFire.has(k)) continue; lastFire.set(k, 1); if (chart.bars.T[i] + chart.ser.ms < (a.chk || 0)) continue; fireS(a, s, c.message || c.title); } }
};
function fireS(a, s, msg) { const c = s.chart, n = c.bars.T.length - 1; a.sym = c.ser.id; a.tf = c.cell.tf; const m = String(a.msg || msg).replace(/\{\{open\}\}/g, c.bars.O[n]).replace(/\{\{high\}\}/g, c.bars.H[n]).replace(/\{\{low\}\}/g, c.bars.L[n]).replace(/\{\{volume\}\}/g, c.bars.V[n]).replace(/\{\{plot_(\d+)\}\}/g, (_, k) => { const p = s.rt.plotList.filter(x => x.kind === 'plot')[+k]; return p ? p.data[n] : ''; }).replace(/\{\{plot\("([^"]+)"\)\}\}/g, (_, t) => { const p = s.rt.plotList.find(x => x.title === t); return p ? p.data[n] : ''; }); const keep = a.msg; a.msg = m; fire(a, c.bars.C[n]); a.msg = keep; save(); }
/* candles closed while this page was away */
async function catchUp() {
  for (const a of list.slice()) {
    if (!a.on || (a.kind !== 'price' && a.kind !== 'draw') || /^pct/.test(a.cond)) continue; const from = Math.max(a.chk || a.ct || 0, U.load('pt.tradingview.alchk', 0)), now = Date.now(); if (now - from < 90000) continue;
    const mins = (now - from) / 60000, tf = mins < 900 ? '1' : mins < 4500 ? '5' : '15';
    try { const d = await F.fetchBars(a.sym, F.baseTf(a.sym.split(':')[0], tf), 0, Math.min(1000, Math.ceil((now - from) / PN.tfParse(tf).ms) + 2)); let prev = null; const dr = a.kind === 'draw' ? findDraw(a) : null; for (const k of d) { if (k[0] < from) { prev = k[4]; continue; } const lv = dr ? AC.DrawLayer.priceAt(dr, k[0]) : [a.v]; let hit = false; for (const v of lv) { const up = k[2] >= v && (prev === null ? k[1] : prev) < v, dn = k[3] <= v && (prev === null ? k[1] : prev) > v; if (a.cond === 'up' ? up : a.cond === 'dn' ? dn : a.cond === 'gt' ? k[2] > v : a.cond === 'lt' ? k[3] < v : up || dn) { hit = true; break; } } if (hit) { fire(a, k[4], null, k[0]); break; } prev = k[4]; } } catch (e) { /* offline */ }
  }
  U.save('pt.tradingview.alchk', Date.now());
}
/* when this device last watched prices (device only, so it never causes account sync traffic) */
setInterval(() => { if (app && list.some(a => a.on)) U.save('pt.tradingview.alchk', Date.now()); }, 30000);
/* bar close alerts */
setInterval(() => { for (const a of list) if (a.on && a.wait) { const bar = PN.tfFloor(Date.now(), a.tf || '1'); if (a.wb === undefined) a.wb = bar; if (bar !== a.wb) { a.wait = false; a.wb = undefined; const q = F.quotes[a.sym]; if (q && (a.cond === 'dn' || a.cond === 'lt' ? q.last <= a.v : a.cond === 'up' || a.cond === 'gt' ? q.last >= a.v : true)) fire(a, q.last); } } }, 1000);
})();
