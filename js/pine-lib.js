/* Amatu Chart — Pine built-ins. T: stateful (st,R,...), RF: runtime (R,...), PF: pure (...) */
(function () {
'use strict';
const G = typeof window !== 'undefined' ? window : globalThis;
const L = G.AC_LIB = {};
const T = L.T = {}, RF = L.RF = {}, PF = L.PF = {}, CONST = L.CONST = {}, VAR = L.VAR = {};
const na = x => x == null || x !== x;
const num = x => (x == null ? NaN : +x);
L.na = na;

/* ---------- colors: '#rrggbbaa' ---------- */
const hex2 = n => { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? '0' : '') + n.toString(16); };
const cparse = L.cparse = c => {
  if (typeof c !== 'string') return null;
  if (c[0] === '#') return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), c.length > 7 ? parseInt(c.slice(7, 9), 16) / 255 : 1];
  return null;
};
const cnewCache = new Map();
PF['color.new'] = (color, transp) => {
  if (na(color)) return NaN;
  const k = color + '|' + transp; let v = cnewCache.get(k);
  if (v === undefined) { const c = color.slice(0, 7); const t = Math.max(0, Math.min(100, +transp || 0)); v = c + hex2((100 - t) * 2.55); if (cnewCache.size > 20000) cnewCache.clear(); cnewCache.set(k, v); }
  return v;
};
PF['color.rgb'] = (red, green, blue, transp) => na(red) ? NaN : '#' + hex2(red) + hex2(green) + hex2(blue) + hex2((100 - (+transp || 0)) * 2.55);
PF['color.r'] = color => { const c = cparse(color); return c ? c[0] : NaN; };
PF['color.g'] = color => { const c = cparse(color); return c ? c[1] : NaN; };
PF['color.b'] = color => { const c = cparse(color); return c ? c[2] : NaN; };
PF['color.t'] = color => { const c = cparse(color); return c ? Math.round(100 - c[3] * 100) : NaN; };
PF['color.from_gradient'] = (value, bottom_value, top_value, bottom_color, top_color) => {
  if (na(value)) return NaN;
  const a = cparse(bottom_color), b = cparse(top_color); if (!a || !b) return NaN;
  let k = (value - bottom_value) / (top_value - bottom_value); if (!(k === k)) k = 0; k = Math.max(0, Math.min(1, k));
  return '#' + [0, 1, 2].map(j => hex2(a[j] + (b[j] - a[j]) * k)).join('') + hex2((a[3] + (b[3] - a[3]) * k) * 255);
};
const COL = { aqua: '#00bcd4', black: '#363a45', blue: '#2962ff', fuchsia: '#e040fb', gray: '#787b86', green: '#4caf50', lime: '#00e676', maroon: '#880e4f', navy: '#311b92', olive: '#808000', orange: '#ff9800', purple: '#9c27b0', red: '#f23645', silver: '#b2b5be', teal: '#089981', white: '#ffffff', yellow: '#fdd835' };
for (const k in COL) CONST['color.' + k] = COL[k];
L.COL = COL;

/* ---------- enum-like constants: value = own last word ---------- */
const enums = {
  'plot.style_': 'line linebr stepline stepline_diamond steplinebr histogram cross area areabr columns circles',
  'plot.linestyle_': 'solid dashed dotted',
  'hline.style_': 'solid dotted dashed', 'line.style_': 'solid dotted dashed arrow_left arrow_right arrow_both',
  'label.style_': 'none xcross cross triangleup triangledown flag circle arrowup arrowdown label_up label_down label_left label_right label_lower_left label_lower_right label_upper_left label_upper_right label_center square diamond text_outline',
  'shape.': 'xcross cross triangleup triangledown flag circle arrowup arrowdown labelup labeldown square diamond',
  'location.': 'abovebar belowbar top bottom absolute', 'size.': 'auto tiny small normal large huge', 'position.': 'top_left top_center top_right middle_left middle_center middle_right bottom_left bottom_center bottom_right',
  'extend.': 'none left right both', 'xloc.': 'bar_index bar_time', 'yloc.': 'price abovebar belowbar', 'text.': 'align_left align_center align_right align_top align_bottom wrap_none wrap_auto format_bold format_italic format_none',
  'display.': 'all none pane data_window price_scale status_line pine_screener', 'format.': 'inherit price volume percent mintick', 'scale.': 'left right none', 'order.': 'ascending descending',
  'barmerge.': 'gaps_on gaps_off lookahead_on lookahead_off', 'alert.': 'freq_all freq_once_per_bar freq_once_per_bar_close', 'font.': 'family_default family_monospace',
  'session.': 'regular extended', 'adjustment.': 'none splits dividends', 'currency.': 'USD EUR GBP JPY USDT BTC ETH IDR AUD CAD CHF NONE',
  'strategy.': 'long short fixed cash percent_of_equity', 'strategy.commission.': 'percent cash_per_contract cash_per_order', 'strategy.oca.': 'cancel reduce none', 'strategy.direction.': 'all long short',
  'settlement_as_close.': 'on off inherit', 'backadjustment.': 'on off inherit', 'earnings.': 'actual estimate standardized', 'dividends.': 'gross net', 'splits.': 'numerator denominator'
};
for (const k in enums) for (const w of enums[k].split(' ')) CONST[k + w] = w;
CONST['shape.labelup'] = 'labelup'; CONST['display.all'] = 'all';
CONST['math.pi'] = Math.PI; CONST['math.e'] = Math.E; CONST['math.phi'] = 1.618033988749895; CONST['math.rphi'] = 0.618033988749895;
'sunday monday tuesday wednesday thursday friday saturday'.split(' ').forEach((d, i) => { CONST['dayofweek.' + d] = i + 1; });

