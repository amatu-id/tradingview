/* Amatu Chart — Pine compiler (AST -> JS) and runtime */
(function () {
'use strict';
const G = typeof window !== 'undefined' ? window : globalThis;
const L = G.AC_LIB, PP = G.AC_PARSE;
const { T, RF, PF, CONST, VAR, SIG } = L;
const PN = G.AC_PINE = {};
const PineError = PP.PineError;
const na = x => x == null || x !== x;

/* ---------- site functions: fn(R, siteId, ...args) ---------- */
const ST = {};
SIG['plot'] = 'series title color linewidth style trackprice histbase offset join editable show_last display format precision force_overlay linestyle'.split(' ');
SIG['plotshape'] = 'series title style location color offset text textcolor editable size show_last display format precision force_overlay'.split(' ');
SIG['plotchar'] = 'series title char location color offset text textcolor editable size show_last display format precision force_overlay'.split(' ');
SIG['plotarrow'] = 'series title colorup colordown offset minheight maxheight editable show_last display format precision force_overlay'.split(' ');
SIG['plotcandle'] = 'open high low close title color wickcolor editable show_last bordercolor display format precision force_overlay'.split(' ');
SIG['plotbar'] = 'open high low close title color editable show_last display format precision force_overlay'.split(' ');
SIG['hline'] = 'price title color linestyle linewidth editable display'.split(' ');
SIG['bgcolor'] = 'color offset editable show_last title display force_overlay'.split(' ');
SIG['barcolor'] = 'color offset editable show_last title display'.split(' ');
SIG['fill'] = 'plot1 plot2 color title editable show_last fillgaps display'.split(' ');
SIG['fill6'] = 'plot1 plot2 top_value bottom_value top_color bottom_color title display fillgaps editable'.split(' ');
SIG['alertcondition'] = 'condition title message'.split(' ');
SIG['alert'] = 'message freq'.split(' ');
SIG['indicator'] = 'title shorttitle overlay format precision scale max_bars_back timeframe timeframe_gaps explicit_plot_zorder max_lines_count max_labels_count max_boxes_count calc_bars_count max_polylines_count dynamic_requests behind_chart'.split(' ');
SIG['strategy'] = 'title shorttitle overlay format precision scale pyramiding calc_on_order_fills calc_on_every_tick max_bars_back backtest_fill_limits_assumption default_qty_type default_qty_value initial_capital currency slippage commission_type commission_value process_orders_on_close close_entries_rule margin_long margin_short explicit_plot_zorder max_lines_count max_labels_count max_boxes_count calc_bars_count risk_free_rate use_bar_magnifier fill_orders_on_standard_ohlc max_polylines_count dynamic_requests behind_chart'.split(' ');
const IN = {
  'input.int': 'defval title minval maxval step tooltip inline group confirm display active', 'input.float': 'defval title minval maxval step tooltip inline group confirm display active',
  'input.bool': 'defval title tooltip inline group confirm display active', 'input.string': 'defval title options tooltip inline group confirm display active', 'input.color': 'defval title tooltip inline group confirm display active',
  'input.timeframe': 'defval title options tooltip inline group confirm display active', 'input.session': 'defval title options tooltip inline group confirm display active', 'input.symbol': 'defval title tooltip inline group confirm display active',
  'input.source': 'defval title tooltip inline group display active confirm', 'input.price': 'defval title tooltip inline group confirm display active', 'input.time': 'defval title tooltip inline group confirm display active',
  'input.text_area': 'defval title tooltip group confirm display active', 'input.enum': 'defval title options tooltip inline group confirm display active', 'input': 'defval title tooltip inline group display active'
};
for (const k in IN) SIG[k] = IN[k].split(' ');
SIG['input4'] = 'defval title type minval maxval confirm step options'.split(' ');
SIG['request.security'] = 'symbol timeframe expression gaps lookahead ignore_invalid_symbol currency calc_bars_count'.split(' ');
SIG['request.security_lower_tf'] = 'symbol timeframe expression ignore_invalid_symbol currency ignore_invalid_timeframe calc_bars_count'.split(' ');
SIG['strategy.entry'] = 'id direction qty limit stop oca_name oca_type comment alert_message disable_alert'.split(' ');
SIG['strategy.order'] = SIG['strategy.entry'];
SIG['strategy.exit'] = 'id from_entry qty qty_percent profit limit loss stop trail_price trail_points trail_offset oca_name comment comment_profit comment_loss comment_trailing alert_message alert_profit alert_loss alert_trailing disable_alert'.split(' ');
SIG['strategy.close'] = 'id comment qty qty_percent alert_message immediately disable_alert'.split(' ');
SIG['strategy.close_all'] = 'comment alert_message immediately disable_alert'.split(' ');
SIG['ta.macd'] = 'source fastlen slowlen siglen'.split(' ');

function plotReg(R, id, kind, o) { return R.plots[id] || (R.plots[id] = (R.plotList.push(o), Object.assign(o, { id, kind, data: [] }), o)); }
function setCol(p, key, i, c) {
  const arr = p[key + 's'];
  if (arr) { arr[i] = c; return; }
  if (p[key + '0'] === undefined) { p[key + '0'] = c; return; }
  if (p[key + '0'] !== c && !(na(p[key + '0']) && na(c))) { const a = p[key + 's'] = []; for (let k = 0; k < i; k++) a[k] = p[key + '0']; a[i] = c; }
}
ST['plot'] = (R, id, series, title, color, linewidth, style, trackprice, histbase, offset, join, editable, show_last, display, format, precision, force_overlay, linestyle) => {
  const p = R.plots[id] || plotReg(R, id, 'plot', { title: na(title) ? 'Plot' : title, width: linewidth || 1, style: style || 'line', base: histbase || 0, offset: 0, showLast: show_last, display, track: trackprice, force: force_overlay, linestyle });
  p.offset = offset | 0; if (!na(linewidth)) p.width = linewidth; if (!na(style)) p.style = style; p.display = display;
  p.data[R.i] = typeof series === 'boolean' ? (series ? 1 : 0) : series; setCol(p, 'color', R.i, color === undefined ? '#2962ff' : color); return p;
};
ST['plotshape'] = (R, id, series, title, style, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) => {
  const p = R.plots[id] || plotReg(R, id, 'shape', { title: na(title) ? 'Shapes' : title, style: style || 'xcross', loc: location || 'abovebar', text: text, size: size || 'auto', offset: 0, showLast: show_last, display, force: force_overlay });
  p.offset = offset | 0; p.text = text;
  p.data[R.i] = p.loc === 'absolute' ? series : (na(series) || series === false || series === 0 ? NaN : 1); setCol(p, 'color', R.i, color === undefined ? '#2962ff' : color); setCol(p, 'tcolor', R.i, textcolor); return p;
};
ST['plotchar'] = (R, id, series, title, char, location, color, offset, text, textcolor, editable, size, show_last, display, format, precision, force_overlay) => {
  const p = R.plots[id] || plotReg(R, id, 'char', { title: na(title) ? 'Chars' : title, char: na(char) ? '★' : char, loc: location || 'abovebar', text, size: size || 'auto', offset: 0, showLast: show_last, display, force: force_overlay });
  p.offset = offset | 0; p.text = text;
  p.raw = p.raw || []; p.raw[R.i] = series;
  p.data[R.i] = p.loc === 'absolute' ? series : (na(series) || series === false || series === 0 ? NaN : 1); setCol(p, 'color', R.i, color === undefined ? '#2962ff' : color); setCol(p, 'tcolor', R.i, textcolor); return p;
};
ST['plotarrow'] = (R, id, series, title, colorup, colordown, offset, minheight, maxheight) => { const p = R.plots[id] || plotReg(R, id, 'arrow', { title: title || 'Arrows', minh: minheight || 5, maxh: maxheight || 100, offset: 0, up: colorup || '#4caf50', dn: colordown || '#f23645' }); p.data[R.i] = series; return p; };
const ohlcP = kind => (R, id, open, high, low, close, title, color, a, b, c, d) => { const p = R.plots[id] || plotReg(R, id, kind, { title: title || kind, offset: 0, o: [], h: [], l: [] }); const i = R.i; p.o[i] = open; p.h[i] = high; p.l[i] = low; p.data[i] = close; setCol(p, 'color', i, color === undefined ? '#2962ff' : color); if (kind === 'candle') { setCol(p, 'wcolor', i, a === undefined ? color : a); setCol(p, 'bcolor', i, d === undefined ? color : d); } return p; };
ST['plotcandle'] = ohlcP('candle'); ST['plotbar'] = ohlcP('bar');
ST['hline'] = (R, id, price, title, color, linestyle, linewidth, editable, display) => { const p = R.plots[id] || plotReg(R, id, 'hline', { title: title || 'Level' }); p.price = price; p.color0 = color === undefined ? '#787b86' : color; p.linestyle = linestyle || 'dashed'; p.width = linewidth || 1; p.display = display; return p; };
ST['bgcolor'] = (R, id, color, offset, editable, show_last, title, display, force_overlay) => { const p = R.plots[id] || plotReg(R, id, 'bg', { title: title || 'Background', offset: 0, showLast: show_last, display, force: force_overlay }); p.offset = offset | 0; p.data[R.i] = color; return p; };
ST['barcolor'] = (R, id, color, offset, editable, show_last, title, display) => { const p = R.plots[id] || plotReg(R, id, 'barcolor', { title: title || 'Bar color', offset: 0, display }); p.offset = offset | 0; p.data[R.i] = color; return p; };
ST['fill'] = (R, id, plot1, plot2, color, title, editable, show_last, fillgaps, display) => { const p = R.plots[id] || plotReg(R, id, 'fill', { title: title || 'Fill', showLast: show_last }); p.a = plot1; p.b = plot2; setCol(p, 'color', R.i, color === undefined ? '#2962ff33' : color); p.data[R.i] = 1; p.gaps = fillgaps; p.display = display; return p; };
ST['fill6'] = (R, id, plot1, plot2, top_value, bottom_value, top_color, bottom_color, title) => { const p = R.plots[id] || plotReg(R, id, 'fill', { title: title || 'Fill', grad: true, tv: [], bv: [], tc: [], bc: [] }); p.a = plot1; p.b = plot2; const i = R.i; p.tv[i] = top_value; p.bv[i] = bottom_value; p.tc[i] = top_color; p.bc[i] = bottom_color; p.data[i] = 1; return p; };
ST['alertcondition'] = (R, id, condition, title, message) => { const a = R.acs[id] || (R.acs[id] = { id, title: title || 'Alert', message: message || '', data: [] }); a.data[R.i] = !na(condition) && !!condition; };
ST['alert'] = (R, id, message, freq) => { if (R.rtNow) R.alertQ.push({ id, message: String(message), freq: freq || 'freq_once_per_bar', time: R.time }); };
for (const lv of ['info', 'warning', 'error']) ST['log.' + lv] = (R, id, message, ...a) => { const m = a.length ? RF['str.format'](R, message, ...a) : L.tostr(R, message); R.logs.push({ lv, m, i: R.i, t: R.time }); if (R.logs.length > 500) R.logs.shift(); };
for (const k in IN) ST[k] = (R, id, ...a) => R.regInput(id, k, a);

/* ---------- v4 and older names ---------- */
const V4 = {}; 'sma ema rma wma vwma swma hma alma linreg rsi macd bb bbw kc kcw tr atr supertrend dmi cci mfi stoch mom roc change crossover crossunder cross highest lowest highestbars lowestbars stdev variance dev median mode percentile_linear_interpolation percentile_nearest_rank percentrank correlation pivothigh pivotlow sar valuewhen barssince cum vwap obv accdist nvi pvi pvt wad wvad iii cog cmo tsi wpr falling rising range'.split(' ').forEach(k => { V4[k] = 'ta.' + k; });
'abs acos asin atan avg ceil cos exp floor log log10 max min pow round sign sin sqrt sum tan random todegrees toradians'.split(' ').forEach(k => { V4[k] = 'math.' + k; });
Object.assign(V4, { study: 'indicator', security: 'request.security', tostring: 'str.tostring', tonumber: 'str.tonumber', tickerid: 'syminfo.tickerid', ticker: 'syminfo.ticker', period: 'timeframe.period', interval: 'timeframe.multiplier', n: 'bar_index', isintraday: 'timeframe.isintraday', isdaily: 'timeframe.isdaily', isweekly: 'timeframe.isweekly', ismonthly: 'timeframe.ismonthly', heikinashi: 'ticker.heikinashi', renko: 'ticker.renko' });
for (const c in L.COL) V4[c] = 'color.' + c;
for (const s of ['line', 'histogram', 'cross', 'area', 'columns', 'circles', 'linebr', 'areabr', 'stepline']) if (!V4[s]) V4['style_' + s] = 'plot.style_' + s;
const V4VAR = { line: 'plot.style_line', linebr: 'plot.style_linebr', stepline: 'plot.style_stepline', histogram: 'plot.style_histogram', cross: 'plot.style_cross', area: 'plot.style_area', areabr: 'plot.style_areabr', columns: 'plot.style_columns', circles: 'plot.style_circles', dotted: 'hline.style_dotted', dashed: 'hline.style_dashed', solid: 'hline.style_solid', integer: 'integer', bool: 'bool' };

/* ---------- built-in variables ---------- */
const OHLCV = { open: 'O', high: 'H', low: 'L', close: 'C', volume: 'V', time: 'T' };
const DER = {
  hl2: 'R.high+R.low)/2', hlc3: 'R.high+R.low+R.close)/3', ohlc4: 'R.open+R.high+R.low+R.close)/4', hlcc4: 'R.high+R.low+R.close+R.close)/4'
};
const DERH = { hl2: 'R.hd2', hlc3: 'R.hd3', ohlc4: 'R.hd4', hlcc4: 'R.hdc' };
Object.assign(VAR, {
  bar_index: R => R.i, last_bar_index: R => R.n - 1, last_bar_time: R => R.T[R.n - 1], timenow: () => Date.now(), time_close: R => R.time + R.tfMs, time_tradingday: R => Math.floor(R.time / 864e5) * 864e5,
  ask: R => R.close, bid: R => R.close,
  'barstate.isfirst': R => R.i === 0, 'barstate.islast': R => R.i === R.n - 1, 'barstate.isconfirmed': R => R.conf, 'barstate.ishistory': R => R.conf, 'barstate.isrealtime': R => !R.conf, 'barstate.isnew': () => true,
  'barstate.islastconfirmedhistory': R => R.i === R.n - 1 - (R.live ? 1 : 0),
  'syminfo.tickerid': R => R.sym.tickerid, 'syminfo.ticker': R => R.sym.ticker, 'syminfo.root': R => R.sym.ticker, 'syminfo.prefix': R => R.sym.prefix, 'syminfo.description': R => R.sym.desc, 'syminfo.currency': R => R.sym.cur, 'syminfo.basecurrency': R => R.sym.base, 'syminfo.mintick': R => R.sym.mintick, 'syminfo.pointvalue': () => 1, 'syminfo.timezone': R => R.sym.tz, 'syminfo.session': () => 'regular', 'syminfo.type': R => R.sym.type, 'syminfo.volumetype': () => 'base', 'syminfo.minmove': R => Math.round(R.sym.mintick * Math.pow(10, R.sym.prec)), 'syminfo.pricescale': R => Math.pow(10, R.sym.prec), 'syminfo.mincontract': R => R.sym.minQty || 0.00001, 'syminfo.country': () => '', 'syminfo.sector': () => '', 'syminfo.industry': () => '', 'syminfo.main_tickerid': R => R.sym.tickerid,
  'timeframe.period': R => R.tfName, 'timeframe.main_period': R => R.tfName, 'timeframe.multiplier': R => R.tfMult, 'timeframe.isintraday': R => R.tfMs < 864e5, 'timeframe.isdaily': R => /D$/.test(R.tf), 'timeframe.isweekly': R => /W$/.test(R.tf), 'timeframe.ismonthly': R => /M$/.test(R.tf), 'timeframe.isdwm': R => R.tfMs >= 864e5, 'timeframe.isseconds': R => /S$/.test(R.tf), 'timeframe.isminutes': R => /^\d+$/.test(R.tf), 'timeframe.isticks': () => false,
  'chart.bg_color': R => R.theme.bg, 'chart.fg_color': R => R.theme.fg, 'chart.is_standard': () => true, 'chart.is_heikinashi': () => false, 'chart.is_renko': () => false, 'chart.is_kagi': () => false, 'chart.is_linebreak': () => false, 'chart.is_pnf': () => false, 'chart.is_range': () => false, 'chart.left_visible_bar_time': R => R.vis ? R.vis[0] : R.T[0], 'chart.right_visible_bar_time': R => R.vis ? R.vis[1] : R.T[R.n - 1],
  'session.ismarket': () => true, 'session.ispremarket': () => false, 'session.ispostmarket': () => false, 'session.isfirstbar': R => R.newDay(), 'session.isfirstbar_regular': R => R.newDay(), 'session.islastbar': R => R.i < R.n - 1 && Math.floor(R.T[R.i + 1] / 864e5) !== Math.floor(R.time / 864e5), 'session.islastbar_regular': R => R.i < R.n - 1 && Math.floor(R.T[R.i + 1] / 864e5) !== Math.floor(R.time / 864e5),
  'strategy.position_size': R => R.strat ? R.strat.size : 0, 'strategy.position_avg_price': R => R.strat && R.strat.size ? R.strat.avg : NaN, 'strategy.equity': R => R.strat ? R.strat.equityNow(R.close) : NaN, 'strategy.netprofit': R => R.strat ? R.strat.net : 0, 'strategy.openprofit': R => R.strat ? R.strat.openPnl(R.close) : 0, 'strategy.grossprofit': R => R.strat ? R.strat.gp : 0, 'strategy.grossloss': R => R.strat ? R.strat.gl : 0, 'strategy.initial_capital': R => R.strat ? R.strat.o.initial_capital : NaN, 'strategy.opentrades': R => R.strat ? R.strat.open.length : 0, 'strategy.closedtrades': R => R.strat ? R.strat.closed.length : 0, 'strategy.wintrades': R => R.strat ? R.strat.wins : 0, 'strategy.losstrades': R => R.strat ? R.strat.losses : 0, 'strategy.eventrades': R => R.strat ? R.strat.closed.length - R.strat.wins - R.strat.losses : 0, 'strategy.max_drawdown': R => R.strat ? R.strat.maxDD : 0, 'strategy.max_runup': R => R.strat ? R.strat.maxRU : 0, 'strategy.position_entry_name': R => R.strat && R.strat.open.length ? R.strat.open[0].id : NaN, 'strategy.account_currency': R => R.sym.cur,
  'strategy.avg_trade': R => R.strat && R.strat.closed.length ? R.strat.net / R.strat.closed.length : NaN
});
for (const k in CONST) if (k === 'strategy.commission.percent') CONST[k] = 'percent';
const tr = (get, f) => (R, n) => { const s = R.strat; if (!s) return NaN; const l = get(s), t = l[n]; return t ? f(t, R) : NaN; };
for (const [k, g] of [['opentrades', s => s.open], ['closedtrades', s => s.closed]]) {
  RF['strategy.' + k + '.entry_price'] = tr(g, t => t.ep); RF['strategy.' + k + '.entry_bar_index'] = tr(g, t => t.ei); RF['strategy.' + k + '.entry_time'] = tr(g, (t, R) => R.T[t.ei]); RF['strategy.' + k + '.entry_id'] = tr(g, t => t.id); RF['strategy.' + k + '.entry_comment'] = tr(g, t => t.comment || ''); RF['strategy.' + k + '.size'] = tr(g, t => t.q * t.dir);
  RF['strategy.' + k + '.profit'] = tr(g, (t, R) => t.pnl !== undefined ? t.pnl : (R.close - t.ep) * t.q * t.dir); RF['strategy.' + k + '.profit_percent'] = tr(g, (t, R) => (t.pnl !== undefined ? t.pnl : (R.close - t.ep) * t.q * t.dir) / (t.ep * t.q) * 100); RF['strategy.' + k + '.exit_price'] = tr(g, t => t.xp); RF['strategy.' + k + '.exit_bar_index'] = tr(g, t => t.xi); RF['strategy.' + k + '.exit_time'] = tr(g, (t, R) => R.T[t.xi]); RF['strategy.' + k + '.exit_id'] = tr(g, t => t.xid); RF['strategy.' + k + '.exit_comment'] = tr(g, t => t.xc || ''); RF['strategy.' + k + '.commission'] = tr(g, t => t.com || 0); RF['strategy.' + k + '.max_runup'] = tr(g, t => t.mfe || 0); RF['strategy.' + k + '.max_drawdown'] = tr(g, t => t.mae || 0);
}
for (const f of ['entry', 'order', 'exit', 'close', 'close_all', 'cancel', 'cancel_all']) RF['strategy.' + f] = (R, ...a) => { if (R.strat && !R.strat.frozen) R.strat[f](R, ...a); };
RF['strategy.default_entry_qty'] = (R, fill_price) => R.strat ? R.strat.qty(fill_price) : NaN; RF['strategy.convert_to_account'] = (R, v) => v; RF['strategy.convert_to_symbol'] = (R, v) => v;
for (const f of ['allow_entry_in', 'max_cons_loss_days', 'max_drawdown', 'max_intraday_filled_orders', 'max_intraday_loss', 'max_position_size']) RF['strategy.risk.' + f] = () => {};
RF['runtime.error'] = (R, message) => { throw new Error(message); };
RF['ticker.new'] = (R, prefix, ticker) => (prefix ? prefix + ':' : '') + ticker; RF['ticker.modify'] = (R, tickerid) => tickerid; RF['ticker.standard'] = (R, symbol) => symbol || R.sym.tickerid; RF['ticker.inherit'] = (R, from, symbol) => symbol;
RF['ticker.heikinashi'] = (R, symbol) => 'HA~' + symbol; for (const k of ['renko', 'linebreak', 'kagi', 'pointfigure']) RF['ticker.' + k] = (R, symbol) => symbol;
RF['max_bars_back'] = () => {};
/* TradingView/ta library (import ... as ta) */
RF['ta.requestUpAndDownVolume'] = (R, lowerTimeframe) => { const b = R.bars.B, v = R.volume || 0; const up = b && b[R.i] === b[R.i] && b[R.i] !== undefined ? b[R.i] : R.high > R.low ? v * (R.close - R.low) / (R.high - R.low) : v / 2; return [up, -(v - up), 2 * up - v]; };
RF['ta.requestVolumeDelta'] = (R, lowerTimeframe, cumulationPeriod) => { const d = RF['ta.requestUpAndDownVolume'](R)[2]; return [0, Math.max(0, d), Math.min(0, d), d]; };
T['ta.dema'] = (st, R, source, length) => { const e = T['ta.ema'](L.sub(st, 0), R, source, length); return 2 * e - T['ta.ema'](L.sub(st, 1), R, e, length); };
T['ta.tema'] = (st, R, source, length) => { const e = T['ta.ema'](L.sub(st, 0), R, source, length), f = T['ta.ema'](L.sub(st, 1), R, e, length); return 3 * e - 3 * f + T['ta.ema'](L.sub(st, 2), R, f, length); }; RF['indicator'] = () => {}; RF['strategy'] = () => {}; RF['library'] = () => {};
for (const k of ['financial', 'economic', 'earnings', 'dividends', 'splits', 'quandl', 'seed', 'currency_rate']) RF['request.' + k] = () => (k === 'currency_rate' ? 1 : NaN);
RF['syminfo.prefix'] = (R, symbol) => String(symbol).split(':')[0]; RF['syminfo.ticker'] = (R, symbol) => String(symbol).split(':').pop();

const paramCache = {};
function paramsOf(name) {
  if (SIG[name]) return SIG[name];
  if (paramCache[name]) return paramCache[name];
  const f = T[name] || RF[name] || PF[name]; if (!f) return [];
  const s = f.toString(); let a;
  const m = /^\(([^)]*)\)\s*=>/.exec(s); if (m) a = m[1]; else { const k = /^([A-Za-z_$][\w$]*)\s*=>/.exec(s); a = k ? k[1] : ''; }
  a = a.split(',').map(x => x.trim().replace(/=.*$/, '')).filter(Boolean);
  a = a.slice(T[name] ? 2 : RF[name] ? 1 : 0);
  return (paramCache[name] = a);
}
PN.paramsOf = paramsOf;
const isBuiltinFn = n => !!(T[n] || RF[n] || PF[n] || ST[n] || n === 'request.security' || n === 'request.security_lower_tf');
const NS = new Set(); for (const o of [T, RF, PF, CONST, VAR, ST]) for (const k in o) if (k.includes('.')) NS.add(k.split('.')[0]);
['syminfo', 'timeframe', 'barstate', 'request', 'input', 'strategy', 'log'].forEach(x => NS.add(x));

/* ============================================================ compiler ============================================================ */
function compile(src) {
  const ast = PP.parse(src);
  const ver = ast.meta.version;
  const types = {}, enums = {}, funcs = {}, methods = {};
  for (const s of ast.body) {
    if (s.type === 'Type') types[s.name] = s;
    else if (s.type === 'Enum') enums[s.name] = s;
    else if (s.type === 'Func') { (funcs[s.name] || (funcs[s.name] = [])).push(s); if (s.method) (methods[s.name] || (methods[s.name] = [])).push(s); }
  }
  let uid = 0;
  const slices = [];       // source text of security slices
  let siteId = 0, stateId = 0;
  const err = (n, msg) => { throw new PineError(msg, n && n.line, n && n.col); };
  const usedB = new Map();
  const bRef = (kind, name) => { const k = kind + ':' + name; if (!usedB.has(k)) usedB.set(k, 'b' + usedB.size); return usedB.get(k); };

  /* names needing history per whole script (by name; conservative) */
  const histNames = new Set();
  (function walk(n) { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(walk); return; } if (n.type === 'Hist' && n.e.type === 'Id') histNames.add(n.e.name); for (const k in n) if (k !== 'line' && k !== 'col') { const v = n[k]; if (v && typeof v === 'object') walk(v); } })(ast.body);
  const declared = new Set(); (function w(n) { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(w); return; } if (n.type === 'Var') declared.add(n.name); if (n.type === 'Tuple') n.names.forEach(x => declared.add(x)); if (n.type === 'Func') n.params.forEach(x => declared.add(x.name)); for (const k in n) if (k !== 'line' && k !== 'col') { const v = n[k]; if (v && typeof v === 'object') w(v); } })(ast.body);
  const hasSec = new Map();
  function containsSec(n, seen) {
    if (!n || typeof n !== 'object') return false;
    if (Array.isArray(n)) return n.some(x => containsSec(x, seen));
    if (n.type === 'Call') {
      const nm = dotted(n.fn);
      if (nm === 'request.security' || nm === 'security' || nm === 'request.security_lower_tf') return true;
      const base = n.fn.type === 'Id' ? n.fn.name : n.fn.type === 'Member' ? n.fn.name : null;
      if (base && funcs[base] && !seen.has(base)) { const s2 = new Set(seen); s2.add(base); if (hasSec.has(base) ? hasSec.get(base) : funcs[base].some(f => containsSec(f.body, s2))) return true; }
    }
    for (const k in n) if (k !== 'line' && k !== 'col') { const v = n[k]; if (v && typeof v === 'object' && containsSec(v, seen)) return true; }
    return false;
  }
  for (const f in funcs) hasSec.set(f, funcs[f].some(x => containsSec(x.body, new Set([f]))));
  function statefulIn(n) { if (!n || typeof n !== 'object') return false; if (Array.isArray(n)) return n.some(statefulIn); if (n.type === 'Call') { const d = dotted(n.fn); if (d && (T[d] || T[V4[d]])) return true; if (n.fn.type === 'Id' && funcs[n.fn.name]) return true; } for (const k in n) if (k !== 'line' && k !== 'col') { const v = n[k]; if (v && typeof v === 'object' && statefulIn(v)) return true; } return false; }

  function dotted(n) { if (!n) return null; if (n.type === 'Id') return n.name; if (n.type === 'Member') { const d = dotted(n.obj); return d ? d + '.' + n.name : null; } return null; }

  /* ---- scope ---- */
  class Scope {
    constructor(parent, frame) { this.p = parent; this.frame = frame || (parent && parent.frame) || '$G'; this.m = new Map(); this.fn = parent ? parent.fn : null; }
    get(n) { let s = this; while (s) { const v = s.m.get(n); if (v) return v; s = s.p; } return null; }
    decl(name, mode, ty) { const v = { name, js: name.replace(/[^\w]/g, '_') + '_' + (++uid), mode: mode || '', frame: this.frame, ty, hk: -1 }; if (histNames.has(name)) v.hk = ctr(this.frame, 'h'); if (mode === 'var') v.slot = ctr(this.frame, 'v'); if (mode === 'varip') v.slot = ctr(this.frame, 'p'); this.m.set(name, v); return v; }
  }
  /* counters: plain global counters are fine (sparse arrays per frame) */
  const cnt = { h: 0, v: 0, p: 0 };
  const ctr = (f, k) => cnt[k]++;
  const ref = v => v.mode === 'var' ? v.frame + '.v[' + v.slot + ']' : v.mode === 'varip' ? v.frame + '.p[' + v.slot + ']' : v.js;

  let specStack = [];      // [{fn, call}] for security slices inside functions
  const secTop = { idx: 0 }; // index of current top-level statement

  /* ---- expressions ---- */
  function ex(n, sc) {
    switch (n.type) {
      case 'Num': return n.v < 0 ? '(' + n.v + ')' : String(n.v);
      case 'Str': return JSON.stringify(n.v);
      case 'Bool': return String(n.v);
      case 'Color': return JSON.stringify(n.v.toLowerCase());
      case 'TupleLit': return '[' + n.items.map(x => ex(x, sc)).join(',') + ']';
      case 'Id': return idRef(n, sc);
      case 'Member': return member(n, sc);
      case 'Un': return n.op === 'not' ? '(!' + ex(n.e, sc) + ')' : n.op === '-' ? '(-' + ex(n.e, sc) + ')' : '(+' + ex(n.e, sc) + ')';
      case 'Bin': return binEx(n, sc);
      case 'Ternary': return '(' + ex(n.c, sc) + '?' + ex(n.a, sc) + ':' + ex(n.b, sc) + ')';
      case 'Hist': return hist(n, sc);
      case 'Call': return call(n, sc);
      case 'If': case 'For': case 'ForIn': case 'While': case 'Switch': { const r = 'r' + (++uid); return '(()=>{let ' + r + '=NaN;' + struct(n, sc, r) + 'return ' + r + ';})()'; }
    }
    err(n, 'Ekspresi tidak didukung: ' + n.type);
  }
  function binEx(n, sc) {
    const a = ex(n.l, sc), b = ex(n.r, sc);
    switch (n.op) {
      case 'and': return ver < 6 && statefulIn(n.r) ? '$and(' + a + ',' + b + ')' : '(' + a + '&&' + b + ')';
      case 'or': return ver < 6 && statefulIn(n.r) ? '$or(' + a + ',' + b + ')' : '(' + a + '||' + b + ')';
      case '==': return '(' + a + '===' + b + ')';
      case '!=': return '$ne(' + a + ',' + b + ')';
      case '/': if (ver < 6 && n.l.type === 'Num' && n.r.type === 'Num' && n.l.int && n.r.int) return 'Math.trunc(' + a + '/' + b + ')'; return '(' + a + '/' + b + ')';
      default: return '(' + a + n.op + b + ')';
    }
  }
  function builtinVar(name) {
    if (OHLCV[name]) return 'R.' + name;
    if (DER[name]) return '((' + DER[name] + ')';
    if (name === 'na') return 'NaN';
    if (Object.prototype.hasOwnProperty.call(CONST, name)) return JSON.stringify(CONST[name]);
    if (VAR[name]) return bRef('V', name) + '(R)';
    if (VAR[name] === null) return bRef('T', name) + '($.s(' + (stateId++) + ',R),R)';
    if (name.startsWith('currency.')) return JSON.stringify(name.slice(9));
    return null;
  }
  function idRef(n, sc) {
    const v = sc.get(n.name);
    if (v) return ref(v);
    const b = builtinVar(n.name);
    if (b) return b;
    if (ver < 5) {
      if (V4VAR[n.name] && builtinVar(V4VAR[n.name])) return builtinVar(V4VAR[n.name]);
      if (V4[n.name] && builtinVar(V4[n.name])) return builtinVar(V4[n.name]);
      if (['integer', 'bool', 'float', 'string', 'symbol', 'resolution', 'session', 'source'].includes(n.name)) return JSON.stringify(n.name);
    }
    err(n, 'Nama "' + n.name + '" belum dideklarasikan');
  }
  function member(n, sc) {
    const d = dotted(n);
    if (d) {
      const root = d.split('.')[0];
      if (!sc.get(root) || (NS.has(root) && builtinVar(d))) {
        if (enums[root]) { const f = enums[root].fields.find(x => x.name === n.name); if (!f) err(n, 'Enum ' + root + ' tidak punya "' + n.name + '"'); return 'EN.' + root + '.' + n.name; }
        const b = builtinVar(d); if (b) return b;
        if (d.startsWith('input.') && ver < 5) return JSON.stringify(n.name);
        if (NS.has(root)) err(n, '"' + d + '" belum didukung');
        if (root === 'syminfo' || root === 'color') err(n, '"' + d + '" tidak dikenal');
      }
    }
    return '$g(' + ex(n.obj, sc) + ').f_' + n.name;
  }
  function hist(n, sc) {
    const e = n.e, k = ex(n.idx, sc);
    if (e.type === 'Id') {
      const v = sc.get(e.name);
      if (v) return v.frame + '.r(' + v.hk + ',' + k + ')';
      if (OHLCV[e.name]) return 'R.hr(R.' + OHLCV[e.name] + ',' + k + ')';
      if (DERH[e.name]) return DERH[e.name] + '(' + k + ')';
      if (ver < 5 && V4[e.name] && !builtinVar(e.name)) return hist({ type: 'Hist', e: { type: 'Member', obj: { type: 'Id', name: V4[e.name].split('.')[0] }, name: V4[e.name].split('.')[1], line: n.line }, idx: n.idx, line: n.line }, sc);
      if (e.name === 'bar_index') return '$bi(R,' + k + ')';
    }
    return '$.hx(' + (cnt.h++) + ',' + ex(e, sc) + ',' + k + ')';
  }
  function bindArgs(n, names, a, sc, conv) {
    /* returns array of js argument strings */
    const out = a.pos.map(x => conv ? conv(x) : ex(x, sc));
    for (const k in a.named) {
      const j = names.indexOf(k);
      if (j < 0) { if (conv) continue; err(a.named[k].line ? a.named[k] : n, 'Argumen "' + k + '" tidak dikenal'); }
      out[j] = conv ? conv(a.named[k]) : ex(a.named[k], sc);
    }
    for (let j = 0; j < out.length; j++) if (out[j] === undefined) out[j] = 'undefined';
    return out;
  }
  function call(n, sc) {
    let d = dotted(n.fn);
    const root = d ? d.split('.')[0] : null;
    if (d && (!sc.get(root) || (d !== root && isBuiltinFn(d) && NS.has(root)))) {
      if (n.fn.type === 'Id' && funcs[d]) return userCall(n, d, n.args, sc, null);
      /* UDT */
      if (n.fn.type === 'Member' && n.fn.obj.type === 'Id' && types[root]) {
        if (n.fn.name === 'new') { const fl = types[root].fields.map(f => f.name); return 'TY.' + root + '(' + ['R', '$'].concat(bindArgs(n, fl, n.args, sc)).join(',') + ')'; }
        if (n.fn.name === 'copy') return '$copy(' + ex(n.args.pos[0], sc) + ')';
      }
      if (ver < 5 && !isBuiltinFn(d) && V4[d]) d = V4[d];
      else if (ver < 5 && V4[d] && !d.includes('.') && d !== 'color' && !T[d] && (d === 'tostring' || d === 'security' || d === 'study')) d = V4[d];
      if (d === 'indicator' || d === 'strategy' || d === 'library' || d === 'study') return 'NaN';
      if (isBuiltinFn(d)) return builtinCall(n, d, n.args, sc);
      if (VAR[d] === null) return bRef('T', d) + '($.s(' + (stateId++) + ',R),R)';
      if (n.fn.type === 'Id') err(n.fn, 'Fungsi "' + d + '" tidak dikenal');
      if (NS.has(root)) err(n.fn, 'Fungsi "' + d + '" belum didukung');
      if (imports[root]) err(n.fn, 'Pustaka "' + imports[root] + '" (import) tidak tersedia di sini. Salin isi fungsinya ke script');
    }
    if (n.fn.type === 'Member') {
      /* method call */
      const name = n.fn.name, objJs = ex(n.fn.obj, sc);
      const ms = (methods[name] || (funcs[name] || []).filter(f => f.method));
      const bm = '$m(R,$.s(' + (stateId++) + ',R),';
      const o = 'o' + (++uid);
      if (ms && ms.length) {
        const fn = pickOverload(ms, n.args, 1, n);
        if (ms.length === 1) return userCall(n, name, n.args, sc, objJs, fn);
        /* choose by runtime type of the receiver */
        let s = '((' + o + ')=>';
        for (const f of ms) s += '$is(' + o + ',' + JSON.stringify(f.params[0].ty || '') + ')?' + userCall(n, name, n.args, sc, o, f) + ':';
        s += 'NaN)(' + objJs + ')';
        return s;
      }
      const pos = n.args.pos.map(x => ex(x, sc)).join(',');
      const nm = Object.keys(n.args.named).map(k => JSON.stringify(k) + ':' + ex(n.args.named[k], sc)).join(',');
      return bm + objJs + ',' + JSON.stringify(name) + ',[' + pos + ']' + (nm ? ',{' + nm + '}' : '') + ')';
    }
    err(n, 'Pemanggilan tidak dikenal');
  }
  function pickOverload(list, a, extra, n) {
    const c = a.pos.length + Object.keys(a.named).length + (extra || 0);
    const ok = list.filter(f => c <= f.params.length && f.params.filter(p => !p.def).length <= c);
    if (!ok.length) { if (list.length === 1) err(n, 'Jumlah argumen fungsi "' + list[0].name + '" tidak cocok'); err(n, 'Tidak ada versi fungsi "' + list[0].name + '" yang cocok'); }
    if (ok.length > 1) {
      const kind = x => x.type === 'Num' ? (x.int ? 'int' : 'float') : x.type === 'Str' ? 'string' : x.type === 'Bool' ? 'bool' : x.type === 'Color' ? 'color' : null;
      const best = ok.find(f => a.pos.every((x, j) => { const k = kind(x), p = f.params[j + (extra || 0)]; return !k || !p || !p.ty || p.ty === k || (k === 'int' && p.ty === 'float'); }));
      if (best) return best;
    }
    return ok[0];
  }
  function userCall(n, name, a, sc, recv, fnDecl) {
    const f = fnDecl || pickOverload(funcs[name], a, recv ? 1 : 0, n);
    const names = f.params.map(p => p.name);
    const args = bindArgs(n, recv ? names.slice(1) : names, a, sc);
    const all = recv ? [recv].concat(args) : args;
    const kid = stateId++;
    if (hasSec.get(name)) {
      if (specStack.length > 8) err(n, 'Fungsi security terlalu dalam');
      /* specialised copy, so the security expression can be rebuilt from this call */
      specStack.push({ fn: f, call: a, recvAst: recv && n.fn.obj, names });
      const js = genFunc(f, sc, true);
      specStack.pop();
      return '(' + js + ')(' + ['$.c(' + kid + ')'].concat(all).join(',') + ')';
    }
    if (f.jsName === undefined) err(n, 'Fungsi "' + name + '" dipakai sebelum dideklarasikan');
    return f.jsName + '(' + ['$.c(' + kid + ')'].concat(all).join(',') + ')';
  }
  function builtinCall(n, d, a, sc) {
    if (d === 'request.security' || d === 'request.security_lower_tf') return security(n, d, a, sc);
    if (d === 'nz' || d === 'na') { if (d === 'na' && !a.pos.length && !Object.keys(a.named).length) return 'NaN'; return (d === 'na' ? '$na' : '$nz') + '(' + bindArgs(n, d === 'na' ? ['x'] : ['source', 'replacement'], a, sc).join(',') + ')'; }
    if (ST[d]) {
      let key = d;
      if (d === 'fill' && (a.named.top_value || a.named.top_color || a.pos.length >= 6)) key = 'fill6';
      let names = paramsOf(key);
      if (d.startsWith('input')) return inputCall(n, d, a, sc);
      if (d.startsWith('log.')) names = ['message'];
      const args = bindArgs(n, names, a, sc);
      if (d.startsWith('plot') || d === 'hline' || d === 'fill' || d === 'bgcolor' || d === 'barcolor') { const k = names.indexOf('title'); if (k >= 0 && args[k] === undefined) while (args.length < k) args.push('undefined'); }
      return bRef('S', key) + '(R,' + (siteId++) + (args.length ? ',' + args.join(',') : '') + ')';
    }
    let names = paramsOf(d);
    if (names.length && names[0].startsWith('...')) names = [];
    const varargs = /\.\.\./.test((T[d] || RF[d] || PF[d]).toString().slice(0, 40));
    let args;
    if (varargs) { args = a.pos.map(x => ex(x, sc)); for (const k in a.named) args.push(ex(a.named[k], sc)); if (d === 'timestamp') { const order = ['timezone', 'year', 'month', 'day', 'hour', 'minute', 'second']; if (Object.keys(a.named).length) { args = order.map(k => a.named[k] ? ex(a.named[k], sc) : 'undefined'); if (args[0] === 'undefined') args.shift(); while (args.length && args[args.length - 1] === 'undefined') args.pop(); } } if (SIG[d]) args = bindArgs(n, SIG[d], a, sc); }
    else {
      /* pivothigh(left,right) style short overloads use names of the long form */
      args = bindArgs(n, names, a, sc);
    }
    if (d === 'array.new' || d === 'matrix.new' || d === 'map.new') { /* generic type ignored */ if (d === 'array.new' && n.generic === 'bool' && args.length === 1) args.push('false'); }
    const A = args.length ? ',' + args.join(',') : '';
    if (T[d]) return bRef('T', d) + '($.s(' + (stateId++) + ',R),R' + A + ')';
    if (RF[d]) return bRef('F', d) + '(R' + A + ')';
    return bRef('P', d) + '(' + args.join(',') + ')';
  }
  const inputCount = {};
  function inputCall(n, d, a, sc) {
    const id = siteId++;
    let names = paramsOf(d);
    let key = d;
    if (d === 'input' && ver < 5) { names = SIG.input4; }
    const get = k => a.named[k] || a.pos[names.indexOf(k)];
    const dv = get('defval');
    if (d === 'input' && ver < 5) { const t = get('type'); const tn = t ? (dotted(t) || '').split('.').pop() : null; const mp = { integer: 'int', float: 'float', bool: 'bool', string: 'string', color: 'color', resolution: 'timeframe', session: 'session', symbol: 'symbol', source: 'source', time: 'time', price: 'price' }; if (tn && mp[tn]) key = 'input.' + mp[tn]; }
    if (key === 'input' && dv) { if (dv.type === 'Num') key = dv.int ? 'input.int' : 'input.float'; else if (dv.type === 'Un' && dv.e.type === 'Num') key = dv.e.int ? 'input.int' : 'input.float'; else if (dv.type === 'Bool') key = 'input.bool'; else if (dv.type === 'Str') key = 'input.string'; else if (dv.type === 'Color' || (dotted(dv) || '').startsWith('color.') || (dv.type === 'Call' && (dotted(dv.fn) || '').startsWith('color.'))) key = 'input.color'; else if (dv.type === 'Id') key = 'input.source'; }
    const o = {};
    const nm2 = key === d || (d === 'input' && ver < 5) ? names : SIG['input'];
    const put = (k, v) => { o[k] = v; };
    a.pos.forEach((x, j) => { if (nm2[j]) put(nm2[j], x); });
    for (const k in a.named) put(k, a.named[k]);
    /* int/float positional signature alternates: (defval,title,options,...) */
    if (a.pos.length > 2 && a.pos[2].type === 'TupleLit') { o.options = a.pos[2]; delete o.minval; }
    const parts = [];
    for (const k in o) { if (k === 'type') continue; if (key === 'input.source' && k === 'defval') { const nm = dotted(o[k]); parts.push('defval:' + JSON.stringify(nm || 'close')); continue; } parts.push(k + ':' + ex(o[k], sc)); }
    if (key === 'input.source') { const nm = dotted(dv) || 'close'; return '(R.iv[' + id + ']===undefined?R.regInput(' + id + ',"' + key + '",{' + parts.join(',') + '},' + JSON.stringify(curVar) + '):0,R.srcv(' + id + ',' + (builtinVar(nm) && !sc.get(nm) ? builtinVar(nm) : ex(dv, sc)) + '))'; }
    return '(R.iv[' + id + ']===undefined?R.regInput(' + id + ',"' + key + '",{' + parts.join(',') + '},' + JSON.stringify(curVar) + '):R.iv[' + id + '])';
  }
  let curVar = '';
  /* ---- request.security ---- */
  /* free identifiers of a node (locals of functions / blocks are excluded) */
  function idsIn(n, set, bound) {
    bound = bound || new Set();
    if (!n || typeof n !== 'object') return set;
    if (Array.isArray(n)) { const b2 = new Set(bound); for (const x of n) idsIn2(x, set, b2); return set; }
    idsIn2(n, set, bound);
    return set;
  }
  function idsIn2(n, set, bound) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { const b2 = new Set(bound); for (const x of n) idsIn2(x, set, b2); return; }
    const sub = (x, b) => { if (x) idsIn2(x, set, b || bound); };
    switch (n.type) {
      case 'Id': if (!bound.has(n.name)) set.add(n.name); return;
      case 'Member': sub(n.obj); return;
      case 'Call': if (n.fn.type === 'Member') { if (methods[n.fn.name]) set.add(n.fn.name); sub(n.fn.obj); } else sub(n.fn); n.args.pos.forEach(x => sub(x)); for (const k in n.args.named) sub(n.args.named[k]); return;
      case 'Func': { const b2 = new Set(bound); n.params.forEach(p => { if (p.def) sub(p.def); b2.add(p.name); }); for (const x of n.body) idsIn2(x, set, b2); return; }
      case 'Var': sub(n.init); bound.add(n.name); return;
      case 'Tuple': sub(n.init); n.names.forEach(x => bound.add(x)); return;
      case 'Assign': { let t = n.target; sub(t); sub(n.value); return; }
      case 'If': sub(n.cond); sub(n.then); sub(n.els); return;
      case 'While': sub(n.cond); sub(n.body); return;
      case 'For': { sub(n.from); sub(n.to); sub(n.by); const b2 = new Set(bound); b2.add(n.name); for (const x of n.body) idsIn2(x, set, b2); return; }
      case 'ForIn': { sub(n.it); const b2 = new Set(bound); b2.add(n.name); if (n.idx) b2.add(n.idx); for (const x of n.body) idsIn2(x, set, b2); return; }
      case 'Switch': sub(n.subj); for (const c of n.cases) { sub(c.test); sub(c.body); } return;
    }
    for (const k in n) if (k !== 'line' && k !== 'col') { const v = n[k]; if (v && typeof v === 'object') idsIn2(v, set, bound); }
  }
  function writesOf(s, set, loc) {
    if (!s || typeof s !== 'object') return set;
    const top = !loc; loc = loc || new Set();
    if (Array.isArray(s)) { const l2 = new Set(loc); s.forEach(x => { if (x && (x.type === 'Var')) { writesOf(x.init, set, l2); l2.add(x.name); } else if (x && x.type === 'Tuple') { writesOf(x.init, set, l2); x.names.forEach(q => l2.add(q)); } else writesOf(x, set, l2); }); return set; }
    if (top) { if (s.type === 'Var' || s.type === 'Func') set.add(s.name); if (s.type === 'Tuple') s.names.forEach(x => set.add(x)); }
    if (s.type === 'Func') return set;
    const add = t => { while (t && (t.type === 'Member' || t.type === 'Hist')) t = t.obj || t.e; if (t && t.type === 'Id' && !loc.has(t.name) && !(NS.has(t.name) && !declared.has(t.name))) set.add(t.name); };
    if (s.type === 'Assign') add(s.target);
    if (s.type === 'Call' && s.fn.type === 'Member') add(s.fn.obj);
    if (s.type === 'Call' && s.args && s.args.pos[0] && s.args.pos[0].type === 'Id' && /^(array|map|matrix)\./.test(dotted(s.fn) || '')) add(s.args.pos[0]);
    for (const k in s) if (k !== 'line' && k !== 'col') { const v = s[k]; if (v && typeof v === 'object') writesOf(v, set, loc); }
    return set;
  }
  function sliceStmts(list, need) {
    const inc = new Array(list.length).fill(false);
    const info = list.map(s => ({ w: writesOf(s, new Set()), r: idsIn(s, new Set()) }));
    let changed = true;
    while (changed) { changed = false; for (let k = 0; k < list.length; k++) if (!inc[k]) { let hit = false; for (const w of info[k].w) if (need.has(w)) { hit = true; break; } if (hit) { inc[k] = true; changed = true; for (const r of info[k].r) need.add(r); } } }
    return list.filter((_, k) => inc[k]);
  }
  function security(n, d, a, sc) {
    const names = SIG[d];
    const get = k => a.named[k] || a.pos[names.indexOf(k)];
    const sym = get('symbol'), tf = get('timeframe'), e = get('expression');
    if (!sym || !e) err(n, 'request.security: argumen kurang');
    const id = slices.length; slices.push(null);
    const opt = [];
    for (const k of ['gaps', 'lookahead']) { const v = get(k); opt.push(v ? ex(v, sc) : 'undefined'); }
    if (opt[1] === 'true') opt[1] = '"lookahead_on"'; if (opt[0] === 'true') opt[0] = '"gaps_on"';
    const symJs = ex(sym, sc), tfJs = tf ? ex(tf, sc) : '""';
    /* build slice */
    const need = idsIn(e, new Set());
    const prel = [];
    for (let k = specStack.length - 1; k >= 0; k--) {
      const { fn, call: c, recvAst, names: pn } = specStack[k];
      const body = fn.body.slice(0, Math.max(0, fn.body.length));
      const loc = sliceStmts(body.filter(s => !(containsSec(s, new Set()))), need);
      const ps = [];
      fn.params.forEach((p, j) => { let arg = recvAst ? (j === 0 ? recvAst : c.pos[j - 1]) : c.pos[j]; if (c.named[p.name]) arg = c.named[p.name]; if (!arg) arg = p.def; if (arg && need.has(p.name)) ps.push({ type: 'Var', name: p.name, mode: '', init: arg, line: n.line, __param: true }); });
      prel.unshift(ps.concat(loc));
      ps.forEach(p => idsIn(p.init, need));
    }
    const globals = sliceStmts(ast.body.slice(0, secTop.idx + 1).filter((s, k) => k < secTop.idx || s.type === 'Func'), need);
    const saveStack = specStack; specStack = [];
    const saveFn = new Map(); for (const f in funcs) for (const x of funcs[f]) { saveFn.set(x, x.jsName); x.jsName = undefined; }
    const saveTop = secTop.idx;
    const root = new Scope(null, '$G');
    let js = '';
    const saveBody = ast.body;
    for (const s of globals) { secTop.idx = saveBody.indexOf(s); js += stmt(s, root); }
    secTop.idx = saveTop;
    let sc2 = root;
    for (const lvl of prel) {
      sc2 = new Scope(sc2, '$G');
      /* evaluate params in the outer scope first */
      const outer = sc2.p; const tmp = [];
      for (const s of lvl) if (s.__param) tmp.push([s, ex(s.init, outer)]);
      for (const [s, j] of tmp) { const v = sc2.decl(s.name, ''); js += 'let ' + v.js + '=' + (v.hk >= 0 ? '$G.w(' + v.hk + ',' + j + ')' : j) + ';'; }
      for (const s of lvl) if (!s.__param) js += stmt(s, sc2);
    }
    js += 'return ' + ex(e, sc2) + ';';
    slices[id] = js;
    specStack = saveStack; for (const [x, v] of saveFn) x.jsName = v;
    return (d === 'request.security' ? 'R.sec' : 'R.secL') + '($.s(' + (stateId++) + ',R),' + id + ',' + symJs + ',' + tfJs + ',' + opt.join(',') + (e.type === 'TupleLit' ? ',' + e.items.length : '') + ')';
  }

  /* ---- statements ---- */
  function wrapHist(v, js) { return v.hk >= 0 ? v.frame + '.w(' + v.hk + ',' + js + ')' : js; }
  const isStruct = n => n && (n.type === 'If' || n.type === 'For' || n.type === 'ForIn' || n.type === 'While' || n.type === 'Switch');
  function stmt(s, sc) {
    switch (s.type) {
      case 'Func': return genFuncDecl(s, sc);
      case 'Type': case 'Enum': return '';
      case 'Import': imports[s.as || s.path.split('/')[1]] = s.path; return '';
      case 'Break': return 'break;';
      case 'Continue': return 'continue;';
      case 'Var': {
        curVar = s.name;
        if (s.mode === 'var' || s.mode === 'varip') {
          const arr = s.mode === 'var' ? 'v' : 'p';
          const init = isStruct(s.init) ? ex(s.init, sc) : ex(s.init, sc);
          const v = sc.decl(s.name, s.mode, s.ty);
          let js = 'if(' + ref(v) + '===undefined)' + ref(v) + '=' + init + ';';
          if (v.hk >= 0) js += v.frame + '.w(' + v.hk + ',' + ref(v) + ');';
          return js;
        }
        if (isStruct(s.init)) {
          const t = 't' + (++uid);
          const b = 'let ' + t + '=NaN;' + struct(s.init, sc, t);
          const v = sc.decl(s.name, '', s.ty);
          return b + 'let ' + v.js + '=' + wrapHist(v, t) + ';';
        }
        let e = ex(s.init, sc);
        if (s.ty === 'int' && s.init.type === 'Bin' && s.init.op === '/') e = 'Math.trunc(' + e + ')';
        const v = sc.decl(s.name, '', s.ty);
        return 'let ' + v.js + '=' + wrapHist(v, e) + ';';
      }
      case 'Tuple': {
        curVar = s.names[0];
        const t = 't' + (++uid);
        let js = isStruct(s.init) ? 'let ' + t + '=NaN;' + struct(s.init, sc, t) : 'let ' + t + '=' + ex(s.init, sc) + ';';
        js += t + '=Array.isArray(' + t + ')?' + t + ':[];';
        s.names.forEach((nm, k) => { if (nm === '_') return; const v = sc.decl(nm, ''); js += 'let ' + v.js + '=' + wrapHist(v, '$u(' + t + '[' + k + '])') + ';'; });
        return js;
      }
      case 'Assign': {
        curVar = s.target.name || '';
        const op = s.op === ':=' ? '' : s.op[0];
        let val, pre = '';
        if (isStruct(s.value)) { const t = 't' + (++uid); pre = 'let ' + t + '=NaN;' + struct(s.value, sc, t); val = t; } else val = ex(s.value, sc);
        if (s.target.type === 'Id') {
          const v = sc.get(s.target.name);
          if (!v) err(s.target, 'Nama "' + s.target.name + '" belum dideklarasikan');
          const e = op ? '(' + ref(v) + op + val + ')' : val;
          return pre + ref(v) + '=' + wrapHist(v, e) + ';';
        }
        if (s.target.type === 'Member') {
          const o = ex(s.target.obj, sc);
          if (!op) return pre + '$set(' + o + ',"f_' + s.target.name + '",' + val + ');';
          const t = 't' + (++uid);
          return pre + '{const ' + t + '=' + o + ';$set(' + t + ',"f_' + s.target.name + '",$g(' + t + ').f_' + s.target.name + op + val + ');}';
        }
        err(s, 'Target penugasan tidak didukung');
      }
      case 'Expr': {
        if (isStruct(s.expr)) return struct(s.expr, sc, null);
        curVar = '';
        return ex(s.expr, sc) + ';';
      }
    }
    err(s, 'Pernyataan tidak didukung: ' + s.type);
  }
  /* block of statements, last value into target */
  function blockInto(list, sc, target) {
    const s2 = new Scope(sc);
    let js = '';
    list.forEach((s, k) => {
      if (k < list.length - 1 || !target) { js += stmt(s, s2); return; }
      if (s.type === 'Expr') { js += isStruct(s.expr) ? struct(s.expr, s2, target) : target + '=' + ex(s.expr, s2) + ';'; return; }
      js += stmt(s, s2);
      if (s.type === 'Var') js += target + '=' + ref(s2.get(s.name)) + ';';
      else if (s.type === 'Assign' && s.target.type === 'Id') js += target + '=' + ref(s2.get(s.target.name)) + ';';
      else if (s.type === 'Assign') js += target + '=' + ex(s.target, s2) + ';';
      else if (s.type === 'Tuple') js += target + '=[' + s.names.map(x => ref(s2.get(x))).join(',') + '];';
    });
    return js;
  }
  function struct(n, sc, target) {
    switch (n.type) {
      case 'If': return 'if(' + ex(n.cond, sc) + '){' + blockInto(n.then, sc, target) + '}' + (n.els ? 'else{' + blockInto(n.els, sc, target) + '}' : '');
      case 'While': return 'while(' + ex(n.cond, sc) + '){R.lc();' + blockInto(n.body, sc, target) + '}';
      case 'For': {
        const s2 = new Scope(sc), a = 'a' + (++uid), b = 'a' + (++uid), d = 'a' + (++uid), st = 'a' + (++uid);
        const f = ex(n.from, sc), to = ex(n.to, sc), by = n.by ? ex(n.by, sc) : '1';
        const v = s2.decl(n.name, '');
        return '{const ' + a + '=' + f + ',' + b + '=' + to + ',' + d + '=' + a + '<=' + b + '?1:-1,' + st + '=Math.abs(' + by + ')||1;for(let ' + v.js + '=' + a + ';' + d + '>0?' + v.js + '<=' + b + ':' + v.js + '>=' + b + ';' + v.js + '+=' + d + '*' + st + '){R.lc();' + (v.hk >= 0 ? v.frame + '.w(' + v.hk + ',' + v.js + ');' : '') + blockInto(n.body, s2, target) + '}}';
      }
      case 'ForIn': {
        const s2 = new Scope(sc), a = 'a' + (++uid), k = 'a' + (++uid);
        const it = ex(n.it, sc);
        let js = '{const ' + a + '=$iter(' + it + (n.idx ? ',1' : '') + ');for(let ' + k + '=0;' + k + '<' + a + '.length;' + k + '++){R.lc();';
        const v = s2.decl(n.name, '');
        if (n.idx) { const vi = s2.decl(n.idx, ''); js += 'let ' + vi.js + '=' + a + '.__mk?' + a + '.__mk[' + k + ']:' + k + ';'; }
        js += 'let ' + v.js + '=' + a + '[' + k + '];' + blockInto(n.body, s2, target) + '}}';
        return js;
      }
      case 'Switch': {
        const t = 's' + (++uid);
        let js = n.subj ? '{const ' + t + '=' + ex(n.subj, sc) + ';' : '{';
        let first = true, def = null;
        for (const c of n.cases) {
          if (!c.test) { def = c; continue; }
          js += (first ? '' : 'else ') + 'if(' + (n.subj ? t + '===' + ex(c.test, sc) : ex(c.test, sc)) + '){' + blockInto(c.body, sc, target) + '}';
          first = false;
        }
        if (def) js += first ? '{' + blockInto(def.body, sc, target) + '}' : 'else{' + blockInto(def.body, sc, target) + '}';
        return js + '}';
      }
    }
  }
  function genFunc(f, sc) {
    let rootSc = sc; while (rootSc.p) rootSc = rootSc.p;
    const s2 = new Scope(rootSc, '$');
    let js = 'function(' + ['$'].concat(f.params.map(p => { const v = s2.decl(p.name, '', p.ty); return v.js + (p.def ? '=' + ex(p.def, rootSc) : ''); })).join(',') + '){$.enter();';
    for (const p of f.params) { const v = s2.get(p.name); if (v.hk >= 0) js += '$.w(' + v.hk + ',' + v.js + ');'; }
    const save = curVar;
    js += 'let _r=NaN;' + blockInto(f.body, s2, '_r') + 'return _r;}';
    curVar = save;
    return js;
  }
  function genFuncDecl(f, sc) {
    if (hasSec.get(f.name)) return '';   // specialised at each call
    const js = genFunc(f, sc);
    f.jsName = 'fn_' + f.name + '_' + (++uid);
    return 'const ' + f.jsName + '=' + js + ';';
  }
  const imports = {};

  /* ---- declaration (indicator / strategy) ---- */
  const decl = { kind: 'indicator', title: 'Script', overlay: false };
  const konst = x => { if (!x) return undefined; if (x.type === 'Num' || x.type === 'Str' || x.type === 'Bool') return x.v; if (x.type === 'Un' && x.op === '-') return -konst(x.e); const d = dotted(x); if (d && d in CONST) return CONST[d]; if (x.type === 'Bin') { const a = konst(x.l), b = konst(x.r); return x.op === '+' ? a + b : x.op === '*' ? a * b : x.op === '-' ? a - b : a / b; } if (x.type === 'Id') { const s = ast.body.find(q => q.type === 'Var' && q.name === x.name); return s ? konst(s.init) : undefined; } return undefined; };
  for (const s of ast.body) if (s.type === 'Expr' && s.expr.type === 'Call' && s.expr.fn.type === 'Id') {
    const nm = s.expr.fn.name;
    if (nm === 'indicator' || nm === 'study' || nm === 'strategy' || nm === 'library') {
      decl.kind = nm === 'study' ? 'indicator' : nm;
      const names = nm === 'strategy' ? SIG.strategy : SIG.indicator;
      s.expr.args.pos.forEach((x, k) => { if (names[k]) decl[names[k]] = konst(x); });
      for (const k in s.expr.args.named) decl[k === 'linktoseries' ? 'x' : k] = konst(s.expr.args.named[k]);
      if (decl.resolution !== undefined) decl.timeframe = decl.resolution;
    }
  }
  if (decl.kind === 'library') throw new PineError('Script "library" tidak bisa dipasang di chart', 1, 1);

  /* ---- main ---- */
  const root = new Scope(null, '$G');
  let main = '';
  ast.body.forEach((s, k) => { secTop.idx = k; main += '/*' + (s.line || 0) + '*/' + (s.line ? 'R.ln=' + s.line + ';' : '') + stmt(s, root) + '\n'; });

  /* ---- type constructors / enums ---- */
  let pre = 'const EN={};';
  for (const e in enums) pre += 'EN.' + e + '={' + enums[e].fields.map(f => f.name + ':{__enum:' + JSON.stringify(e) + ',name:' + JSON.stringify(f.name) + ',title:' + JSON.stringify(String(f.title)) + '}').join(',') + '};';
  let tyMk = 'const TY={};';
  for (const t in types) {
    tyMk += 'class C_' + t + '{constructor(R,$,a){const $G=R.G;';
    types[t].fields.forEach((f, k) => { tyMk += 'this.f_' + f.name + '=a[' + k + ']!==undefined?a[' + k + ']:' + (f.def ? ex(f.def, new Scope(null, '$G')) : f.ty === 'bool' && ver >= 6 ? 'false' : 'NaN') + ';'; });
    tyMk += '}}C_' + t + '.prototype.__t=' + JSON.stringify(t) + ';TY.' + t + '=(R,$,...a)=>new C_' + t + '(R,$,a);';
  }
  let libs = '';
  for (const [k, js] of usedB) { const [kind, ...r] = k.split(':'); const nm = r.join(':'); libs += 'const ' + js + '=' + (kind === 'V' ? 'VAR' : kind === 'T' ? 'T' : kind === 'F' ? 'RF' : kind === 'S' ? 'ST' : 'PF') + '[' + JSON.stringify(nm) + '];'; }
  const body = '"use strict";' + libs + pre + tyMk +
    'const main=function($G,R){const $=$G;$.enter();' + main + '};' +
    'const SL=[' + slices.map(s => 'function($G,R){const $=$G;$.enter();' + s + '}').join(',') + '];return {main,SL,EN,TY};';
  let mod;
  try { mod = new Function('T', 'RF', 'PF', 'ST', 'VAR', '$na', '$nz', '$ne', '$and', '$or', '$g', '$set', '$m', '$is', '$iter', '$u', '$copy', '$bi', 'R0', body); }
  catch (e) { const er = new PineError('Gagal menyusun script: ' + e.message, 1, 1); er.js = body; throw er; }
  const R0 = null;
  const out = mod(T, RF, PF, ST, VAR, na, (x, r) => (x == null || x !== x ? (r === undefined ? 0 : r) : x), ne, (a, b) => !!(a && b), (a, b) => !!(a || b), getObj, setObj, methodCall, isType, iter, x => (x === undefined ? NaN : x), copyObj, (R, k) => (R.i - k < 0 ? NaN : R.i - k), R0);
  return { main: out.main, SL: out.SL, EN: out.EN, decl, version: ver, js: body };
}
const ne = (a, b) => a !== b && !(a !== a) && !(b !== b) && a != null && b != null;
const EMPTY = Object.freeze({});
const getObj = o => (o == null || o !== o || typeof o !== 'object' ? EMPTY : o);
/* reads of missing fields must be NaN */
const setObj = (o, k, v) => { if (o == null || o !== o) throw new Error('Objek masih na saat mengisi "' + k.slice(2) + '"'); o[k] = v; };
const copyObj = o => { if (o == null || o !== o) return NaN; if (Array.isArray(o)) return o.slice(); if (o instanceof Map) return new Map(o); return Object.assign(Object.create(Object.getPrototypeOf(o)), o); };
const isType = (o, ty) => {
  if (!ty) return true;
  const k = kindOf(o);
  if (/^array/.test(ty)) return k === 'array'; if (/^map/.test(ty)) return k === 'map'; if (/^matrix/.test(ty)) return k === 'matrix';
  if (ty === 'float' || ty === 'int') return typeof o === 'number'; if (ty === 'string') return typeof o === 'string' && o[0] !== '#'; if (ty === 'color') return typeof o === 'string' && o[0] === '#'; if (ty === 'bool') return typeof o === 'boolean';
  if (ty === 'chart.point') return o instanceof L.ChartPoint;
  return k === ty;
};
const kindOf = o => Array.isArray(o) ? 'array' : o instanceof Map ? 'map' : o instanceof L.Matrix ? 'matrix' : o instanceof L.Draw ? o.__k : o instanceof L.ChartPoint ? 'chart.point' : o && o.__t ? o.__t : typeof o;
const iter = (o, k) => { if (Array.isArray(o)) return o; if (o instanceof Map) { const v = Array.from(o.values()); if (k) { v.__mk = Array.from(o.keys()); } return v; } if (o instanceof L.Matrix) return o.d; return []; };
function methodCall(R, st, o, name, pos, named) {
  const k = kindOf(o);
  if (k === 'number' && o !== o) { if (/^(set_|delete|clear|cell)/.test(name)) return NaN; if (/^get_/.test(name)) return NaN; throw new Error('Memanggil ".' + name + '()" pada nilai na'); }
  if (name === 'copy' && o && o.__t) return copyObj(o);
  const q = k === 'string' ? 'str.' + name : k + '.' + name;
  const f = RF[q] || PF[q] || T[q];
  if (!f) {
    if (k === 'number' || k === 'boolean') { const g = PF['math.' + name]; if (g) return g(o, ...pos); if (name === 'tostring') return RF['str.tostring'](R, o, ...pos); }
    throw new Error('Method ".' + name + '()" tidak ada untuk ' + k);
  }
  let args = pos;
  if (named) { const names = paramsOf(q).slice(1); args = pos.slice(); for (const a in named) { const j = names.indexOf(a); if (j >= 0) args[j] = named[a]; } }
  if (PF[q]) return f(o, ...args);
  if (RF[q]) return f(R, o, ...args);
  return f(st, R, o, ...args);
}

