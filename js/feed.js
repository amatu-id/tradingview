/* Amatu Chart — market data: Binance spot/futures, Bybit, OKX, Coinbase, Hyperliquid, gTrade (forex, metals, oil, stocks) */
(function () {
'use strict';
const AC = window.AC, U = AC.U, PN = window.AC_PINE;
const F = AC.F = {};
const GT = 'https://backend-pricing.eu.gains.trade', GTWS = 'wss://backend-pricing.eu.gains.trade', HL = 'https://api.hyperliquid.xyz/info', HLWS = 'wss://api.hyperliquid.xyz/ws';
const BN = ['https://data-api.binance.vision', 'https://api.binance.com', 'https://api1.binance.com'];
const CATALOG = [["EURUSD","Euro vs US Dollar","Majors",5,"g:21"],["GBPUSD","Great Britain Pound vs US Dollar","Majors",5,"g:23"],["USDJPY","US Dollar vs Japanese Yen","Majors",3,"g:22"],["USDCHF","US Dollar vs Swiss Franc","Majors",5,"g:24"],["USDCAD","US Dollar vs Canadian Dollar","Majors",5,"g:26"],["AUDUSD","Australian Dollar vs US Dollar","Majors",5,"g:25"],["NZDUSD","New Zealand Dollar vs US Dollar","Majors",5,"g:27"],["EURGBP","Euro vs Great Britain Pound","Minors",5,"g:30"],["EURJPY","Euro vs Japanese Yen","Minors",3,"g:29"],["EURCHF","Euro vs Swiss Franc","Minors",5,"g:28"],["EURAUD","Euro vs Australian Dollar","Minors",5,"g:110"],["EURCAD","Euro vs Canadian Dollar","Minors",5,"g:112"],["EURNZD","Euro vs New Zealand Dollar","Minors",5,"g:111"],["GBPJPY","Great Britain Pound vs Japanese Yen","Minors",3,"g:117"],["GBPCHF","Great Britain Pound vs Swiss Franc","Minors",5,"g:116"],["GBPAUD","Great Britain Pound vs Australian Dollar","Minors",5,"g:113"],["GBPCAD","Great Britain Pound vs Canadian Dollar","Minors",5,"g:115"],["GBPNZD","Great Britain Pound vs New Zealand Dollar","Minors",5,"g:114"],["AUDJPY","Australian Dollar vs Japanese Yen","Minors",3,"g:121"],["AUDCHF","Australian Dollar vs Swiss Franc","Minors",5,"g:120"],["AUDCAD","Australian Dollar vs Canadian Dollar","Minors",5,"g:119"],["AUDNZD","Australian Dollar vs New Zealand Dollar","Minors",5,"g:118"],["NZDJPY","New Zealand Dollar vs Japanese Yen","Minors",3,"g:124"],["NZDCHF","New Zealand Dollar vs Swiss Franc","Minors",5,"g:123"],["NZDCAD","New Zealand Dollar vs Canadian Dollar","Minors",5,"g:122"],["CADJPY","Canadian Dollar vs Japanese Yen","Minors",3,"g:126"],["CADCHF","Canadian Dollar vs Swiss Franc","Minors",5,"g:125"],["CHFJPY","Swiss Franc vs Japanese Yen","Minors",3,"g:127"],["EURNOK","Euro vs Norwegian Krone","Exotic",5,"g:96"],["EURSEK","Euro vs Swedish Krona","Exotic",5,"g:94"],["USDCNH","US Dollar vs Chinese Yuan Offshore","Exotic",5,"g:92"],["USDMXN","US Dollar vs Mexican Peso","Exotic",5,"g:98"],["USDSGD","US Dollar vs Singapore Dollar","Exotic",5,"g:93"],["USDZAR","US Dollar vs South African Rand","Exotic",5,"g:100"],["XAUUSD","Gold vs US Dollar","Metals",3,"g:90"],["XAGUSD","Silver vs US Dollar","Metals",3,"g:91"],["XPTUSD","Platinum vs US Dollar","Metals",2,"g:188"],["XPDUSD","Palladium vs US Dollar","Metals",2,"g:189"],["USOIL","Crude Oil WTI","Energy",3,"g:187"],["UKOIL","Crude Oil Brent","Energy",3,"g:450"],["XNGUSD","Natural Gas vs US Dollar","Energy",4,"h:xyz:NATGAS"],["US500","US SPX 500 Index","Indices",2,"h:xyz:SP500"],["USTEC","US Tech 100 Index","Indices",2,"h:xyz:XYZ100"],["JP225","Japan 225 Index","Indices",2,"h:xyz:JP225"],["BTCUSD","Bitcoin vs US Dollar","Crypto",2,"g:0"],["ETHUSD","Ethereum vs US Dollar","Crypto",2,"g:1"],["AAPL","Apple Inc.","Stocks",2,"h:xyz:AAPL"],["AMD","Advanced Micro Devices Inc.","Stocks",2,"h:xyz:AMD"],["AMZN","Amazon.com Inc.","Stocks",2,"h:xyz:AMZN"],["AVGO","Broadcom Inc.","Stocks",2,"h:xyz:AVGO"],["BA","Boeing Co.","Stocks",2,"g:76"],["BABA","Alibaba Group Holding Ltd.","Stocks",2,"h:xyz:BABA"],["BIDU","Baidu Inc.","Stocks",2,"g:395"],["COST","Costco Wholesale Corp.","Stocks",2,"h:xyz:COST"],["EBAY","eBay Inc.","Stocks",2,"h:xyz:EBAY"],["FB","Meta Platforms Inc. (FB)","Stocks",2,"h:xyz:META"],["GOOGL","Alphabet Inc. Class A","Stocks",2,"h:xyz:GOOGL"],["IBM","International Business Machines","Stocks",2,"h:xyz:IBM"],["INTC","Intel Corp.","Stocks",2,"h:xyz:INTC"],["JPM","JPMorgan Chase & Co.","Stocks",2,"g:485"],["KO","Coca-Cola Co.","Stocks",2,"g:69"],["LLY","Eli Lilly and Co.","Stocks",2,"h:xyz:LLY"],["LMT","Lockheed Martin Corp.","Stocks",2,"g:397"],["MA","Mastercard Inc.","Stocks",2,"g:67"],["MCD","McDonald's Corp.","Stocks",2,"g:80"],["META","Meta Platforms Inc.","Stocks",2,"h:xyz:META"],["MSFT","Microsoft Corp.","Stocks",2,"h:xyz:MSFT"],["NFLX","Netflix Inc.","Stocks",2,"h:xyz:NFLX"],["NKE","Nike Inc.","Stocks",2,"g:72"],["NVDA","NVIDIA Corp.","Stocks",2,"h:xyz:NVDA"],["ORCL","Oracle Corp.","Stocks",2,"h:xyz:ORCL"],["PFE","Pfizer Inc.","Stocks",2,"g:68"],["PYPL","PayPal Holdings Inc.","Stocks",2,"g:74"],["SBUX","Starbucks Corp.","Stocks",2,"g:77"],["SPCX","SPAC & New Issue ETF","Stocks",2,"h:xyz:SPCX"],["TSLA","Tesla Inc.","Stocks",2,"h:xyz:TSLA"],["TSM","Taiwan Semiconductor Mfg.","Stocks",2,"h:xyz:TSM"],["V","Visa Inc.","Stocks",2,"g:66"],["WMT","Walmart Inc.","Stocks",2,"g:78"]];
const CMAP = {}; for (const c of CATALOG) CMAP[c[0]] = c;
F.CATALOG = CATALOG;
async function J(url, opt, ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms || 15000); try { const r = await fetch(url, Object.assign({ signal: c.signal }, opt)); if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; } return await r.json(); } finally { clearTimeout(t); } }
F.J = J;
async function bnGet(path) { let err; for (const b of BN) try { return await J(b + path); } catch (e) { err = e; if (e.status === 400) throw e; } throw err; }
F.bnGet = bnGet;
F.fapi = path => J('https://fapi.binance.com' + path);

