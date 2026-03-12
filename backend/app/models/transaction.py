from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import DATE, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticker_id: Mapped[int] = mapped_column(ForeignKey("tickers.id"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(10), nullable=False)  # buy / sell
    date: Mapped[date] = mapped_column(DATE, nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    fees: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    ticker: Mapped["Ticker"] = relationship(back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction {self.type} {self.quantity}x{self.ticker_id} @{self.price}>"
