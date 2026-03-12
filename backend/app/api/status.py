"""Financial Status API — portfolio and per-ticker health check (FR-801–808)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.status_service import StatusService

router = APIRouter(prefix="/api/status", tags=["status"])


@router.get("/portfolio")
def portfolio_status(db: Session = Depends(get_db)):
    """Full portfolio financial status check (FR-801–805, FR-808)."""
    return StatusService.portfolio_status(db)


@router.get("/ticker/{ticker_id}")
def ticker_status(ticker_id: int, db: Session = Depends(get_db)):
    """Per-ticker financial status check (FR-801–804, FR-806, FR-808)."""
    result = StatusService.ticker_status(db, ticker_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return result