/* ---------- symbol parsing ---------- */
/* canonical: EXCHANGE:TICKER   futures: BINANCE:BTCUSDT.P   expressions: A/B, A*2 ... */
F.norm = s => {
  s = String(s || '').trim(); if (!s) return 'BINANCE:BTCUSDT';
  if (/^HA~/.test(s)) return 'HA~' + F.norm(s.slice(3));
  if (F.isExpr(s)) return s;
  s = s.toUpperCase();
  if (s.includes(':')) {
    const [e, t] = s.split(':');
    const al = { OANDA: 'GNS', FX: 'GNS', FX_IDC: 'GNS', FOREXCOM: 'GNS', TVC: 'GNS', NASDAQ: 'GNS', NYSE: 'GNS', CAPITALCOM: 'GNS', EXNESS: 'GNS', PEPPERSTONE: 'GNS', ICMARKETS: 'GNS', BINANCEUS: 'BINANCE', BITSTAMP: 'COINBASE' };
    if (al[e]) { const g = { GOLD: 'XAUUSD', SILVER: 'XAGUSD', SPX: 'US500', SPX500USD: 'US500', NAS100USD: 'USTEC', NDX: 'USTEC', WTICOUSD: 'USOIL', BCOUSD: 'UKOIL' }[t] || t; return al[e] + ':' + g.replace(/M$/, x => CMAP[g] ? x : ''); }
    return e + ':' + t;
  }
  if (CMAP[s]) return 'GNS:' + s;
  if (s === 'GOLD') return 'GNS:XAUUSD';
  return 'BINANCE:' + s;
};
F.isExpr = s => /[+*/]|\s-\s|^\d+\//.test(s.replace(/^[A-Z0-9]+:/i, '')) ;
const QUOTES = ['FDUSD', 'USDT', 'USDC', 'TUSD', 'BUSD', 'DAI', 'USD1', 'BTC', 'ETH', 'BNB', 'EUR', 'TRY', 'BRL', 'JPY', 'GBP', 'AUD', 'IDR', 'USD', 'PLN', 'ARS', 'MXN', 'ZAR', 'COP', 'CZK', 'RON', 'UAH', 'XRP', 'DOGE', 'TRX', 'SOL'];
F.split = t => { t = t.replace(/\.P$/, ''); for (const q of QUOTES) if (t.endsWith(q) && t.length > q.length) return [t.slice(0, -q.length), q]; return [t, '']; };
const tick = U.load('pt.tradingview.tick', {});     // device cache of tick sizes
F.info = id => {
  const [e, t = ''] = id.replace(/^HA~/, '').split(':');
  const ha = /^HA~/.test(id);
  if (F.isExpr(id)) { return { id, tickerid: id, ticker: id.replace(/[A-Z]+:/g, ''), prefix: 'SPREAD', desc: 'Rasio / spread', cur: '', base: '', mintick: tick[id] || 0.0001, prec: U.precOf(tick[id] || 0.0001), tz: 'Etc/UTC', type: 'crypto', expr: true }; }
  let cur = '', base = t, desc = t, type = 'crypto', tz = 'Etc/UTC', mt = tick[id];
  if (e === 'GNS') { const c = CMAP[t]; if (c) { desc = c[1]; mt = mt || Math.pow(10, -c[3]); type = c[2] === 'Stocks' ? 'stock' : c[2] === 'Crypto' ? 'crypto' : c[2] === 'Indices' ? 'index' : c[2] === 'Metals' || c[2] === 'Energy' ? 'cfd' : 'forex'; tz = type === 'crypto' ? 'Etc/UTC' : 'America/New_York'; } cur = t.length === 6 ? t.slice(3) : 'USD'; base = t.length === 6 ? t.slice(0, 3) : t; }
  else if (e === 'HL') { cur = 'USD'; base = t; desc = t + ' perpetual'; }
  else { const b = t.includes('-') ? t.replace('.P', '').split('-') : F.split(t); base = b[0]; cur = b[1]; desc = base + ' / ' + cur + (t.endsWith('.P') ? ' Perpetual' : ''); }
  if (!mt) mt = 0.01;
  return { id, tickerid: id, ticker: t, prefix: e, desc: (ha ? 'Heikin Ashi · ' : '') + desc, cur, base, mintick: mt, prec: U.precOf(mt), tz, type };
};
const tickReq = {};
F.ensureInfo = id => {
  if (tick[id] || F.isExpr(id)) return Promise.resolve(F.info(id));
  if (tickReq[id]) return tickReq[id];
  const [e, t] = id.replace(/^HA~/, '').split(':');
  const p = (async () => {
    try {
      let v;
      if (e === 'BINANCE' && !t.endsWith('.P')) { const d = await bnGet('/api/v3/exchangeInfo?symbol=' + t); v = +d.symbols[0].filters.find(f => f.filterType === 'PRICE_FILTER').tickSize; }
      else if (e === 'BINANCE') { const d = await J('https://fapi.binance.com/fapi/v1/ticker/price?symbol=' + t.replace('.P', '')); v = Math.pow(10, -U.precOf(+d.price)); const l = await symbols('BINANCE_F').catch(() => null); const m = l && l.find(x => x.id === id); if (m && m.tk) v = m.tk; }
      else if (e === 'BYBIT') { const c = t.endsWith('.P') ? 'linear' : 'spot'; const d = await J('https://api.bybit.com/v5/market/instruments-info?category=' + c + '&symbol=' + t.replace('.P', '')); v = +d.result.list[0].priceFilter.tickSize; }
      else if (e === 'OKX') { const d = await J('https://www.okx.com/api/v5/public/instruments?instType=' + (t.endsWith('.P') ? 'SWAP' : 'SPOT') + '&instId=' + okxId(t)); v = +d.data[0].tickSz; }
      else if (e === 'COINBASE') { const d = await J('https://api.exchange.coinbase.com/products/' + cbId(t)); v = +d.quote_increment; }
      else if (e === 'HL') { const d = await J(HL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'l2Book', coin: hlCoin(t) }) }); v = Math.pow(10, -Math.max(...d.levels[0].slice(0, 8).map(x => U.precOf(+x.px)))); }
      if (v > 0) { tick[id] = v; U.save('pt.tradingview.tick', tick); }
    } catch (x) { delete tickReq[id]; }
    return F.info(id);
  })();
  return (tickReq[id] = p);
};
const okxId = t => { const [b, q] = F.split(t); return b + '-' + q + (t.endsWith('.P') ? '-SWAP' : ''); };
const cbId = t => { const [b, q] = F.split(t); return b + '-' + q; };
const hlCoin = t => /^XYZ_/.test(t) ? 'xyz:' + t.slice(4) : t;
/* TradingView symbol for links/widgets */
F.toTV = id => {
  id = id.replace(/^HA~/, ''); if (F.isExpr(id)) return id.replace(/\bGNS:/g, 'OANDA:').replace(/\s/g, '');
  const [e, t] = id.split(':');
  if (e === 'GNS') { const c = CMAP[t]; const m = { USOIL: 'TVC:USOIL', UKOIL: 'TVC:UKOIL', US500: 'SP:SPX', USTEC: 'NASDAQ:NDX', JP225: 'TVC:NI225', XNGUSD: 'CAPITALCOM:NATURALGAS', BTCUSD: 'COINBASE:BTCUSD', ETHUSD: 'COINBASE:ETHUSD', FB: 'NASDAQ:META' }; if (m[t]) return m[t]; if (c && c[2] === 'Stocks') return (['AMD', 'AAPL', 'AMZN', 'AVGO', 'BIDU', 'COST', 'EBAY', 'GOOGL', 'INTC', 'META', 'MSFT', 'NFLX', 'NVDA', 'PYPL', 'SBUX', 'TSLA'].includes(t) ? 'NASDAQ:' : 'NYSE:') + t; return 'OANDA:' + t; }
  if (e === 'HL') return 'HYPERLIQUID:' + t.replace('XYZ_', '') + 'USDC.P';
  return e + ':' + t;
};
F.toTVtf = tf => { const m = { '1S': '1S', '5S': '5S', '10S': '10S', '15S': '15S', '30S': '30S' }; return m[tf] || tf.replace(/^1([DWM])$/, '$1'); };
F.source = id => { const e = id.replace(/^HA~/, '').split(':')[0]; return { GNS: 'gTrade', HL: 'Hyperliquid', BINANCE: 'Binance', BYBIT: 'Bybit', OKX: 'OKX', COINBASE: 'Coinbase', OI: 'Binance Futures' }[e] || e; };

