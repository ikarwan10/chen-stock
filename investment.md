# Chen's Stocks — Market Requirements Document (MRD)

**Document Version:** 1.1  
**Date:** March 11, 2026  
**Author:** ikarwan  
**Status:** Draft  
**Revision Notes:** Added per-ticker investment history, portfolio performance history, and financial status check view (v1.1).

---

## 1. Executive Summary

**Chen's Stocks** is a personal finance application that enables investors to manage, monitor, and analyze their stock and securities portfolio in real time. The application provides live ticker quotes, full portfolio visibility, and comprehensive Profit & Loss (PNL) tracking over time.

---

## 2. Problem Statement

Individual investors lack a simple, unified tool to:

- Track all their investments across multiple tickers in one place.
- Get real-time or near-real-time price quotes without switching between platforms.
- Understand their overall portfolio performance, including gains, losses, and PNL trends over time.
- Review the full investment history of any individual ticker — every buy/sell transaction and how the holding evolved.
- Inspect the portfolio's financial health (overall or per ticker) at a glance to determine whether performance is improving or deteriorating over any selected period.

---

## 3. Target Users

| Persona | Description |
|---------|-------------|
| **Self-directed Investor** | Manages their own stock/ETF/crypto portfolio and needs a consolidated view. |
| **Casual Trader** | Makes periodic trades and wants to track performance without complex tools. |

---

## 4. Product Goals

1. **Simplicity** — Easy to add, edit, and remove tickers from the portfolio.
2. **Real-time Data** — Fetch live or near-real-time quotes from online sources.
3. **Full Visibility** — Dashboard showing all holdings, cost basis, current value, and allocation.
4. **PNL Tracking** — Historical profit and loss view per ticker and for the overall portfolio.
5. **Investment History** — Full audit trail of all transactions and value changes per ticker and across the portfolio.
6. **Financial Status Check** — On-demand view of portfolio or individual ticker health, showing trend direction (improving / declining / stable) over a chosen period.
7. **Portability** — Accessible from desktop; potential future expansion to web/mobile.

---

## 5. Functional Requirements

### 5.1 Ticker Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-101 | User can add any valid stock/ETF/crypto ticker symbol to the portfolio. | **P0** |
| FR-102 | User can remove a ticker from the portfolio. | **P0** |
| FR-103 | User can edit ticker details (quantity, purchase price, purchase date). | **P0** |
| FR-104 | System validates ticker symbols against a known list or live API lookup. | **P1** |
| FR-105 | User can add multiple lots (buy transactions) for the same ticker. | **P1** |

### 5.2 Live Quotes

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-201 | System fetches real-time or delayed (≤15 min) price quotes for all tickers. | **P0** |
| FR-202 | Quotes include: last price, daily change ($), daily change (%), day high, day low, volume. | **P0** |
| FR-203 | User can manually refresh quotes on demand. | **P0** |
| FR-204 | System auto-refreshes quotes at a configurable interval (default: 60 seconds). | **P1** |
| FR-205 | System gracefully handles API rate limits and displays last-known price with a stale indicator. | **P1** |

### 5.3 Portfolio Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-301 | Dashboard displays all holdings in a sortable table: ticker, quantity, avg cost, current price, market value, daily change, total gain/loss, % gain/loss. | **P0** |
| FR-302 | Dashboard shows portfolio-level summary: total invested, total market value, total PNL ($), total PNL (%). | **P0** |
| FR-303 | Portfolio allocation pie/donut chart by ticker or sector. | **P1** |
| FR-304 | User can filter/search tickers within the portfolio. | **P2** |

### 5.4 Profit & Loss (PNL) Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-401 | System calculates unrealized PNL per ticker: (current price − avg cost) × quantity. | **P0** |
| FR-402 | System calculates realized PNL when a sell transaction is recorded (FIFO method). | **P1** |
| FR-403 | Historical PNL chart showing portfolio value over time (daily/weekly/monthly). | **P0** |
| FR-404 | Per-ticker PNL breakdown with historical chart. | **P1** |
| FR-405 | Support for time-range selection on PNL charts: 1D, 1W, 1M, 3M, 6M, YTD, 1Y, All. | **P1** |