/* ---------- math ---------- */
const m1 = (n, f) => { PF['math.' + n] = f; };
for (const f of ['sqrt', 'exp', 'log', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ceil', 'floor']) m1(f, number => na(number) ? NaN : Math[f](number));
m1('abs', number => na(number) ? NaN : Math.abs(number));
m1('sign', number => na(number) ? NaN : Math.sign(number));
m1('pow', (base, exponent) => Math.pow(num(base), num(exponent)));
PF['math.round'] = (number, precision) => { if (na(number)) return NaN; if (precision === undefined) return Math.floor(number + 0.5); const p = Math.pow(10, precision); return Math.round((number + Number.EPSILON) * p) / p; };
PF['math.max'] = (...a) => { let r = -Infinity; for (const x of a) { if (na(x)) return NaN; if (x > r) r = x; } return r; };
PF['math.min'] = (...a) => { let r = Infinity; for (const x of a) { if (na(x)) return NaN; if (x < r) r = x; } return r; };
PF['math.avg'] = (...a) => { let s = 0; for (const x of a) s += num(x); return s / a.length; };
PF['math.todegrees'] = radians => radians * 180 / Math.PI; PF['math.toradians'] = degrees => degrees * Math.PI / 180;
RF['math.round_to_mintick'] = (R, number) => { if (na(number)) return NaN; const m = R.sym.mintick; return +(Math.round(number / m) * m).toFixed(12); };
T['math.random'] = (st, R, min, max, seed) => { let x = ((seed || 1) * 16807 + (R.i + 1) * 48271) % 2147483647; x = (x * 16807) % 2147483647; const u = x / 2147483647; min = min === undefined ? 0 : min; max = max === undefined ? 1 : max; return min + u * (max - min); };
PF['nz'] = (source, replacement) => na(source) ? (replacement === undefined ? 0 : replacement) : source;
PF['na'] = x => na(x);
PF['int'] = x => na(x) ? NaN : Math.trunc(x); PF['float'] = x => num(x); PF['bool'] = x => !na(x) && !!x; PF['string'] = x => na(x) ? NaN : x; PF['color'] = x => x;
PF['iff'] = (c, a, b) => c ? a : b;
for (const k of ['line', 'label', 'box', 'table', 'linefill', 'polyline']) PF[k] = x => x;
T['fixnan'] = (st, R, source) => { if (st.v === undefined) st.v = []; const n = st.n; const v = na(source) ? (n > 0 ? st.v[n - 1] : NaN) : source; st.v[n] = v; return v === undefined ? NaN : v; };

/* ---------- windows ---------- */
/* compact buffer of non-na samples; returns count */
function push(st, x) { if (!st.a) { st.a = []; st.m = 0; st.m0 = 0; } let m = st.m0; if (!(x !== x) && x != null) st.a[m++] = +x; st.m = m; return m; }
const raw = (st, x) => { (st.r || (st.r = []))[st.n] = x; return st.r; };
function pushSum(st, x) {
  if (!st.S) st.S = [0];
  const m = push(st, x);
  if (m > st.m0) st.S[m] = st.S[m - 1] + st.a[m - 1];
  return m;
}
const len = l => { l = Math.floor(+l); return l > 0 ? l : 0; };
T['ta.sma'] = (st, R, source, length) => { const m = pushSum(st, source), l = len(length); if (!l || m < l) return NaN; return (st.S[m] - st.S[m - l]) / l; };
T['math.sum'] = (st, R, source, length) => { const m = pushSum(st, source), l = len(length); if (!l || m < l) return NaN; return st.S[m] - st.S[m - l]; };
function smooth(st, source, length, alpha) {
  const m = pushSum(st, source), l = len(length);
  if (!st.e) st.e = [];
  if (!l || m < l) { st.e[m] = NaN; return NaN; }
  if (m === st.m0) return st.e[m];
  const p = st.e[m - 1];
  return (st.e[m] = na(p) ? (st.S[m] - st.S[m - l]) / l : alpha * st.a[m - 1] + (1 - alpha) * p);
}
T['ta.ema'] = (st, R, source, length) => smooth(st, source, length, 2 / (len(length) + 1));
T['ta.rma'] = (st, R, source, length) => smooth(st, source, length, 1 / len(length));
T['ta.wma'] = (st, R, source, length) => { const m = push(st, source), l = len(length); if (!l || m < l) return NaN; let s = 0; for (let k = 0; k < l; k++) s += st.a[m - 1 - k] * (l - k); return s / (l * (l + 1) / 2); };
T['ta.swma'] = (st, R, source) => { const m = push(st, source); if (m < 4) return NaN; const a = st.a; return (a[m - 1] + 2 * a[m - 2] + 2 * a[m - 3] + a[m - 4]) / 6; };
T['ta.vwma'] = (st, R, source, length) => { const a = st.x || (st.x = {}); return T['ta.sma'](sub(st, 0), R, source * R.volume, length) / T['ta.sma'](sub(st, 1), R, R.volume, length); };
T['ta.hma'] = (st, R, source, length) => { const l = len(length); const w = 2 * T['ta.wma'](sub(st, 0), R, source, Math.floor(l / 2)) - T['ta.wma'](sub(st, 1), R, source, l); return T['ta.wma'](sub(st, 2), R, w, Math.floor(Math.sqrt(l))); };
T['ta.alma'] = (st, R, series, length, offset, sigma, floor) => { const m = push(st, series), l = len(length); if (m < l) return NaN; const mm = floor ? Math.floor(offset * (l - 1)) : offset * (l - 1), s = l / sigma; let n = 0, w = 0; for (let k = 0; k < l; k++) { const c = Math.exp(-(k - mm) * (k - mm) / (2 * s * s)); w += c; n += st.a[m - l + k] * c; } return n / w; };
T['ta.linreg'] = (st, R, source, length, offset) => { const m = push(st, source), l = len(length); if (m < l || l < 1) return NaN; let sx = 0, sy = 0, sxx = 0, sxy = 0; for (let k = 0; k < l; k++) { const y = st.a[m - l + k]; sx += k; sy += y; sxx += k * k; sxy += k * y; } const d = l * sxx - sx * sx; const b = d ? (l * sxy - sx * sy) / d : 0; const a = (sy - b * sx) / l; return a + b * (l - 1 - (offset || 0)); };
/* child states for composed functions */
function sub(st, k) { const c = st.c || (st.c = []); let x = c[k]; if (!x) x = c[k] = { n: -1, b: -1 }; if (x.b !== st.b) { x.b = st.b; x.n++; x.m0 = x.m || 0; } return x; }
L.sub = sub;
const win = (st, x, length) => { const m = push(st, x), l = len(length); return !l || m < l ? null : [m, l]; };
T['ta.highest'] = (st, R, source, length) => { if (length === undefined) { length = source; source = R.high; } const r = raw(st, source), l = len(length), n = st.n; if (n < l - 1) return NaN; let v = -Infinity, any = false; for (let k = 0; k < l; k++) { const x = r[n - k]; if (x >= v) { v = x; any = true; } } return any ? v : NaN; };
T['ta.lowest'] = (st, R, source, length) => { if (length === undefined) { length = source; source = R.low; } const r = raw(st, source), l = len(length), n = st.n; if (n < l - 1) return NaN; let v = Infinity, any = false; for (let k = 0; k < l; k++) { const x = r[n - k]; if (x <= v) { v = x; any = true; } } return any ? v : NaN; };
T['ta.highestbars'] = (st, R, source, length) => { if (length === undefined) { length = source; source = R.high; } const r = raw(st, source), l = len(length), n = st.n; if (n < l - 1) return NaN; let v = -Infinity, o = NaN; for (let k = 0; k < l; k++) { const x = r[n - k]; if (x > v) { v = x; o = -k; } } return o; };
T['ta.lowestbars'] = (st, R, source, length) => { if (length === undefined) { length = source; source = R.low; } const r = raw(st, source), l = len(length), n = st.n; if (n < l - 1) return NaN; let v = Infinity, o = NaN; for (let k = 0; k < l; k++) { const x = r[n - k]; if (x < v) { v = x; o = -k; } } return o; };
T['ta.max'] = (st, R, source) => { const v = st.v || (st.v = []); const p = st.n ? v[st.n - 1] : NaN; return (v[st.n] = na(p) ? num(source) : na(source) ? p : Math.max(p, source)); };
T['ta.min'] = (st, R, source) => { const v = st.v || (st.v = []); const p = st.n ? v[st.n - 1] : NaN; return (v[st.n] = na(p) ? num(source) : na(source) ? p : Math.min(p, source)); };
T['ta.range'] = (st, R, source, length) => { const w = win(st, source, length); if (!w) return NaN; let a = Infinity, b = -Infinity; for (let k = 0; k < w[1]; k++) { const x = st.a[w[0] - 1 - k]; a = Math.min(a, x); b = Math.max(b, x); } return b - a; };
function vari(st, source, length, biased) { const w = win(st, source, length); if (!w) return NaN; const [m, l] = w; let s = 0; for (let k = 0; k < l; k++) s += st.a[m - 1 - k]; const mean = s / l; let v = 0; for (let k = 0; k < l; k++) { const d = st.a[m - 1 - k] - mean; v += d * d; } return v / (biased === false ? l - 1 : l); }
T['ta.variance'] = (st, R, source, length, biased) => vari(st, source, length, biased);
T['ta.stdev'] = (st, R, source, length, biased) => Math.sqrt(vari(st, source, length, biased));
T['ta.dev'] = (st, R, source, length) => { const w = win(st, source, length); if (!w) return NaN; const [m, l] = w; let s = 0; for (let k = 0; k < l; k++) s += st.a[m - 1 - k]; const mean = s / l; let v = 0; for (let k = 0; k < l; k++) v += Math.abs(st.a[m - 1 - k] - mean); return v / l; };
const sorted = (st, w) => st.a.slice(w[0] - w[1], w[0]).sort((a, b) => a - b);
T['ta.median'] = (st, R, source, length) => { const w = win(st, source, length); if (!w) return NaN; const a = sorted(st, w), h = a.length >> 1; return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; };
T['ta.mode'] = (st, R, source, length) => { const w = win(st, source, length); if (!w) return NaN; const c = new Map(); let best = NaN, bc = 0; for (const x of sorted(st, w)) { const k = (c.get(x) || 0) + 1; c.set(x, k); if (k > bc) { bc = k; best = x; } } return best; };
T['ta.percentile_linear_interpolation'] = (st, R, source, length, percentage) => { const w = win(st, source, length); if (!w) return NaN; return pctl(sorted(st, w), percentage); };
T['ta.percentile_nearest_rank'] = (st, R, source, length, percentage) => { const w = win(st, source, length); if (!w) return NaN; const a = sorted(st, w); return a[Math.max(0, Math.ceil(percentage / 100 * a.length) - 1)]; };
function pctl(a, p) { const r = p / 100 * a.length - 0.5; if (r <= 0) return a[0]; if (r >= a.length - 1) return a[a.length - 1]; const f = Math.floor(r); return a[f] + (a[f + 1] - a[f]) * (r - f); }
T['ta.percentrank'] = (st, R, source, length) => { const m = push(st, source), l = len(length); if (m < l + 1) return NaN; const x = st.a[m - 1]; let c = 0; for (let k = 1; k <= l; k++) if (st.a[m - 1 - k] <= x) c++; return c / l * 100; };
T['ta.correlation'] = (st, R, source1, source2, length) => { const A = raw(sub(st, 0), source1), B = raw(sub(st, 1), source2), l = len(length), n = st.n; if (n < l - 1) return NaN; let sa = 0, sb = 0, aa = 0, bb = 0, ab = 0; for (let k = 0; k < l; k++) { const a = A[n - k], b = B[n - k]; sa += a; sb += b; aa += a * a; bb += b * b; ab += a * b; } const d = Math.sqrt((l * aa - sa * sa) * (l * bb - sb * sb)); return d ? (l * ab - sa * sb) / d : NaN; };
T['ta.cum'] = (st, R, source) => { const v = st.v || (st.v = []); const p = st.n ? v[st.n - 1] : 0; return (v[st.n] = p + (na(source) ? 0 : +source)); };
T['ta.change'] = (st, R, source, length) => { const r = raw(st, source), l = length === undefined ? 1 : len(length), p = r[st.n - l]; if (typeof source === 'boolean') return st.n >= l && p !== source; return st.n < l ? NaN : source - p; };
T['ta.mom'] = (st, R, source, length) => T['ta.change'](st, R, source, length);
T['ta.roc'] = (st, R, source, length) => { const r = raw(st, source), l = len(length), p = r[st.n - l]; return st.n < l ? NaN : 100 * (source - p) / p; };
T['ta.rising'] = (st, R, source, length) => { const r = raw(st, source); if (st.n < length) return false; for (let k = 1; k <= length; k++) if (!(source > r[st.n - k])) return false; return true; };
T['ta.falling'] = (st, R, source, length) => { const r = raw(st, source); if (st.n < length) return false; for (let k = 1; k <= length; k++) if (!(source < r[st.n - k])) return false; return true; };
/* cross functions follow the last differing side like Pine does (x[1] <= y[1]) */
T['ta.crossover'] = (st, R, source1, source2) => { const A = st.A || (st.A = []), B = st.B || (st.B = []), n = st.n; A[n] = source1; B[n] = source2; return n > 0 && source1 > source2 && A[n - 1] <= B[n - 1]; };
T['ta.crossunder'] = (st, R, source1, source2) => { const A = st.A || (st.A = []), B = st.B || (st.B = []), n = st.n; A[n] = source1; B[n] = source2; return n > 0 && source1 < source2 && A[n - 1] >= B[n - 1]; };
T['ta.cross'] = (st, R, source1, source2) => { const A = st.A || (st.A = []), B = st.B || (st.B = []), n = st.n; A[n] = source1; B[n] = source2; return n > 0 && ((source1 > source2 && A[n - 1] <= B[n - 1]) || (source1 < source2 && A[n - 1] >= B[n - 1])); };
T['ta.barssince'] = (st, R, condition) => { const v = st.v || (st.v = []); const p = st.n ? v[st.n - 1] : NaN; return (v[st.n] = condition && !na(condition) ? 0 : p + 1); };
T['ta.valuewhen'] = (st, R, condition, source, occurrence) => { if (!st.q) { st.q = []; st.m = 0; st.m0 = 0; } let m = st.m0; if (condition && !na(condition)) st.q[m++] = source; st.m = m; const k = m - 1 - (occurrence || 0); return k >= 0 ? st.q[k] : NaN; };
T['ta.rsi'] = (st, R, source, length) => { const c = T['ta.change'](sub(st, 0), R, source, 1); const u = T['ta.rma'](sub(st, 1), R, na(c) ? NaN : Math.max(c, 0), length), d = T['ta.rma'](sub(st, 2), R, na(c) ? NaN : Math.max(-c, 0), length); return na(u) || na(d) ? NaN : d === 0 ? 100 : u === 0 ? 0 : 100 - 100 / (1 + u / d); };
T['ta.macd'] = (st, R, source, fastlen, slowlen, siglen) => { const m = T['ta.ema'](sub(st, 0), R, source, fastlen) - T['ta.ema'](sub(st, 1), R, source, slowlen); const s = T['ta.ema'](sub(st, 2), R, m, siglen); return [m, s, m - s]; };
T['ta.bb'] = (st, R, series, length, mult) => { const b = T['ta.sma'](sub(st, 0), R, series, length), d = mult * T['ta.stdev'](sub(st, 1), R, series, length); return [b, b + d, b - d]; };
T['ta.bbw'] = (st, R, series, length, mult) => { const r = T['ta.bb'](st, R, series, length, mult); return (r[1] - r[2]) / r[0] * 100; };
T['ta.kc'] = (st, R, series, length, mult, useTrueRange) => { const b = T['ta.ema'](sub(st, 0), R, series, length); const s = T['ta.ema'](sub(st, 1), R, useTrueRange === false ? R.high - R.low : trv(R), length) * mult; return [b, b + s, b - s]; };
T['ta.kcw'] = (st, R, series, length, mult, useTrueRange) => { const r = T['ta.kc'](st, R, series, length, mult, useTrueRange); return (r[1] - r[2]) / r[0]; };
const trv = (R, handle) => { const pc = R.i > 0 ? R.C[R.i - 1] : NaN; return na(pc) ? R.high - R.low : Math.max(R.high - R.low, Math.abs(R.high - pc), Math.abs(R.low - pc)); };
RF['ta.tr'] = (R, handle_na) => R.i === 0 && !handle_na ? NaN : trv(R);
VAR['ta.tr'] = R => R.i === 0 ? NaN : trv(R);
T['ta.atr'] = (st, R, length) => T['ta.rma'](sub(st, 0), R, trv(R), length);
T['ta.supertrend'] = (st, R, factor, atrPeriod) => {
  const atr = T['ta.atr'](sub(st, 0), R, atrPeriod), n = st.n, src = (R.high + R.low) / 2;
  const U = st.U || (st.U = []), D = st.D || (st.D = []), V = st.V || (st.V = []), S = st.S2 || (st.S2 = []);
  let up = src + factor * atr, lo = src - factor * atr;
  const pl = na(D[n - 1]) ? 0 : D[n - 1], pu = na(U[n - 1]) ? 0 : U[n - 1], pc = R.i > 0 ? R.C[R.i - 1] : NaN;
  lo = lo > pl || pc < pl ? lo : pl; up = up < pu || pc > pu ? up : pu;
  D[n] = lo; U[n] = up;
  let dir; const ps = S[n - 1];
  if (st.natr === undefined) st.natr = [];
  st.natr[n] = atr;
  if (na(st.natr[n - 1])) dir = 1; else if (ps === pu) dir = R.close > up ? -1 : 1; else dir = R.close < lo ? 1 : -1;
  const s = dir === -1 ? lo : up; S[n] = s;
  return [na(atr) ? NaN : s, dir];
};
T['ta.dmi'] = (st, R, diLength, adxSmoothing) => {
  const i = R.i; let p = NaN, m = NaN;
  if (i > 0) { const u = R.high - R.H[i - 1], d = R.L[i - 1] - R.low; p = u > d && u > 0 ? u : 0; m = d > u && d > 0 ? d : 0; }
  const tr = T['ta.rma'](sub(st, 0), R, i === 0 ? NaN : trv(R), diLength);
  const fx = (s, v) => T.fixnan(s, R, v);
  const pl = fx(sub(st, 3), 100 * T['ta.rma'](sub(st, 1), R, p, diLength) / tr), mi = fx(sub(st, 4), 100 * T['ta.rma'](sub(st, 2), R, m, diLength) / tr);
  const sum = pl + mi; const adx = 100 * T['ta.rma'](sub(st, 5), R, Math.abs(pl - mi) / (sum === 0 ? 1 : sum), adxSmoothing);
  return [pl, mi, adx];
};
T['ta.cci'] = (st, R, source, length) => { const s = T['ta.sma'](sub(st, 0), R, source, length), d = T['ta.dev'](sub(st, 1), R, source, length); return (source - s) / (0.015 * d); };
T['ta.mfi'] = (st, R, series, length) => { const c = T['ta.change'](sub(st, 0), R, series, 1); const u = T['math.sum'](sub(st, 1), R, R.volume * (c <= 0 || na(c) ? 0 : series), length), d = T['math.sum'](sub(st, 2), R, R.volume * (c >= 0 || na(c) ? 0 : series), length); return d === 0 ? 100 : 100 - 100 / (1 + u / d); };
T['ta.stoch'] = (st, R, source, high, low, length) => { const h = T['ta.highest'](sub(st, 0), R, high, length), l = T['ta.lowest'](sub(st, 1), R, low, length); return 100 * (source - l) / (h - l); };
T['ta.wpr'] = (st, R, length) => { const h = T['ta.highest'](sub(st, 0), R, R.high, length), l = T['ta.lowest'](sub(st, 1), R, R.low, length); return 100 * (R.close - h) / (h - l); };
T['ta.cog'] = (st, R, source, length) => { const w = win(st, source, length); if (!w) return NaN; let nn = 0, d = 0; for (let k = 0; k < w[1]; k++) { const x = st.a[w[0] - 1 - k]; nn += x * (k + 1); d += x; } return -nn / d; };
T['ta.cmo'] = (st, R, series, length) => { const c = T['ta.change'](sub(st, 0), R, series, 1); const u = T['math.sum'](sub(st, 1), R, c >= 0 ? c : na(c) ? NaN : 0, length), d = T['math.sum'](sub(st, 2), R, c >= 0 ? 0 : -c, length); return 100 * (u - d) / (u + d); };
T['ta.tsi'] = (st, R, source, short_length, long_length) => { const c = T['ta.change'](sub(st, 0), R, source, 1); const a = T['ta.ema'](sub(st, 2), R, T['ta.ema'](sub(st, 1), R, c, long_length), short_length), b = T['ta.ema'](sub(st, 4), R, T['ta.ema'](sub(st, 3), R, Math.abs(c), long_length), short_length); return a / b; };
T['ta.sar'] = (st, R, start, inc, max) => {
  const n = st.n, i = R.i, s = st.s || (st.s = []);
  if (i < 1 || n < 1) { s[n] = null; return NaN; }
  let p = s[n - 1], o;
  if (!p) { const up = R.close > R.C[i - 1]; o = { up, ep: up ? R.high : R.low, sar: up ? R.L[i - 1] : R.H[i - 1], af: start, first: true }; s[n] = o; }
  else o = { up: p.up, ep: p.ep, sar: p.sar, af: p.af, first: false };
  if (p) {
    o.sar = p.sar + p.af * (p.ep - p.sar);
    if (o.up) { if (o.sar > R.low) { o.first = true; o.up = false; o.sar = Math.max(R.high, o.ep); o.ep = R.low; o.af = start; } }
    else if (o.sar < R.high) { o.first = true; o.up = true; o.sar = Math.min(R.low, o.ep); o.ep = R.high; o.af = start; }
    if (!o.first) { if (o.up) { if (R.high > o.ep) { o.ep = R.high; o.af = Math.min(o.af + inc, max); } } else if (R.low < o.ep) { o.ep = R.low; o.af = Math.min(o.af + inc, max); } }
  }
  if (o.up) { o.sar = Math.min(o.sar, R.L[i - 1]); if (i > 1) o.sar = Math.min(o.sar, R.L[i - 2]); } else { o.sar = Math.max(o.sar, R.H[i - 1]); if (i > 1) o.sar = Math.max(o.sar, R.H[i - 2]); }
  s[n] = o; return o.sar;
};
function pivot(st, x, left, right, sgn) { const r = raw(st, x), n = st.n, c = n - right; if (c - left < 0) return NaN; const p = r[c]; if (na(p)) return NaN; for (let k = 1; k <= left; k++) if ((r[c - k] - p) * sgn > 0) return NaN; for (let k = 1; k <= right; k++) if ((r[c + k] - p) * sgn >= 0) return NaN; return p; }
T['ta.pivothigh'] = (st, R, source, leftbars, rightbars) => { if (rightbars === undefined) { rightbars = leftbars; leftbars = source; source = R.high; } return pivot(st, source, len(leftbars), len(rightbars), 1); };
T['ta.pivotlow'] = (st, R, source, leftbars, rightbars) => { if (rightbars === undefined) { rightbars = leftbars; leftbars = source; source = R.low; } return pivot(st, source, len(leftbars), len(rightbars), -1); };
T['ta.vwap'] = (st, R, source, anchor, stdev_mult) => {
  if (source === undefined) source = (R.high + R.low + R.close) / 3;
  const n = st.n, P = st.p || (st.p = []);
  let a = anchor;
  if (a === undefined) a = R.newDay();
  const prev = n > 0 && !a ? P[n - 1] : null;
  const v = na(R.volume) ? 0 : R.volume;
  const o = { s: (prev ? prev.s : 0) + source * v, v: (prev ? prev.v : 0) + v, q: (prev ? prev.q : 0) + source * source * v };
  P[n] = o;
  const w = o.s / o.v;
  if (stdev_mult === undefined) return w;
  const sd = Math.sqrt(Math.max(0, o.q / o.v - w * w)) * stdev_mult;
  return [w, w + sd, w - sd];
};
VAR['ta.vwap'] = null; /* handled as stateful call */
const cumVar = (name, f) => { T[name] = (st, R) => { const v = st.v || (st.v = []); const p = st.n ? v[st.n - 1] : 0; return (v[st.n] = p + (num(f(R)) || 0)); }; VAR[name] = null; };
const pcl = R => R.i ? R.C[R.i - 1] : NaN;
cumVar('ta.obv', R => Math.sign(R.close - pcl(R)) * R.volume);
cumVar('ta.accdist', R => R.high === R.low ? 0 : ((R.close - R.low) - (R.high - R.close)) / (R.high - R.low) * R.volume);
cumVar('ta.pvt', R => (R.close - pcl(R)) / pcl(R) * R.volume);
cumVar('ta.wad', R => { const p = pcl(R); if (na(p)) return 0; return R.close > p ? R.close - Math.min(R.low, p) : R.close < p ? R.close - Math.max(R.high, p) : 0; });
VAR['ta.iii'] = R => (2 * R.close - R.high - R.low) / ((R.high - R.low) * R.volume);
VAR['ta.wvad'] = R => (R.close - R.open) / (R.high - R.low) * R.volume;
const nviF = (name, cmp) => { T[name] = (st, R) => { const v = st.v || (st.v = []); const p = st.n ? v[st.n - 1] : 1; const pv = R.i ? R.V[R.i - 1] : NaN, pc = pcl(R); let x = p; if (!na(pv) && pc && cmp(R.volume, pv)) x = p + (R.close - pc) / pc * p; return (v[st.n] = x); }; VAR[name] = null; };
nviF('ta.nvi', (a, b) => a < b); nviF('ta.pvi', (a, b) => a > b);
T['ta.pivot_point_levels'] = (st, R, type, anchor, developing) => {
  const n = st.n, P = st.p || (st.p = []);
  const prev = n ? P[n - 1] : null;
  let o = prev && !anchor ? { o: prev.o, h: Math.max(prev.h, R.high), l: Math.min(prev.l, R.low), c: R.close, lv: prev.lv } : { o: R.open, h: R.high, l: R.low, c: R.close, lv: prev ? ppl(type, prev) : new Array(11).fill(NaN) };
  P[n] = o; return developing ? ppl(type, o) : o.lv.slice();
};
function ppl(type, b) { const { h, l, c, o } = b, r = h - l; const p = (h + l + c) / 3; const N = NaN;
  switch (type) {
    case 'Fibonacci': return [p, p + .382 * r, p - .382 * r, p + .618 * r, p - .618 * r, p + r, p - r, N, N, N, N];
    case 'Woodie': { const q = (h + l + 2 * o) / 4; const r3 = h + 2 * (q - l), s3 = l - 2 * (h - q); return [q, 2 * q - l, 2 * q - h, q + r, q - r, r3, s3, r3 + r, s3 - r, N, N]; }
    case 'Classic': return [p, 2 * p - l, 2 * p - h, p + r, p - r, p + 2 * r, p - 2 * r, p + 3 * r, p - 3 * r, N, N];
    case 'DM': { const x = o === c ? h + l + 2 * c : c > o ? 2 * h + l + c : 2 * l + h + c; return [x / 4, x / 2 - l, x / 2 - h, N, N, N, N, N, N, N, N]; }
    case 'Camarilla': return [p, c + 1.1 * r / 12, c - 1.1 * r / 12, c + 1.1 * r / 6, c - 1.1 * r / 6, c + 1.1 * r / 4, c - 1.1 * r / 4, c + 1.1 * r / 2, c - 1.1 * r / 2, h / l * c, c - (h / l * c - c)];
    default: return [p, 2 * p - l, 2 * p - h, p + r, p - r, 2 * p + h - 2 * l, 2 * p - (2 * h - l), 3 * p + h - 3 * l, 3 * p - (3 * h - l), 4 * p + h - 4 * l, 4 * p - (4 * h - l)];
  } }
L.pivots = ppl;

/* ---------- strings ---------- */
const fmtNum = L.fmtNum = (x, f, R) => {
  if (na(x)) return 'NaN';
  if (f === 'mintick') { const m = R.sym.mintick; return (Math.round(x / m) * m).toFixed(R.sym.prec); }
  if (f === 'percent') return x.toFixed(2) + '%';
  if (f === 'volume') { const a = Math.abs(x); return a >= 1e9 ? (x / 1e9).toFixed(3).replace(/\.?0+$/, '') + 'B' : a >= 1e6 ? (x / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M' : a >= 1e3 ? (x / 1e3).toFixed(3).replace(/\.?0+$/, '') + 'K' : String(+x.toFixed(3)); }
  if (f === 'price' || f === 'inherit') return x.toFixed(R.sym.prec);
  if (f === undefined || f === null || f === '') { if (Number.isInteger(x)) return String(x); return String(+x.toFixed(10)); }
  return patNum(x, f);
};
function patNum(x, f) {
  const m = /^([^#0,.]*)([#0,.]*)(%?)(.*)$/.exec(f); if (!m || !m[2]) return String(x);
  let v = m[3] ? x * 100 : x;
  const [ip, dp = ''] = m[2].split('.');
  const min = (dp.match(/0/g) || []).length, max = dp.length;
  let s = Math.abs(v).toFixed(max);
  let [a, b = ''] = s.split('.');
  while (b.length > min && b.endsWith('0')) b = b.slice(0, -1);
  const minI = (ip.replace(/,/g, '').match(/0/g) || []).length;
  while (a.length < minI) a = '0' + a;
  if (minI === 0 && a === '0' && b) a = ip.includes('#') || ip ? '0' : '';
  if (ip.includes(',')) a = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  s = a + (b ? '.' + b : '');
  const neg = v < 0 && /[1-9]/.test(s);
  return (neg ? '-' : '') + m[1] + s + m[3] + m[4];
}
L.patNum = patNum;
RF['str.tostring'] = (R, value, format) => tostr(R, value, format);
function tostr(R, v, f) {
  if (typeof v === 'number') return fmtNum(v, f, R);
  if (v == null) return 'NaN';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return '[' + v.map(x => tostr(R, x, f)).join(', ') + ']';
  if (v && v.__enum) return v.title;
  return String(v);
}
L.tostr = tostr;
PF['str.tonumber'] = string => { if (na(string)) return NaN; const s = String(string).trim(); return /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s) ? parseFloat(s) : NaN; };
RF['str.format'] = (R, formatString, ...args) => String(formatString).replace(/\{(\d+)(?:,\s*([a-z]+)(?:,\s*([^}]+))?)?\}/g, (_, k, ty, f) => {
  const v = args[+k]; if (v === undefined) return '';
  if (ty === 'number' && typeof v === 'number') { if (f === 'integer') return patNum(v, '#,##0'); if (f === 'percent') return patNum(v, '#,##0%'); if (f === 'currency') return '$' + patNum(v, '#,##0.00'); return f ? patNum(v, f) : patNum(v, '#,##0.###'); }
  if ((ty === 'date' || ty === 'time') && typeof v === 'number') return R.fmtTime(v, f || (ty === 'date' ? 'dd MMM yyyy' : 'HH:mm:ss'));
  if (typeof v === 'number') return na(v) ? 'NaN' : patNum(v, '#,##0.###');
  return tostr(R, v);
}).replace(/''/g, "'");
RF['str.format_time'] = (R, time, format, timezone) => na(time) ? 'NaN' : R.fmtTime(time, format || "yyyy-MM-dd'T'HH:mm:ssZ", timezone);
PF['str.length'] = string => na(string) ? 0 : string.length;
PF['str.contains'] = (source, str) => !na(source) && String(source).includes(str);
PF['str.startswith'] = (source, str) => !na(source) && source.startsWith(str); PF['str.endswith'] = (source, str) => !na(source) && source.endsWith(str);
PF['str.pos'] = (source, str) => { const p = String(source).indexOf(str); return p < 0 ? NaN : p; };
PF['str.substring'] = (source, begin_pos, end_pos) => String(source).substring(begin_pos, end_pos);
PF['str.replace'] = (source, target, replacement, occurrence) => { let idx = -1; for (let k = 0; k <= (occurrence || 0); k++) { idx = source.indexOf(target, idx + 1); if (idx < 0) return source; } return source.slice(0, idx) + replacement + source.slice(idx + target.length); };
PF['str.replace_all'] = (source, target, replacement) => String(source).split(target).join(replacement);
PF['str.split'] = (string, separator) => String(string).split(separator);
PF['str.upper'] = source => String(source).toUpperCase(); PF['str.lower'] = source => String(source).toLowerCase(); PF['str.trim'] = source => String(source).trim(); PF['str.repeat'] = (source, repeat, separator) => new Array(Math.max(0, repeat | 0)).fill(source).join(separator || '');
PF['str.match'] = (source, regex) => { try { const m = new RegExp(regex).exec(source); return m ? m[0] : ''; } catch (e) { return ''; } };
PF['str.split_lines'] = s => String(s).split('\n');

/* ---------- arrays (plain JS arrays) ---------- */
const A = (n, f) => { PF['array.' + n] = f; };
const chk = (id, index) => { if (!Array.isArray(id)) throw new Error('Array masih na'); if (index < 0) index += id.length; if (index >= id.length || index < 0 || na(index)) throw new Error('Indeks array ' + index + ' di luar batas. Ukuran array ' + id.length); return index; };
A('new', (size, initial_value) => new Array(Math.max(0, size | 0)).fill(initial_value === undefined ? NaN : initial_value));
for (const t of ['float', 'int', 'bool', 'string', 'color', 'line', 'label', 'box', 'table', 'linefill', 'polyline']) A('new_' + t, (size, initial_value) => new Array(Math.max(0, size | 0)).fill(initial_value === undefined ? (t === 'bool' ? false : NaN) : initial_value));
A('from', (...a) => a);
A('size', id => id && Array.isArray(id) ? id.length : 0);
A('get', (id, index) => id[chk(id, index)]); A('set', (id, index, value) => { id[chk(id, index)] = value; });
A('push', (id, value) => { id.push(value); }); A('pop', id => id.length ? id.pop() : NaN); A('shift', id => id.length ? id.shift() : NaN); A('unshift', (id, value) => { id.unshift(value); });
A('insert', (id, index, value) => { id.splice(index < 0 ? id.length + index : index, 0, value); }); A('remove', (id, index) => id.splice(chk(id, index), 1)[0]);
A('clear', id => { id.length = 0; }); A('first', id => { chk(id, 0); return id[0]; }); A('last', id => { chk(id, 0); return id[id.length - 1]; });
A('concat', (id1, id2) => { for (const x of id2) id1.push(x); return id1; }); A('copy', id => id.slice()); A('slice', (id, index_from, index_to) => id.slice(index_from, index_to));
A('reverse', id => { id.reverse(); }); A('fill', (id, value, index_from, index_to) => { id.fill(value, index_from || 0, na(index_to) ? id.length : index_to); });
A('includes', (id, value) => id.includes(value)); A('indexof', (id, value) => id.indexOf(value)); A('lastindexof', (id, value) => id.lastIndexOf(value));
A('join', (id, separator) => id.map(x => na(x) ? 'NaN' : x).join(separator === undefined ? ',' : separator));
const nn = id => id.filter(x => !na(x));
A('sum', id => nn(id).reduce((a, b) => a + b, 0)); A('avg', id => { const a = nn(id); return a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN; });
A('max', (id, nth) => { const a = nn(id).sort((x, y) => y - x); return a.length > (nth || 0) ? a[nth || 0] : NaN; }); A('min', (id, nth) => { const a = nn(id).sort((x, y) => x - y); return a.length > (nth || 0) ? a[nth || 0] : NaN; });
A('range', id => PF['array.max'](id) - PF['array.min'](id));
A('median', id => { const a = nn(id).sort((x, y) => x - y), h = a.length >> 1; return !a.length ? NaN : a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; });
A('mode', id => { const c = new Map(); let b = NaN, bc = 0; for (const x of nn(id).sort((p, q) => p - q)) { const k = (c.get(x) || 0) + 1; c.set(x, k); if (k > bc) { bc = k; b = x; } } return b; });
A('variance', (id, biased) => { const a = nn(id); if (!a.length) return NaN; const m = a.reduce((x, y) => x + y, 0) / a.length; return a.reduce((x, y) => x + (y - m) * (y - m), 0) / (biased === false ? a.length - 1 : a.length); });
A('stdev', (id, biased) => Math.sqrt(PF['array.variance'](id, biased)));
A('covariance', (id1, id2, biased) => { const n = Math.min(id1.length, id2.length); let a = 0, b = 0; for (let k = 0; k < n; k++) { a += id1[k]; b += id2[k]; } a /= n; b /= n; let s = 0; for (let k = 0; k < n; k++) s += (id1[k] - a) * (id2[k] - b); return s / (biased === false ? n - 1 : n); });
const cmp = order => order === 'descending' ? (a, b) => (a < b ? 1 : a > b ? -1 : 0) : (a, b) => (a < b ? -1 : a > b ? 1 : 0);
A('sort', (id, order) => { id.sort(cmp(order)); }); A('sort_indices', (id, order) => { const f = cmp(order); return id.map((_, k) => k).sort((p, q) => f(id[p], id[q]) || p - q); });
A('abs', id => id.map(Math.abs)); A('every', id => id.every(x => !!x && !na(x))); A('some', id => id.some(x => !!x && !na(x)));
A('percentile_linear_interpolation', (id, percentage) => { const a = nn(id).sort((x, y) => x - y); return a.length ? pctl(a, percentage) : NaN; });
A('percentile_nearest_rank', (id, percentage) => { const a = nn(id).sort((x, y) => x - y); return a.length ? a[Math.max(0, Math.ceil(percentage / 100 * a.length) - 1)] : NaN; });
A('percentrank', (id, index) => { const v = id[index]; let c = 0; for (const x of id) if (x <= v) c++; return (c - 1) / (id.length - 1) * 100; });
A('standardize', id => { const m = PF['array.avg'](id), s = PF['array.stdev'](id); return id.map(x => s ? (x - m) / s : 1); });
A('binary_search', (id, val) => { const k = id.indexOf(val); return k; }); A('binary_search_leftmost', (id, val) => { let lo = 0, hi = id.length; while (lo < hi) { const m = (lo + hi) >> 1; if (id[m] < val) lo = m + 1; else hi = m; } return id[lo] === val ? lo : lo - 1; }); A('binary_search_rightmost', (id, val) => { let lo = 0, hi = id.length; while (lo < hi) { const m = (lo + hi) >> 1; if (id[m] <= val) lo = m + 1; else hi = m; } return lo > 0 && id[lo - 1] === val ? lo - 1 : lo; });

/* ---------- maps / matrix ---------- */
const M = (n, f) => { PF['map.' + n] = f; };
M('new', () => new Map()); M('get', (id, key) => id.has(key) ? id.get(key) : NaN); M('put', (id, key, value) => { const p = id.has(key) ? id.get(key) : NaN; id.set(key, value); return p; }); M('contains', (id, key) => id.has(key)); M('size', id => id.size); M('remove', (id, key) => { const p = id.has(key) ? id.get(key) : NaN; id.delete(key); return p; }); M('clear', id => id.clear()); M('keys', id => Array.from(id.keys())); M('values', id => Array.from(id.values())); M('copy', id => new Map(id)); M('put_all', (id, id2) => { for (const [k, v] of id2) id.set(k, v); });
class Matrix { constructor(r, c, v) { this.d = Array.from({ length: r }, () => new Array(c).fill(v)); } get r() { return this.d.length; } get c() { return this.d.length ? this.d[0].length : 0; } }
L.Matrix = Matrix;
const X = (n, f) => { PF['matrix.' + n] = f; };
X('new', (rows, columns, initial_value) => new Matrix(rows || 0, columns || 0, initial_value === undefined ? NaN : initial_value)); X('get', (id, row, column) => id.d[row][column]); X('set', (id, row, column, value) => { id.d[row][column] = value; }); X('rows', id => id.r); X('columns', id => id.c); X('elements_count', id => id.r * id.c);
X('row', (id, row) => id.d[row].slice()); X('col', (id, column) => id.d.map(r => r[column])); X('add_row', (id, row, array_id) => { id.d.splice(row === undefined ? id.r : row, 0, array_id ? array_id.slice() : new Array(id.c).fill(NaN)); }); X('add_col', (id, column, array_id) => { const c = column === undefined ? id.c : column; if (!id.r && array_id) id.d = array_id.map(() => []); id.d.forEach((r, k) => r.splice(c, 0, array_id ? array_id[k] : NaN)); }); X('remove_row', (id, row) => id.d.splice(row === undefined ? id.r - 1 : row, 1)[0]); X('remove_col', (id, column) => id.d.map(r => r.splice(column === undefined ? r.length - 1 : column, 1)[0]));
X('fill', (id, value, from_row, to_row, from_column, to_column) => { for (let r = from_row || 0; r < (to_row === undefined ? id.r : to_row); r++) for (let c = from_column || 0; c < (to_column === undefined ? id.c : to_column); c++) id.d[r][c] = value; });
const mk = d => { const m = new Matrix(0, 0); m.d = d; return m; };
X('copy', id => mk(id.d.map(r => r.slice()))); X('transpose', id => mk(Array.from({ length: id.c }, (_, c) => id.d.map(r => r[c])))); X('mult', (id1, id2) => { if (typeof id2 === 'number') return mk(id1.d.map(r => r.map(x => x * id2))); if (Array.isArray(id2)) return id1.d.map(r => r.reduce((s, x, k) => s + x * id2[k], 0)); return mk(id1.d.map(r => Array.from({ length: id2.c }, (_, c) => r.reduce((s, x, k) => s + x * id2.d[k][c], 0)))); });
X('sum', (id1, id2) => typeof id2 === 'number' ? mk(id1.d.map(r => r.map(x => x + id2))) : mk(id1.d.map((r, i) => r.map((x, j) => x + id2.d[i][j])))); X('diff', (id1, id2) => typeof id2 === 'number' ? mk(id1.d.map(r => r.map(x => x - id2))) : mk(id1.d.map((r, i) => r.map((x, j) => x - id2.d[i][j]))));
X('avg', id => PF['array.avg'](id.d.flat())); X('max', id => PF['array.max'](id.d.flat())); X('min', id => PF['array.min'](id.d.flat())); X('median', id => PF['array.median'](id.d.flat()));
function det(d) { const n = d.length, a = d.map(r => r.slice()); let D = 1; for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r; if (!a[p][c]) return 0; if (p !== c) { [a[p], a[c]] = [a[c], a[p]]; D = -D; } D *= a[c][c]; for (let r = c + 1; r < n; r++) { const f = a[r][c] / a[c][c]; for (let k = c; k < n; k++) a[r][k] -= f * a[c][k]; } } return D; }
X('det', id => det(id.d)); X('inv', id => { const n = id.r, a = id.d.map((r, i) => r.concat(Array.from({ length: n }, (_, k) => k === i ? 1 : 0))); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r; if (!a[p][c]) return mk(id.d.map(r => r.map(() => NaN))); [a[p], a[c]] = [a[c], a[p]]; const f = a[c][c]; for (let k = 0; k < 2 * n; k++) a[c][k] /= f; for (let r = 0; r < n; r++) if (r !== c) { const g = a[r][c]; for (let k = 0; k < 2 * n; k++) a[r][k] -= g * a[c][k]; } } return mk(a.map(r => r.slice(n))); });
X('swap_rows', (id, row1, row2) => { [id.d[row1], id.d[row2]] = [id.d[row2], id.d[row1]]; }); X('reverse', id => { id.d.reverse(); id.d.forEach(r => r.reverse()); }); X('sort', (id, column, order) => { const f = cmp(order); id.d.sort((a, b) => f(a[column || 0], b[column || 0])); }); X('is_square', id => id.r === id.c);

/* ---------- drawings ---------- */
class Draw { constructor(k) { this.__k = k; } }
L.Draw = Draw;
class ChartPoint { constructor(time, index, price) { this.f_time = time; this.f_index = index; this.f_price = price; } }
L.ChartPoint = ChartPoint;
RF['chart.point.new'] = (R, time, index, price) => new ChartPoint(time, index, price);
RF['chart.point.from_index'] = (R, index, price) => new ChartPoint(NaN, index, price);
RF['chart.point.from_time'] = (R, time, price) => new ChartPoint(time, NaN, price);
RF['chart.point.now'] = (R, price) => new ChartPoint(R.time, R.i, price === undefined ? R.close : price);
RF['chart.point.copy'] = (R, id) => new ChartPoint(id.f_time, id.f_index, id.f_price);
const DEF = {
  line: ['x1 y1 x2 y2 xloc extend color style width force_overlay', { xloc: 'bar_index', extend: 'none', color: COL.blue, style: 'solid', width: 1 }],
  label: ['x y text xloc yloc color style textcolor size textalign tooltip text_font_family force_overlay text_formatting', { text: '', xloc: 'bar_index', yloc: 'price', color: COL.blue, style: 'label_down', textcolor: '#ffffff', size: 'normal', textalign: 'align_center', tooltip: '' }],
  box: ['left top right bottom border_color border_width border_style extend xloc bgcolor text text_size text_color text_halign text_valign text_wrap text_font_family force_overlay text_formatting', { border_color: COL.blue, border_width: 1, border_style: 'solid', extend: 'none', xloc: 'bar_index', bgcolor: COL.blue, text: '', text_size: 'auto', text_color: '#363a45', text_halign: 'align_center', text_valign: 'align_center', text_wrap: 'wrap_none' }],
  linefill: ['line1 line2 color', {}],
  polyline: ['points curved closed xloc line_color fill_color line_style line_width force_overlay', { curved: false, closed: false, xloc: 'bar_index', line_color: COL.blue, fill_color: NaN, line_style: 'solid', line_width: 1 }],
  table: ['position columns rows bgcolor frame_color frame_width border_color border_width force_overlay', { bgcolor: NaN, frame_color: NaN, frame_width: 0, border_color: NaN, border_width: 0 }]
};
const SIG = L.SIG = {};
const regOf = { line: 'lines', label: 'labels', box: 'boxes', linefill: 'linefills', polyline: 'polylines', table: 'tables' };
for (const k in DEF) {
  const props = DEF[k][0].split(' '), d = DEF[k][1];
  SIG[k + '.new'] = props;
  RF[k + '.new'] = (R, ...a) => {
    const o = new Draw(k);
    if (k === 'line' && a[0] instanceof ChartPoint) { const [p, q, ...rest] = a; a = [p, q].concat(rest); const xl = rest[0] || 'bar_index'; const t = xl === 'bar_time'; a = [t ? p.f_time : p.f_index, p.f_price, t ? q.f_time : q.f_index, q.f_price].concat(rest); }
    else if (k === 'label' && a[0] instanceof ChartPoint) { const [p, ...rest] = a; const t = (rest[1] || 'bar_index') === 'bar_time'; a = [t ? p.f_time : p.f_index, p.f_price].concat(rest); }
    else if (k === 'box' && a[0] instanceof ChartPoint) { const [p, q, ...rest] = a; const t = (rest[4] || 'bar_index') === 'bar_time'; a = [t ? p.f_time : p.f_index, p.f_price, t ? q.f_time : q.f_index, q.f_price].concat(rest); }
    for (let j = 0; j < props.length; j++) { const v = a[j]; o[props[j]] = v === undefined ? (d[props[j]] === undefined ? NaN : d[props[j]]) : v; }
    if (k === 'table') o.cells = {};
    const reg = R[regOf[k]];
    reg.push(o);
    const mx = R.maxOf[k];
    if (mx && reg.length > mx) { const old = reg.shift(); old.__del = true; }
    return o;
  };
  SIG[k + '.delete'] = ['id'];
  RF[k + '.delete'] = (R, id) => { if (!(id instanceof Draw) || id.__del) return; id.__del = true; const reg = R[regOf[k]], j = reg.lastIndexOf(id); if (j >= 0) reg.splice(j, 1); };
  RF[k + '.copy'] = (R, id) => { if (!(id instanceof Draw)) return NaN; const o = new Draw(k); Object.assign(o, id); delete o.__del; R[regOf[k]].push(o); const mx = R.maxOf[k]; if (mx && R[regOf[k]].length > mx) R[regOf[k]].shift().__del = true; return o; };
  for (const p of props) {
    PF[k + '.set_' + p] = (id, v) => { if (id instanceof Draw) id[p] = v; };
    PF[k + '.get_' + p] = id => id instanceof Draw ? id[p] : NaN;
  }
  VAR[k + '.all'] = R => R[regOf[k]].slice();
}
PF['line.set_xy1'] = (id, x, y) => { if (id instanceof Draw) { id.x1 = x; id.y1 = y; } }; PF['line.set_xy2'] = (id, x, y) => { if (id instanceof Draw) { id.x2 = x; id.y2 = y; } };
PF['line.set_first_point'] = (id, point) => { if (id instanceof Draw) { id.x1 = id.xloc === 'bar_time' ? point.f_time : point.f_index; id.y1 = point.f_price; } };
PF['line.set_second_point'] = (id, point) => { if (id instanceof Draw) { id.x2 = id.xloc === 'bar_time' ? point.f_time : point.f_index; id.y2 = point.f_price; } };
PF['line.set_xloc'] = (id, x1, x2, xloc) => { if (id instanceof Draw) { id.x1 = x1; id.x2 = x2; id.xloc = xloc; } };
PF['line.get_price'] = (id, x) => !(id instanceof Draw) ? NaN : id.y1 + (id.y2 - id.y1) * (x - id.x1) / (id.x2 - id.x1);
PF['label.set_xy'] = (id, x, y) => { if (id instanceof Draw) { id.x = x; id.y = y; } }; PF['label.set_xloc'] = (id, x, xloc) => { if (id instanceof Draw) { id.x = x; id.xloc = xloc; } };
PF['label.set_point'] = (id, point) => { if (id instanceof Draw) { id.x = id.xloc === 'bar_time' ? point.f_time : point.f_index; id.y = point.f_price; } };
PF['box.set_lefttop'] = (id, left, top) => { if (id instanceof Draw) { id.left = left; id.top = top; } }; PF['box.set_rightbottom'] = (id, right, bottom) => { if (id instanceof Draw) { id.right = right; id.bottom = bottom; } };
PF['box.set_top_left_point'] = (id, point) => { if (id instanceof Draw) { id.left = id.xloc === 'bar_time' ? point.f_time : point.f_index; id.top = point.f_price; } };
PF['box.set_bottom_right_point'] = (id, point) => { if (id instanceof Draw) { id.right = id.xloc === 'bar_time' ? point.f_time : point.f_index; id.bottom = point.f_price; } };
PF['box.set_xloc'] = (id, left, right, xloc) => { if (id instanceof Draw) { id.left = left; id.right = right; id.xloc = xloc; } };
PF['linefill.get_line1'] = id => id.line1; PF['linefill.get_line2'] = id => id.line2;
const CELL = 'table_id column row text width height text_color text_halign text_valign text_size bgcolor tooltip text_font_family text_formatting'.split(' ');
SIG['table.cell'] = CELL;
PF['table.cell'] = (id, column, row, text, width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family) => { if (!(id instanceof Draw)) return; id.cells[column + ',' + row] = { c: column, r: row, text: na(text) ? '' : String(text), width, height, text_color, text_halign, text_valign, text_size, bgcolor, tooltip, text_font_family }; };
for (const p of ['text', 'width', 'height', 'text_color', 'text_halign', 'text_valign', 'text_size', 'bgcolor', 'tooltip', 'text_font_family', 'text_formatting']) PF['table.cell_set_' + p] = (id, column, row, v) => { if (!(id instanceof Draw)) return; const k = column + ',' + row; const c = id.cells[k] || (id.cells[k] = { c: column, r: row, text: '' }); c[p] = p === 'text' ? String(v) : v; };
PF['table.clear'] = (table_id, start_column, start_row, end_column, end_row) => { if (!(table_id instanceof Draw)) return; const c2 = end_column === undefined ? start_column : end_column, r2 = end_row === undefined ? start_row : end_row; for (const k in table_id.cells) { const c = table_id.cells[k]; if (c.c >= start_column && c.c <= c2 && c.r >= start_row && c.r <= r2) delete table_id.cells[k]; } };
PF['table.merge_cells'] = (table_id, start_column, start_row, end_column, end_row) => { if (table_id instanceof Draw) { const k = start_column + ',' + start_row; const c = table_id.cells[k] || (table_id.cells[k] = { c: start_column, r: start_row, text: '' }); c.cs = end_column - start_column + 1; c.rs = end_row - start_row + 1; } };

/* ---------- time ---------- */
RF['timestamp'] = (R, ...a) => R.timestamp(a);
for (const k of ['year', 'month', 'dayofmonth', 'dayofweek', 'hour', 'minute', 'second', 'weekofyear']) { RF[k] = (R, time, timezone) => R.tpart(time, timezone)[k]; VAR[k] = R => R.tpart(R.time)[k]; }
RF['time'] = (R, timeframe, session, timezone, bars_back) => R.timeFn(timeframe, session, timezone, false);
RF['time_close'] = (R, timeframe, session, timezone) => R.timeFn(timeframe, session, timezone, true);
SIG['time'] = ['timeframe', 'session', 'timezone', 'bars_back', 'timeframe_bars_back']; SIG['time_close'] = SIG['time'];
RF['timeframe.in_seconds'] = (R, timeframe) => R.tfSec(na(timeframe) || timeframe === '' ? R.tf : timeframe);
RF['timeframe.from_seconds'] = (R, seconds) => seconds < 60 ? seconds + 'S' : seconds < 86400 ? String(Math.round(seconds / 60)) : seconds < 604800 ? Math.round(seconds / 86400) + 'D' : seconds < 2592000 ? Math.round(seconds / 604800) + 'W' : Math.round(seconds / 2592000) + 'M';
T['timeframe.change'] = (st, R, timeframe) => { const v = st.v || (st.v = []); v[st.n] = R.timeFn(timeframe); return st.n > 0 && v[st.n] !== v[st.n - 1]; };
})();