/* ============================================================ runtime ============================================================ */
class Frame {
  constructor(R) { this.R = R; this.n = -1; this.b = -1; this.v = []; this.p = []; this.h = []; this.st = []; this.k = []; }
  enter() { const i = this.R.i; if (this.b !== i) { this.b = i; this.n++; } }
  s(id, R) { let x = this.st[id]; if (x === undefined) x = this.st[id] = { n: -1, b: -1, m: 0, m0: 0 }; const i = this.R.i; if (x.b !== i) { x.b = i; x.n++; x.m0 = x.m; } return x; }
  c(id) { let x = this.k[id]; if (x === undefined) x = this.k[id] = new Frame(this.R); return x; }
  w(k, v) { let a = this.h[k]; if (a === undefined) a = this.h[k] = []; a[this.n] = v; return v; }
  r(k, off) { const a = this.h[k]; if (a === undefined) return NaN; const j = this.n - (off | 0); if (off !== off || j < 0) return NaN; const v = a[j]; return v === undefined ? NaN : v; }
  hx(k, v, off) { let a = this.h[k]; if (a === undefined) a = this.h[k] = []; a[this.n] = v; const j = this.n - (off | 0); if (j < 0 || off !== off) return NaN; const x = a[j]; return x === undefined ? NaN : x; }
}
/* sub() helper in lib needs m0 refresh */
L.sub && (function () { })();