### 5.5 Transaction History

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-501 | User can record buy and sell transactions (ticker, date, quantity, price, fees). | **P0** |
| FR-502 | Transaction log viewable and sortable by date, ticker, or type. | **P1** |
| FR-503 | User can import transactions via CSV file. | **P2** |
| FR-504 | User can export transaction history to CSV. | **P2** |

### 5.6 Per-Ticker Investment History

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-601 | User can open a dedicated history view for any individual ticker. | **P0** |
| FR-602 | Per-ticker history displays a chronological list of all transactions: date, type (buy/sell), quantity, price paid, fees, and running total quantity. | **P0** |
| FR-603 | Per-ticker history shows a value-over-time chart: market value of that holding from first purchase to today, plotted against cost basis. | **P0** |
| FR-604 | Per-ticker history includes a PNL timeline: unrealized and realized gain/loss at each recorded date, with net gain/loss highlighted. | **P0** |
| FR-605 | Per-ticker history displays cost basis evolution across multiple lots (average cost updates with each buy). | **P1** |
| FR-606 | Per-ticker history supports time-range selection: 1M, 3M, 6M, YTD, 1Y, All. | **P1** |
| FR-607 | User can print or export a single ticker's history as PDF or CSV. | **P2** |

### 5.7 Portfolio Performance History

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-701 | System records a daily portfolio snapshot (total invested, total market value, PNL) automatically. | **P0** |
| FR-702 | Portfolio history view displays a line chart of total portfolio value over time, overlaid with total cost basis. | **P0** |
| FR-703 | Portfolio history shows the delta ($ and %) performance between any two user-selected dates. | **P0** |
| FR-704 | System labels periods of improvement (value increasing) and deterioration (value decreasing) visually on the chart (e.g., green/red shading). | **P1** |
| FR-705 | Portfolio history provides a summary table: value at start of period, value at end of period, net change ($), net change (%), best day, worst day. | **P1** |
| FR-706 | User can compare portfolio performance against a benchmark index (e.g., S\&P 500, NASDAQ) over the same period. | **P2** |
| FR-707 | Portfolio history supports time-range selection: 1W, 1M, 3M, 6M, YTD, 1Y, All. | **P1** |

### 5.8 Financial Status Check

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-801 | User can invoke a "Financial Status" check at any time for the **full portfolio** or for any **individual ticker**. | **P0** |
| FR-802 | Financial status check computes and displays for the selected scope: current market value, total amount invested, unrealized PNL ($), unrealized PNL (%), realized PNL ($), overall net PNL ($). | **P0** |
| FR-803 | Status check shows a trend indicator for the selected period: **Improving** (net PNL rising), **Declining** (net PNL falling), or **Stable** (change within ±1%). | **P0** |
| FR-804 | Status check includes a performance scorecard: daily change, weekly change, monthly change, YTD change — each with $ and % values and a color indicator (green / red / grey). | **P0** |
| FR-805 | For the full portfolio status, a breakdown table lists each ticker's contribution to overall PNL, sorted by largest gain to largest loss. | **P1** |
| FR-806 | For a per-ticker status, the check includes position details: number of shares, avg cost, current price, day range, 52-week high/low, and the ticker's % of total portfolio. | **P1** |
| FR-807 | User can set a personal return target (e.g., +10% for the year); status check shows actual vs. target progress with a progress bar. | **P2** |
| FR-808 | Status check is accessible from the main dashboard (one-click) and from the per-ticker detail view. | **P0** |

---

## 6. Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | **Performance** — Dashboard loads in under 2 seconds with up to 100 tickers. | **P0** |
| NFR-02 | **Reliability** — Application handles API failures gracefully with cached data fallback. | **P1** |
| NFR-03 | **Data Persistence** — Portfolio data stored locally (SQLite or JSON) with no cloud dependency for MVP. | **P0** |
| NFR-04 | **Security** — API keys stored securely (environment variables or encrypted config), not hardcoded. | **P0** |
| NFR-05 | **Usability** — Clean, intuitive UI; minimal clicks to perform core actions. | **P1** |
| NFR-06 | **Extensibility** — Architecture supports adding new data providers or asset classes in the future. | **P2** |

