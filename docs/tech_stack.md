# Chen's Stocks — Tech Stack Decision

**Date:** March 11, 2026  
**Decision by:** Tech Lead  
**Status:** Approved  

---

## Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Backend** | Python 3.11+ / FastAPI | Fast async API framework; great for financial data; yfinance is a Python library |
| **Frontend** | React 18 + Vite | Lightweight SPA; Vite for fast dev builds; React for rich interactive dashboard |
| **Database** | PostgreSQL via SQLAlchemy | Render.com managed PostgreSQL; persistent across deploys; SQLAlchemy ORM + Alembic migrations |
| **Migrations** | Alembic | Standard SQLAlchemy migration tool |
| **Hosting** | Render.com | Backend: Web Service (Docker); Frontend: Static Site; Database: Managed PostgreSQL |
| **Market Data** | yfinance (primary) | Free, no API key, supports stocks/ETFs/crypto (MRD §7) |
| **Market Data Fallback** | Alpha Vantage | Requires free API key; used only if yfinance is unavailable |
| **Charts (Frontend)** | Recharts | React-native charting library; good for financial time-series |
| **HTTP Client (Frontend)** | Axios | Consistent API layer with interceptors for error handling |
| **State Management** | React Context + hooks | Simple enough for this app; no Redux needed |
| **Styling** | Tailwind CSS | Utility-first; matches the dark-theme mockup quickly |
| **Testing (Backend)** | pytest + httpx | FastAPI test client via httpx |
| **Testing (Frontend)** | Vitest + React Testing Library | Fast, Vite-native test runner |

## Deployment Architecture (Render.com)

```
Render.com
├── Web Service: chen-stocks-api (Docker)
│   ├── FastAPI backend
│   ├── Auto-deploy from Git push
│   └── Env vars: DATABASE_URL, FRONTEND_URL, ALPHA_VANTAGE_API_KEY
├── Static Site: chen-stocks-ui
│   ├── React (Vite) build output → dist/
│   ├── Auto-deploy from Git push
│   └── Rewrites: /* → /index.html (SPA routing)
└── PostgreSQL: chen-stocks-db
    ├── Managed by Render
    ├── DATABASE_URL auto-injected to Web Service
    └── Daily backups included
```

## API Communication

- Backend serves REST API on `http://localhost:8000`
- Frontend dev server on `http://localhost:5173` with proxy to backend
- JSON request/response throughout

## Directory Structure

```
Chen/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── api/                 # Route handlers (routers)
│   │   └── services/            # Business logic
│   ├── alembic/                 # DB migrations
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level components
│   │   ├── hooks/               # Custom React hooks
│   │   └── services/            # API client layer
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── docs/
├── investment.md
├── execution_plan.md
└── mockup.html
```
