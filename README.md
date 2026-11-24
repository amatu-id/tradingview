# Amatu Chart

Web charting & analysis platform (Portal AMATU app) at https://amatu-id.github.io/tradingview/

- Own canvas chart engine, own Pine Script v4–v6 compiler/runtime, 130+ built-in indicators (all in Pine), 80+ drawing tools,
  unlimited indicators per chart, up to 16 charts per layout, replay, strategy tester + optimizer, screener, alerts, paper trading.
- Market data straight from the exchanges: Binance spot/futures, Bybit, OKX, Coinbase, Hyperliquid, gTrade (forex, metals, oil, stocks).
- Autosave: every edit goes to `localStorage` (`tradingview.*`, synced per account by the portal's `/amatu.js`), version history in
  IndexedDB `amatu-tradingview`; `pt.tradingview.*` keys stay on the device.
- TradingView connection (js/tv.js): opens the same chart on tradingview.com, official embed widgets, Pine import/export,
  drawings → Pine, watchlist import/export, alert webhooks in (Edge Function `amatu-tv`, `cloud/`).
- Not affiliated with TradingView Inc.

No bundler: classic scripts in `js/`, `index.src.html` → `./build.sh` (stamps `?v=<hash>`, `versi.txt`, `js/own.js` from `pine/`).