---

## 7. Data Sources & API Strategy

| Provider | Type | Notes |
|----------|------|-------|
| **Yahoo Finance API (yfinance)** | Free / Unofficial | Good for MVP; supports stocks, ETFs, crypto. No API key needed. |
| **Alpha Vantage** | Free tier available | 5 calls/min on free plan; good fallback. |
| **Finnhub** | Free tier available | Real-time US stock quotes; 60 calls/min. |
| **Twelve Data** | Free tier available | Supports historical data; 8 calls/min. |

**MVP Recommendation:** Start with `yfinance` (Python) for simplicity and zero-cost; add Alpha Vantage as a fallback.

---

## 8. Technical Architecture (Proposed)

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend / UI                        │
│            (Web: React/Next.js  OR  Desktop: TBD)        │
├──────────────────────────────────────────────────────────┤
│                     Backend / API                         │
│                (Python FastAPI / Flask)                   │
├──────────┬──────────┬──────────┬───────────┬────────────┤
│ Portfolio│  Quotes  │   PNL    │  History  │  Financial │
│ Service  │  Service │  Engine  │  Service  │   Status   │
│          │          │          │           │   Service  │
├──────────┴──────────┴──────────┴───────────┴────────────┤
│                   Data Layer (SQLite)                     │
│   (transactions, ticker_snapshots, portfolio_snapshots)  │
├──────────────────────────────────────────────────────────┤
│              External APIs (yfinance, etc.)               │
└──────────────────────────────────────────────────────────┘
```

**Key services added:**
- **History Service** — Reads ticker and portfolio snapshot tables; computes value-over-time series for charts.
- **Financial Status Service** — Aggregates current + historical data to produce trend direction (Improving / Declining / Stable) and the performance scorecard for any scope (full portfolio or single ticker).

---

## 9. Data Model (Conceptual)

### Tickers / Holdings
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique identifier |
| ticker | VARCHAR | Ticker symbol (e.g., AAPL, MSFT) |
| name | VARCHAR | Company/asset name |
| asset_type | VARCHAR | stock, etf, crypto |
| created_at | DATETIME | When the ticker was added |

### Transactions
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique identifier |
| ticker_id | INT (FK) | Reference to ticker |
| type | VARCHAR | buy / sell |
| date | DATE | Transaction date |
| quantity | DECIMAL | Number of shares/units |
| price | DECIMAL | Price per share at transaction |
| fees | DECIMAL | Broker/transaction fees |
| created_at | DATETIME | Record creation timestamp |

### Portfolio Snapshots (for historical PNL & performance history)
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique identifier |
| date | DATE | Snapshot date |
| total_value | DECIMAL | Total portfolio market value |
| total_cost | DECIMAL | Total invested cost |
| unrealized_pnl | DECIMAL | Unrealized profit or loss |
| realized_pnl | DECIMAL | Realized profit or loss (cumulative) |
| net_pnl | DECIMAL | Total net PNL (unrealized + realized) |
| daily_change | DECIMAL | Portfolio value change vs. prior snapshot |
| created_at | DATETIME | Record creation timestamp |

### Ticker Snapshots (for per-ticker history)
| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique identifier |
| ticker_id | INT (FK) | Reference to ticker |
| date | DATE | Snapshot date |
| quantity | DECIMAL | Total shares held at this date |
| avg_cost | DECIMAL | Average cost basis at this date |
| market_price | DECIMAL | Market price at this date |
| market_value | DECIMAL | Total market value (quantity × price) |
| unrealized_pnl | DECIMAL | Unrealized PNL at this date |
| realized_pnl | DECIMAL | Cumulative realized PNL at this date |
| created_at | DATETIME | Record creation timestamp |

---

## 10. User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-01 | As an investor, I want to add a ticker to my portfolio so I can track it. | Ticker is validated, added, and appears on the dashboard. |
| US-02 | As an investor, I want to see the current price of all my holdings so I know their market value. | Dashboard shows live/delayed prices for all tickers. |
| US-03 | As an investor, I want to record a buy transaction so my cost basis is tracked. | Transaction is saved; average cost and quantity are updated. |
| US-04 | As an investor, I want to see my total PNL so I know if I'm up or down overall. | Dashboard summary shows total PNL in dollars and percent. |
| US-05 | As an investor, I want to view my PNL over time so I can see performance trends. | Historical chart renders with selectable time ranges. |
| US-06 | As an investor, I want to record a sell transaction so my realized gains are tracked. | Sell transaction saves; realized PNL is calculated (FIFO). |
| US-07 | As an investor, I want to see allocation breakdown so I know how diversified I am. | Pie/donut chart shows portfolio allocation by ticker. |
| US-08 | As an investor, I want to view the full history of a specific ticker so I can see how my holding evolved. | Per-ticker history view shows all transactions, a value-over-time chart, and PNL timeline. |
| US-09 | As an investor, I want to see how my total portfolio has performed over time so I know if it is improving or deteriorating. | Portfolio history chart shows value vs. cost basis with improvement/decline shading and a summary table. |
| US-10 | As an investor, I want to check the financial status of my entire portfolio with one click so I have an instant health snapshot. | Portfolio status check shows current value, PNL, trend indicator, and per-ticker PNL breakdown. |
| US-11 | As an investor, I want to check the financial status of a single ticker so I can decide whether to hold, buy more, or sell. | Per-ticker status check shows position details, PNL, scorecard (daily/weekly/monthly/YTD), and trend direction. |

---

## 11. MVP Scope (Phase 1)

The Minimum Viable Product includes only **P0** features:

- [x] Add / remove / edit tickers with buy transactions
- [x] Fetch live quotes (yfinance)
- [x] Portfolio dashboard with holdings table and summary row
- [x] Unrealized PNL per ticker and total
- [x] Historical PNL chart (portfolio level)
- [x] **Per-ticker investment history** — full transaction list, value-over-time chart, PNL timeline
- [x] **Portfolio performance history** — daily snapshots, value vs. cost basis chart, delta between dates
- [x] **Financial status check** — one-click health snapshot for full portfolio or individual ticker, with trend indicator and performance scorecard
- [x] Local data persistence (PostgreSQL on Render.com — including ticker snapshots and portfolio snapshots)
- [x] Secure API key handling

### Out of Scope for MVP
- Realized PNL / sell transactions (Phase 2)
- CSV import/export (Phase 2)
- Allocation charts (Phase 2)
- Benchmark comparison (Phase 2)
- Personal return target / progress bar (Phase 2)
- Multi-currency support
- Tax-lot optimization
- Mobile app

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Portfolio load time | < 2 seconds for 100 tickers |
| Quote freshness | ≤ 15 minutes delayed (free tier) |
| Data accuracy | PNL calculations match manual verification to the cent |
| Uptime | Application available whenever user launches it (local) |

---

## 13. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Free API rate limits exceeded | Quotes become stale | Medium | Cache aggressively; support multiple providers as fallback. |
| Yahoo Finance unofficial API breaks | No quote data | Medium | Abstract data provider; swap to Alpha Vantage or Finnhub. |
| Data loss (local storage corruption) | Portfolio data lost | Low | Auto-backup SQLite file; future cloud sync option. |
| Incorrect PNL calculations | User trust eroded | Low | Unit tests for all PNL math; manual verification during QA. |

---

## 14. Future Roadmap

| Phase | Features |
|-------|----------|
| **Phase 2** | Sell transactions, realized PNL, CSV import/export, allocation charts, benchmark comparison, personal return targets |
| **Phase 3** | Dividend tracking, watchlists, price alerts, ticker history PDF export |
| **Phase 4** | Multi-currency support, web-hosted version, user authentication |
| **Phase 5** | Mobile app (React Native), tax reporting, AI-driven portfolio insights |

---

## 15. Open Questions

1. Preferred tech stack for the frontend — web app (React) or desktop (Electron / Tkinter / PyQt)?
2. Should the MVP support cryptocurrency tickers, or stocks/ETFs only?
3. Is multi-account support needed (e.g., brokerage A vs. brokerage B)?
4. Desired deployment model — local-only or self-hosted server?

---

*End of Document*