/* ---------- symbol lists (search) ---------- */
const lists = {};
function symbols(src) {
  if (lists[src]) return lists[src];
  const ck = 'pt.tradingview.list.' + src, c = U.load(ck, null);
  if (c && Date.now() - c.t < 12 * 36e5 && c.l.length) return (lists[src] = Promise.resolve(c.l));
  const p = (async () => {
    let l = [];
    if (src === 'BINANCE') { const d = await bnGet('/api/v3/ticker/24hr?type=MINI'); l = d.filter(x => +x.lastPrice > 0 && Date.now() - x.closeTime < 864e5).map(x => ({ id: 'BINANCE:' + x.symbol, v: usdVol(x.symbol, +x.quoteVolume), k: 'spot' })); }
    else if (src === 'BINANCE_F') { const d = await J('https://fapi.binance.com/fapi/v1/exchangeInfo', null, 30000); l = d.symbols.filter(x => x.contractType === 'PERPETUAL' && x.status === 'TRADING').map(x => ({ id: 'BINANCE:' + x.symbol + '.P', v: 0, k: 'swap', tk: +x.filters.find(f => f.filterType === 'PRICE_FILTER').tickSize })); }
    else if (src === 'BYBIT') { const [a, b] = await Promise.all(['linear', 'spot'].map(k => J('https://api.bybit.com/v5/market/tickers?category=' + k))); l = a.result.list.filter(x => !/-/.test(x.symbol)).map(x => ({ id: 'BYBIT:' + x.symbol + '.P', v: +x.turnover24h, k: 'swap' })).concat(b.result.list.map(x => ({ id: 'BYBIT:' + x.symbol, v: usdVol(x.symbol, +x.turnover24h), k: 'spot' }))); }
    else if (src === 'OKX') { const [a, b] = await Promise.all(['SWAP', 'SPOT'].map(k => J('https://www.okx.com/api/v5/market/tickers?instType=' + k))); l = a.data.filter(x => /-USDT-SWAP$/.test(x.instId)).map(x => ({ id: 'OKX:' + x.instId.replace('-SWAP', '').replace('-', '') + '.P', v: 0, k: 'swap' })).concat(b.data.map(x => ({ id: 'OKX:' + x.instId.replace('-', ''), v: +x.volCcy24h || 0, k: 'spot' }))); }
    else if (src === 'COINBASE') { const d = await J('https://api.exchange.coinbase.com/products'); l = d.filter(x => x.status === 'online').map(x => ({ id: 'COINBASE:' + x.base_currency + x.quote_currency, v: 0, k: 'spot' })); }
    else if (src === 'HL') { const d = await J(HL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"type":"metaAndAssetCtxs"}' }); l = d[0].universe.map((x, i) => ({ id: 'HL:' + x.name.toUpperCase(), v: +d[1][i].dayNtlVlm, k: 'swap', n: x.name })).filter(x => x.n === x.n.toUpperCase()); const z = await J(HL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"type":"meta","dex":"xyz"}' }).catch(() => null); if (z) l = l.concat(z.universe.filter(x => !x.isDelisted).map(x => ({ id: 'HL:XYZ_' + x.name.replace('xyz:', ''), v: 0, k: 'cfd' }))); }
    else if (src === 'GNS') l = CATALOG.map(c => ({ id: 'GNS:' + c[0], v: 0, k: c[2] === 'Stocks' ? 'stock' : c[2] === 'Crypto' ? 'spot' : c[2] === 'Indices' ? 'index' : c[2] === 'Metals' || c[2] === 'Energy' ? 'cfd' : 'forex' }));
    if (src !== 'GNS') U.save(ck, { t: Date.now(), l });
    return l;
  })();
  lists[src] = p; p.catch(() => { delete lists[src]; });
  return p;
}
const usdVol = (s, q) => /(USDT|USDC|FDUSD|USD)$/.test(s) ? q : q / 1e6;
F.symbols = symbols;
F.SOURCES = ['BINANCE', 'GNS', 'BINANCE_F', 'BYBIT', 'OKX', 'COINBASE', 'HL'];
F.search = async (q, kind, onPart) => {
  q = q.trim().toUpperCase().replace(/\s+/g, '');
  let ex = null; if (q.includes(':')) { [ex, q] = q.split(':'); }
  const score = id => { const t = id.split(':')[1]; const e = id.split(':')[0]; if (ex && !e.startsWith(ex)) return -1; if (!q) return 1; if (t === q) return 100; if (t === q + 'USDT') return 96; if (t === q + 'USD') return 95; if (t === q + '.P') return 90; if (t.startsWith(q)) return 80 - Math.min(20, t.length - q.length); if (t.includes(q)) return 30; const c = CMAP[t]; if (e === 'GNS' && c && c[1].toUpperCase().replace(/\s/g, '').includes(q)) return 60; return -1; };
  let all = [];
  const emit = () => { const r = all.map(x => [score(x.id), x]).filter(x => x[0] > 0 && (!kind || kind === 'all' || x[1].k === kind)).sort((a, b) => b[0] - a[0] || (b[1].v || 0) - (a[1].v || 0)).slice(0, 120).map(x => x[1]); onPart(r); };
  await Promise.all(F.SOURCES.map(s => symbols(s).then(l => { all = all.concat(l); emit(); }).catch(() => { })));
};

