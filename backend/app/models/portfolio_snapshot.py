from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import DATE, DateTime, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date] = mapped_column(DATE, nullable=False, unique=True, index=True)
    total_value: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    total_cost: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    unrealized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    realized_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    net_pnl: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    daily_change: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<PortfolioSnapshot {self.date} val={self.total_value}>"
