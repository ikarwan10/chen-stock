from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    ticker_id: int
    type: str = Field(..., pattern="^(buy|sell)$")
    date: date
    quantity: Decimal = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    fees: Decimal = Field(default=Decimal("0"), ge=0)


class TransactionOut(BaseModel):
    id: int
    ticker_id: int
    type: str
    date: date
    quantity: Decimal
    price: Decimal
    fees: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}