/* ---------- candles ---------- */
const NATIVE = {
  BINANCE: { '1S': '1s', 1: '1m', 3: '3m', 5: '5m', 15: '15m', 30: '30m', 60: '1h', 120: '2h', 240: '4h', 360: '6h', 480: '8h', 720: '12h', '1D': '1d', '3D': '3d', '1W': '1w', '1M': '1M' },
  BYBIT: { 1: '1', 3: '3', 5: '5', 15: '15', 30: '30', 60: '60', 120: '120', 240: '240', 360: '360', 720: '720', '1D': 'D', '1W': 'W', '1M': 'M' },
  OKX: { 1: '1m', 3: '3m', 5: '5m', 15: '15m', 30: '30m', 60: '1H', 120: '2H', 240: '4H', 360: '6Hutc', 720: '12Hutc', '1D': '1Dutc', '1W': '1Wutc', '1M': '1Mutc' },
  COINBASE: { 1: 60, 5: 300, 15: 900, 60: 3600, 360: 21600, '1D': 86400 },
  HL: { 1: '1m', 3: '3m', 5: '5m', 15: '15m', 30: '30m', 60: '1h', 120: '2h', 240: '4h', 480: '8h', 720: '12h', '1D': '1d', '3D': '3d', '1W': '1w', '1M': '1M' },
  GNS: { 1: 1, 5: 5, 15: 15, 30: 30, 60: 60, 240: 240, '1D': 1440 },
  OI: { 5: '5m', 15: '15m', 30: '30m', 60: '1h', 120: '2h', 240: '4h', 360: '6h', 720: '12h', '1D': '1d' }
};
const msOf = tf => PN.tfParse(tf).ms;
function baseTf(ex, tf) {
  const N = NATIVE[ex] || NATIVE.BINANCE;
  if (N[tf] !== undefined) return tf;
  const ms = msOf(tf), p = PN.tfParse(tf);
  if (p.unit === 'S') return N['1S'] !== undefined ? '1S' : '1';
  if (p.unit === 'M' || p.unit === 'W' || p.unit === 'D') return N['1D'] !== undefined ? '1D' : '240';
  let best = null;
  for (const k in N) { const m = msOf(k); if (/^\d+$/.test(k) && m <= ms && ms % m === 0 && (!best || m > msOf(best))) best = k; }
  return best || '1';
}
F.baseTf = baseTf;
/* each returns [[t,o,h,l,c,v,takerBuy]] ascending, ending at `end` (ms, inclusive) */
const FETCH = {
  async BINANCE(t, tf, end, n) {
    const fut = t.endsWith('.P'), s = t.replace('.P', '');
    const lim = Math.min(fut ? 1500 : 1000, n);
    const q = '?symbol=' + s + '&interval=' + NATIVE.BINANCE[tf] + '&limit=' + lim + (end ? '&endTime=' + end : '');
    const d = fut ? await F.fapi('/fapi/v1/klines' + q) : await bnGet('/api/v3/klines' + q);
    return d.map(k => [k[0], +k[1], +k[2], +k[3], +k[4], +k[5], +k[9]]);
  },
  async BYBIT(t, tf, end, n) {
    const d = await J('https://api.bybit.com/v5/market/kline?category=' + (t.endsWith('.P') ? 'linear' : 'spot') + '&symbol=' + t.replace('.P', '') + '&interval=' + NATIVE.BYBIT[tf] + '&limit=' + Math.min(1000, n) + (end ? '&end=' + end : ''));
    return d.result.list.map(k => [+k[0], +k[1], +k[2], +k[3], +k[4], +k[5], NaN]).reverse();
  },
  async OKX(t, tf, end, n) {
    const d = await J('https://www.okx.com/api/v5/market/' + (end && end < Date.now() - msOf(tf) * 1000 ? 'history-candles' : 'candles') + '?instId=' + okxId(t) + '&bar=' + NATIVE.OKX[tf] + '&limit=' + Math.min(300, n) + (end ? '&after=' + (end + 1) : ''));
    return d.data.map(k => [+k[0], +k[1], +k[2], +k[3], +k[4], +k[5], NaN]).reverse();
  },
  async COINBASE(t, tf, end, n) {
    const g = NATIVE.COINBASE[tf]; const e = end || Date.now(); const st = e - g * 1000 * 299;
    const d = await J('https://api.exchange.coinbase.com/products/' + cbId(t) + '/candles?granularity=' + g + '&start=' + new Date(st).toISOString() + '&end=' + new Date(e).toISOString());
    return d.map(k => [k[0] * 1000, k[3], k[2], k[1], k[4], k[5], NaN]).reverse();
  },
  async HL(t, tf, end, n) {
    const e = end || Date.now() + 60000; const ms = msOf(tf);
    const d = await J(HL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'candleSnapshot', req: { coin: hlCoin(t), interval: NATIVE.HL[tf], startTime: Math.floor(e - ms * Math.min(4500, n)), endTime: Math.floor(e) } }) });
    return (Array.isArray(d) ? d : []).map(k => [k.t, +k.o, +k.h, +k.l, +k.c, +k.v, NaN]);
  },
  async GNS(t, tf, end, n) {
    const c = CMAP[t]; if (!c) throw new Error('Simbol ' + t + ' tidak ada');
    if (c[4][0] === 'h') return FETCH.HL(c[4].slice(2).replace('xyz:', 'XYZ_'), tf, end, n);
    const res = NATIVE.GNS[tf], ms = res * 60000, e = Math.floor((end || Date.now() + 60000) / 1000);
    const closed = c[2] === 'Crypto' ? 1 : c[2] === 'Stocks' ? (res < 1440 ? 5.2 : 1.5) : 1.45;
    const span = Math.min(n * res * 60 * closed, res < 5 ? 13 * 86400 : 4e8);
    const d = await J(GT + '/charts/' + c[4].slice(2) + '/' + Math.floor(e - span) + '/' + e + '/' + res, null, 25000);
    const out = [];
    for (const k of d.table || []) { const tt = Math.floor(k.time / ms) * ms; const L = out[out.length - 1]; if (L && L[0] === tt) { L[2] = Math.max(L[2], k.high); L[3] = Math.min(L[3], k.low); L[4] = k.close; } else if (!end || tt <= end) out.push([tt, k.open, k.high, k.low, k.close, NaN, NaN]); }
    return out;
  },
  /* OI:BTCUSDT, OI:FR_BTCUSDT, OI:LS_BTCUSDT, OI:TLS_BTCUSDT (taker ratio), OI:TOP_BTCUSDT, OI:PREM_BTCUSDT, OI:FNG */
  async OI(t, tf, end, n) {
    if (t === 'FNG') { if (end && end < Date.now() - 4 * 864e5) return []; const d = await J('https://api.alternative.me/fng/?limit=0'); return d.data.map(x => [+x.timestamp * 1000, +x.value, +x.value, +x.value, +x.value, 0, NaN]).reverse(); }
    const m = /^(FR|LS|TLS|TOP|PREM)_(.+)$/.exec(t); const s = (m ? m[2] : t).replace('.P', ''), k = m ? m[1] : 'OI';
    if (k === 'FR') { const d = await F.fapi('/fapi/v1/fundingRate?symbol=' + s + '&limit=1000' + (end ? '&endTime=' + end : '')); const ms = Math.max(msOf(tf), 1); const out = []; for (const x of d) { const tt = PN.tfFloor(x.fundingTime + 1000, tf), v = +x.fundingRate * 100; const L = out[out.length - 1]; if (L && L[0] === tt) { L[4] = v; L[2] = Math.max(L[2], v); L[3] = Math.min(L[3], v); } else out.push([tt, v, v, v, v, 0, NaN]); } return out; }
    if (k === 'PREM') { const d = await F.fapi('/fapi/v1/premiumIndexKlines?symbol=' + s + '&interval=' + NATIVE.BINANCE[tf] + '&limit=1000' + (end ? '&endTime=' + end : '')); return d.map(x => [x[0], +x[1] * 100, +x[2] * 100, +x[3] * 100, +x[4] * 100, 0, NaN]); }
    if (end && end < Date.now() - 29 * 864e5) return [];
    const path = { OI: 'openInterestHist', LS: 'globalLongShortAccountRatio', TOP: 'topLongShortPositionRatio', TLS: 'takerlongshortRatio' }[k];
    const d = await F.fapi('/futures/data/' + path + '?symbol=' + s + '&period=' + NATIVE.OI[tf] + '&limit=500' + (end && end < Date.now() ? '&endTime=' + end : ''));
    return d.map(x => { const v = k === 'OI' ? +x.sumOpenInterest : k === 'TLS' ? +x.buySellRatio : +x.longShortRatio; return [x.timestamp, v, v, v, v, k === 'OI' ? +x.sumOpenInterestValue : 0, NaN]; });
  }
};
F.fetchBars = async (id, tf, end, n) => {
  const [e, t] = id.split(':'); if (!FETCH[e]) throw new Error('Bursa ' + e + ' belum didukung');
  let out = []; let guard = 0, last = end;
  while (out.length < n && guard++ < 8) {
    const part = await FETCH[e](t, tf, last, n - out.length);
    const add = out.length ? part.filter(k => k[0] < out[0][0]) : part;
    if (!add.length) break;
    out = add.concat(out);
    const nx = out[0][0] - 1; if (last && nx >= last) break; last = nx;
    if (part.length < 100 && e !== 'COINBASE' && e !== 'GNS' || (e === 'GNS' && guard > 4)) break;
  }
  return out;
};

