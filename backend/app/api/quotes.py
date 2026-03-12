from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.quote import QuoteOut
from app.services.quote_service import QuoteService
from app.services.ticker_service import TickerService

router = APIRouter(prefix="/api/quotes", tags=["quotes"])


@router.get("/", response_model=list[QuoteOut])
def get_all_quotes(db: Session = Depends(get_db)):
    """Fetch live quotes for all portfolio tickers (FR-201)."""
    tickers = TickerService.get_all(db)
    if not tickers:
        return []
    symbols = [t.symbol for t in tickers]
    return QuoteService.get_quotes(symbols)


@router.get("/{symbol}", response_model=QuoteOut)
def get_quote(symbol: str):
    """Fetch a live quote for a single ticker (FR-202)."""
    try:
        return QuoteService.get_quote(symbol)
    except Exception:
        raise HTTPException(status_code=502, detail=f"Unable to fetch quote for {symbol.upper()}")


@router.post("/refresh", response_model=list[QuoteOut])
def refresh_quotes(db: Session = Depends(get_db)):
    """Force-refresh all quotes, clearing cache (FR-203)."""
    QuoteService.clear_cache()
    tickers = TickerService.get_all(db)
    if not tickers:
        return []
    symbols = [t.symbol for t in tickers]
    return QuoteService.get_quotes(symbols)
