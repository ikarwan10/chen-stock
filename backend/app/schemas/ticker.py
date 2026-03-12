from datetime import datetime

from pydantic import BaseModel, Field


class TickerCreate(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20, examples=["AAPL"])
    name: str = Field(default="", max_length=200)
    asset_type: str = Field(default="stock", pattern="^(stock|etf|crypto)$")


class TickerUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    asset_type: str | None = Field(default=None, pattern="^(stock|etf|crypto)$")


class TickerOut(BaseModel):
    id: int
    symbol: str
    name: str
    asset_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