/* ---------- series cache ---------- */
const SER = new Map();
const empty = () => ({ T: [], O: [], H: [], L: [], C: [], V: [], B: [] });
class Series {
  constructor(id, tf) {
    this.id = id; this.tf = tf; this.key = id + '|' + tf; this.ver = 0; this.ready = false; this.failed = null; this.live = true; this.bars = empty(); this.raw = []; this.noMore = false; this.loading = null; this.refs = 0; this.sym = F.info(id); this.lastTick = 0; this.stream = null; this.lastUse = Date.now();
    const [e] = id.replace(/^HA~/, '').split(':');
    this.ex = e; this.base = baseTf(e, tf); this.agg = this.base !== tf; this.ms = msOf(tf);
    this.listeners = new Set();
    this.ha = /^HA~/.test(id);
    this.expr = F.isExpr(id);
  }
  load() {
    if (this.loading) return this.loading;
    this.loading = (async () => {
      try {
        if (this.ha || this.expr) { await this.loadDerived(); }
        else {
          const r = this.agg ? Math.max(1, Math.min(60, this.ms / msOf(this.base))) : 1;
          const n = Math.min(this.agg ? 6000 : 1500, Math.ceil(1500 * r));
          F.ensureInfo(this.id).then(s => { this.sym = s; });
          const d = await F.fetchBars(this.id, this.base, 0, n);
          if (!d.length) throw new Error('Tidak ada data');
          this.raw = d; if (d.length < 50) this.noMore = true;
          this.rebuild();
          if (!tick[this.id] && this.ex !== 'GNS') { const p = Math.max(...d.slice(-40).map(k => U.precOf(k[4]))); if (p < 12) this.sym = Object.assign({}, this.sym, { mintick: Math.pow(10, -p), prec: p }); }
          await Promise.race([F.ensureInfo(this.id), new Promise(r => setTimeout(r, 1500))]).then(s => { if (s && tick[this.id]) this.sym = s; });
          this.connect();
        }
        this.ready = true; this.failed = null; this.ver++; this.emit('load');
      } catch (e) { this.failed = e; this.loading = null; this.emit('fail'); clearTimeout(this.retry); if (this.refs > 0) this.retry = setTimeout(() => this.load(), 8000); }
    })();
    return this.loading;
  }
  rebuild() {
    const b = empty(), d = this.raw, ag = this.agg, tf = this.tf; let last = null, st = -1;
    for (let k = 0; k < d.length; k++) {
      const x = d[k], t = ag ? PN.tfFloor(x[0], tf) : x[0];
      if (ag && t === last) { const j = b.T.length - 1; if (x[2] > b.H[j]) b.H[j] = x[2]; if (x[3] < b.L[j]) b.L[j] = x[3]; b.C[j] = x[4]; b.V[j] += x[5]; b.B[j] += x[6]; continue; }
      if (last !== null && t <= last) continue;
      b.T.push(t); b.O.push(x[1]); b.H.push(x[2]); b.L.push(x[3]); b.C.push(x[4]); b.V.push(x[5]); b.B.push(x[6]); last = t; st = k;
    }
    this.bars = b; this.tail = ag ? d.slice(Math.max(0, st)) : null;
  }
  /* base bar update */
  onBar(x) {
    const b = this.bars, n = b.T.length; if (!n) return;
    this.lastTick = Date.now();
    if (this.agg) {
      const t = PN.tfFloor(x[0], this.tf), j = n - 1;
      if (t < b.T[j]) return;
      if (t > b.T[j]) { this.tail = [x]; this.push(t, x); }
      else {
        const L = this.tail[this.tail.length - 1];
        if (L && L[0] === x[0]) this.tail[this.tail.length - 1] = x; else if (!L || x[0] > L[0]) this.tail.push(x); else return;
        let h = -Infinity, l = Infinity, v = 0, bb = 0; for (const k of this.tail) { if (k[2] > h) h = k[2]; if (k[3] < l) l = k[3]; v += k[5]; bb += k[6]; }
        b.O[j] = this.tail[0][1]; b.H[j] = h; b.L[j] = l; b.C[j] = x[4]; b.V[j] = v; b.B[j] = bb;
      }
    } else {
      const j = n - 1;
      if (x[0] < b.T[j]) { if (n > 1 && x[0] === b.T[j - 1]) { this.setAt(j - 1, x); } return; }
      if (x[0] === b.T[j]) this.setAt(j, x); else this.push(x[0], x);
    }
    this.ver++; this.tick();
  }
  setAt(j, x) { const b = this.bars; b.O[j] = x[1]; b.H[j] = x[2]; b.L[j] = x[3]; b.C[j] = x[4]; b.V[j] = x[5]; b.B[j] = x[6]; }
  push(t, x) { const b = this.bars; b.T.push(t); b.O.push(x[1]); b.H.push(x[2]); b.L.push(x[3]); b.C.push(x[4]); b.V.push(x[5]); b.B.push(x[6]); this.emit('newbar'); }
  /* price-only update (tick feeds without candles) */
  onPrice(p, ts, vol) {
    const b = this.bars, n = b.T.length; if (!n || !(p > 0)) return;
    this.lastTick = Date.now();
    const t = PN.tfFloor(ts || Date.now(), this.tf), j = n - 1;
    if (t < b.T[j]) return;
    if (t > b.T[j]) this.push(t, [t, p, p, p, p, vol === undefined ? NaN : 0, NaN]);
    else { if (p > b.H[j]) b.H[j] = p; if (p < b.L[j]) b.L[j] = p; if (b.C[j] === p && !vol) return; b.C[j] = p; }
    this.ver++; this.tick();
  }
  tick() { if (this.tq) return; this.tq = true; const run = () => { if (!this.tq) return; this.tq = false; this.emit('tick'); }; requestAnimationFrame(run); setTimeout(run, 400); }
  emit(k) { for (const f of Array.from(this.listeners)) try { f(k, this); } catch (e) { console.error(e); } }
  on(f) { this.listeners.add(f); this.refs++; this.lastUse = Date.now(); if (this.ready && !this.stream) this.connect(); return () => { if (this.listeners.delete(f)) { this.refs--; this.lastUse = Date.now(); } }; }
  async more() {
    if (this.noMore || this.mloading || !this.ready || this.bars.T.length > 40000) return false;
    this.mloading = true;
    try {
      if (this.ha || this.expr) { let any = false; for (const p of this.parts) any = (await p.more()) || any; if (any) this.derive(); this.noMore = this.parts.every(p => p.noMore); return any; }
      const first = this.raw.length ? this.raw[0][0] : this.bars.T[0];
      const r = this.agg ? Math.max(1, Math.min(30, this.ms / msOf(this.base))) : 1;
      const d = await F.fetchBars(this.id, this.base, first - 1, Math.min(6000, Math.ceil(1500 * r)));
      const add = d.filter(k => k[0] < first);
      if (!add.length) { this.noMore = true; return false; }
      /* live bars that arrived after `raw` was fetched are kept */
      const rawT = this.raw.length ? this.raw[this.raw.length - 1][0] : 0;
      const old = this.bars, keep = [];
      this.raw = add.concat(this.raw);
      for (let k = 0; k < old.T.length; k++) keep.push(k);
      const prevTail = this.tail; const lastT = old.T[0];
      const nb = empty(); let last = null;
      for (const x of add) { const t = this.agg ? PN.tfFloor(x[0], this.tf) : x[0]; if (t >= lastT) { if (this.agg && t === lastT) { if (x[2] > old.H[0]) old.H[0] = x[2]; if (x[3] < old.L[0]) old.L[0] = x[3]; old.O[0] = last === t ? old.O[0] : x[1]; old.V[0] += x[5]; last = t; } continue; } if (t === last) { const j = nb.T.length - 1; if (x[2] > nb.H[j]) nb.H[j] = x[2]; if (x[3] < nb.L[j]) nb.L[j] = x[3]; nb.C[j] = x[4]; nb.V[j] += x[5]; nb.B[j] += x[6]; } else { nb.T.push(t); nb.O.push(x[1]); nb.H.push(x[2]); nb.L.push(x[3]); nb.C.push(x[4]); nb.V.push(x[5]); nb.B.push(x[6]); last = t; } }
      for (const k in nb) this.bars[k] = nb[k].concat(old[k]);
      this.tail = prevTail;
      this.ver++; this.emit('more'); return true;
    } catch (e) { return false; } finally { this.mloading = false; }
  }
  /* fill the gap after sleep / reconnect */
  async resync() {
    if (!this.ready || this.ha || this.expr) return;
    if (this.rs) return; this.rs = true;
    try {
      const b = this.bars, lastT = b.T[b.T.length - 1], need = Math.ceil((Date.now() - lastT) / msOf(this.base)) + 3;
      if (need > 5000) { this.loading = null; return await this.load(); }
      const d = await F.fetchBars(this.id, this.base, 0, Math.max(3, Math.min(5000, need + (this.agg ? Math.ceil(this.ms / msOf(this.base)) : 0))));
      let ch = false;
      for (const x of d) {
        const L = this.bars.T.length - 1;
        if (this.agg) { const t = PN.tfFloor(x[0], this.tf); if (t < this.bars.T[L]) continue; const tl = this.tail && this.tail[this.tail.length - 1]; if (t === this.bars.T[L] && tl && x[0] < tl[0]) continue; this.onBar(x); ch = true; }
        else if (x[0] >= this.bars.T[L]) { this.onBar(x); ch = true; }
        else { const j = PN.lb(this.bars.T, x[0]); if (this.bars.T[j] === x[0]) this.setAt(j, x); }
      }
      if (ch) { this.ver++; this.emit('tick'); }
    } catch (e) { /* retry later */ } finally { this.rs = false; }
  }
  /* ---- derived: heikin ashi & expressions ---- */
  async loadDerived() {
    if (this.ha) this.parts = [F.series(this.id.slice(3), this.tf)];
    else {
      const toks = this.id.match(/[A-Za-z][A-Za-z0-9_.:]*|\d+\.?\d*|[-+*/()]/g) || [];
      this.prog = toks; const ids = [];
      for (const t of toks) if (/^[A-Za-z]/.test(t)) ids.push(F.norm(t));
      this.parts = ids.map(x => F.series(x, this.tf));
    }
    await Promise.all(this.parts.map(p => p.ready ? 0 : p.load()));
    if (this.parts.some(p => !p.ready)) throw new Error('Sebagian simbol gagal dimuat');
    this.derive();
    if (!this.un) this.un = this.parts.map(p => p.on(k => { if (k === 'tick' || k === 'more' || k === 'newbar') { this.derive(); this.ver++; this.emit(k === 'newbar' ? 'tick' : k); } }));
    const pr = this.parts[0].sym; if (this.ha) this.sym = Object.assign({}, pr, { id: this.id, tickerid: this.id, desc: 'Heikin Ashi · ' + pr.desc });
    else { const c = this.bars.C[this.bars.C.length - 1]; const dec = c > 1000 ? 2 : c > 1 ? 4 : c > 0.01 ? 6 : 8; tick[this.id] = Math.pow(10, -dec); this.sym = F.info(this.id); }
  }
  derive() {
    if (this.ha) { this.bars = AC.toHA(this.parts[0].bars); return; }
    const base = this.parts[0].bars, ptr = this.parts.map(() => 0), b = empty(); const val = this.parts.map(() => [0, 0, 0, 0]);
    /* expression evaluator on arrays of parts (shunting yard, compiled once) */
    if (!this.fn) { let k = 0; const js = this.prog.map(t => /^[A-Za-z]/.test(t) ? 'v[' + (k++) + ']' : t).join(''); if (!/^[v\[\]\d.+\-*/()]+$/.test(js)) throw new Error('Ekspresi simbol salah'); this.fn = new Function('v', 'return ' + js); }
    for (let i = 0; i < base.T.length; i++) {
      const t = base.T[i]; let ok = true; const o = [], h = [], l = [], c = [];
      this.parts.forEach((p, j) => { const B = p.bars; while (ptr[j] + 1 < B.T.length && B.T[ptr[j] + 1] <= t) ptr[j]++; const q = ptr[j]; if (B.T[q] > t) ok = false; o.push(B.O[q]); h.push(B.H[q]); l.push(B.L[q]); c.push(B.C[q]); });
      if (!ok) continue;
      const O = this.fn(o), C = this.fn(c), H = this.fn(h), Lo = this.fn(l);
      b.T.push(t); b.O.push(O); b.H.push(Math.max(O, C, H, Lo)); b.L.push(Math.min(O, C, H, Lo)); b.C.push(C); b.V.push(base.V[i]); b.B.push(NaN);
    }
    this.bars = b;
  }
  connect() { if (this.stream || this.ha || this.expr) return; this.stream = STREAM.add(this); }
  close() { if (this.stream) { STREAM.remove(this); this.stream = null; } clearTimeout(this.retry); if (this.un) { this.un.forEach(f => f()); this.un = null; } }
}
F.Series = Series;
AC.toHA = s => { const b = { T: s.T, O: [], H: [], L: [], C: [], V: s.V, B: s.B }; let po, pc; for (let i = 0; i < s.T.length; i++) { const c = (s.O[i] + s.H[i] + s.L[i] + s.C[i]) / 4, o = i ? (po + pc) / 2 : (s.O[i] + s.C[i]) / 2; b.O.push(o); b.C.push(c); b.H.push(Math.max(s.H[i], o, c)); b.L.push(Math.min(s.L[i], o, c)); po = o; pc = c; } return b; };
F.series = (id, tf) => {
  id = F.norm(id); tf = PN.tfNorm(tf); const k = id + '|' + tf;
  let s = SER.get(k); if (!s) { s = new Series(id, tf); SER.set(k, s); s.load(); }
  else if (s.failed && !s.loading) s.load();
  s.lastUse = Date.now(); return s;
};
setInterval(() => { const now = Date.now(); for (const [k, s] of SER) if (s.refs <= 0 && now - s.lastUse > 120000) { s.close(); SER.delete(k); } }, 30000);
F.allSeries = () => Array.from(SER.values());

