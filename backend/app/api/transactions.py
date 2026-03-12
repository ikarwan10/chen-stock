from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionOut])
def list_transactions(ticker_id: int | None = None, db: Session = Depends(get_db)):
    if ticker_id:
        return TransactionService.get_by_ticker(db, ticker_id)
    return TransactionService.get_all(db)


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    try:
        return TransactionService.create(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