const tzCache = new Map();
function tzOff(tz, ms) {
  const key = tz + '|' + Math.floor(ms / 900000); let v = tzCache.get(key);
  if (v !== undefined) return v;
  const m = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(tz);
  if (m) v = (m[1] === '-' ? -1 : 1) * ((+m[2]) * 60 + (+(m[3] || 0))) * 60000;
  else {
    try {
      let f = tzFmt.get(tz); if (!f) { f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }); tzFmt.set(tz, f); }
      const p = {}; for (const x of f.formatToParts(new Date(ms))) p[x.type] = +x.value;
      v = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
    } catch (e) { v = 0; }
  }
  if (tzCache.size > 60000) tzCache.clear();
  tzCache.set(key, v); return v;
}
const tzFmt = new Map();
PN.tzOff = tzOff;
/* timeframe helpers (TradingView notation) */
function tfParse(tf) {
  tf = String(tf || '').trim();
  const m = /^(\d*)([SDWMTR]?)$/.exec(tf) || /^(\d*)(m|h|d|w)$/.exec(tf); if (!m) return { mult: 1, unit: 'm', ms: 60000 };
  const k = m[1] ? +m[1] : 1, u = m[2];
  if (u === 'h') return { mult: k * 60, unit: 'm', ms: k * 36e5 };
  const ms = u === 'S' ? 1000 : u === 'D' || u === 'd' ? 864e5 : u === 'W' || u === 'w' ? 6048e5 : u === 'M' ? 2629800000 : 60000;
  return { mult: k, unit: u === '' ? 'm' : u, ms: k * ms };
}
function tfNorm(tf) { const p = tfParse(tf); if (p.unit === 'm') { if (p.mult >= 1440 && p.mult % 1440 === 0) return (p.mult / 1440) + 'D'; return String(p.mult); } return p.mult + p.unit.toUpperCase(); }
function tfFloor(t, tf) {
  const p = tfParse(tf);
  if (p.unit === 'M') { const d = new Date(t); const mi = d.getUTCFullYear() * 12 + d.getUTCMonth(); const q = Math.floor(mi / p.mult) * p.mult; return Date.UTC(Math.floor(q / 12), q % 12, 1); }
  if (p.unit === 'W' || p.unit === 'w') { const off = 4 * 864e5; return Math.floor((t - off) / p.ms) * p.ms + off; }
  return Math.floor(t / p.ms) * p.ms;
}
function tfNext(t, tf) { const p = tfParse(tf); if (p.unit === 'M') { const d = new Date(t); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + p.mult, 1); } return t + p.ms; }
Object.assign(PN, { tfParse, tfNorm, tfFloor, tfNext });
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n, l) => String(n).padStart(l || 2, '0');
function fmtTime(ms, f, tz) {
  const o = tzOff(tz, ms), d = new Date(ms + o);
  return f.replace(/'([^']*)'|y+|M+|d+|E+|H+|h+|m+|s+|S+|a|Z|w+/g, (x, q) => {
    if (q !== undefined) return q;
    switch (x[0]) {
      case 'y': return x.length === 2 ? pad(d.getUTCFullYear() % 100) : String(d.getUTCFullYear());
      case 'M': return x.length >= 4 ? d.toLocaleString('en', { month: 'long', timeZone: 'UTC' }) : x.length === 3 ? MON[d.getUTCMonth()] : x.length === 2 ? pad(d.getUTCMonth() + 1) : String(d.getUTCMonth() + 1);
      case 'd': return x.length === 1 ? String(d.getUTCDate()) : pad(d.getUTCDate());
      case 'E': return x.length >= 4 ? d.toLocaleString('en', { weekday: 'long', timeZone: 'UTC' }) : DAYS[d.getUTCDay()];
      case 'H': return x.length === 1 ? String(d.getUTCHours()) : pad(d.getUTCHours());
      case 'h': { const h = d.getUTCHours() % 12 || 12; return x.length === 1 ? String(h) : pad(h); }
      case 'm': return x.length === 1 ? String(d.getUTCMinutes()) : pad(d.getUTCMinutes());
      case 's': return x.length === 1 ? String(d.getUTCSeconds()) : pad(d.getUTCSeconds());
      case 'S': return pad(d.getUTCMilliseconds(), 3);
      case 'a': return d.getUTCHours() < 12 ? 'AM' : 'PM';
      case 'Z': { const a = Math.abs(o) / 60000; return (o < 0 ? '-' : '+') + pad(Math.floor(a / 60)) + pad(a % 60); }
      case 'w': return String(Math.ceil((((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5) + 1) / 7));
    }
    return x;
  });
}
PN.fmtTime = fmtTime;