/* ---------- live streams ---------- */
const quotes = F.quotes = {};
F.status = { state: 'connecting', t: 0 };
const mark = () => { F.status.t = Date.now(); if (F.status.state !== 'live') { F.status.state = 'live'; U.emit('feed-status'); } };
class Sock {
  constructor(url, onmsg, subMsg, ping) { this.url = url; this.onmsg = onmsg; this.subMsg = subMsg; this.ping = ping; this.subs = new Map(); this.retry = 0; }
  add(k) { const c = this.subs.get(k) || 0; this.subs.set(k, c + 1); if (!c) { if (this.ws && this.ws.readyState === 1) this.subMsg(this.ws, [k], true); else this.open(); } }
  del(k) { const c = this.subs.get(k) || 0; if (c > 1) this.subs.set(k, c - 1); else if (c) { this.subs.delete(k); if (this.ws && this.ws.readyState === 1) this.subMsg(this.ws, [k], false); } }
  open() {
    if (this.ws) return;
    let ws; try { ws = new WebSocket(this.url); } catch (e) { return this.later(); }
    this.ws = ws;
    ws.onopen = () => { const was = this.retry; this.retry = 0; const l = Array.from(this.subs.keys()); for (let i = 0; i < l.length; i += 40) setTimeout(() => ws.readyState === 1 && this.subMsg(ws, l.slice(i, i + 40), true), i * 8); if (this.ping) this.pt = setInterval(() => { try { ws.send(this.ping); } catch (e) { /* */ } }, 20000); if (this.had) U.emit('reconnect'); this.had = true; };
    ws.onmessage = e => { this.last = Date.now(); let m; try { m = JSON.parse(e.data); } catch (x) { return; } mark(); try { this.onmsg(m); } catch (x) { console.error(x); } };
    ws.onclose = () => { clearInterval(this.pt); if (this.ws === ws) this.ws = null; this.later(); };
    ws.onerror = () => { try { ws.close(); } catch (e) { /* */ } };
  }
  later() { if (!this.subs.size) return; clearTimeout(this.rt); this.rt = setTimeout(() => this.open(), Math.min(20000, 800 * Math.pow(1.8, this.retry++))); }
  kick() { if (this.ws && this.last && Date.now() - this.last > 25000) { const w = this.ws; this.ws = null; try { w.onclose = null; w.close(); } catch (e) { /* */ } clearInterval(this.pt); this.open(); } else if (!this.ws && this.subs.size) this.open(); }
}
let mid = 1;
const bnSub = (ws, l, on) => ws.send(JSON.stringify({ method: on ? 'SUBSCRIBE' : 'UNSUBSCRIBE', params: l, id: mid++ }));
const handlers = new Map();  // stream -> Set(fn)
const hadd = (k, f) => { let s = handlers.get(k); if (!s) handlers.set(k, s = new Set()); s.add(f); };
const hdel = (k, f) => { const s = handlers.get(k); if (s) { s.delete(f); if (!s.size) handlers.delete(k); } };
const fire = (k, d) => { const s = handlers.get(k); if (s) for (const f of Array.from(s)) f(d); };
const bnMsg = pre => m => { const st = m.stream, d = m.data; if (!st || !d) return; fire(pre + st, d); };
const SOCK = F.SOCK = {
  bn: new Sock('wss://data-stream.binance.vision/stream', bnMsg('bn|'), bnSub),
  bf: new Sock('wss://fstream.binance.com/stream', bnMsg('bf|'), bnSub),
  byl: new Sock('wss://stream.bybit.com/v5/public/linear', m => { if (m.topic) fire('byl|' + m.topic, m); }, (ws, l, on) => ws.send(JSON.stringify({ op: on ? 'subscribe' : 'unsubscribe', args: l })), '{"op":"ping"}'),
  bys: new Sock('wss://stream.bybit.com/v5/public/spot', m => { if (m.topic) fire('bys|' + m.topic, m); }, (ws, l, on) => ws.send(JSON.stringify({ op: on ? 'subscribe' : 'unsubscribe', args: l })), '{"op":"ping"}'),
  okb: new Sock('wss://ws.okx.com:8443/ws/v5/business', m => { if (m.arg && m.data) fire('okb|' + m.arg.channel + '|' + m.arg.instId, m.data); }, (ws, l, on) => ws.send(JSON.stringify({ op: on ? 'subscribe' : 'unsubscribe', args: l.map(k => ({ channel: k.split('|')[0], instId: k.split('|')[1] })) }))),
  hl: new Sock(HLWS, m => { const d = m.data; if (m.channel === 'candle' && d) fire('hl|' + d.s + '|' + d.i, d); else if (m.channel === 'allMids' && d) { for (const c in d.mids) hlMids[c] = +d.mids[c]; fire('hl|mids', hlMids); } else if (m.channel === 'l2Book') fire('hl|book|' + d.coin, d); else if (m.channel === 'trades' && d && d[0]) fire('hl|trades|' + d[0].coin, d); }, (ws, l, on) => { for (const k of l) { const p = k.split('|'); ws.send(JSON.stringify({ method: on ? 'subscribe' : 'unsubscribe', subscription: k === 'mids' ? { type: 'allMids' } : p[0] === 'book' ? { type: 'l2Book', coin: p[1] } : p[0] === 'trades' ? { type: 'trades', coin: p[1] } : { type: 'candle', coin: p[0], interval: p[1] } })); } }, '{"method":"ping"}'),
  cb: new Sock('wss://ws-feed.exchange.coinbase.com', m => { if (m.type === 'ticker' || m.type === 'match') fire('cb|' + m.product_id, m); }, (ws, l, on) => ws.send(JSON.stringify({ type: on ? 'subscribe' : 'unsubscribe', product_ids: l, channels: ['ticker'] })))
};
const hlMids = {};
/* gTrade: one socket, flat [idx,price,...] */
const gt = { subs: new Map(), px: {}, ws: null, retry: 0 };
function gtOpen() {
  if (gt.ws) return; let ws; try { ws = new WebSocket(GTWS); } catch (e) { return; } gt.ws = ws;
  ws.onopen = () => { gt.retry = 0; };
  ws.onmessage = e => { let a; try { a = JSON.parse(e.data); } catch (x) { return; } if (!Array.isArray(a) || a.length < 2) return; mark(); const t = Date.now(); for (let i = 0; i + 1 < a.length; i += 2) { const p = +a[i + 1]; if (p > 0) { gt.px[a[i]] = { p, t }; fire('gt|' + a[i], { p, t }); } } };
  ws.onclose = () => { gt.ws = null; if (gt.n) setTimeout(gtOpen, Math.min(20000, 1000 * Math.pow(2, gt.retry++))); };
  ws.onerror = () => { try { ws.close(); } catch (e) { /* */ } };
}
gt.n = 0;
function sub(sock, stream, f) { const pre = Object.keys(SOCK).find(k => SOCK[k] === sock); hadd(pre + '|' + stream, f); sock.add(stream); return () => { hdel(pre + '|' + stream, f); sock.del(stream); }; }
function gtSub(idx, f) { hadd('gt|' + idx, f); gt.n++; gtOpen(); return () => { hdel('gt|' + idx, f); gt.n--; }; }
F.sub = sub;
/* live bar subscription for a series */
const STREAM = {
  add(s) {
    const [e, t] = s.id.split(':'), tf = s.base; const un = [];
    if (e === 'BINANCE') {
      const fut = t.endsWith('.P'), sym = t.replace('.P', '').toLowerCase();
      un.push(sub(fut ? SOCK.bf : SOCK.bn, sym + '@kline_' + NATIVE.BINANCE[tf], d => { const k = d.k; s.onBar([k.t, +k.o, +k.h, +k.l, +k.c, +k.v, +k.V]); }));
    } else if (e === 'BYBIT') un.push(sub(t.endsWith('.P') ? SOCK.byl : SOCK.bys, 'kline.' + NATIVE.BYBIT[tf] + '.' + t.replace('.P', ''), m => { for (const k of m.data) s.onBar([k.start, +k.open, +k.high, +k.low, +k.close, +k.volume, NaN]); }));
    else if (e === 'OKX') un.push(sub(SOCK.okb, 'candle' + NATIVE.OKX[tf] + '|' + okxId(t), d => { for (const k of d) s.onBar([+k[0], +k[1], +k[2], +k[3], +k[4], +k[5], NaN]); }));
    else if (e === 'HL') un.push(sub(SOCK.hl, hlCoin(t) + '|' + NATIVE.HL[tf], k => s.onBar([k.t, +k.o, +k.h, +k.l, +k.c, +k.v, NaN])));
    else if (e === 'COINBASE') un.push(sub(SOCK.cb, cbId(t), m => s.onPrice(+m.price, Date.parse(m.time) || Date.now(), 0)));
    else if (e === 'GNS') { const c = CMAP[t]; if (c) { if (c[4][0] === 'g') un.push(gtSub(+c[4].slice(2), d => { if (F.isOpen(s.id)) s.onPrice(d.p, d.t); })); else un.push(sub(SOCK.hl, c[4].slice(2) + '|' + NATIVE.HL[baseTf('HL', tf)], k => s.onBar([k.t, +k.o, +k.h, +k.l, +k.c, NaN, NaN]))); } }
    /* polling safety net */
    const slow = e === 'OI';
    const iv = setInterval(() => { if (s.refs <= 0) return; if (document.hidden && Date.now() - s.lastTick < 60000) return; if (Date.now() - s.lastTick > (slow ? 60000 : 12000) && F.isOpen(s.id)) { s.lastTick = Date.now() - (slow ? 0 : 6000); s.resync(); } }, 5000);
    un.push(() => clearInterval(iv));
    s.unstream = un; return true;
  },
  remove(s) { if (s.unstream) s.unstream.forEach(f => f()); s.unstream = null; }
};
setInterval(() => { for (const k in SOCK) SOCK[k].kick(); if (Date.now() - F.status.t > 20000 && F.status.state === 'live') { F.status.state = navigator.onLine ? 'lambat' : 'offline'; U.emit('feed-status'); } }, 5000);
const wake = () => { if (document.hidden) return; for (const k in SOCK) SOCK[k].kick(); for (const s of SER.values()) if (s.refs > 0 && Date.now() - s.lastTick > 3000) s.resync(); };
document.addEventListener('visibilitychange', wake); addEventListener('online', wake); U.on('reconnect', () => setTimeout(wake, 600));

