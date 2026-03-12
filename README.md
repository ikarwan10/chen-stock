# Chen's Stocks — Investment Portfolio Tracker

A full-stack investment portfolio tracker that lets you manage tickers, view live quotes, track P&L, and check financial health — all in one place.

## Features

- **Dashboard** — Holdings table with sortable columns, portfolio summary bar, P&L chart
- **Live Quotes** — Real-time prices via yfinance with cache and stale fallback
- **Ticker Management** — Add/edit/remove tickers with symbol validation
- **Transactions** — Record buy/sell transactions with FIFO-based realized P&L
- **Per-Ticker History** — Transaction list, value-over-time chart, P&L timeline
- **Portfolio History** — Value vs. cost basis chart, date-range delta comparison
- **Financial Status** — One-click health check with trend indicator (Improving/Declining/Stable), performance scorecard (daily/weekly/monthly/YTD), and per-ticker breakdown
- **Snapshot Engine** — Automatic daily portfolio snapshots for historical tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL (production) / SQLite (local dev) |
| Market Data | yfinance (free, no API key needed) |
| Deployment | Render.com (render.yaml blueprint) |

## Quick Start (Local Development)

### Prerequisites

- Python 3.10+ 
- Node.js 18+
- Git

### Backend

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env — default SQLite is fine for local dev

# Start the server
uvicorn app.main:app --port 8000 --reload
```

The API will be available at `http://localhost:8000`. Health check: `GET /api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`. API calls are proxied to the backend via Vite.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard/` | Dashboard with holdings + summary |
| GET/POST/PATCH/DELETE | `/api/tickers/` | Ticker CRUD |
| GET | `/api/quotes/` | Live quotes for all tickers |
| POST | `/api/quotes/refresh` | Force-refresh quotes |
| GET/POST | `/api/transactions/` | Transaction list + create |
| GET | `/api/history/ticker/{id}` | Per-ticker history + chart data |
| GET | `/api/history/portfolio` | Portfolio history + chart data |
| GET | `/api/history/portfolio/delta` | Compare two dates |
| POST | `/api/history/snapshot` | Manually trigger snapshot |
| GET | `/api/status/portfolio` | Portfolio financial status |
| GET | `/api/status/ticker/{id}` | Per-ticker financial status |

## Deployment (Render.com)

This project includes a `render.yaml` blueprint for one-click deployment:

1. Push to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Connect your repo and select `render.yaml`
4. Render will create:
   - `chen-stocks-db` — Managed PostgreSQL
   - `chen-stocks-api` — Web service (Docker)
   - `chen-stocks-ui` — Static site

The `DATABASE_URL` is automatically injected by Render.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (dashboard, tickers, quotes, transactions, history, status)
│   │   ├── models/       # SQLAlchemy ORM models (Ticker, Transaction, PortfolioSnapshot, TickerSnapshot)
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic (PNL engine, quotes, snapshots, history, status)
│   │   ├── config.py     # Settings from .env
│   │   ├── database.py   # SQLAlchemy engine + session
│   │   └── main.py       # FastAPI app entry point
│   ├── Dockerfile        # Production Docker image
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages (Dashboard, TickerDetail, PortfolioHistory, FinancialStatus, Transactions)
│   │   └── services/     # API client (axios)
│   └── package.json
├── render.yaml           # Render.com IaC blueprint
├── execution_plan.md     # Sprint plan & task breakdown
└── investment.md         # MRD (requirements)
```

## License

Private project — Chen's Stocks.
