/* Amatu Chart — built-in indicators, all written in Pine Script (so each one can be opened, edited and copied to TradingView) */
(function () {
'use strict';
const AC = window.AC, U = AC.U, PN = window.AC_PINE;
const I = AC.Ind = {};
const LIST = [];
/* add(id, name, category, flags, body, shorttitle) flags: o=overlay, v=volume format, s=strategy, raw=full source */
function add(id, name, cat, fl, body, short, extra) { const q = s => '"' + s + '"'; const head = '//@version=6\n' + (fl.includes('s') ? 'strategy(' : 'indicator(') + q(name) + (short ? ', ' + q(short) : '') + (fl.includes('o') || fl.includes('s') ? ', overlay = true' : '') + (fl.includes('v') ? ', format = format.volume' : '') + (fl.includes('m') ? ', max_lines_count = 500, max_labels_count = 500, max_boxes_count = 500' : '') + (fl.includes('s') ? ', initial_capital = 10000, default_qty_type = strategy.percent_of_equity, default_qty_value = 100, commission_type = strategy.commission.percent, commission_value = 0.05' : '') + ')\n'; LIST.push({ id, name, cat, code: head + body.trim() + '\n', tv: extra }); }
const T = 'Tren & rata-rata', O = 'Osilator', V = 'Volume', W = 'Volatilitas', S = 'Struktur & level', C = 'Pola', K = 'Kripto & sentimen', X = 'Strategi (backtest)', P = 'Milik saya';
const ma1 = (id, nm, sh, fn, len, ex) => add(id, nm, T, 'o', `len = input.int(${len}, "Panjang", minval = 1)\nsrc = input.source(close, "Sumber")\n${fn}\nplot(m, "${sh}", color = ${ex || '#2962ff'}, linewidth = 2)`, sh);
ma1('sma', 'Moving Average Simple (SMA)', 'SMA', 'm = ta.sma(src, len)', 20, '#2962ff'); ma1('ema', 'Moving Average Exponential (EMA)', 'EMA', 'm = ta.ema(src, len)', 21, '#ff9800'); ma1('wma', 'Moving Average Weighted (WMA)', 'WMA', 'm = ta.wma(src, len)', 20); ma1('hma', 'Hull Moving Average (HMA)', 'HMA', 'm = ta.hma(src, len)', 21, '#00bcd4'); ma1('smma', 'Smoothed Moving Average (SMMA/RMA)', 'SMMA', 'm = ta.rma(src, len)', 14, '#673ab7'); ma1('vwma', 'Volume Weighted MA (VWMA)', 'VWMA', 'm = ta.vwma(src, len)', 20); ma1('alma', 'Arnaud Legoux MA (ALMA)', 'ALMA', 'm = ta.alma(src, len, 0.85, 6)', 20); ma1('lsma', 'Least Squares MA (LSMA)', 'LSMA', 'm = ta.linreg(src, len, 0)', 25);
ma1('dema', 'Double EMA (DEMA)', 'DEMA', 'e = ta.ema(src, len)\nm = 2 * e - ta.ema(e, len)', 21, '#4caf50'); ma1('tema', 'Triple EMA (TEMA)', 'TEMA', 'e1 = ta.ema(src, len)\ne2 = ta.ema(e1, len)\nm = 3 * (e1 - e2) + ta.ema(e2, len)', 21, '#e91e63'); ma1('zlema', 'Zero Lag EMA (ZLEMA)', 'ZLEMA', 'lag = math.floor((len - 1) / 2)\nm = ta.ema(src + src - src[lag], len)', 21); ma1('t3', 'Tillson T3', 'T3', 'b = 0.7\ne1 = ta.ema(src, len)\ne2 = ta.ema(e1, len)\ne3 = ta.ema(e2, len)\ne4 = ta.ema(e3, len)\ne5 = ta.ema(e4, len)\ne6 = ta.ema(e5, len)\nm = -b * b * b * e6 + (3 * b * b + 3 * b * b * b) * e5 + (-6 * b * b - 3 * b - 3 * b * b * b) * e4 + (1 + 3 * b + b * b * b + 3 * b * b) * e3', 8); ma1('kama', 'Kaufman Adaptive MA (KAMA)', 'KAMA', 'mom = math.abs(ta.change(src, len))\nvola = math.sum(math.abs(ta.change(src)), len)\ner = vola != 0 ? mom / vola : 0.0\nalpha = math.pow(er * (2.0 / 3 - 2.0 / 31) + 2.0 / 31, 2)\nvar float m = na\nm := nz(m[1], src) + alpha * (src - nz(m[1], src))', 10, '#fdd835'); ma1('mcg', 'McGinley Dynamic', 'McGinley', 'var float m = na\ng = ta.ema(src, len)\nm := na(m[1]) ? g : m[1] + (src - m[1]) / (len * math.pow(src / m[1], 4))', 14, '#009688'); ma1('trima', 'Triangular MA', 'TRIMA', 'm = ta.sma(ta.sma(src, math.ceil(len / 2)), math.floor(len / 2) + 1)', 20);
add('mama', 'Multi MA (4 garis)', T, 'o', `f(t, s, l) =>
    switch t
        "EMA" => ta.ema(s, l)
        "SMA" => ta.sma(s, l)
        "WMA" => ta.wma(s, l)
        "RMA" => ta.rma(s, l)
        "VWMA" => ta.vwma(s, l)
        => ta.hma(s, l)
src = input.source(close, "Sumber")
t = input.string("EMA", "Jenis", options = ["EMA", "SMA", "WMA", "RMA", "VWMA", "HMA"])
l1 = input.int(9, "MA 1")
l2 = input.int(21, "MA 2")
l3 = input.int(50, "MA 3")
l4 = input.int(200, "MA 4")
plot(f(t, src, l1), "MA 1", color = #00bcd4)
plot(f(t, src, l2), "MA 2", color = #ff9800)
plot(f(t, src, l3), "MA 3", color = #2962ff, linewidth = 2)
plot(f(t, src, l4), "MA 4", color = #f23645, linewidth = 2)`, 'Multi MA');
add('ribbon', 'EMA Ribbon', T, 'o', `src = input.source(close, "Sumber")
st = input.int(20, "Awal")
sp = input.int(5, "Jarak")
c(a, b) => a > b ? color.new(#089981, 20) : color.new(#f23645, 20)
e1 = ta.ema(src, st)
e2 = ta.ema(src, st + sp)
e3 = ta.ema(src, st + sp * 2)
e4 = ta.ema(src, st + sp * 3)
e5 = ta.ema(src, st + sp * 4)
e6 = ta.ema(src, st + sp * 5)
e7 = ta.ema(src, st + sp * 6)
e8 = ta.ema(src, st + sp * 7)
p1 = plot(e1, "1", color = c(e1, e8))
plot(e2, "2", color = c(e2, e8))
plot(e3, "3", color = c(e3, e8))
plot(e4, "4", color = c(e4, e8))
plot(e5, "5", color = c(e5, e8))
plot(e6, "6", color = c(e6, e8))
plot(e7, "7", color = c(e7, e8))
p8 = plot(e8, "8", color = c(e1, e8))
fill(p1, p8, color = e1 > e8 ? color.new(#089981, 88) : color.new(#f23645, 88))`);
add('gmma', 'Guppy Multiple MA', T, 'o', [3, 5, 8, 10, 12, 15].map((n, i) => `plot(ta.ema(close, ${n}), "S${i + 1}", color = #00bcd4)`).concat([30, 35, 40, 45, 50, 60].map((n, i) => `plot(ta.ema(close, ${n}), "L${i + 1}", color = #f23645)`)).join('\n'), 'GMMA');
add('macross', 'MA Cross', T, 'o', `a = input.int(9, "Cepat")
b = input.int(21, "Lambat")
x = ta.ema(close, a)
y = ta.ema(close, b)
plot(x, "Cepat", color = #ff9800)
plot(y, "Lambat", color = #2962ff)
up = ta.crossover(x, y)
dn = ta.crossunder(x, y)
plotshape(up, "Naik", shape.triangleup, location.belowbar, #089981, size = size.small)
plotshape(dn, "Turun", shape.triangledown, location.abovebar, #f23645, size = size.small)
alertcondition(up, "MA cross naik", "{{ticker}} MA cross naik di {{close}}")
alertcondition(dn, "MA cross turun", "{{ticker}} MA cross turun di {{close}}")`);
add('mtfma', 'MA Multi-Timeframe', T, 'o', `tf = input.timeframe("240", "Timeframe")
len = input.int(50, "Panjang")
t = input.string("EMA", "Jenis", options = ["EMA", "SMA"])
m = request.security(syminfo.tickerid, tf, t == "EMA" ? ta.ema(close, len) : ta.sma(close, len))
plot(m, "MTF MA", color = close > m ? #089981 : #f23645, linewidth = 2)`, 'MTF MA');
add('bb', 'Bollinger Bands', W, 'o', `len = input.int(20, "Panjang", minval = 1)
src = input.source(close, "Sumber")
mult = input.float(2.0, "StdDev", step = 0.1)
[b, u, l] = ta.bb(src, len, mult)
plot(b, "Basis", color = #ff9800)
p1 = plot(u, "Atas", color = #2962ff)
p2 = plot(l, "Bawah", color = #2962ff)
fill(p1, p2, color = color.new(#2962ff, 93), title = "Latar")`, 'BB');
add('kc', 'Keltner Channels', W, 'o', `len = input.int(20, "Panjang")
mult = input.float(2.0, "Pengali")
atrLen = input.int(10, "Panjang ATR")
m = ta.ema(close, len)
r = ta.atr(atrLen) * mult
p1 = plot(m + r, "Atas", color = #00bcd4)
plot(m, "Basis", color = #00bcd4)
p2 = plot(m - r, "Bawah", color = #00bcd4)
fill(p1, p2, color = color.new(#00bcd4, 94))`, 'KC');
add('dc', 'Donchian Channels', W, 'o', `len = input.int(20, "Panjang")
u = ta.highest(len)
l = ta.lowest(len)
p1 = plot(u, "Atas", color = #2962ff)
p2 = plot(l, "Bawah", color = #2962ff)
plot(math.avg(u, l), "Basis", color = #ff6d00)
fill(p1, p2, color = color.new(#2962ff, 95))`, 'DC');
add('env', 'Envelope', W, 'o', `len = input.int(20, "Panjang")
pct = input.float(5.0, "Persen")
m = ta.sma(close, len)
plot(m, "Basis", color = #ff9800)
plot(m * (1 + pct / 100), "Atas", color = #2962ff)
plot(m * (1 - pct / 100), "Bawah", color = #2962ff)`, 'ENV');
add('atrb', 'ATR Bands', W, 'o', `len = input.int(14, "Panjang ATR")
m = input.float(2.0, "Pengali")
a = ta.atr(len) * m
plot(close + a, "Atas", color = #f23645)
plot(close - a, "Bawah", color = #089981)`);
add('seb', 'Standard Error Bands', W, 'o', `len = input.int(21, "Panjang")
k = input.float(2, "Pengali")
lr = ta.linreg(close, len, 0)
se = ta.stdev(close, len) * math.sqrt(1 - math.pow(ta.correlation(close, bar_index, len), 2))
b = ta.sma(lr, 3)
e = ta.sma(se, 3) * k
plot(b, "Tengah", color = #ff9800)
plot(b + e, "Atas", color = #2962ff)
plot(b - e, "Bawah", color = #2962ff)`);
add('nw', 'Nadaraya-Watson Envelope (tanpa repaint)', W, 'o', `h = input.float(8, "Bandwidth")
m = input.float(3, "Pengali")
n = 200
float s = 0
float w = 0
for i = 0 to n
    k = math.exp(-(i * i) / (h * h * 2))
    s += nz(close[i], close) * k
    w += k
o = s / w
e = ta.sma(math.abs(close - o), n) * m
plot(o + e, "Atas", color = #089981)
plot(o - e, "Bawah", color = #f23645)
plotshape(ta.crossunder(close, o - e), "Bawah tembus", shape.triangleup, location.belowbar, #089981, size = size.tiny)
plotshape(ta.crossover(close, o + e), "Atas tembus", shape.triangledown, location.abovebar, #f23645, size = size.tiny)`, 'NWE');
add('ichi', 'Ichimoku Cloud', T, 'o', `a = input.int(9, "Tenkan")
b = input.int(26, "Kijun")
c = input.int(52, "Senkou B")
d = input.int(26, "Geser")
don(l) => math.avg(ta.lowest(l), ta.highest(l))
tk = don(a)
kj = don(b)
sa = math.avg(tk, kj)
sb = don(c)
plot(tk, "Tenkan", color = #2962ff)
plot(kj, "Kijun", color = #b71c1c)
plot(close, "Chikou", color = #43a047, offset = -d + 1)
p1 = plot(sa, "Senkou A", color = #a5d6a7, offset = d - 1)
p2 = plot(sb, "Senkou B", color = #ef9a9a, offset = d - 1)
fill(p1, p2, color = sa > sb ? color.new(#43a047, 85) : color.new(#f44336, 85))`, 'Ichimoku');
add('psar', 'Parabolic SAR', T, 'o', `s = input.float(0.02, "Awal", step = 0.01)
i = input.float(0.02, "Kenaikan", step = 0.01)
m = input.float(0.2, "Maks", step = 0.01)
v = ta.sar(s, i, m)
plot(v, "SAR", color = v < close ? #089981 : #f23645, style = plot.style_circles, linewidth = 2)`, 'SAR');
add('st', 'Supertrend', T, 'o', `len = input.int(10, "Panjang ATR")
f = input.float(3.0, "Faktor", step = 0.1)
[s, d] = ta.supertrend(f, len)
up = plot(d < 0 ? s : na, "Naik", color = #089981, style = plot.style_linebr, linewidth = 2)
dn = plot(d < 0 ? na : s, "Turun", color = #f23645, style = plot.style_linebr, linewidth = 2)
b = plot((open + close) / 2, "Badan", display = display.none)
fill(b, up, color = color.new(#089981, 90), fillgaps = false)
fill(b, dn, color = color.new(#f23645, 90), fillgaps = false)
alertcondition(d[1] > d, "Supertrend naik", "{{ticker}} Supertrend NAIK {{close}}")
alertcondition(d[1] < d, "Supertrend turun", "{{ticker}} Supertrend TURUN {{close}}")`);
add('chand', 'Chandelier Exit', T, 'o', `len = input.int(22, "Panjang")
m = input.float(3.0, "Pengali ATR")
a = ta.atr(len) * m
ls = ta.highest(close, len) - a
ss = ta.lowest(close, len) + a
var float l = na
var float s = na
l := close[1] > nz(l[1], ls) ? math.max(ls, nz(l[1], ls)) : ls
s := close[1] < nz(s[1], ss) ? math.min(ss, nz(s[1], ss)) : ss
var int d = 1
d := close > nz(s[1], ss) ? 1 : close < nz(l[1], ls) ? -1 : d
plot(d == 1 ? l : na, "Long", color = #089981, style = plot.style_linebr, linewidth = 2)
plot(d == 1 ? na : s, "Short", color = #f23645, style = plot.style_linebr, linewidth = 2)`, 'CE');
add('ckstop', 'Chande Kroll Stop', T, 'o', `p = input.int(10, "P")
x = input.float(1, "X")
q = input.int(9, "Q")
fh = ta.highest(high, p) - x * ta.atr(p)
fl = ta.lowest(low, p) + x * ta.atr(p)
plot(ta.highest(fh, q), "Stop long", color = #2962ff)
plot(ta.lowest(fl, q), "Stop short", color = #ff6d00)`);
add('atrts', 'ATR Trailing Stop + sinyal', T, 'o', `k = input.float(1.5, "Sensitivitas")
len = input.int(10, "Periode ATR")
n = k * ta.atr(len)
var float ts = na
p = nz(ts[1], close)
ts := close > p and close[1] > p ? math.max(p, close - n) : close < p and close[1] < p ? math.min(p, close + n) : close > p ? close - n : close + n
b = ta.crossover(close, ts)
s = ta.crossunder(close, ts)
plot(ts, "Trailing", color = close > ts ? #089981 : #f23645, linewidth = 2)
plotshape(b, "Beli", shape.labelup, location.belowbar, #089981, text = "BUY", textcolor = color.white, size = size.small)
plotshape(s, "Jual", shape.labeldown, location.abovebar, #f23645, text = "SELL", textcolor = color.white, size = size.small)
alertcondition(b, "ATR TS beli", "BUY {{ticker}} {{close}}")
alertcondition(s, "ATR TS jual", "SELL {{ticker}} {{close}}")`, 'ATR TS');
add('halftrend', 'HalfTrend', T, 'o', `amp = input.int(2, "Amplitudo")
dev = input.float(2, "Deviasi kanal")
var int trend = 0
var int next = 0
var float maxLow = nz(low[1], low)
var float minHigh = nz(high[1], high)
var float up = 0.0
var float dn = 0.0
a2 = ta.atr(100) / 2
hp = high[nz(math.abs(ta.highestbars(amp)))]
lp = low[nz(math.abs(ta.lowestbars(amp)))]
hm = nz(ta.sma(high, amp), high)
lm = nz(ta.sma(low, amp), low)
if next == 1
    maxLow := math.max(lp, maxLow)
    if hm < maxLow and close < nz(low[1], low)
        trend := 1
        next := 0
        minHigh := hp
else
    minHigh := math.min(hp, minHigh)
    if lm > minHigh and close > nz(high[1], high)
        trend := 0
        next := 1
        maxLow := lp
if trend == 0
    up := trend[1] != 0 ? dn[1] : math.max(maxLow, nz(up[1], maxLow))
else
    dn := trend[1] != 1 ? up[1] : math.min(minHigh, nz(dn[1], minHigh))
ht = trend == 0 ? up : dn
plot(ht, "HalfTrend", color = trend == 0 ? #2962ff : #f23645, linewidth = 2)
plotshape(trend == 0 and trend[1] == 1, "Beli", shape.triangleup, location.belowbar, #2962ff, size = size.small)
plotshape(trend == 1 and trend[1] == 0, "Jual", shape.triangledown, location.abovebar, #f23645, size = size.small)`);
add('alli', 'Williams Alligator', T, 'o', `j = ta.rma(hl2, 13)
t = ta.rma(hl2, 8)
l = ta.rma(hl2, 5)
plot(j, "Rahang", offset = 8, color = #2962ff)
plot(t, "Gigi", offset = 5, color = #e91e63)
plot(l, "Bibir", offset = 3, color = #66bb6a)`);
add('lrc', 'Linear Regression Channel', T, 'om', `len = input.int(100, "Panjang")
k = input.float(2, "Deviasi")
var line a = line.new(na, na, na, na, color = #2962ff, width = 1)
var line b = line.new(na, na, na, na, color = #f23645, width = 1)
var line c = line.new(na, na, na, na, color = #089981, width = 1)
if barstate.islast
    e = ta.linreg(close, len, 0)
    s = ta.linreg(close, len, len - 1)
    float d = 0
    for i = 0 to len - 1
        v = e + (s - e) * i / (len - 1)
        d += math.pow(close[i] - v, 2)
    sd = math.sqrt(d / len) * k
    a.set_xy1(bar_index - len + 1, s)
    a.set_xy2(bar_index, e)
    b.set_xy1(bar_index - len + 1, s + sd)
    b.set_xy2(bar_index, e + sd)
    c.set_xy1(bar_index - len + 1, s - sd)
    c.set_xy2(bar_index, e - sd)
    a.set_extend(extend.right)
    b.set_extend(extend.right)
    c.set_extend(extend.right)
plot(ta.linreg(close, len, 0), "LSMA", display = display.none)`, 'LRC');
add('vwap', 'VWAP (+ pita)', V, 'o', `anc = input.string("Sesi", "Jangkar", options = ["Sesi", "Minggu", "Bulan", "Tahun"])
src = input.source(hlc3, "Sumber")
m1 = input.float(1, "Pita 1")
m2 = input.float(2, "Pita 2")
show = input.bool(true, "Tampilkan pita")
n = anc == "Sesi" ? timeframe.change("D") : anc == "Minggu" ? timeframe.change("W") : anc == "Bulan" ? timeframe.change("M") : timeframe.change("12M")
[w, u, l] = ta.vwap(src, n, 1)
d = u - w
plot(w, "VWAP", color = #2962ff, linewidth = 2)
p1 = plot(show ? w + d * m1 : na, "Atas 1", color = color.new(#4caf50, 20))
p2 = plot(show ? w - d * m1 : na, "Bawah 1", color = color.new(#4caf50, 20))
plot(show ? w + d * m2 : na, "Atas 2", color = color.new(#808000, 20))
plot(show ? w - d * m2 : na, "Bawah 2", color = color.new(#808000, 20))
fill(p1, p2, color = color.new(#4caf50, 95))`, 'VWAP');
add('twap', 'TWAP', V, 'o', `n = timeframe.change("D")
var float s = 0.0
var int c = 0
if n
    s := 0
    c := 0
s += ohlc4
c += 1
plot(s / c, "TWAP", color = #9c27b0)`);
/* ---- volume ---- */
add('vol', 'Volume', V, 'ov', `len = input.int(20, "Panjang MA")
showMa = input.bool(true, "Tampilkan MA")
plot(volume, "Volume", style = plot.style_columns, color = close >= open ? color.new(#089981, 55) : color.new(#f23645, 55))
plot(showMa ? ta.sma(volume, len) : na, "MA volume", color = #ff9800)`, 'Vol');
add('voln', 'Volume (panel sendiri)', V, 'v', `len = input.int(20, "Panjang MA")
m = ta.sma(volume, len)
plot(volume, "Volume", style = plot.style_columns, color = volume > m * 2 ? (close >= open ? #089981 : #f23645) : close >= open ? color.new(#089981, 45) : color.new(#f23645, 45))
plot(m, "MA", color = #ff9800)`, 'Vol');
add('cvd', 'Cumulative Volume Delta (CVD)', V, 'v', `import TradingView/ta/10 as ta
res = input.timeframe("D", "Mulai ulang tiap")
[u, d, x] = ta.requestUpAndDownVolume("1")
var float c = 0.0
o = timeframe.change(res) ? 0.0 : nz(c[1])
c := o + x
col = c >= o ? #089981 : #f23645
plotcandle(o, math.max(o, c), math.min(o, c), c, "CVD", color = col, wickcolor = col, bordercolor = col)
hline(0, "Nol")`, 'CVD');
add('vdelta', 'Volume Delta (beli − jual agresif)', V, 'v', `import TradingView/ta/10 as ta
[u, d, x] = ta.requestUpAndDownVolume("1")
plot(x, "Delta", style = plot.style_columns, color = x >= 0 ? #089981 : #f23645)
plot(ta.ema(x, 14), "EMA", color = #ff9800)
hline(0, "Nol")`, 'Delta');
add('updn', 'Up/Down Volume', V, 'v', `import TradingView/ta/10 as ta
[u, d, x] = ta.requestUpAndDownVolume("1")
plot(u, "Beli", style = plot.style_columns, color = color.new(#089981, 30))
plot(d, "Jual", style = plot.style_columns, color = color.new(#f23645, 30))
plot(x, "Delta", color = color.gray)`);
add('obv', 'On Balance Volume (OBV)', V, 'v', `len = input.int(21, "Panjang MA")
plot(ta.obv, "OBV", color = #2962ff)
plot(ta.ema(ta.obv, len), "MA", color = #ff9800)`, 'OBV');
add('ad', 'Accumulation/Distribution', V, 'v', `plot(ta.accdist, "A/D", color = #808000)`, 'A/D');
add('cmf', 'Chaikin Money Flow', V, '', `len = input.int(20, "Panjang")
a = high == low ? 0 : ((2 * close - low - high) / (high - low)) * volume
m = math.sum(a, len) / math.sum(volume, len)
plot(m, "CMF", color = m >= 0 ? #089981 : #f23645, linewidth = 2)
hline(0, "Nol")`, 'CMF');
add('cho', 'Chaikin Oscillator', V, 'v', `plot(ta.ema(ta.accdist, 3) - ta.ema(ta.accdist, 10), "CO", color = #ec407a)
hline(0)`);
add('pvt', 'Price Volume Trend', V, 'v', `plot(ta.pvt, "PVT", color = #2962ff)`, 'PVT');
add('nvi', 'Negative / Positive Volume Index', V, '', `plot(ta.nvi, "NVI", color = #f23645)
plot(ta.pvi, "PVI", color = #089981)`, 'NVI/PVI');
add('eom', 'Ease of Movement', V, '', `len = input.int(14, "Panjang")
plot(ta.sma(10000 * ta.change(hl2) * (high - low) / volume, len), "EOM", color = #43a047)
hline(0)`, 'EOM');
add('efi', 'Elder Force Index', V, 'v', `plot(ta.ema(ta.change(close) * volume, 13), "EFI", color = #f23645)
hline(0)`, 'EFI');
add('vosc', 'Volume Oscillator', V, '', `a = ta.ema(volume, 5)
b = ta.ema(volume, 10)
plot(100 * (a - b) / b, "VO", color = #2962ff)
hline(0)`);
add('rvol', 'Relative Volume (RVOL)', V, '', `len = input.int(20, "Panjang")
r = volume / ta.sma(volume, len)
plot(r, "RVOL", style = plot.style_columns, color = r >= 3 ? #e91e63 : r >= 2 ? #ff9800 : r >= 1 ? #2962ff : color.new(#787b86, 40))
hline(1)
hline(2)`, 'RVOL');
add('klinger', 'Klinger Oscillator', V, 'v', `sv = ta.change(hlc3) >= 0 ? volume : -volume
k = ta.ema(sv, 34) - ta.ema(sv, 55)
plot(k, "KO", color = #2962ff)
plot(ta.ema(k, 13), "Sinyal", color = #43a047)`);
add('netv', 'Net Volume', V, 'v', `plot(close > close[1] ? volume : close < close[1] ? -volume : 0, "Net", color = #2962ff)
hline(0)`);
add('vwmacd', 'VW-MACD', V, '', `m = ta.vwma(close, 12) - ta.vwma(close, 26)
s = ta.ema(m, 9)
plot(m - s, "Hist", style = plot.style_columns, color = m >= s ? color.new(#089981, 40) : color.new(#f23645, 40))
plot(m, "VW-MACD", color = #2962ff)
plot(s, "Sinyal", color = #ff6d00)`);
/* ---- oscillators ---- */
add('rsi', 'Relative Strength Index (RSI) + divergensi', O, '', `len = input.int(14, "Panjang")
src = input.source(close, "Sumber")
maLen = input.int(14, "Panjang MA")
div = input.bool(false, "Divergensi")
r = ta.rsi(src, len)
p = plot(r, "RSI", color = #7e57c2, linewidth = 2)
plot(ta.sma(r, maLen), "MA", color = #fdd835)
h1 = hline(70, "Atas", color = #787b86)
hline(50, "Tengah", color = color.new(#787b86, 50))
h2 = hline(30, "Bawah", color = #787b86)
fill(h1, h2, color = color.new(#7e57c2, 92))
m = plot(50, "t", display = display.none, editable = false)
fill(p, m, 100, 70, color.new(#089981, 0), color.new(#089981, 100), title = "Jenuh beli")
fill(p, m, 30, 0, color.new(#f23645, 100), color.new(#f23645, 0), title = "Jenuh jual")
lb = 5
pl = na(ta.pivotlow(r, lb, lb)) ? false : true
ph = na(ta.pivothigh(r, lb, lb)) ? false : true
rl = ta.valuewhen(pl, r[lb], 1)
ll = ta.valuewhen(pl, low[lb], 1)
rh = ta.valuewhen(ph, r[lb], 1)
hh = ta.valuewhen(ph, high[lb], 1)
bull = div and pl and r[lb] > rl and low[lb] < ll
bear = div and ph and r[lb] < rh and high[lb] > hh
plotshape(bull ? r[lb] : na, "Bull", shape.labelup, location.absolute, #089981, offset = -5, text = "Bull", textcolor = color.white)
plotshape(bear ? r[lb] : na, "Bear", shape.labeldown, location.absolute, #f23645, offset = -5, text = "Bear", textcolor = color.white)
alertcondition(ta.crossover(r, 70), "RSI > 70", "{{ticker}} RSI jenuh beli")
alertcondition(ta.crossunder(r, 30), "RSI < 30", "{{ticker}} RSI jenuh jual")
alertcondition(bull, "Divergensi bullish", "{{ticker}} RSI divergensi bullish")
alertcondition(bear, "Divergensi bearish", "{{ticker}} RSI divergensi bearish")`, 'RSI', 'STD;RSI');
add('macd', 'MACD', O, '', `f = input.int(12, "Cepat")
s = input.int(26, "Lambat")
g = input.int(9, "Sinyal")
src = input.source(close, "Sumber")
[m, sg, h] = ta.macd(src, f, s, g)
plot(h, "Histogram", style = plot.style_columns, color = h >= 0 ? (h > h[1] ? #26a69a : #b2dfdb) : (h > h[1] ? #ffcdd2 : #ff5252))
plot(m, "MACD", color = #2962ff)
plot(sg, "Sinyal", color = #ff6d00)
hline(0, "Nol", color = color.new(#787b86, 50))
alertcondition(ta.crossover(m, sg), "MACD cross naik", "{{ticker}} MACD cross naik")
alertcondition(ta.crossunder(m, sg), "MACD cross turun", "{{ticker}} MACD cross turun")`, '', 'STD;MACD');
add('stoch', 'Stochastic', O, '', `k = input.int(14, "%K")
d = input.int(3, "%D")
sm = input.int(3, "Penghalus")
a = ta.sma(ta.stoch(close, high, low, k), sm)
plot(a, "%K", color = #2962ff)
plot(ta.sma(a, d), "%D", color = #ff6d00)
h1 = hline(80)
h2 = hline(20)
fill(h1, h2, color = color.new(#2196f3, 92))`, 'Stoch', 'STD;Stochastic');
add('srsi', 'Stochastic RSI', O, '', `kk = input.int(3, "K")
dd = input.int(3, "D")
rl = input.int(14, "Panjang RSI")
sl = input.int(14, "Panjang Stoch")
r = ta.rsi(close, rl)
k = ta.sma(ta.stoch(r, r, r, sl), kk)
plot(k, "K", color = #2962ff)
plot(ta.sma(k, dd), "D", color = #ff6d00)
h1 = hline(80)
h2 = hline(20)
fill(h1, h2, color = color.new(#2196f3, 92))`, 'Stoch RSI', 'STD;Stochastic_RSI');
add('cci', 'Commodity Channel Index (CCI)', O, '', `len = input.int(20, "Panjang")
c = ta.cci(hlc3, len)
plot(c, "CCI", color = #2962ff)
plot(ta.sma(c, 14), "MA", color = #fdd835)
h1 = hline(100)
h2 = hline(-100)
fill(h1, h2, color = color.new(#2196f3, 92))`, 'CCI', 'STD;CCI');
add('mfi', 'Money Flow Index', O, '', `len = input.int(14, "Panjang")
plot(ta.mfi(hlc3, len), "MFI", color = #7e57c2)
h1 = hline(80)
h2 = hline(20)
fill(h1, h2, color = color.new(#7e57c2, 92))`, 'MFI', 'STD;MFI');
add('wpr', 'Williams %R', O, '', `len = input.int(14, "Panjang")
plot(ta.wpr(len), "%R", color = #7e57c2)
hline(-20)
hline(-80)`, '%R');
add('roc', 'Rate of Change', O, '', `len = input.int(9, "Panjang")
plot(ta.roc(close, len), "ROC", color = #2962ff)
hline(0)`, 'ROC');
add('mom', 'Momentum', O, '', `len = input.int(10, "Panjang")
plot(ta.mom(close, len), "MOM", color = #2962ff)
hline(0)`, 'MOM');
add('ao', 'Awesome Oscillator', O, '', `a = ta.sma(hl2, 5) - ta.sma(hl2, 34)
plot(a, "AO", style = plot.style_columns, color = a >= a[1] ? #089981 : #f23645)`, 'AO');
add('acosc', 'Accelerator Oscillator', O, '', `a = ta.sma(hl2, 5) - ta.sma(hl2, 34)
c = a - ta.sma(a, 5)
plot(c, "AC", style = plot.style_columns, color = c >= c[1] ? #089981 : #f23645)`, 'AC');
add('tsi', 'True Strength Index', O, '', `l = input.int(25, "Panjang")
s = input.int(13, "Pendek")
g = input.int(13, "Sinyal")
t = ta.tsi(close, s, l) * 100
plot(t, "TSI", color = #2962ff)
plot(ta.ema(t, g), "Sinyal", color = #e91e63)
hline(0)`, 'TSI');
add('trix', 'TRIX', O, '', `len = input.int(18, "Panjang")
plot(10000 * ta.change(ta.ema(ta.ema(ta.ema(math.log(close), len), len), len)), "TRIX", color = #f23645)
hline(0)`);
add('uo', 'Ultimate Oscillator', O, '', `bp = close - math.min(low, close[1])
tr = math.max(high, close[1]) - math.min(low, close[1])
a(l) => math.sum(bp, l) / math.sum(tr, l)
plot(100 * (4 * a(7) + 2 * a(14) + a(28)) / 7, "UO", color = #f23645)
hline(70)
hline(30)`, 'UO');
add('dpo', 'Detrended Price Oscillator', O, '', `len = input.int(21, "Panjang")
plot(close - ta.sma(close, len)[math.floor(len / 2) + 1], "DPO", color = #43a047)
hline(0)`, 'DPO');
add('cmo', 'Chande Momentum Oscillator', O, '', `len = input.int(9, "Panjang")
plot(ta.cmo(close, len), "CMO", color = #2962ff)
hline(50)
hline(0)
hline(-50)`, 'CMO');
add('rvgi', 'Relative Vigor Index', O, '', `len = input.int(10, "Panjang")
r = math.sum(ta.swma(close - open), len) / math.sum(ta.swma(high - low), len)
plot(r, "RVGI", color = #008000)
plot(ta.swma(r), "Sinyal", color = #f23645)`, 'RVGI');
add('rviv', 'Relative Volatility Index', O, '', `len = input.int(10, "Panjang")
s = ta.stdev(close, len)
u = ta.ema(ta.change(close) <= 0 ? 0 : s, 14)
d = ta.ema(ta.change(close) > 0 ? 0 : s, 14)
plot(u / (u + d) * 100, "RVI", color = #7e57c2)
hline(80)
hline(20)`, 'RVI');
add('kst', 'Know Sure Thing', O, '', `k = ta.sma(ta.roc(close, 10), 10) + 2 * ta.sma(ta.roc(close, 15), 10) + 3 * ta.sma(ta.roc(close, 20), 10) + 4 * ta.sma(ta.roc(close, 30), 15)
plot(k, "KST", color = #089981)
plot(ta.sma(k, 9), "Sinyal", color = #f23645)
hline(0)`, 'KST');
add('copp', 'Coppock Curve', O, '', `plot(ta.wma(ta.roc(close, 14) + ta.roc(close, 11), 10), "Coppock", color = #2962ff)
hline(0)`);
add('fisher', 'Fisher Transform', O, '', `len = input.int(9, "Panjang")
hh = ta.highest(hl2, len)
ll = ta.lowest(hl2, len)
r(v) => v > 0.99 ? 0.999 : v < -0.99 ? -0.999 : v
var float v = 0.0
v := r(0.66 * ((hl2 - ll) / (hh - ll) - 0.5) + 0.67 * nz(v[1]))
var float f = 0.0
f := 0.5 * math.log((1 + v) / (1 - v)) + 0.5 * nz(f[1])
plot(f, "Fisher", color = #2962ff)
plot(f[1], "Pemicu", color = #ff6d00)
hline(0)`);
add('aroon', 'Aroon', O, '', `len = input.int(14, "Panjang")
plot(100 * (ta.highestbars(high, len + 1) + len) / len, "Naik", color = #fb8c00)
plot(100 * (ta.lowestbars(low, len + 1) + len) / len, "Turun", color = #2962ff)`);
add('adx', 'ADX / DMI', O, '', `len = input.int(14, "Panjang DI")
sm = input.int(14, "Penghalus ADX")
[p, m, a] = ta.dmi(len, sm)
plot(a, "ADX", color = #f50057, linewidth = 2)
plot(p, "+DI", color = #2962ff)
plot(m, "-DI", color = #ff6d00)
hline(25)`, 'ADX', 'STD;Average%1Directional%1Index');
add('vortex', 'Vortex Indicator', O, '', `len = input.int(14, "Panjang")
s = math.sum(ta.atr(1), len)
plot(math.sum(math.abs(high - low[1]), len) / s, "VI+", color = #2962ff)
plot(math.sum(math.abs(low - high[1]), len) / s, "VI-", color = #e91e63)`);
add('bbp', 'Bull Bear Power (Elder Ray)', O, '', `len = input.int(13, "Panjang")
e = ta.ema(close, len)
b = high - e
s = low - e
plot(b, "Bull", style = plot.style_columns, color = color.new(#089981, 40))
plot(s, "Bear", style = plot.style_columns, color = color.new(#f23645, 40))`, 'Elder Ray');
add('ppo', 'Price Oscillator (PPO)', O, '', `a = ta.ema(close, 12)
b = ta.ema(close, 26)
p = (a - b) / b * 100
s = ta.ema(p, 9)
plot(p - s, "Hist", style = plot.style_columns, color = p > s ? color.new(#089981, 40) : color.new(#f23645, 40))
plot(p, "PPO", color = #2962ff)
plot(s, "Sinyal", color = #ff6d00)`, 'PPO');
add('smi', 'Stochastic Momentum Index (SMI)', O, '', `k = input.int(10, "%K")
d = input.int(3, "%D")
hh = ta.highest(high, k)
ll = ta.lowest(low, k)
e(s, l) => ta.ema(ta.ema(s, l), l)
s = 200 * e(close - math.avg(hh, ll), d) / e(hh - ll, d)
plot(s, "SMI", color = #2962ff)
plot(ta.ema(s, 3), "EMA", color = #ff6d00)
hline(40)
hline(-40)`, 'SMI');
add('wt', 'WaveTrend', O, '', `n1 = input.int(10, "Kanal")
n2 = input.int(21, "Rata-rata")
e = ta.ema(hlc3, n1)
d = ta.ema(math.abs(hlc3 - e), n1)
w = ta.ema((hlc3 - e) / (0.015 * d), n2)
s = ta.sma(w, 4)
plot(w - s, "Momentum", style = plot.style_area, color = color.new(#2962ff, 70))
plot(w, "WT1", color = #089981)
plot(s, "WT2", color = #f23645)
hline(60)
hline(-60)
plotshape(ta.crossover(w, s) and w < -53 ? w : na, "Beli", shape.circle, location.absolute, #089981, size = size.tiny)
plotshape(ta.crossunder(w, s) and w > 53 ? w : na, "Jual", shape.circle, location.absolute, #f23645, size = size.tiny)
alertcondition(ta.crossover(w, s) and w < -53, "WT beli", "{{ticker}} WaveTrend beli")
alertcondition(ta.crossunder(w, s) and w > 53, "WT jual", "{{ticker}} WaveTrend jual")`, 'WT');
add('qqe', 'QQE', O, '', `rl = input.int(14, "RSI")
sf = input.int(5, "Penghalus")
q = input.float(4.236, "Faktor")
r = ta.ema(ta.rsi(close, rl), sf)
w = rl * 2 - 1
d = ta.ema(ta.ema(math.abs(r[1] - r), w), w) * q
var float lb = 0.0
var float sb = 0.0
var int t = 1
nl = r - d
ns = r + d
lb := r[1] > nz(lb[1]) and r > nz(lb[1]) ? math.max(nz(lb[1]), nl) : nl
sb := r[1] < nz(sb[1]) and r < nz(sb[1]) ? math.min(nz(sb[1]), ns) : ns
t := r > nz(sb[1]) ? 1 : r < nz(lb[1]) ? -1 : t
plot(r, "RSI MA", color = #2962ff, linewidth = 2)
plot(t == 1 ? lb : sb, "Trail", color = t == 1 ? #089981 : #f23645)
hline(50)`);
add('stc', 'Schaff Trend Cycle', O, '', `len = input.int(12, "Siklus")
a = input.int(26, "Cepat")
b = input.int(50, "Lambat")
m = ta.ema(close, a) - ta.ema(close, b)
f(x) =>
    l = ta.lowest(x, len)
    h = ta.highest(x, len) - l
    var float k = 0.0
    k := h > 0 ? (x - l) / h * 100 : nz(k[1])
    var float o = na
    o := na(o[1]) ? k : o[1] + 0.5 * (k - o[1])
    o
s = f(f(m))
plot(s, "STC", color = s > s[1] ? #089981 : #f23645, linewidth = 2)
hline(75)
hline(25)`, 'STC');
add('crsi', 'Connors RSI', O, '', `s = 0
var int ud = 0
ud := close > close[1] ? (nz(ud[1]) > 0 ? nz(ud[1]) + 1 : 1) : close < close[1] ? (nz(ud[1]) < 0 ? nz(ud[1]) - 1 : -1) : 0
plot(math.avg(ta.rsi(close, 3), ta.rsi(ud, 2), ta.percentrank(ta.roc(close, 1), 100)), "CRSI", color = #2962ff)
hline(70)
hline(30)`, 'CRSI');
add('chop', 'Choppiness Index', W, '', `len = input.int(14, "Panjang")
plot(100 * math.log10(math.sum(ta.atr(1), len) / (ta.highest(len) - ta.lowest(len))) / math.log10(len), "CHOP", color = #2962ff)
h1 = hline(61.8)
h2 = hline(38.2)
fill(h1, h2, color = color.new(#2962ff, 92))`, 'CHOP');
add('squeeze', 'Squeeze Momentum', O, '', `len = input.int(20, "Panjang")
[b, u, l] = ta.bb(close, len, 2.0)
[k, ku, kl] = ta.kc(close, len, 1.5)
on = l > kl and u < ku
v = ta.linreg(close - math.avg(math.avg(ta.highest(high, len), ta.lowest(low, len)), ta.sma(close, len)), len, 0)
plot(v, "Momentum", style = plot.style_columns, color = v > 0 ? (v > v[1] ? #00e676 : #089981) : (v < v[1] ? #f23645 : #880e4f))
plot(0, "Squeeze", style = plot.style_cross, color = on ? #fdd835 : color.gray, linewidth = 2)
alertcondition(on[1] and not on, "Squeeze lepas", "{{ticker}} squeeze lepas")`, 'SQZ');
add('mass', 'Mass Index', W, '', `s = high - low
plot(math.sum(ta.ema(s, 9) / ta.ema(ta.ema(s, 9), 9), 25), "Mass", color = #2962ff)
hline(27)`);
add('atr', 'Average True Range (ATR)', W, '', `len = input.int(14, "Panjang")
plot(ta.atr(len), "ATR", color = #b71c1c)`, 'ATR', 'STD;Average_True_Range');
add('bbpb', 'Bollinger %B', W, '', `[b, u, l] = ta.bb(close, 20, 2)
plot((close - l) / (u - l), "%B", color = #2962ff)
hline(1)
hline(0)`, '%B');
add('bbw', 'Bollinger Band Width', W, '', `plot(ta.bbw(close, 20, 2), "BBW", color = #2962ff)
plot(ta.lowest(ta.bbw(close, 20, 2), 125), "Terendah", color = #f23645)`, 'BBW');
add('hv', 'Historical Volatility', W, '', `len = input.int(10, "Panjang")
plot(100 * ta.stdev(math.log(close / close[1]), len) * math.sqrt(365), "HV", color = #2962ff)`, 'HV');
add('sd', 'Standard Deviation', W, '', `len = input.int(20, "Panjang")
plot(ta.stdev(close, len), "SD", color = #2962ff)`, 'SD');
add('ulcer', 'Ulcer Index', W, '', `len = input.int(14, "Panjang")
d = 100 * (close - ta.highest(close, len)) / ta.highest(close, len)
plot(math.sqrt(ta.sma(d * d, len)), "UI", color = #2962ff)`);
add('zs', 'Z-Score', O, '', `len = input.int(50, "Panjang")
z = (close - ta.sma(close, len)) / ta.stdev(close, len)
plot(z, "Z", color = z > 2 ? #f23645 : z < -2 ? #089981 : #2962ff, linewidth = 2)
hline(2)
hline(0)
hline(-2)`);
add('bop', 'Balance of Power', O, '', `plot(ta.sma((close - open) / (high - low), 14), "BOP", color = #f23645)
hline(0)`, 'BOP');
add('corr', 'Correlation Coefficient', O, '', `s = input.symbol("BINANCE:ETHUSDT", "Simbol")
len = input.int(20, "Panjang")
o = request.security(s, "", close)
c = ta.correlation(close, o, len)
plot(c, "Korelasi", color = #2962ff, style = plot.style_area)
hline(1)
hline(0)
hline(-1)`, 'CC');
add('rs', 'Kekuatan relatif vs simbol', O, '', `s = input.symbol("BINANCE:BTCUSDT", "Pembanding")
o = request.security(s, "", close)
r = close / o
plot(r, "Rasio", color = #2962ff)
plot(ta.ema(r, 50), "EMA 50", color = #ff9800)`, 'RS');
add('rating', 'Peringkat teknikal (−100…+100)', O, '', `f(tf) =>
    float s = 0
    s += close > ta.ema(close, 10) ? 1 : -1
    s += close > ta.ema(close, 20) ? 1 : -1
    s += close > ta.sma(close, 50) ? 1 : -1
    s += close > ta.sma(close, 100) ? 1 : -1
    s += close > ta.sma(close, 200) ? 1 : -1
    s += close > ta.hma(close, 9) ? 1 : -1
    r = ta.rsi(close, 14)
    s += r < 30 and r > r[1] ? 1 : r > 70 and r < r[1] ? -1 : 0
    k = ta.stoch(close, high, low, 14)
    s += k < 20 ? 1 : k > 80 ? -1 : 0
    c = ta.cci(close, 20)
    s += c < -100 ? 1 : c > 100 ? -1 : 0
    [m, g, h] = ta.macd(close, 12, 26, 9)
    s += m > g ? 1 : -1
    mo = ta.mom(close, 10)
    s += mo > mo[1] ? 1 : -1
    [p, n, a] = ta.dmi(14, 14)
    s += a > 20 ? (p > n ? 1 : -1) : 0
    s / 12 * 100
v = f("")
plot(v, "Skor", style = plot.style_columns, color = v > 50 ? #089981 : v > 10 ? #81c784 : v < -50 ? #f23645 : v < -10 ? #f77c80 : color.gray)
hline(50)
hline(10)
hline(-10)
hline(-50)`, 'Rating');
/* ---- structure ---- */
add('pivots', 'Pivot Points', S, 'om', `kind = input.string("Traditional", "Jenis", options = ["Traditional", "Fibonacci", "Woodie", "Classic", "DM", "Camarilla"])
tf = input.timeframe("D", "Periode")
showN = input.int(3, "Jumlah periode", minval = 1, maxval = 20)
[ph, pl, pc, po, t] = request.security(syminfo.tickerid, tf, [high[1], low[1], close[1], open[1], time], lookahead = barmerge.lookahead_on)
chg = ta.change(t) != 0
r = ph - pl
p = kind == "Woodie" ? (ph + pl + 2 * po) / 4 : kind == "DM" ? (pc > po ? 2 * ph + pl + pc : pc < po ? 2 * pl + ph + pc : ph + pl + 2 * pc) / 4 : (ph + pl + pc) / 3
r1 = kind == "Fibonacci" ? p + 0.382 * r : kind == "Camarilla" ? pc + 1.1 * r / 12 : 2 * p - pl
s1 = kind == "Fibonacci" ? p - 0.382 * r : kind == "Camarilla" ? pc - 1.1 * r / 12 : 2 * p - ph
r2 = kind == "Fibonacci" ? p + 0.618 * r : kind == "Camarilla" ? pc + 1.1 * r / 6 : p + r
s2 = kind == "Fibonacci" ? p - 0.618 * r : kind == "Camarilla" ? pc - 1.1 * r / 6 : p - r
r3 = kind == "Fibonacci" ? p + r : kind == "Camarilla" ? pc + 1.1 * r / 4 : 2 * p + ph - 2 * pl
s3 = kind == "Fibonacci" ? p - r : kind == "Camarilla" ? pc - 1.1 * r / 4 : 2 * p - (2 * ph - pl)
var array<line> ls = array.new<line>()
var array<label> lb = array.new<label>()
mk(y, n, c) =>
    ls.push(line.new(bar_index, y, bar_index + 1, y, color = c))
    lb.push(label.new(bar_index, y, n + " (" + str.tostring(y, format.mintick) + ")", style = label.style_label_right, color = #00000000, textcolor = c, size = size.small))
if chg
    mk(p, "P", #ff9800)
    mk(r1, "R1", #f23645)
    mk(s1, "S1", #089981)
    mk(r2, "R2", #f23645)
    mk(s2, "S2", #089981)
    if kind != "DM"
        mk(r3, "R3", #f23645)
        mk(s3, "S3", #089981)
n = kind == "DM" ? 5 : 7
if ls.size() >= n
    for i = ls.size() - n to ls.size() - 1
        ls.get(i).set_x2(bar_index + 1)
while ls.size() > n * showN
    line.delete(ls.shift())
    label.delete(lb.shift())`, 'Pivots');
add('pdhl', 'High/Low hari, minggu, bulan sebelumnya', S, 'o', `sd = input.bool(true, "Hari")
sw = input.bool(true, "Minggu")
sm = input.bool(false, "Bulan")
[dh, dl, dop] = request.security(syminfo.tickerid, "D", [high[1], low[1], open], lookahead = barmerge.lookahead_on)
[wh, wl] = request.security(syminfo.tickerid, "W", [high[1], low[1]], lookahead = barmerge.lookahead_on)
[mh, ml] = request.security(syminfo.tickerid, "M", [high[1], low[1]], lookahead = barmerge.lookahead_on)
plot(sd ? dh : na, "PDH", color = #ba68c8, style = plot.style_stepline)
plot(sd ? dl : na, "PDL", color = #ba68c8, style = plot.style_stepline)
plot(sd ? dop : na, "Open harian", color = color.new(#787b86, 20), style = plot.style_stepline)
plot(sw ? wh : na, "PWH", color = #ff9800, style = plot.style_stepline, linewidth = 2)
plot(sw ? wl : na, "PWL", color = #ff9800, style = plot.style_stepline, linewidth = 2)
plot(sm ? mh : na, "PMH", color = #00bcd4, style = plot.style_stepline, linewidth = 2)
plot(sm ? ml : na, "PML", color = #00bcd4, style = plot.style_stepline, linewidth = 2)
alertcondition(ta.crossover(close, dh), "Tembus PDH", "{{ticker}} tembus high kemarin")
alertcondition(ta.crossunder(close, dl), "Tembus PDL", "{{ticker}} tembus low kemarin")`, 'PDHL');
add('sess', 'Sesi Asia, London, New York', S, 'om', `a = input.session("0000-0900", "Asia (Tokyo)")
l = input.session("0700-1600", "London (UTC)")
n = input.session("1300-2200", "New York (UTC)")
f(s, c, nm) =>
    var box b = na
    i = not na(time(timeframe.period, s, "UTC"))
    if i and not i[1]
        b := box.new(bar_index, high, bar_index, low, border_color = color.new(c, 60), bgcolor = color.new(c, 92), text = nm, text_color = color.new(c, 20), text_size = size.small, text_halign = text.align_left, text_valign = text.align_top)
    else if i and not na(b)
        b.set_right(bar_index)
        b.set_top(math.max(b.get_top(), high))
        b.set_bottom(math.min(b.get_bottom(), low))
    i
if timeframe.isintraday
    f(a, #2962ff, "Asia")
    f(l, #ff9800, "London")
    f(n, #089981, "New York")`, 'Sesi');
add('orb', 'Opening Range Breakout', S, 'o', `s = input.session("0000-0015", "Rentang pembuka")
tz = input.string("UTC", "Zona waktu", options = ["UTC", "Europe/London", "America/New_York", "Asia/Jakarta"])
i = not na(time(timeframe.period, s, tz))
var float h = na
var float l = na
if i and not i[1]
    h := high
    l := low
else if i
    h := math.max(h, high)
    l := math.min(l, low)
plot(i ? na : h, "Atas", color = #089981, style = plot.style_linebr, linewidth = 2)
plot(i ? na : l, "Bawah", color = #f23645, style = plot.style_linebr, linewidth = 2)
bgcolor(i ? color.new(#fdd835, 88) : na)
alertcondition(ta.crossover(close, h), "ORB naik", "{{ticker}} ORB naik")
alertcondition(ta.crossunder(close, l), "ORB turun", "{{ticker}} ORB turun")`, 'ORB');
add('zz', 'Zig Zag', S, 'om', `len = input.int(10, "Panjang pivot")
var line ln = na
var int lx = na
var float ly = na
var int d = 0
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
add(x, y, k) =>
    var line z = na
    z
if not na(ph)
    if d == 1 and ph > ly
        ln.set_xy2(bar_index - len, ph)
        lx := bar_index - len
        ly := ph
    else if d != 1
        ln := na(lx) ? na : line.new(lx, ly, bar_index - len, ph, color = #2962ff, width = 2)
        label.new(bar_index - len, ph, str.tostring(ph, format.mintick), style = label.style_label_down, color = #00000000, textcolor = #f23645, size = size.small)
        lx := bar_index - len
        ly := ph
        d := 1
if not na(pl)
    if d == -1 and pl < ly
        ln.set_xy2(bar_index - len, pl)
        lx := bar_index - len
        ly := pl
    else if d != -1
        ln := na(lx) ? na : line.new(lx, ly, bar_index - len, pl, color = #2962ff, width = 2)
        label.new(bar_index - len, pl, str.tostring(pl, format.mintick), style = label.style_label_up, color = #00000000, textcolor = #089981, size = size.small)
        lx := bar_index - len
        ly := pl
        d := -1`, 'ZZ');
add('frac', 'Williams Fractals', S, 'o', `n = input.int(2, "Periode", minval = 2)
u = ta.pivothigh(high, n, n)
d = ta.pivotlow(low, n, n)
plotshape(not na(d), "Bawah", shape.triangledown, location.belowbar, #f44336, offset = -n, size = size.tiny)
plotshape(not na(u), "Atas", shape.triangleup, location.abovebar, #009688, offset = -n, size = size.tiny)`, 'Fractals');
add('sr', 'Support & Resistance otomatis', S, 'om', `len = input.int(12, "Panjang pivot")
maxN = input.int(8, "Jumlah level")
tol = input.float(0.6, "Toleransi gabung (x ATR)")
var array<float> lv = array.new<float>()
var array<int> ct = array.new<int>()
var array<int> bx = array.new<int>()
a = ta.atr(50)
addL(v) =>
    bool f = false
    if lv.size() > 0
        for i = 0 to lv.size() - 1
            if math.abs(lv.get(i) - v) < a * tol
                lv.set(i, (lv.get(i) * ct.get(i) + v) / (ct.get(i) + 1))
                ct.set(i, ct.get(i) + 1)
                f := true
                break
    if not f
        lv.push(v)
        ct.push(1)
        bx.push(bar_index - len)
    if lv.size() > 40
        k = ct.indexof(ct.min())
        lv.remove(k)
        ct.remove(k)
        bx.remove(k)
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
if not na(ph)
    addL(ph)
if not na(pl)
    addL(pl)
var array<line> ls = array.new<line>()
var array<label> lb = array.new<label>()
if barstate.islast
    for l in ls
        l.delete()
    for l in lb
        l.delete()
    ls.clear()
    lb.clear()
    o = ct.sort_indices(order.descending)
    n = math.min(maxN, o.size())
    if n > 0
        for j = 0 to n - 1
            i = o.get(j)
            y = lv.get(i)
            c = y > close ? #f23645 : #089981
            ls.push(line.new(math.max(bx.get(i), bar_index - 480), y, bar_index + 10, y, color = color.new(c, 25), width = math.min(4, 1 + math.floor(ct.get(i) / 2))))
            lb.push(label.new(bar_index + 10, y, str.tostring(ct.get(i)) + "x", style = label.style_label_left, color = #00000000, textcolor = c, size = size.small))`, 'S/R');
add('atl', 'Garis tren otomatis', S, 'om', `len = input.int(14, "Panjang pivot")
var int x1 = na
var float y1 = na
var int x2 = na
var float y2 = na
var int p1 = na
var float q1 = na
var int p2 = na
var float q2 = na
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
var line u = line.new(na, na, na, na, color = #f23645, width = 2, extend = extend.right)
var line d = line.new(na, na, na, na, color = #089981, width = 2, extend = extend.right)
if not na(ph)
    x1 := x2
    y1 := y2
    x2 := bar_index - len
    y2 := ph
    if not na(x1) and y2 < y1
        u.set_xy1(x1, y1)
        u.set_xy2(x2, y2)
if not na(pl)
    p1 := p2
    q1 := q2
    p2 := bar_index - len
    q2 := pl
    if not na(p1) and q2 > q1
        d.set_xy1(p1, q1)
        d.set_xy2(p2, q2)
uv = line.get_price(u, bar_index)
dv = line.get_price(d, bar_index)
bu = ta.crossover(close, uv)
bd = ta.crossunder(close, dv)
plotshape(bu, "Tembus atas", shape.labelup, location.belowbar, #089981, text = "B", textcolor = color.white, size = size.tiny)
plotshape(bd, "Tembus bawah", shape.labeldown, location.abovebar, #f23645, text = "B", textcolor = color.white, size = size.tiny)
alertcondition(bu, "Tembus garis tren turun", "{{ticker}} tembus garis tren turun")
alertcondition(bd, "Tembus garis tren naik", "{{ticker}} tembus garis tren naik")`, 'Auto TL');
add('afib', 'Fibonacci otomatis', S, 'om', `len = input.int(100, "Rentang (bar)")
h = ta.highest(high, len)
l = ta.lowest(low, len)
hb = ta.highestbars(high, len)
lb = ta.lowestbars(low, len)
var array<line> ls = array.new<line>()
var array<label> ts = array.new<label>()
if barstate.islast
    for x in ls
        x.delete()
    for x in ts
        x.delete()
    ls.clear()
    ts.clear()
    up = hb > lb
    f = array.from(0.0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618)
    c = array.from(#787b86, #f23645, #ff9800, #4caf50, #089981, #00bcd4, #787b86, #673ab7, #2962ff)
    for [i, k] in f
        y = up ? h - (h - l) * k : l + (h - l) * k
        ls.push(line.new(bar_index + math.min(hb, lb), y, bar_index + 5, y, color = c.get(i)))
        ts.push(label.new(bar_index + 5, y, str.tostring(k) + " (" + str.tostring(y, format.mintick) + ")", style = label.style_label_left, color = #00000000, textcolor = c.get(i), size = size.small))`, 'Auto Fib');
add('smc', 'Struktur pasar: BOS, CHoCH, Order Block, FVG', S, 'om', `len = input.int(8, "Panjang swing")
showOB = input.bool(true, "Order block")
showFVG = input.bool(true, "Fair value gap")
showEQ = input.bool(true, "Equal high/low")
maxB = input.int(8, "Jumlah kotak maksimal")
var float sh = na
var int shx = na
var float sl = na
var int slx = na
var bool shB = true
var bool slB = true
var int trend = 0
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
a = ta.atr(50)
if not na(ph)
    if showEQ and not na(sh) and math.abs(ph - sh) < a * 0.1
        line.new(shx, sh, bar_index - len, ph, color = #ff9800, style = line.style_dotted)
        label.new(bar_index - len, ph, "EQH", style = label.style_none, textcolor = #ff9800, size = size.tiny, yloc = yloc.abovebar)
    sh := ph
    shx := bar_index - len
    shB := false
if not na(pl)
    if showEQ and not na(sl) and math.abs(pl - sl) < a * 0.1
        line.new(slx, sl, bar_index - len, pl, color = #ff9800, style = line.style_dotted)
        label.new(bar_index - len, pl, "EQL", style = label.style_none, textcolor = #ff9800, size = size.tiny, yloc = yloc.belowbar)
    sl := pl
    slx := bar_index - len
    slB := false
type Z
    box b
    int d
var array<Z> obs = array.new<Z>()
var array<Z> fvg = array.new<Z>()
ob(int from, int d) =>
    int k = 0
    float best = na
    for i = 1 to math.min(bar_index - from + 1, 200)
        if d == 1 and close[i] < open[i] and (na(best) or low[i] < best)
            best := low[i]
            k := i
        if d == -1 and close[i] > open[i] and (na(best) or high[i] > best)
            best := high[i]
            k := i
    if k > 0
        c = d == 1 ? #2962ff : #f23645
        obs.push(Z.new(box.new(bar_index - k, high[k], bar_index + 10, low[k], border_color = color.new(c, 60), bgcolor = color.new(c, 85), text = "OB", text_color = color.new(c, 20), text_size = size.tiny, text_halign = text.align_right), d))
        if obs.size() > maxB
            z = obs.shift()
            z.b.delete()
bos = false
choch = false
if not shB and close > sh
    c = trend == -1 ? "CHoCH" : "BOS"
    line.new(shx, sh, bar_index, sh, color = #089981)
    label.new(math.round((shx + bar_index) / 2), sh, c, style = label.style_label_down, color = #00000000, textcolor = #089981, size = size.tiny)
    choch := trend == -1
    bos := trend != -1
    shB := true
    trend := 1
    if showOB
        ob(slx, 1)
if not slB and close < sl
    c = trend == 1 ? "CHoCH" : "BOS"
    line.new(slx, sl, bar_index, sl, color = #f23645)
    label.new(math.round((slx + bar_index) / 2), sl, c, style = label.style_label_up, color = #00000000, textcolor = #f23645, size = size.tiny)
    choch := trend == 1
    bos := trend != 1
    slB := true
    trend := -1
    if showOB
        ob(shx, -1)
if showFVG and barstate.isconfirmed
    if low > high[2] and close[1] > high[2] and low - high[2] > a * 0.25
        fvg.push(Z.new(box.new(bar_index - 1, low, bar_index + 8, high[2], border_color = #00000000, bgcolor = color.new(#089981, 84)), 1))
    if high < low[2] and close[1] < low[2] and low[2] - high > a * 0.25
        fvg.push(Z.new(box.new(bar_index - 1, low[2], bar_index + 8, high, border_color = #00000000, bgcolor = color.new(#f23645, 84)), -1))
    if fvg.size() > maxB * 2
        z = fvg.shift()
        z.b.delete()
upd(arr) =>
    if arr.size() > 0
        for i = arr.size() - 1 to 0
            z = arr.get(i)
            bool hit = z.d == 1 ? close < z.b.get_bottom() : close > z.b.get_top()
            if hit
                z.b.delete()
                arr.remove(i)
            else
                z.b.set_right(bar_index + 8)
upd(obs)
upd(fvg)
alertcondition(choch, "CHoCH", "{{ticker}} CHoCH di {{close}}")
alertcondition(bos, "BOS", "{{ticker}} BOS di {{close}}")`, 'SMC');
add('liq', 'Sapuan likuiditas (liquidity sweep)', S, 'om', `len = input.int(10, "Panjang swing")
var array<line> hs = array.new<line>()
var array<line> lw = array.new<line>()
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
if not na(ph)
    hs.push(line.new(bar_index - len, ph, bar_index + 1, ph, color = color.new(#f23645, 40), style = line.style_dotted))
if not na(pl)
    lw.push(line.new(bar_index - len, pl, bar_index + 1, pl, color = color.new(#089981, 40), style = line.style_dotted))
bool sH = false
bool sL = false
if hs.size() > 0
    for i = hs.size() - 1 to 0
        l = hs.get(i)
        l.set_x2(bar_index)
        if high > l.get_y1()
            if close < l.get_y1()
                sH := true
            hs.remove(i)
if lw.size() > 0
    for i = lw.size() - 1 to 0
        l = lw.get(i)
        l.set_x2(bar_index)
        if low < l.get_y1()
            if close > l.get_y1()
                sL := true
            lw.remove(i)
if hs.size() > 12
    hs.shift().delete()
if lw.size() > 12
    lw.shift().delete()
plotshape(sH, "Sapu atas", shape.triangledown, location.abovebar, #f23645, text = "x", textcolor = #f23645, size = size.tiny)
plotshape(sL, "Sapu bawah", shape.triangleup, location.belowbar, #089981, text = "x", textcolor = #089981, size = size.tiny)
alertcondition(sH, "Sapu likuiditas atas", "{{ticker}} sapu likuiditas atas")
alertcondition(sL, "Sapu likuiditas bawah", "{{ticker}} sapu likuiditas bawah")`, 'Sweep');
add('gaps', 'Gap', S, 'om', `min = input.float(0.1, "Gap minimal %")
up = low > high[1] and (low - high[1]) / close * 100 > min
dn = high < low[1] and (low[1] - high) / close * 100 > min
if up
    box.new(bar_index - 1, low, bar_index + 30, high[1], border_color = #00000000, bgcolor = color.new(#089981, 80))
if dn
    box.new(bar_index - 1, low[1], bar_index + 30, high, border_color = #00000000, bgcolor = color.new(#f23645, 80))`);
add('supdem', 'Zona supply & demand', S, 'om', `len = input.int(10, "Panjang swing")
keep = input.int(6, "Jumlah zona")
var array<box> sup = array.new<box>()
var array<box> dem = array.new<box>()
a = ta.atr(50)
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
if not na(ph)
    sup.push(box.new(bar_index - len, ph, bar_index + 10, ph - a * 0.6, border_color = color.new(#f23645, 60), bgcolor = color.new(#f23645, 86), extend = extend.right))
    if sup.size() > keep
        sup.shift().delete()
if not na(pl)
    dem.push(box.new(bar_index - len, pl + a * 0.6, bar_index + 10, pl, border_color = color.new(#089981, 60), bgcolor = color.new(#089981, 86), extend = extend.right))
    if dem.size() > keep
        dem.shift().delete()
if sup.size() > 0
    for i = sup.size() - 1 to 0
        if close > sup.get(i).get_top()
            sup.remove(i).delete()
if dem.size() > 0
    for i = dem.size() - 1 to 0
        if close < dem.get(i).get_bottom()
            dem.remove(i).delete()`, 'S/D');
add('mtfdash', 'Dasbor tren multi-timeframe', S, 'o', `t1 = input.timeframe("5", "TF 1")
t2 = input.timeframe("15", "TF 2")
t3 = input.timeframe("60", "TF 3")
t4 = input.timeframe("240", "TF 4")
t5 = input.timeframe("D", "TF 5")
pos = input.string("Kanan atas", "Posisi", options = ["Kanan atas", "Kanan bawah", "Kiri bawah"])
f() =>
    e = ta.ema(close, 50)
    [m, s, h] = ta.macd(close, 12, 26, 9)
    [st, d] = ta.supertrend(3, 10)
    [close > e ? 1 : -1, ta.rsi(close, 14), h > 0 ? 1 : -1, d < 0 ? 1 : -1]
[a1, b1, c1, d1] = request.security(syminfo.tickerid, t1, f())
[a2, b2, c2, d2] = request.security(syminfo.tickerid, t2, f())
[a3, b3, c3, d3] = request.security(syminfo.tickerid, t3, f())
[a4, b4, c4, d4] = request.security(syminfo.tickerid, t4, f())
[a5, b5, c5, d5] = request.security(syminfo.tickerid, t5, f())
var table tb = table.new(pos == "Kanan bawah" ? position.bottom_right : pos == "Kiri bawah" ? position.bottom_left : position.top_right, 6, 6, bgcolor = #1b222d, border_width = 1, border_color = #2c3646)
cell(c, r, t, col) => table.cell(tb, c, r, t, text_color = color.white, bgcolor = col, text_size = size.small)
G = color.new(#089981, 20)
D = color.new(#f23645, 20)
N = #2c3646
row(r, tf, a, b, c, d) =>
    cell(0, r, tf, N)
    cell(1, r, a > 0 ? "Naik" : "Turun", a > 0 ? G : D)
    cell(2, r, str.tostring(b, "0"), b > 55 ? G : b < 45 ? D : N)
    cell(3, r, c > 0 ? "+" : "−", c > 0 ? G : D)
    cell(4, r, d > 0 ? "Naik" : "Turun", d > 0 ? G : D)
    s = a + c + d + (b > 50 ? 1 : -1)
    cell(5, r, s >= 3 ? "BELI" : s <= -3 ? "JUAL" : "Netral", s >= 3 ? G : s <= -3 ? D : N)
if barstate.islast
    cell(0, 0, "TF", N)
    cell(1, 0, "EMA50", N)
    cell(2, 0, "RSI", N)
    cell(3, 0, "MACD", N)
    cell(4, 0, "ST", N)
    cell(5, 0, "Arah", N)
    row(1, t1, a1, b1, c1, d1)
    row(2, t2, a2, b2, c2, d2)
    row(3, t3, a3, b3, c3, d3)
    row(4, t4, a4, b4, c4, d4)
    row(5, t5, a5, b5, c5, d5)`, 'MTF');
/* ---- patterns ---- */
add('cpat', 'Pola candlestick (16 pola)', C, 'om', `trend = input.bool(true, "Saring dengan SMA 50")
b = math.abs(close - open)
r = high - low
uw = high - math.max(close, open)
lw = math.min(close, open) - low
av = ta.ema(b, 14)
w = close > open
up = not trend or close > ta.sma(close, 50)
dn = not trend or close < ta.sma(close, 50)
small = b < av
big = b > av
doji = r > 0 and b <= r * 0.05
hammer = small and b > 0 and lw >= 2 * b and uw <= b * 0.6 and dn
inv = small and b > 0 and uw >= 2 * b and lw <= b * 0.6 and dn
shoot = small and b > 0 and uw >= 2 * b and lw <= b * 0.6 and up
hang = small and b > 0 and lw >= 2 * b and uw <= b * 0.6 and up
bullE = dn and w and not w[1] and big and small[1] and close >= open[1] and open <= close[1]
bearE = up and not w and w[1] and big and small[1] and close <= open[1] and open >= close[1]
bullH = dn and w and not w[1] and big[1] and small and high <= open[1] and low >= close[1]
bearH = up and not w and w[1] and big[1] and small and high <= close[1] and low >= open[1]
morn = dn and not w[2] and big[2] and small[1] and w and big and close >= (open[2] + close[2]) / 2 and math.max(open[1], close[1]) < close[2] + av * 0.3
even = up and w[2] and big[2] and small[1] and not w and big and close <= (open[2] + close[2]) / 2 and math.min(open[1], close[1]) > close[2] - av * 0.3
pierce = dn and not w[1] and big[1] and w and open <= low[1] and close > (open[1] + close[1]) / 2 and close < open[1]
dark = up and w[1] and big[1] and not w and open >= high[1] and close < (open[1] + close[1]) / 2 and close > open[1]
sold = w and w[1] and w[2] and big and big[1] and big[2] and close > close[1] and close[1] > close[2] and uw < b * 0.3 and uw[1] < b[1] * 0.3
crow = not w and not w[1] and not w[2] and big and big[1] and big[2] and close < close[1] and close[1] < close[2] and lw < b * 0.3 and lw[1] < b[1] * 0.3
bot = bullE ? "Bullish Engulfing" : morn ? "Morning Star" : pierce ? "Piercing" : sold ? "3 White Soldiers" : bullH ? "Bullish Harami" : hammer ? "Hammer" : inv ? "Inverted Hammer" : ""
top = bearE ? "Bearish Engulfing" : even ? "Evening Star" : dark ? "Dark Cloud" : crow ? "3 Black Crows" : bearH ? "Bearish Harami" : shoot ? "Shooting Star" : hang ? "Hanging Man" : ""
if bot != ""
    label.new(bar_index, low, bot, yloc = yloc.belowbar, style = label.style_label_up, color = color.new(#2962ff, 15), textcolor = color.white, size = size.tiny)
if top != ""
    label.new(bar_index, high, top, yloc = yloc.abovebar, style = label.style_label_down, color = color.new(#f23645, 15), textcolor = color.white, size = size.tiny)
plotchar(doji and bot == "" and top == "", "Doji", "+", location.abovebar, color.gray, size = size.tiny)
alertcondition(bot != "", "Pola bullish", "{{ticker}} pola candle bullish")
alertcondition(top != "", "Pola bearish", "{{ticker}} pola candle bearish")`, 'Candle');
add('dtb', 'Double top / double bottom', C, 'om', `len = input.int(10, "Panjang pivot")
tol = input.float(0.5, "Toleransi (x ATR)")
a = ta.atr(50)
var float h1 = na
var int x1 = na
var float l1 = na
var int y1 = na
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
bool dt = false
bool db = false
if not na(ph)
    if not na(h1) and math.abs(ph - h1) < a * tol and bar_index - len - x1 > len
        line.new(x1, h1, bar_index - len, ph, color = #f23645, width = 2)
        label.new(bar_index - len, ph, "Double Top", style = label.style_label_down, color = #f23645, textcolor = color.white, size = size.small)
        dt := true
    h1 := ph
    x1 := bar_index - len
if not na(pl)
    if not na(l1) and math.abs(pl - l1) < a * tol and bar_index - len - y1 > len
        line.new(y1, l1, bar_index - len, pl, color = #089981, width = 2)
        label.new(bar_index - len, pl, "Double Bottom", style = label.style_label_up, color = #089981, textcolor = color.white, size = size.small)
        db := true
    l1 := pl
    y1 := bar_index - len
alertcondition(dt, "Double top", "{{ticker}} double top")
alertcondition(db, "Double bottom", "{{ticker}} double bottom")`, 'DT/DB');
add('harm', 'Pola harmonik otomatis', C, 'om', `len = input.int(8, "Panjang pivot")
e = input.float(0.08, "Toleransi rasio")
var array<float> pv = array.new<float>()
var array<int> px = array.new<int>()
var int d = 0
ph = ta.pivothigh(high, len, len)
pl = ta.pivotlow(low, len, len)
put(v, k) =>
    if pv.size() > 0 and k == (pv.size() > 1 ? (pv.last() > pv.get(pv.size() - 2) ? 1 : -1) : 0) and (k == 1 ? v > pv.last() : v < pv.last())
        pv.set(pv.size() - 1, v)
        px.set(px.size() - 1, bar_index - len)
    else if pv.size() < 2 or k != (pv.last() > pv.get(pv.size() - 2) ? 1 : -1)
        pv.push(v)
        px.push(bar_index - len)
    if pv.size() > 12
        pv.shift()
        px.shift()
bool nw = false
if not na(ph)
    put(ph, 1)
    nw := true
if not na(pl)
    put(pl, -1)
    nw := true
in_(v, a, b) => v >= a - e and v <= b + e
if nw and pv.size() >= 5
    n = pv.size()
    x = pv.get(n - 5)
    a = pv.get(n - 4)
    b = pv.get(n - 3)
    c = pv.get(n - 2)
    dd = pv.get(n - 1)
    ab = math.abs(b - a) / math.abs(a - x)
    bc = math.abs(c - b) / math.abs(b - a)
    cd = math.abs(dd - c) / math.abs(c - b)
    ad = math.abs(dd - a) / math.abs(a - x)
    nm = in_(ab, 0.618, 0.618) and in_(bc, 0.382, 0.886) and in_(ad, 0.786, 0.786) ? "Gartley" : in_(ab, 0.382, 0.5) and in_(bc, 0.382, 0.886) and in_(ad, 0.886, 0.886) ? "Bat" : in_(ab, 0.786, 0.786) and in_(bc, 0.382, 0.886) and in_(ad, 1.27, 1.618) ? "Butterfly" : in_(ab, 0.382, 0.618) and in_(bc, 0.382, 0.886) and in_(ad, 1.618, 1.618) ? "Crab" : ""
    if nm != ""
        col = dd < c ? #089981 : #f23645
        for i = n - 5 to n - 2
            line.new(px.get(i), pv.get(i), px.get(i + 1), pv.get(i + 1), color = col, width = 2)
        line.new(px.get(n - 5), x, px.get(n - 3), b, color = col, style = line.style_dotted)
        line.new(px.get(n - 3), b, px.get(n - 1), dd, color = col, style = line.style_dotted)
        label.new(px.get(n - 1), dd, nm, style = dd < c ? label.style_label_up : label.style_label_down, color = col, textcolor = color.white, size = size.small)`, 'Harmonik');
add('insd', 'Inside bar & outside bar', C, 'o', `ins = high < high[1] and low > low[1]
out = high > high[1] and low < low[1]
barcolor(ins ? #fdd835 : out ? #9c27b0 : na)
alertcondition(ins, "Inside bar", "{{ticker}} inside bar")`);
add('volcol', 'Warna candle menurut volume', C, 'o', `m = ta.sma(volume, 21)
barcolor(volume > m * 1.5 ? (close < open ? #800000 : #006400) : volume < m * 0.5 ? (close < open ? #ff9800 : #7fffd4) : na)`);
add('impulse', 'Elder Impulse', C, 'o', `e = ta.ema(close, 13)
[m, s, h] = ta.macd(close, 12, 26, 9)
barcolor(e > e[1] and h > h[1] ? #089981 : e < e[1] and h < h[1] ? #f23645 : #2962ff)`);
/* ---- crypto ---- */
const perp = 'b = str.replace_all(syminfo.ticker, ".P", "")\n';
add('oi', 'Open Interest (Binance Futures)', K, 'v', perp + `[o, h, l, c] = request.security("OI:" + b, timeframe.period, [open, high, low, close])
plot(c, "Open Interest", color = #ff9800, linewidth = 2)
plot(ta.sma(c, 20), "MA", color = color.gray)`, 'OI');
add('oid', 'Perubahan Open Interest', K, 'v', perp + `c = request.security("OI:" + b, timeframe.period, close)
d = ta.change(c)
plot(d, "ΔOI", style = plot.style_columns, color = d > 0 ? (close > close[1] ? #089981 : #f23645) : color.new(#787b86, 40))`, 'ΔOI');
add('fund', 'Funding Rate (Binance Futures)', K, '', perp + `f = request.security("OI:FR_" + b, timeframe.isintraday ? "480" : "D", close)
plot(f, "Funding %", style = plot.style_columns, color = f >= 0 ? #089981 : #f23645)
hline(0.01)
hline(0)`, 'Funding');
add('lsr', 'Rasio Long/Short akun', K, '', perp + `a = request.security("OI:LS_" + b, timeframe.period, close)
t = request.security("OI:TOP_" + b, timeframe.period, close)
plot(a, "Semua akun", color = #2962ff)
plot(t, "Top trader (posisi)", color = #ff9800)
hline(1)`, 'L/S');
add('tls', 'Rasio taker beli/jual', K, '', perp + `a = request.security("OI:TLS_" + b, timeframe.period, close)
plot(a, "Taker B/S", style = plot.style_columns, histbase = 1, color = a > 1 ? #089981 : #f23645)
hline(1)`, 'Taker');
add('prem', 'Premium Index', K, '', perp + `a = request.security("OI:PREM_" + b, timeframe.period, close)
plot(a, "Premium %", style = plot.style_columns, color = a > 0 ? #089981 : #f23645)
hline(0)`, 'Premium');
add('fng', 'Fear & Greed Index', K, '', `a = request.security("OI:FNG", "D", close)
plot(a, "F&G", color = a > 75 ? #089981 : a < 25 ? #f23645 : #ff9800, linewidth = 2)
h1 = hline(75)
h2 = hline(25)
fill(h1, h2, color = color.new(#787b86, 94))`, 'F&G');
add('picy', 'Pi Cycle Top (harian)', K, 'o', `a = request.security(syminfo.tickerid, "D", ta.sma(close, 111))
b = request.security(syminfo.tickerid, "D", ta.sma(close, 350) * 2)
plot(a, "SMA 111", color = #ff9800)
plot(b, "SMA 350 x2", color = #089981)
plotshape(ta.crossover(a, b), "Puncak", shape.labeldown, location.abovebar, #f23645, text = "Pi Top", textcolor = color.white)`);
/* ---- strategies ---- */
add('s_ma', 'Strategi MA Cross', X, 's', `a = input.int(9, "Cepat")
b = input.int(21, "Lambat")
sh = input.bool(true, "Boleh short")
x = ta.ema(close, a)
y = ta.ema(close, b)
plot(x, "Cepat", color = #ff9800)
plot(y, "Lambat", color = #2962ff)
if ta.crossover(x, y)
    strategy.entry("Long", strategy.long)
if ta.crossunder(x, y)
    if sh
        strategy.entry("Short", strategy.short)
    else
        strategy.close("Long")`, 'S: MA');
add('s_rsi', 'Strategi RSI', X, 's', `len = input.int(14, "Panjang")
lo = input.int(30, "Jenuh jual")
hi = input.int(70, "Jenuh beli")
r = ta.rsi(close, len)
if ta.crossover(r, lo)
    strategy.entry("Long", strategy.long)
if ta.crossunder(r, hi)
    strategy.entry("Short", strategy.short)`, 'S: RSI');
add('s_macd', 'Strategi MACD', X, 's', `f = input.int(12, "Cepat")
s = input.int(26, "Lambat")
g = input.int(9, "Sinyal")
[m, sg, h] = ta.macd(close, f, s, g)
if ta.crossover(h, 0)
    strategy.entry("Long", strategy.long)
if ta.crossunder(h, 0)
    strategy.entry("Short", strategy.short)`, 'S: MACD');
add('s_bb', 'Strategi Bollinger', X, 's', `len = input.int(20, "Panjang")
k = input.float(2, "StdDev")
[b, u, l] = ta.bb(close, len, k)
plot(u, "Atas", color = #2962ff)
plot(l, "Bawah", color = #2962ff)
if ta.crossover(close, l)
    strategy.entry("Long", strategy.long)
if ta.crossunder(close, u)
    strategy.entry("Short", strategy.short)`, 'S: BB');
add('s_st', 'Strategi Supertrend', X, 's', `len = input.int(10, "ATR")
f = input.float(3, "Faktor")
[s, d] = ta.supertrend(f, len)
plot(s, "ST", color = d < 0 ? #089981 : #f23645)
if ta.change(d) < 0
    strategy.entry("Long", strategy.long)
if ta.change(d) > 0
    strategy.entry("Short", strategy.short)`, 'S: ST');
add('s_don', 'Strategi Breakout Donchian', X, 's', `n = input.int(20, "Masuk")
x = input.int(10, "Keluar")
h = ta.highest(high, n)[1]
l = ta.lowest(low, n)[1]
plot(h, "Atas", color = #089981)
plot(l, "Bawah", color = #f23645)
if close > h
    strategy.entry("Long", strategy.long)
if close < l
    strategy.entry("Short", strategy.short)
strategy.exit("XL", "Long", stop = ta.lowest(low, x)[1])
strategy.exit("XS", "Short", stop = ta.highest(high, x)[1])`, 'S: Donchian');
add('s_atr', 'Strategi tren + SL/TP ATR', X, 's', `len = input.int(50, "EMA tren")
sl = input.float(2, "SL (x ATR)")
tp = input.float(4, "TP (x ATR)")
e = ta.ema(close, len)
r = ta.rsi(close, 14)
a = ta.atr(14)
plot(e, "EMA", color = #ff9800)
if strategy.position_size == 0 and close > e and ta.crossover(r, 50)
    strategy.entry("Long", strategy.long)
    strategy.exit("XL", "Long", stop = close - sl * a, limit = close + tp * a)
if strategy.position_size == 0 and close < e and ta.crossunder(r, 50)
    strategy.entry("Short", strategy.short)
    strategy.exit("XS", "Short", stop = close + sl * a, limit = close - tp * a)`, 'S: ATR');

I.list = LIST; I.map = {}; for (const x of LIST) I.map[x.id] = x;
I.cats = [P, T, O, V, W, S, C, K, X];
I.addOwn = (id, name, code) => { const x = { id, name, cat: P, code, own: true }; LIST.unshift(x); I.map[id] = x; };
/* user scripts: tradingview.scripts = [{id,name,code,mt}] */
I.scripts = () => U.load('tradingview.scripts', []);
I.saveScript = (s) => { const l = I.scripts(); const k = l.findIndex(x => x.id === s.id); s.mt = Date.now(); if (k >= 0) l[k] = s; else l.unshift(s); U.save('tradingview.scripts', l); U.emit('scripts'); };
I.delScript = id => { U.save('tradingview.scripts', I.scripts().filter(x => x.id !== id)); U.emit('scripts'); };
I.code = cfg => { if (cfg.src && cfg.src.startsWith('b:')) { const b = I.map[cfg.src.slice(2)]; return b ? b.code : cfg.code || null; } if (cfg.src && cfg.src.startsWith('u:')) { const s = I.scripts().find(x => x.id === cfg.src.slice(2)); return s ? s.code : cfg.code || null; } return cfg.code || null; };
const cc = new Map();
I.compile = code => { let p = cc.get(code); if (p) return p; p = PN.compile(code); if (cc.size > 200) cc.delete(cc.keys().next().value); cc.set(code, p); return p; };
})();