/* ---------- market hours (rough, for non-crypto) ---------- */
F.isOpen = id => {
  const [e, t] = id.replace(/^HA~/, '').split(':'); if (e !== 'GNS') return true;
  const c = CMAP[t]; if (!c || c[2] === 'Crypto') return true;
  const now = Date.now(), d = new Date(now + PN.tzOff('America/New_York', now)), dow = d.getUTCDay(), m = d.getUTCHours() * 60 + d.getUTCMinutes();
  if (c[2] === 'Stocks') return dow >= 1 && dow <= 5 && m >= 570 && m < 960;
  if (dow === 6 || (dow === 5 && m >= 1020) || (dow === 0 && m < (c[2] === 'Metals' || c[2] === 'Energy' || c[2] === 'Indices' ? 1080 : 1025))) return false;
  if ((c[2] === 'Metals' || c[2] === 'Energy' || c[2] === 'Indices') && m >= 1020 && m < 1080) return false;
  return true;
};

/* ---------- quotes (watchlist, alerts) ---------- */
const qsub = new Map();   // id -> {n, un}
const dirty = new Set(); let qflush = false;
function setQ(id, q) {
  const o = quotes[id] || (quotes[id] = { id });
  if (q.last > 0 && q.last !== o.last) { o.prev = o.last; o.dir = o.last == null ? 0 : q.last > o.last ? 1 : -1; }
  Object.assign(o, q); o.t = Date.now();
  if (o.open > 0 && o.last > 0) { o.chg = o.last - o.open; o.chgp = o.chg / o.open * 100; }
  dirty.add(id); if (!qflush) { qflush = true; setTimeout(() => { qflush = false; const l = Array.from(dirty); dirty.clear(); U.emit('quotes', l); }, 250); }
}
async function dayOpen(id) {
  try {
    const [e, t] = id.split(':'); const c = e === 'GNS' ? CMAP[t] : null;
    if (c && c[2] !== 'Crypto') {          // change against the previous daily close
      const d = await F.fetchBars(id, '1D', 0, 12); const n = d.length; if (n < 2) return;
      setQ(id, { open: d[n - 2][4], high: d[n - 1][2], low: d[n - 1][3], last: quotes[id] && quotes[id].last || d[n - 1][4] }); return;
    }
    const d = await F.fetchBars(id, '60', 0, 30);
    if (d.length) { const cut = Date.now() - 864e5; const day = d.filter(k => k[0] >= cut); const x = day[0] || d[d.length - 1]; setQ(id, { open: x[1], high: Math.max(...day.map(k => k[2])), low: Math.min(...day.map(k => k[3])), vol: day.reduce((s, k) => s + (k[5] || 0), 0), last: quotes[id] && quotes[id].last || d[d.length - 1][4] }); }
  } catch (e) { /* */ }
}
F.quote = id => {           // subscribe; returns unsubscribe
  id = F.norm(id);
  let q = qsub.get(id);
  if (q) { q.n++; return () => F.unquote(id); }
  q = { n: 1, un: [] }; qsub.set(id, q);
  const [e, t] = id.split(':');
  if (F.isExpr(id)) { const s = F.series(id, '60'); const f = () => { const b = s.bars, n = b.C.length; if (n) setQ(id, { last: b.C[n - 1], open: b.C[Math.max(0, n - 25)] }); }; q.un.push(s.on(f)); f(); return () => F.unquote(id); }
  if (e === 'BINANCE') {
    const fut = t.endsWith('.P'), sym = t.replace('.P', '').toLowerCase();
    q.un.push(sub(fut ? SOCK.bf : SOCK.bn, sym + '@miniTicker', d => setQ(id, { last: +d.c, open: +d.o, high: +d.h, low: +d.l, vol: +d.v, qvol: +d.q })));
    (fut ? F.fapi('/fapi/v1/ticker/24hr?symbol=' + sym.toUpperCase()) : bnGet('/api/v3/ticker/24hr?symbol=' + sym.toUpperCase())).then(d => setQ(id, { last: +d.lastPrice, open: +d.openPrice, high: +d.highPrice, low: +d.lowPrice, vol: +d.volume, qvol: +d.quoteVolume })).catch(() => { });
  } else if (e === 'BYBIT') { q.un.push(sub(t.endsWith('.P') ? SOCK.byl : SOCK.bys, 'tickers.' + t.replace('.P', ''), m => { const d = m.data, o = {}; if (d.lastPrice) o.last = +d.lastPrice; if (d.prevPrice24h) o.open = +d.prevPrice24h; if (d.highPrice24h) o.high = +d.highPrice24h; if (d.lowPrice24h) o.low = +d.lowPrice24h; if (d.volume24h) o.vol = +d.volume24h; setQ(id, o); })); }
  else if (e === 'GNS') { const c = CMAP[t]; if (c) { if (c[4][0] === 'g') { q.un.push(gtSub(+c[4].slice(2), d => { if (F.isOpen(id)) setQ(id, { last: d.p }); })); } else q.un.push(sub(SOCK.hl, c[4].slice(2) + '|1m', k => setQ(id, { last: +k.c }))); dayOpen(id); const iv = setInterval(() => dayOpen(id), 300000); q.un.push(() => clearInterval(iv)); } }
  else if (e === 'HL') { q.un.push(sub(SOCK.hl, 'mids', m => { const c = hlCoin(t); if (m[c]) setQ(id, { last: m[c] }); })); dayOpen(id); }
  else if (e === 'COINBASE') { q.un.push(sub(SOCK.cb, cbId(t), m => setQ(id, { last: +m.price, open: +m.open_24h, high: +m.high_24h, low: +m.low_24h, vol: +m.volume_24h }))); }
  else { dayOpen(id); const iv = setInterval(() => dayOpen(id), 15000); q.un.push(() => clearInterval(iv)); }
  return () => F.unquote(id);
};
F.unquote = id => { const q = qsub.get(id); if (q && --q.n <= 0) { q.un.forEach(f => f()); qsub.delete(id); } };

