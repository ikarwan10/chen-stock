from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import DATE, DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TickerSnapshot(Base):
    __tablename__ = "ticker_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticker_id: Mapped[int] = mapped_column(ForeignKey("tickers.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(DATE, nullable=False, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    avg_cost: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    market_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    market_value: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    unrealized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    realized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    ticker: Mapped["Ticker"] = relationship(back_populates="snapshots")

    def __repr__(self) -> str:
        return f"<TickerSnapshot {self.ticker_id} {self.date} val={self.market_value}>"