class Runtime {
  /* prog: compile() result; host: { sym, tf, theme, series(sym,tf) , source(key) , tz }, overrides: input values */
  constructor(prog, host, overrides, fnMain, depth) {
    this.prog = prog; this.host = host; this.sym = host.sym; this.tf = host.tf; this.ov = overrides || {};
    this.mainFn = fnMain || prog.main; this.depth = depth || 0;
    const p = tfParse(host.tf); this.tfMs = p.ms; this.tfMult = p.mult;
    this.tfName = p.unit === 'm' ? String(p.mult) : (prog.version >= 6 || p.mult > 1 ? p.mult + p.unit : p.unit);
    this.theme = host.theme || { bg: '#131722', fg: '#d1d4dc' };
    this.secT = {};
    this.reset();
  }
  reset() {
    this.G = new Frame(this); this.i = -1; this.n = 0; this.ln = 0; this.loops = 0;
    this.plots = {}; this.plotList = []; this.acs = {}; this.alertQ = []; this.logs = []; this.inputs = []; this.iv = this.depth ? this.iv || [] : []; this.inNames = {};
    this.lines = []; this.labels = []; this.boxes = []; this.tables = []; this.linefills = []; this.polylines = [];
    const d = this.prog.decl; this.maxOf = { line: d.max_lines_count || 50, label: d.max_labels_count || 50, box: d.max_boxes_count || 50, polyline: d.max_polylines_count || 50 };
    this.strat = d.kind === 'strategy' && !this.depth ? new Strategy(d, this) : null;
    this.snap = null; this.rtNow = false; this.live = false; this.pending = false; this.subs = new Map();
    this.done = -1; this.doneN = 0;
  }
  lc() { if (++this.loops > 4e6) throw new Error('Loop terlalu panjang'); }
  setBars(b) { this.T = b.T; this.O = b.O; this.H = b.H; this.L = b.L; this.C = b.C; this.V = b.V; this.n = b.T.length; this.bars = b; }
  load(i) { this.i = i; this.open = this.O[i]; this.high = this.H[i]; this.low = this.L[i]; this.close = this.C[i]; this.volume = this.V[i]; this.time = this.T[i]; }
  hr(a, off) { const j = this.i - (off | 0); return j < 0 || off !== off ? NaN : a[j]; }
  hd2(o) { const j = this.i - (o | 0); return j < 0 ? NaN : (this.H[j] + this.L[j]) / 2; }
  hd3(o) { const j = this.i - (o | 0); return j < 0 ? NaN : (this.H[j] + this.L[j] + this.C[j]) / 3; }
  hd4(o) { const j = this.i - (o | 0); return j < 0 ? NaN : (this.O[j] + this.H[j] + this.L[j] + this.C[j]) / 4; }
  hdc(o) { const j = this.i - (o | 0); return j < 0 ? NaN : (this.H[j] + this.L[j] + 2 * this.C[j]) / 4; }
  newDay() { return this.i === 0 || Math.floor(this.T[this.i] / 864e5) !== Math.floor(this.T[this.i - 1] / 864e5); }
  tfSec(tf) { return tfParse(tf).ms / 1000; }
  fmtTime(ms, f, tz) { return fmtTime(ms, f, tz || this.sym.tz || 'UTC'); }
  tpart(ms, tz) {
    tz = tz || this.sym.tz || 'UTC';
    if (na(ms)) return { year: NaN, month: NaN, dayofmonth: NaN, dayofweek: NaN, hour: NaN, minute: NaN, second: NaN, weekofyear: NaN };
    const d = new Date(ms + tzOff(tz, ms));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, dayofmonth: d.getUTCDate(), dayofweek: d.getUTCDay() + 1, hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds(), weekofyear: Math.ceil(((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7) };
  }
  timestamp(a) {
    if (a.length === 1) { const t = typeof a[0] === 'string' ? Date.parse(/[zZ]|GMT|UTC|[+-]\d\d:?\d\d$/.test(a[0]) ? a[0] : a[0] + ' UTC') : a[0]; return na(t) ? NaN : t; }
    let tz = this.sym.tz || 'UTC';
    if (typeof a[0] === 'string') { tz = a[0]; a = a.slice(1); }
    const u = Date.UTC(a[0], (a[1] || 1) - 1, a[2] === undefined ? 1 : a[2], a[3] || 0, a[4] || 0, a[5] || 0);
    return u - tzOff(tz, u - tzOff(tz, u));
  }
  inSession(ms, sess, tz) {
    if (na(sess) || sess === '' || sess === '24x7') return true;
    const [rng, days] = String(sess).split(':');
    const d = new Date(ms + tzOff(tz, ms)), mi = d.getUTCHours() * 60 + d.getUTCMinutes(), dow = d.getUTCDay() + 1;
    const ok = days || '1234567';
    for (const r of rng.split(',')) {
      const m = /^(\d{2})(\d{2})-(\d{2})(\d{2})$/.exec(r.trim()); if (!m) continue;
      const a = +m[1] * 60 + +m[2]; let b = +m[3] * 60 + +m[4]; if (b === 0) b = 1440;
      if (a < b ? mi >= a && mi < b && ok.includes(dow) : (a === b && ok.includes(dow)) || (mi >= a && ok.includes(dow)) || (mi < b && ok.includes(dow === 1 ? 7 : dow - 1))) return true;
    }
    return false;
  }
  timeFn(tf, sess, tz, close) {
    const t = this.time;
    if (!na(sess) && sess !== undefined && sess !== '' && !this.inSession(t, sess, tz || this.sym.tz || 'UTC')) return NaN;
    const f = na(tf) || tf === '' || tf === undefined ? this.tf : tf;
    const a = tfParse(f).ms <= this.tfMs ? t : tfFloor(t, f);
    return close ? tfNext(a, f) : a;
  }
  /* ---- inputs ---- */
  regInput(id, type, o, varName) {
    let key = !na(o.title) && o.title !== '' ? String(o.title) : varName || 'in' + id;
    if (this.inNames[key] !== undefined && this.inNames[key] !== id) { let k = 2; while (this.inNames[key + '#' + k] !== undefined) k++; key += '#' + k; }
    this.inNames[key] = id;
    let v = this.ov[key];
    const inp = { id, key, type: type.replace(/^input\.?/, '') || 'float', def: o.defval, title: na(o.title) ? varName : o.title, min: o.minval, max: o.maxval, step: o.step, tip: o.tooltip, group: o.group, inline: o.inline, options: o.options };
    if (inp.type === 'enum' && v !== undefined && typeof v === 'string') { const E = this.prog.EN[o.defval.__enum]; v = E && E[v]; if (!inp.options) inp.options = E && Object.values(E); }
    else if (inp.type === 'enum' && !inp.options) inp.options = Object.values(this.prog.EN[o.defval.__enum] || {});
    if (v !== undefined && v !== null) { if ((inp.type === 'int' || inp.type === 'float' || inp.type === 'time' || inp.type === 'price')) { v = +v; if (v !== v) v = undefined; else { if (!na(inp.min) && inp.min !== undefined) v = Math.max(v, inp.min); if (!na(inp.max) && inp.max !== undefined) v = Math.min(v, inp.max); } } }
    if (v === undefined || v === null) v = o.defval;
    inp.val = v; this.inputs.push(inp); this.iv[id] = v === undefined ? NaN : v;
    if (inp.type === 'source') return undefined;
    return this.iv[id];
  }
  srcv(id, def) {
    const v = this.iv[id];
    if (v === undefined) return def;
    const i = this.inputs.length ? null : null;
    const inp = this._src || (this._src = {}); let f = inp[id];
    if (!f) { const rec = this.inputs.find(x => x.id === id); f = inp[id] = rec && rec.val !== rec.def ? rec.val : ''; }
    if (!f) return def;
    switch (f) {
      case 'open': case 'high': case 'low': case 'close': case 'volume': return this[f];
      case 'hl2': return (this.high + this.low) / 2; case 'hlc3': return (this.high + this.low + this.close) / 3; case 'ohlc4': return (this.open + this.high + this.low + this.close) / 4; case 'hlcc4': return (this.high + this.low + 2 * this.close) / 4;
    }
    if (f.startsWith('@')) { const a = this.host.source ? this.host.source(f) : null; const x = a ? a[this.i] : NaN; return x === undefined ? NaN : x; }
    return def;
  }
  /* ---- security ---- */
  sub(id, sym, tf) {
    const key = id + '|' + sym + '|' + tf;
    let s = this.subs.get(key);
    if (s) return s;
    s = { key, ser: null, rt: null, vals: [], ver: -1, missing: false };
    this.subs.set(key, s);
    return s;
  }
  ensureSub(s, id, sym, tf) {
    if (s.missing) return false;
    if (!s.ser) {
      const ser = this.host.series ? this.host.series(sym, tf) : null;
      if (!ser) { s.missing = true; return false; }
      if (!ser.ready) { if (ser.failed) { s.missing = true; return false; } this.pending = true; (this.waits || (this.waits = new Set())).add(ser); return false; }
      s.ser = ser;
      const h = Object.assign({}, this.host, { sym: ser.sym || this.sym, tf: ser.tf || tf });
      s.rt = new Runtime(this.prog, h, this.ov, this.prog.SL[id], this.depth + 1);
      s.rt.iv = []; s.rt.ov = this.ov;
    }
    const b = s.ser.bars, n = b.T.length;
    if (s.ver !== s.ser.ver) {
      s.rt.maxOf = { line: 1, label: 1, box: 1, polyline: 1 };
      const from = s.len === undefined || s.first !== b.T[0] ? 0 : Math.max(0, s.len - 1);
      if (from === 0) { s.rt.reset(); s.vals = []; }
      s.rt.runRange(b, from, s.vals, s.ser.live);
      s.len = n; s.first = b.T[0]; s.ver = s.ser.ver;
      if (s.rt.pending) { this.pending = true; for (const w of s.rt.waits || []) (this.waits || (this.waits = new Set())).add(w); s.missing = true; s.rt.pending = false; }
    }
    return true;
  }
  sec(st, id, sym, tf, gaps, look, tupleN) {
    if (this.depth > 3) return tupleN ? new Array(tupleN).fill(NaN) : NaN;
    sym = na(sym) || sym === '' ? this.sym.tickerid : sym;
    tf = na(tf) || tf === '' ? this.tf : tfNorm(tf);
    const s = this.sub(id, sym, tf);
    const none = tupleN ? new Array(tupleN).fill(NaN) : NaN;
    if (!this.ensureSub(s, id, sym, tf)) return none;
    const T2 = s.ser.bars.T, t = this.time;
    const ltf = tfParse(tf).ms < this.tfMs;
    let j;
    const tc = t + this.tfMs;
    if (ltf) { /* last lower bar inside this bar */ j = ub(T2, tc - 1, st, s); }
    else {
      j = ub(T2, t, st, s);
      const on = look === 'lookahead_on';
      if (!on && j >= 0) { const end = tfNext(T2[j], tf); const live = j === T2.length - 1 && s.ser.live && !this.conf; if (end > tc && !live) j--; }
    }
    if (j < 0) return none;
    if (gaps === 'gaps_on') { const pj = st.pj; if (st.pb !== this.i) { st.pj0 = st.cj; st.pb = this.i; } st.cj = j; if (st.pj0 === j) return none; }
    const v = s.vals[j];
    return v === undefined ? none : v;
  }
  secL(st, id, sym, tf) {
    sym = na(sym) || sym === '' ? this.sym.tickerid : sym; tf = tfNorm(tf);
    const s = this.sub(id, sym, tf);
    if (!this.ensureSub(s, id, sym, tf)) return [];
    const T2 = s.ser.bars.T, a = lb(T2, this.time), b = lb(T2, this.time + this.tfMs);
    const out = []; for (let k = a; k < b; k++) out.push(s.vals[k]);
    if (out.length && Array.isArray(out[0])) return out[0].map((_, c) => out.map(x => x[c]));
    return out;
  }
  /* run bars from..end collecting slice values (sub runtimes) */
  runRange(b, from, vals, live) {
    this.setBars(b);
    const n = this.n;
    for (let i = from; i < n; i++) {
      const last = i === n - 1 && live;
      if (from && i === from && this.snap && this.snap.i === i) this.restore();
      this.conf = !last; this.live = !!live; this.loops = 0;
      if (i === n - 1) this.snapshot(i);
      this.load(i);
      vals[i] = this.mainFn(this.G, this);
    }
  }
  /* ---- main execution ---- */
  run(bars, live) {
    this.reset(); this._src = {};
    this.setBars(bars); this.live = !!live;
    const n = this.n;
    for (let i = 0; i < n; i++) this.exec(i, !(live && i === n - 1));
    this.done = n - 1; this.doneN = n; this.firstT = bars.T[0];
    if (this.strat) this.strat.finish(this);
  }
  exec(i, conf) {
    this.conf = conf; this.loops = 0; this.lastConf = conf;
    if (!conf) this.snapshot(i);
    this.load(i);
    if (this.strat) { this.strat.frozen = !conf; if (conf) this.strat.onBar(this, i); }
    this.mainFn(this.G, this);
    if (this.strat && conf) this.strat.afterBar(this, i);
  }
  /* incremental: same bars object grew or its last bar changed */
  update(bars, live) {
    if (this.done < 0 || bars.T[0] !== this.firstT || bars.T.length < this.doneN) return this.run(bars, live);
    this.setBars(bars); this.live = !!live; this.rtNow = true;
    const n = this.n;
    if (this.lastConf && live && n === this.doneN) { this.rtNow = false; return this.run(bars, live); }
    const start = this.lastConf ? this.doneN : this.doneN - 1;
    this.lastConf0 = this.lastConf;
    for (let i = start; i < n; i++) {
      const conf = !(live && i === n - 1);
      if (i === start && !this.lastConf0) { if (!this.snap || this.snap.i !== i) { return (this.rtNow = false, this.run(bars, live)); } this.restore(); }
      this.conf = conf; this.loops = 0;
      if (!conf && (i !== start || this.lastConf0)) this.snapshot(i);
      this.lastConf = conf;
      this.load(i);
      if (this.strat) { this.strat.frozen = !conf; if (conf) this.strat.onBar(this, i); }
      this.mainFn(this.G, this);
      if (this.strat && conf) this.strat.afterBar(this, i);
      if (conf) this.snap = i === n - 1 ? null : this.snap;
    }
    this.rtNow = false;
    this.done = n - 1; this.doneN = n;
    if (this.strat) this.strat.finish(this);
  }
  snapshot(i) {
    const m = new Map(), frames = [];
    const visit = o => {
      if (o === null || typeof o !== 'object' || m.has(o)) return;
      if (Array.isArray(o)) { const c = o.slice(); m.set(o, c); for (const x of c) if (x !== null && typeof x === 'object') visit(x); }
      else if (o instanceof Map) { m.set(o, new Map(o)); for (const x of o.values()) visit(x); }
      else if (o instanceof L.Matrix) { m.set(o, o.d.map(r => r.slice())); }
      else if (o.__enum) return;
      else if (o instanceof L.Draw) { const c = Object.assign({}, o); if (o.cells) c.cells = Object.assign({}, ...Object.keys(o.cells).map(k => ({ [k]: Object.assign({}, o.cells[k]) }))); m.set(o, c); if (o.points) visit(o.points); if (o.line1 instanceof L.Draw) { visit(o.line1); visit(o.line2); } }
      else { m.set(o, Object.assign({}, o)); for (const k in o) { const x = o[k]; if (x !== null && typeof x === 'object') visit(x); } }
    };
    const fr = f => { frames.push([f, f.v.slice(), f.n, f.b]); for (const x of f.v) visit(x); for (const c of f.k) if (c) fr(c); };
    fr(this.G);
    for (const k of ['lines', 'labels', 'boxes', 'tables', 'linefills', 'polylines']) visit(this[k]);
    this.snap = { i, m, frames, set: new Set(frames.map(x => x[0])) };
  }
  restore() {
    const s = this.snap; if (!s) return;
    for (const [f, v] of s.frames) { f.v.length = 0; for (let k = 0; k < v.length; k++) f.v[k] = v[k]; }
    const fr = f => { if (!s.set.has(f)) f.v.length = 0; for (const c of f.k) if (c) fr(c); };
    fr(this.G);
    for (const [o, c] of s.m) {
      if (Array.isArray(o)) { o.length = 0; for (const x of c) o.push(x); }
      else if (o instanceof Map) { o.clear(); for (const [k, v] of c) o.set(k, v); }
      else if (o instanceof L.Matrix) o.d = c.map(r => r.slice());
      else if (o instanceof L.Draw) { delete o.__del; Object.assign(o, c); if (c.cells) { o.cells = {}; for (const k in c.cells) o.cells[k] = Object.assign({}, c.cells[k]); } }
      else Object.assign(o, c);
    }
  }
}
function ub(a, x, st, s) { /* last index with a[idx] <= x, with a moving hint */ let h = st && st.hint !== undefined && st.hintS === s ? st.hint : -2; if (h >= -1 && h < a.length && (h < 0 || a[h] <= x)) { while (h + 1 < a.length && a[h + 1] <= x) h++; if (st) st.hint = h; return h; } let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] <= x) lo = m + 1; else hi = m; } if (st) { st.hint = lo - 1; st.hintS = s; } return lo - 1; }
function lb(a, x) { let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; } return lo; }
PN.lb = lb;

