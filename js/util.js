/* Amatu Chart — helpers, events, storage with autosave */
(function () {
'use strict';
const AC = window.AC = window.AC || {};
const U = AC.U = {};
U.$ = (s, r) => (r || document).querySelector(s);
U.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
U.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* h('div.cls', {on..}, ...kids) */
U.h = (tag, at, ...kids) => {
  const m = tag.split('.'); const e = document.createElement(m[0] || 'div'); if (m.length > 1) e.className = m.slice(1).join(' ');
  if (at) for (const k in at) { const v = at[k]; if (v == null || v === false) continue; if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v; else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v); else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k in e && k !== 'list' && typeof v !== 'object') { try { e[k] = v; } catch (x) { e.setAttribute(k, v); } } else e.setAttribute(k, v); }
  for (const c of kids.flat(9)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
};
U.ic = n => '<svg class="ic"><use href="#i-' + n + '"/></svg>';
U.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
U.clone = o => JSON.parse(JSON.stringify(o));
U.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
U.debounce = (f, ms) => { let t; const g = (...a) => { clearTimeout(t); t = setTimeout(() => { t = null; f(...a); }, ms); }; g.flush = () => { if (t) { clearTimeout(t); t = null; f(); } }; return g; };
/* events */
const L = {};
U.on = (n, f) => { (L[n] || (L[n] = [])).push(f); return () => { L[n] = L[n].filter(x => x !== f); }; };
U.emit = (n, d) => { for (const f of (L[n] || []).slice()) try { f(d); } catch (e) { console.error(n, e); } };
/* storage */
U.load = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
U.save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { U.emit('save-error', e); return false; } };
U.del = k => { try { localStorage.removeItem(k); } catch (e) { /* */ } };
/* numbers */
U.fmt = (x, d) => x == null || x !== x ? '—' : Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
U.price = (x, d) => x == null || x !== x ? '—' : U.fmt(x, d);
U.big = x => { if (x == null || x !== x) return '—'; const a = Math.abs(x); return a >= 1e12 ? (x / 1e12).toFixed(2) + 'T' : a >= 1e9 ? (x / 1e9).toFixed(2) + 'B' : a >= 1e6 ? (x / 1e6).toFixed(2) + 'M' : a >= 1e3 ? (x / 1e3).toFixed(2) + 'K' : a >= 1 ? x.toFixed(2) : x === 0 ? '0' : x.toPrecision(3); };
U.pct = x => x == null || x !== x ? '—' : (x >= 0 ? '+' : '') + x.toFixed(2) + '%';
U.precOf = x => { if (!(x > 0)) return 2; const s = x >= 1 ? String(+x.toFixed(10)) : x.toFixed(12).replace(/0+$/, ''); const k = s.indexOf('.'); return k < 0 ? 0 : s.length - k - 1; };
U.ago = t => { const s = (Date.now() - t) / 1000; return s < 5 ? 'baru saja' : s < 60 ? Math.floor(s) + ' dtk lalu' : s < 3600 ? Math.floor(s / 60) + ' mnt lalu' : s < 86400 ? Math.floor(s / 3600) + ' jam lalu' : Math.floor(s / 86400) + ' hari lalu'; };
/* colors */
U.rgba = (c, a) => { if (!c || c[0] !== '#') return c; const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16); const al = a === undefined ? (c.length > 7 ? parseInt(c.slice(7, 9), 16) / 255 : 1) : a; return 'rgba(' + r + ',' + g + ',' + b + ',' + al + ')'; };
U.alpha = c => c && c.length > 7 ? Math.round(parseInt(c.slice(7, 9), 16) / 2.55) : 100;
U.withA = (c, p) => c.slice(0, 7) + Math.round(p * 2.55).toString(16).padStart(2, '0');
U.lum = c => { if (!c || c[0] !== '#') return 0; return (0.299 * parseInt(c.slice(1, 3), 16) + 0.587 * parseInt(c.slice(3, 5), 16) + 0.114 * parseInt(c.slice(5, 7), 16)) / 255; };
U.ink = c => U.lum(c) > 0.6 ? '#131722' : '#ffffff';
/* toast */
U.toast = (msg, kind, ms) => {
  let w = U.$('#toasts'); if (!w) { w = U.h('div', { id: 'toasts' }); document.body.append(w); }
  const t = U.h('div.toast' + (kind ? '.' + kind : ''), { text: msg }); w.append(t);
  setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 300); }, ms || 3200); return t;
};
U.copy = async (txt, msg) => { try { await navigator.clipboard.writeText(txt); } catch (e) { const a = U.h('textarea', { value: txt, style: { position: 'fixed', opacity: 0 } }); document.body.append(a); a.select(); document.execCommand('copy'); a.remove(); } U.toast(msg || 'Disalin'); };
U.download = (name, data, type) => { const b = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain' }); const a = U.h('a', { href: URL.createObjectURL(b), download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
U.pickFile = accept => new Promise(r => { const i = U.h('input', { type: 'file', accept, style: { display: 'none' } }); i.onchange = () => { r(i.files[0] || null); i.remove(); }; document.body.append(i); i.click(); });

/* ---------- dialogs & menus ---------- */
U.dialog = (title, body, opt) => {
  opt = opt || {};
  const bg = U.h('div.dlg-bg'), d = U.h('div.dlg' + (opt.cls ? '.' + opt.cls : ''), { role: 'dialog', 'aria-label': title });
  if (opt.w) d.style.width = opt.w + 'px';
  const close = () => { if (bg.dead) return; bg.dead = true; document.removeEventListener('keydown', key, true); bg.remove(); if (opt.onclose) opt.onclose(); };
  const head = U.h('div.dlg-h', null, U.h('b', { text: title }), U.h('button.ib', { html: U.ic('x'), title: 'Tutup', 'aria-label': 'Tutup', onclick: close }));
  const bd = U.h('div.dlg-b'); if (typeof body === 'string') bd.innerHTML = body; else if (body) bd.append(...[].concat(body));
  d.append(head, bd);
  if (opt.foot) d.append(U.h('div.dlg-f', null, opt.foot));
  bg.append(d); document.body.append(bg);
  bg.addEventListener('pointerdown', e => { if (e.target === bg && !opt.sticky) close(); });
  const key = e => { if (e.key === 'Escape' && U.$$('.dlg-bg').pop() === bg) { e.stopPropagation(); close(); } };
  document.addEventListener('keydown', key, true);
  /* drag by header */
  head.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return; const r = d.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = ev => { d.style.position = 'fixed'; d.style.margin = 0; d.style.left = U.clamp(ev.clientX - ox, -r.width + 80, innerWidth - 80) + 'px'; d.style.top = U.clamp(ev.clientY - oy, 0, innerHeight - 40) + 'px'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  return { el: d, body: bd, close, bg };
};
U.confirm = (msg, yes) => new Promise(r => { let ok = false; const d = U.dialog('Konfirmasi', U.h('p', { text: msg }), { w: 380, onclose: () => r(ok), foot: [U.h('button.btn', { text: 'Batal', onclick: () => d.close() }), U.h('button.btn.pri', { text: yes || 'Ya', onclick: () => { ok = true; d.close(); } })] }); setTimeout(() => d.el.querySelector('.pri').focus(), 30); });
U.prompt = (title, val, ph) => new Promise(r => { let out = null; const i = U.h('input.inp', { value: val || '', placeholder: ph || '' }); const done = () => { out = i.value; d.close(); }; const d = U.dialog(title, i, { w: 380, onclose: () => r(out), foot: [U.h('button.btn', { text: 'Batal', onclick: () => d.close() }), U.h('button.btn.pri', { text: 'OK', onclick: done })] }); i.onkeydown = e => { if (e.key === 'Enter') done(); }; setTimeout(() => { i.focus(); i.select(); }, 30); });
let curMenu = null;
U.closeMenu = () => { if (curMenu) { const m = curMenu; curMenu = null; m.remove(); document.removeEventListener('pointerdown', m._out, true); } };
/* items: [{t, ic, k, on, sub, sep, chk, head}] at {x,y} or element */
U.menu = (items, at, opt) => {
  U.closeMenu(); opt = opt || {};
  const m = U.h('div.menu' + (opt.cls ? '.' + opt.cls : ''));
  for (const it of items) {
    if (!it) continue;
    if (it.sep) { m.append(U.h('div.msep')); continue; }
    if (it.head) { m.append(U.h('div.mhead', { text: it.head })); continue; }
    if (it.el) { m.append(it.el); continue; }
    const b = U.h('button.mi' + (it.chk ? '.on' : '') + (it.dis ? '.dis' : '') + (it.red ? '.red' : ''), { type: 'button' });
    b.innerHTML = (it.ic ? U.ic(it.ic) : it.chk !== undefined ? '<i class="ck">' + (it.chk ? '✓' : '') + '</i>' : '') + '<span>' + U.esc(it.t) + '</span>' + (it.k ? '<kbd>' + U.esc(it.k) + '</kbd>' : '');
    if (it.star !== undefined) { const s = U.h('span.mstar' + (it.star ? '.on' : ''), { html: U.ic('star') }); s.onclick = e => { e.stopPropagation(); it.onstar(); s.classList.toggle('on'); }; b.append(s); }
    b.onclick = () => { if (it.dis) return; if (!it.keep) U.closeMenu(); it.on && it.on(b); };
    m.append(b);
  }
  document.body.append(m);
  const r = at && at.getBoundingClientRect ? at.getBoundingClientRect() : null;
  let x = r ? (opt.right ? r.right - m.offsetWidth : opt.side ? r.right + 4 : r.left) : at.x, y = r ? (opt.side ? r.top : r.bottom + 4) : at.y;
  m.style.maxHeight = Math.min(innerHeight - 16, opt.maxH || 9999) + 'px';
  x = U.clamp(x, 6, Math.max(6, innerWidth - m.offsetWidth - 6));
  if (y + m.offsetHeight > innerHeight - 6) y = r && !opt.side ? Math.max(6, r.top - m.offsetHeight - 4 < 6 ? innerHeight - m.offsetHeight - 6 : r.top - m.offsetHeight - 4) : Math.max(6, innerHeight - m.offsetHeight - 6);
  m.style.left = x + 'px'; m.style.top = y + 'px';
  m._out = e => { if (!m.contains(e.target)) { if (at && at.contains && at.contains(e.target)) e._menuToggle = true; U.closeMenu(); } };
  setTimeout(() => document.addEventListener('pointerdown', m._out, true), 0);
  curMenu = m; return m;
};
/* color picker popover */
const PAL = ['#ffffff', '#d1d4dc', '#b2b5be', '#787b86', '#5d606b', '#434651', '#2a2e39', '#131722', '#000000', '#880e4f',
  '#f23645', '#ff9800', '#fdd835', '#4caf50', '#089981', '#00bcd4', '#2962ff', '#673ab7', '#9c27b0', '#e91e63',
  '#fccbcd', '#ffe0b2', '#fff9c4', '#c8e6c9', '#ace5dc', '#b2ebf2', '#bbd9fb', '#d1c4e9', '#e1bee7', '#f8bbd0',
  '#f77c80', '#ffb74d', '#fff176', '#81c784', '#42bda8', '#4dd0e1', '#5b9cf6', '#9575cd', '#ba68c8', '#f06292',
  '#b22833', '#f57c00', '#fbc02d', '#388e3c', '#056656', '#0097a7', '#1848cc', '#512da8', '#7b1fa2', '#c2185b',
  '#801922', '#e65100', '#f57f17', '#1b5e20', '#00332a', '#006064', '#0c3299', '#311b92', '#4a148c', '#880e4f'];
U.colorBtn = (val, on) => {
  let cur = val || '#2962ff';
  const b = U.h('button.cbtn', { type: 'button', title: 'Warna' }); const paint = () => { b.innerHTML = '<i style="background:' + U.rgba(cur) + '"></i>'; }; paint();
  b.onclick = () => {
    const box = U.h('div.cpick'); const grid = U.h('div.cgrid');
    for (const c of PAL) grid.append(U.h('button', { type: 'button', style: { background: c }, title: c, onclick: () => { cur = U.withA(c, U.alpha(cur)); if (U.alpha(cur) === 100) cur = c; apply(); } }));
    const hex = U.h('input.inp', { type: 'color', value: cur.slice(0, 7) }); hex.oninput = () => { cur = U.alpha(cur) === 100 ? hex.value : U.withA(hex.value, U.alpha(cur)); apply(); };
    const op = U.h('input', { type: 'range', min: 0, max: 100, value: U.alpha(cur) }); const lab = U.h('span', { text: U.alpha(cur) + '%' });
    op.oninput = () => { cur = +op.value === 100 ? cur.slice(0, 7) : U.withA(cur, +op.value); lab.textContent = op.value + '%'; apply(true); };
    const apply = k => { paint(); on(cur); if (!k) { hex.value = cur.slice(0, 7); } };
    box.append(grid, U.h('label.crow', null, 'Kustom', hex), U.h('label.crow', null, 'Opasitas', op, lab));
    U.menu([{ el: box }], b, { cls: 'pop' });
  };
  b.set = v => { cur = v; paint(); };
  return b;
};
})();
