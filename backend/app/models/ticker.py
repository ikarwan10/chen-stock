from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Ticker(Base):
    __tablename__ = "tickers"

    id: Mapped[int] = mapped_column(primary_key=True)
    symbol: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(20), default="stock")  # stock, etf, crypto
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="ticker", cascade="all, delete-orphan")
    snapshots: Mapped[list["TickerSnapshot"]] = relationship(back_populates="ticker", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Ticker {self.symbol}>"