/* ============================================================ strategy ============================================================ */
class Strategy {
  constructor(d, R) {
    this.o = { initial_capital: d.initial_capital || 1000000, qtyType: d.default_qty_type || 'fixed', qtyVal: d.default_qty_value === undefined ? 1 : d.default_qty_value, pyr: d.pyramiding || 0, com: d.commission_value || 0, comT: d.commission_type || 'percent', slip: (d.slippage || 0) * R.sym.mintick, onClose: !!d.process_orders_on_close, anyRule: d.close_entries_rule === 'ANY' };
    Object.assign(this.o, R.host.stratOpt || {});
    this.open = []; this.closed = []; this.orders = new Map(); this.exits = new Map(); this.net = 0; this.gp = 0; this.gl = 0; this.wins = 0; this.losses = 0; this.eq = []; this.peak = this.o.initial_capital; this.low = this.o.initial_capital; this.maxDD = 0; this.maxDDp = 0; this.maxRU = 0; this.frozen = false; this.fills = []; this.comTot = 0;
  }
  get size() { let s = 0; for (const t of this.open) s += t.q * t.dir; return s; }
  get avg() { let s = 0, q = 0; for (const t of this.open) { s += t.ep * t.q; q += t.q; } return q ? s / q : NaN; }
  openPnl(p) { let s = 0; for (const t of this.open) s += (p - t.ep) * t.q * t.dir; return s; }
  equityNow(p) { return this.o.initial_capital + this.net + this.openPnl(p); }
  qty(p) { const o = this.o; if (o.qtyType === 'percent_of_equity') return this.equityNow(p) * o.qtyVal / 100 / p; if (o.qtyType === 'cash') return o.qtyVal / p; return o.qtyVal; }
  fee(p, q) { const o = this.o; return o.comT === 'cash_per_contract' ? o.com * q : o.comT === 'cash_per_order' ? o.com : p * q * o.com / 100; }
  entry(R, id, direction, qty, limit, stop, oca_name, oca_type, comment) { this.orders.set(id, { id, dir: direction === 'short' || direction === false ? -1 : 1, qty, limit: num(limit), stop: num(stop), comment, entry: true, i: R.i }); }
  order(R, id, direction, qty, limit, stop, on, ot, comment) { this.orders.set(id, { id, dir: direction === 'short' || direction === false ? -1 : 1, qty, limit: num(limit), stop: num(stop), comment, entry: false, i: R.i }); }
  exit(R, id, from_entry, qty, qty_percent, profit, limit, loss, stop, trail_price, trail_points, trail_offset, oca_name, comment, comment_profit, comment_loss) {
    const k = id + '|' + (na(from_entry) ? '' : from_entry);
    const p = this.exits.get(k);
    const e = { id, from: na(from_entry) ? '' : from_entry, qty, pct: qty_percent, profit: num(profit), limit: num(limit), loss: num(loss), stop: num(stop), tp: num(trail_price), tpt: num(trail_points), to: num(trail_offset), comment, cp: comment_profit, cl: comment_loss, best: p ? p.best : NaN, armed: p ? p.armed : false, used: p ? p.used : new Set(), i: R.i };
    this.exits.set(k, e);
  }
  close(R, id, comment, qty, qty_percent, alert_message, immediately) { if (!this.open.some(t => t.id === id)) return; const o = { close: id, comment, qty, pct: qty_percent }; if (immediately || this.o.onClose) this.fillClose(R, o, R.close, R.i); else this.orders.set('\u0001close' + id, o); }
  close_all(R, comment, am, immediately) { if (!this.open.length) return; const o = { close: '\u0002all', comment }; if (immediately || this.o.onClose) this.fillClose(R, o, R.close, R.i); else this.orders.set('\u0001closeall', o); }
  cancel(R, id) { this.orders.delete(id); for (const k of Array.from(this.exits.keys())) if (this.exits.get(k).id === id) this.exits.delete(k); }
  cancel_all() { this.orders.clear(); this.exits.clear(); }
  fillClose(R, o, p, i) { let trades = o.close === '\u0002all' ? this.open.slice() : this.open.filter(t => t.id === o.close); let q = trades.reduce((s, t) => s + t.q, 0); if (!na(o.qty) && o.qty !== undefined) q = Math.min(q, o.qty); else if (!na(o.pct) && o.pct !== undefined) q *= o.pct / 100; const dir = trades.length ? trades[0].dir : 1; this.reduce(R, trades, q, p - dir * this.o.slip, i, o.close === '\u0002all' ? 'Close all' : 'Close ' + o.close, o.comment); }
  reduce(R, trades, q, p, i, xid, xc) {
    for (const t of trades) {
      if (q <= 1e-12) break;
      const k = Math.min(q, t.q); q -= k;
      const part = { id: t.id, dir: t.dir, q: k, ep: t.ep, ei: t.ei, comment: t.comment, xp: p, xi: i, xid, xc: na(xc) ? '' : xc, mfe: t.mfe * k / t.q, mae: t.mae * k / t.q };
      const fee = this.fee(p, k), feeIn = t.com * k / t.q;
      part.com = fee + feeIn; this.comTot += part.com; part.pnl = (p - t.ep) * k * t.dir - part.com; part.pct = part.pnl / (t.ep * k) * 100; part.et = R.T[t.ei]; part.xt = R.T[i];
      t.com -= feeIn; t.q -= k;
      this.net += part.pnl; if (part.pnl > 0) { this.gp += part.pnl; this.wins++; } else if (part.pnl < 0) { this.gl -= part.pnl; this.losses++; }
      part.cum = this.net; this.closed.push(part); this.fills.push({ i, p, dir: -t.dir, q: k, label: part.xc || xid, exit: true });
    }
    this.open = this.open.filter(t => t.q > 1e-12);
    if (!this.open.length) { for (const e of this.exits.values()) { e.best = NaN; e.armed = false; e.used = new Set(); } }
  }
  fillEntry(R, o, p, i) {
    const size = this.size;
    p += o.dir * this.o.slip;
    let q = na(o.qty) || o.qty === undefined ? this.qty(p) : o.qty;
    if (!(q > 0)) return;
    if (size && Math.sign(size) !== o.dir) {
      if (!o.entry) { const k = Math.min(q, Math.abs(size)); this.reduce(R, this.open.slice(), k, p, i, o.id, o.comment); q -= k; if (q <= 1e-12) return; }
      else { this.reduce(R, this.open.slice(), Math.abs(size), p, i, o.id, o.comment); if (na(o.qty) || o.qty === undefined) q = this.qty(p); }
    } else if (size && o.entry && this.open.length > this.o.pyr) return;
    this.open.push({ id: o.id, dir: o.dir, q, q0: q, ep: p, ei: i, comment: na(o.comment) ? '' : o.comment, com: this.fee(p, q), mfe: 0, mae: 0 });
    this.fills.push({ i, p, dir: o.dir, q, label: na(o.comment) || !o.comment ? o.id : o.comment });
  }
  onBar(R, i) {
    const o = R.open, h = R.high, l = R.low, c = R.close;
    /* market orders at the open */
    for (const [k, od] of Array.from(this.orders)) {
      if (od.close !== undefined) { this.orders.delete(k); this.fillClose(R, od, o, i); continue; }
      if (na(od.limit) && na(od.stop)) { this.orders.delete(k); this.fillEntry(R, od, o, i); }
    }
    const path = Math.abs(o - h) < Math.abs(o - l) ? [o, h, l, c] : [o, l, h, c];
    this.walk(R, i, o, o, true);
    for (let s = 0; s < 3; s++) this.walk(R, i, path[s], path[s + 1], false);
    for (const t of this.open) { const up = t.dir > 0 ? (h - t.ep) : (t.ep - l), dn = t.dir > 0 ? (t.ep - l) : (h - t.ep); t.mfe = Math.max(t.mfe, up * t.q); t.mae = Math.max(t.mae, dn * t.q); }
  }
  walk(R, i, a, b, gap) {
    for (let guard = 0; guard < 40; guard++) {
      let best = null;
      const consider = (price, f, kind) => { /* kind: 'up' trigger when price >= , 'dn' when <= */
        let hit = null;
        if (kind === 'up') { if (a >= price) hit = a; else if (b >= price) hit = price; }
        else { if (a <= price) hit = a; else if (b <= price) hit = price; }
        if (hit === null) return;
        const d = Math.abs(hit - a); if (!best || d < best.d) best = { d, p: hit, f };
      };
      for (const [k, od] of this.orders) {
        if (od.close !== undefined) continue;
        if (!na(od.stop) && !od.trig) consider(od.stop, p => { if (!na(od.limit)) { od.trig = true; od.stop = NaN; } else { this.orders.delete(k); this.fillEntry(R, od, p, i); } }, od.dir > 0 ? 'up' : 'dn');
        else if (!na(od.limit)) consider(od.limit, p => { this.orders.delete(k); this.fillEntry(R, od, p, i); }, od.dir > 0 ? 'dn' : 'up');
      }
      for (const [k, e] of this.exits) {
        const tr = this.open.filter(t => (!e.from || t.id === e.from) && !e.used.has(t)); if (!tr.length) continue;
        const dir = tr[0].dir, m = R.sym.mintick, ep = tr[0].ep;
        const q0 = tr.reduce((s, t) => s + t.q, 0); let q = !na(e.qty) && e.qty !== undefined ? Math.min(q0, e.qty) : !na(e.pct) && e.pct !== undefined ? tr.reduce((s, t) => s + t.q0, 0) * e.pct / 100 : q0; q = Math.min(q, q0);
        const go = cm => p => { for (const t of tr) e.used.add(t); this.reduce(R, tr, q, p, i, e.id, !na(cm) && cm ? cm : e.comment); if (q < q0 - 1e-12) { /* partial: keep used so it fires once */ } };
        const lim = !na(e.limit) ? e.limit : !na(e.profit) ? ep + dir * e.profit * m : NaN, stp = !na(e.stop) ? e.stop : !na(e.loss) ? ep - dir * e.loss * m : NaN;
        if (!na(lim)) consider(lim, go(e.cp), dir > 0 ? 'up' : 'dn');
        if (!na(stp)) consider(stp, p => go(e.cl)(p - dir * this.o.slip), dir > 0 ? 'dn' : 'up');
        const act = !na(e.tp) ? e.tp : !na(e.tpt) ? ep + dir * e.tpt * m : NaN;
        if (!na(act) && !na(e.to)) {
          if (!e.armed) { if (dir > 0 ? Math.max(a, b) >= act : Math.min(a, b) <= act) { e.armed = true; e.best = dir > 0 ? Math.max(a, b) : Math.min(a, b); } }
          else { const ts = e.best - dir * e.to * m; consider(ts, go(), dir > 0 ? 'dn' : 'up'); e.best = dir > 0 ? Math.max(e.best, a) : Math.min(e.best, a); }
        }
      }
      if (!best) break;
      a = best.p; best.f(best.p);
    }
    for (const e of this.exits.values()) if (e.armed) { const t = this.open.find(x => !e.from || x.id === e.from); if (t) e.best = t.dir > 0 ? Math.max(e.best, b) : Math.min(e.best, b); }
  }
  afterBar(R, i) {
    if (this.o.onClose) for (const [k, od] of Array.from(this.orders)) if (od.close === undefined && na(od.limit) && na(od.stop)) { this.orders.delete(k); this.fillEntry(R, od, R.close, i); }
    const e = this.equityNow(R.close); this.eq[i] = e;
    if (e > this.peak) this.peak = e; if (e < this.low) this.low = e;
    const dd = this.peak - e; if (dd > this.maxDD) this.maxDD = dd; if (dd / this.peak * 100 > this.maxDDp) this.maxDDp = dd / this.peak * 100; this.maxRU = Math.max(this.maxRU, e - this.low);
  }
  finish() { }
}
const num = x => (x === undefined || x === null ? NaN : +x);
Object.assign(PN, { compile, Runtime, Frame, Strategy, PineError });
})();
