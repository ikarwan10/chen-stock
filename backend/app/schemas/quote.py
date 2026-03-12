from decimal import Decimal

from pydantic import BaseModel


class QuoteOut(BaseModel):
    symbol: str
    last_price: Decimal
    change: Decimal
    change_percent: Decimal
    day_high: Decimal
    day_low: Decimal
    volume: int
    is_stale: bool = False
