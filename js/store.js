/* Amatu Chart — layouts: autosave on every change, version history, multi-device merge */
(function () {
'use strict';
const AC = window.AC, U = AC.U;
const ST = AC.Store = {};
const K = id => 'tradingview.layout.' + id;
/* ---------- version history (IndexedDB, ring of 40 per layout) ---------- */
let dbp = null;
function db() { if (dbp) return dbp; dbp = new Promise((res, rej) => { const r = indexedDB.open('amatu-tradingview', 1); r.onupgradeneeded = () => r.result.createObjectStore('versions'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); dbp.catch(() => { dbp = null; }); return dbp; }
const tx = async (mode, f) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('versions', mode), s = t.objectStore('versions'); const r = f(s); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); }); };
ST.snapshot = async (doc, label) => {
  try {
    const keys = (await tx('readonly', s => s.getAllKeys())).filter(k => String(k).startsWith(doc.id + '|')).sort();
    const key = doc.id + '|' + String(Date.now()).padStart(14, '0');
    await tx('readwrite', s => s.put({ t: Date.now(), name: doc.name, label: label || 'Otomatis', data: JSON.stringify(doc) }, key));
    const auto = keys; if (auto.length >= 40) await tx('readwrite', s => { for (const k of auto.slice(0, auto.length - 39)) s.delete(k); });
  } catch (e) { /* private window */ }
};
ST.versions = async id => { try { const keys = (await tx('readonly', s => s.getAllKeys())).filter(k => String(k).startsWith(id + '|')).sort().reverse(); const out = []; for (const k of keys) { const v = await tx('readonly', s => s.get(k)); out.push({ k, t: v.t, name: v.name, label: v.label, data: v.data }); } return out; } catch (e) { return []; } };
/* ---------- layouts ---------- */
ST.index = () => U.load('tradingview.layouts', []).filter(x => x && x.id);
ST.setIndex = l => U.save('tradingview.layouts', l);
ST.newDoc = (name, cell) => ({ id: U.uid(), name: name || 'Tanpa nama', grid: '1', cells: [Object.assign({ id: U.uid(), sym: 'BINANCE:BTCUSDT', tf: '1D', type: 'candles', studies: [], compares: [], scale: { auto: true }, bs: 8, ro: 8 }, cell || {})], draw: {}, del: {}, sync: { sym: false, tf: false, cross: true, time: false, draw: true }, mt: Date.now() });
ST.load = id => { const d = U.load(K(id), null); if (!d || !d.cells || !d.cells.length) return null; d.draw = d.draw || {}; d.del = d.del || {}; d.sync = d.sync || { cross: true, draw: true }; return d; };
let base = new Map(), baseMt = 0;
const eachDraw = (doc, f) => { for (const s in doc.draw) for (const d of doc.draw[s]) f(d, s); };
ST.rebase = doc => { base = new Map(); baseMt = doc.mt || 0; eachDraw(doc, d => base.set(d.id, JSON.stringify(d))); };
ST.save = doc => {
  const now = Date.now(); const seen = new Set();
  eachDraw(doc, d => { seen.add(d.id); const j = JSON.stringify(d); if (base.get(d.id) !== j) d.mt = now; });
  for (const id of base.keys()) if (!seen.has(id)) doc.del[id] = now;
  for (const id of seen) delete doc.del[id];
  for (const id in doc.del) if (now - doc.del[id] > 60 * 864e5) delete doc.del[id];
  /* another tab or device saved in between: keep both sides' drawings */
  const cur = U.load(K(doc.id), null); let merged = false;
  if (cur && cur.mt > baseMt && cur.mt !== doc.mt) merged = ST.merge(doc, cur);
  doc.mt = now;
  const ok = U.save(K(doc.id), doc);
  if (ok) { const ix = ST.index(); const e = ix.find(x => x.id === doc.id); const info = { id: doc.id, name: doc.name, mt: now, sym: doc.cells[0].sym, tf: doc.cells[0].tf, n: doc.cells.length }; if (e) Object.assign(e, info); else ix.unshift(info); ST.setIndex(ix); ST.rebase(doc); }
  return { ok, merged };
};
ST.merge = (doc, cur) => {
  let ch = false;
  for (const s in cur.draw) for (const d of cur.draw[s]) {
    const mine = (doc.draw[s] || []).find(x => x.id === d.id);
    if (!mine) { if (doc.del[d.id] && doc.del[d.id] >= (d.mt || 0)) continue; (doc.draw[s] || (doc.draw[s] = [])).push(d); ch = true; }
    else if ((d.mt || 0) > (mine.mt || 0)) { for (const k of Object.keys(mine)) delete mine[k]; Object.assign(mine, d); ch = true; }
  }
  for (const id in cur.del || {}) { for (const s in doc.draw) { const k = doc.draw[s].findIndex(d => d.id === id && (d.mt || 0) < cur.del[id]); if (k >= 0) { doc.draw[s].splice(k, 1); ch = true; } } if (!doc.del[id]) doc.del[id] = cur.del[id]; }
  return ch;
};
ST.remove = id => { U.del(K(id)); ST.setIndex(ST.index().filter(x => x.id !== id)); };
ST.key = K;
/* ---------- full backup ---------- */
ST.exportAll = () => { const o = { app: 'amatu-chart', v: 1, t: Date.now(), data: {} }; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('tradingview.')) o.data[k] = localStorage.getItem(k); } return JSON.stringify(o); };
ST.importAll = txt => { const o = JSON.parse(txt); if (o.app !== 'amatu-chart') throw new Error('Bukan berkas cadangan Amatu Chart'); for (const k in o.data) if (k.startsWith('tradingview.')) localStorage.setItem(k, o.data[k]); };
if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => { });
})();
