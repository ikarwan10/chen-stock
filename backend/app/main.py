from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.api import tickers_router, quotes_router, transactions_router, dashboard_router, history_router, status_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Chen's Stocks API",
    version="0.1.0",
    description="Investment portfolio tracker backend",
)

# CORS — allow frontend (local dev + Render deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tickers_router)
app.include_router(quotes_router)
app.include_router(transactions_router)
app.include_router(dashboard_router)
app.include_router(history_router)
app.include_router(status_router)


@app.on_event("startup")
def startup_snapshot():
    """Take a portfolio snapshot on app start if one doesn't exist for today."""
    from app.database import SessionLocal
    from app.services.snapshot_service import SnapshotService

    db = SessionLocal()
    try:
        SnapshotService.take_snapshot(db)
    except Exception:
        pass
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Chen's Stocks"}
