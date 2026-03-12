from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ticker import TickerCreate, TickerOut, TickerUpdate
from app.services.ticker_service import TickerService

router = APIRouter(prefix="/api/tickers", tags=["tickers"])


@router.get("/", response_model=list[TickerOut])
def list_tickers(db: Session = Depends(get_db)):
    return TickerService.get_all(db)


@router.get("/{ticker_id}", response_model=TickerOut)
def get_ticker(ticker_id: int, db: Session = Depends(get_db)):
    ticker = TickerService.get_by_id(db, ticker_id)
    if not ticker:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return ticker


@router.post("/", response_model=TickerOut, status_code=201)
def create_ticker(data: TickerCreate, db: Session = Depends(get_db)):
    # Check for duplicate
    existing = TickerService.get_by_symbol(db, data.symbol)
    if existing:
        raise HTTPException(status_code=409, detail=f"Ticker {data.symbol.upper()} already exists")
    try:
        return TickerService.create(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{ticker_id}", response_model=TickerOut)
def update_ticker(ticker_id: int, data: TickerUpdate, db: Session = Depends(get_db)):
    ticker = TickerService.update(db, ticker_id, data)
    if not ticker:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return ticker


@router.delete("/{ticker_id}", status_code=204)
def delete_ticker(ticker_id: int, db: Session = Depends(get_db)):
    if not TickerService.delete(db, ticker_id):
        raise HTTPException(status_code=404, detail="Ticker not found")
