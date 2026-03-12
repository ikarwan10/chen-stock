"""History API — per-ticker and portfolio history endpoints (FR-601–607, FR-701–707)."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.history_service import HistoryService
from app.services.snapshot_service import SnapshotService

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/ticker/{ticker_id}")
def get_ticker_history(
    ticker_id: int,
    range: str = Query("ALL", pattern="^(1W|1M|3M|6M|YTD|1Y|ALL)$"),
    db: Session = Depends(get_db),
):
    """Per-ticker investment history (FR-601–606)."""
    result = HistoryService.get_ticker_history(db, ticker_id, range)
    if result is None:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return result


@router.get("/portfolio")
def get_portfolio_history(
    range: str = Query("ALL", pattern="^(1W|1M|3M|6M|YTD|1Y|ALL)$"),
    db: Session = Depends(get_db),
):
    """Portfolio performance history (FR-701–707)."""
    return HistoryService.get_portfolio_history(db, range)


@router.get("/portfolio/delta")
def get_portfolio_delta(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Delta between two dates (FR-703)."""
    return HistoryService.get_portfolio_delta(db, start_date, end_date)


@router.post("/snapshot")
def take_snapshot(db: Session = Depends(get_db)):
    """Manually trigger a portfolio snapshot."""
    result = SnapshotService.take_snapshot(db)
    if result is None:
        return {"message": "No tickers in portfolio — snapshot skipped."}
    return {"message": "Snapshot taken", "date": result.date.isoformat()}