/* ---------- order book & trades ---------- */
F.depth = (id, f) => {
  const [e, t] = id.replace(/^HA~/, '').split(':');
  if (e === 'BINANCE') { const fut = t.endsWith('.P'), s = t.replace('.P', '').toLowerCase(); return sub(fut ? SOCK.bf : SOCK.bn, s + '@depth20@100ms', d => f({ b: (d.bids || d.b).map(x => [+x[0], +x[1]]), a: (d.asks || d.a).map(x => [+x[0], +x[1]]) })); }
  if (e === 'HL') return sub(SOCK.hl, 'book|' + hlCoin(t), d => f({ b: d.levels[0].map(x => [+x.px, +x.sz]), a: d.levels[1].map(x => [+x.px, +x.sz]) }));
  return null;
};
F.trades = (id, f) => {
  const [e, t] = id.replace(/^HA~/, '').split(':');
  if (e === 'BINANCE') { const fut = t.endsWith('.P'), s = t.replace('.P', '').toLowerCase(); return sub(fut ? SOCK.bf : SOCK.bn, s + '@aggTrade', d => f({ p: +d.p, q: +d.q, buy: !d.m, t: d.T })); }
  if (e === 'BYBIT') return sub(t.endsWith('.P') ? SOCK.byl : SOCK.bys, 'publicTrade.' + t.replace('.P', ''), m => { for (const x of m.data) f({ p: +x.p, q: +x.v, buy: x.S === 'Buy', t: x.T }); });
  if (e === 'HL') return sub(SOCK.hl, 'trades|' + hlCoin(t), d => { for (const x of d) f({ p: +x.px, q: +x.sz, buy: x.side === 'B', t: x.time }); });
  return null;
};
F.canDepth = id => /^(HA~)?(BINANCE|HL):/.test(id);
F.canTrades = id => /^(HA~)?(BINANCE|BYBIT|HL):/.test(id);
})();
