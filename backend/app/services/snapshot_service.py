"""Snapshot service — create and retrieve portfolio + per-ticker snapshots (FR-701, S3-01)."""

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.ticker import Ticker
from app.models.portfolio_snapshot import PortfolioSnapshot
from app.models.ticker_snapshot import TickerSnapshot
from app.services.pnl_service import PnlService


class SnapshotService:

    @staticmethod
    def take_snapshot(db: Session) -> PortfolioSnapshot | None:
        """Capture today's portfolio + per-ticker snapshots. Skips if already exists."""
        today = date.today()

        existing = db.query(PortfolioSnapshot).filter(PortfolioSnapshot.date == today).first()
        if existing:
            return existing

        tickers = db.query(Ticker).all()
        if not tickers:
            return None

        total_value = Decimal("0")
        total_cost = Decimal("0")
        total_unrealized = Decimal("0")
        total_realized = Decimal("0")

        for ticker in tickers:
            pnl = PnlService.compute_ticker_pnl(db, ticker.id)
            qty = pnl["total_quantity"]
            if qty <= 0:
                continue

            total_value += pnl["market_value"]
            total_cost += pnl["total_cost"]
            total_unrealized += pnl["unrealized_pnl"]
            total_realized += pnl["realized_pnl"]

            ticker_snap = TickerSnapshot(
                ticker_id=ticker.id,
                date=today,
                quantity=qty,
                avg_cost=pnl["avg_cost"],
                market_price=pnl["current_price"],
                market_value=pnl["market_value"],
                unrealized_pnl=pnl["unrealized_pnl"],
                realized_pnl=pnl["realized_pnl"],
            )
            db.add(ticker_snap)

        # Daily change vs previous snapshot
        prev = (
            db.query(PortfolioSnapshot)
            .filter(PortfolioSnapshot.date < today)
            .order_by(PortfolioSnapshot.date.desc())
            .first()
        )
        daily_change = (total_value - prev.total_value) if prev else Decimal("0")

        net_pnl = total_unrealized + total_realized
        snapshot = PortfolioSnapshot(
            date=today,
            total_value=total_value,
            total_cost=total_cost,
            unrealized_pnl=total_unrealized,
            realized_pnl=total_realized,
            net_pnl=net_pnl,
            daily_change=daily_change,
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot

    @staticmethod
    def get_portfolio_snapshots(
        db: Session, start: date | None = None, end: date | None = None
    ) -> list[PortfolioSnapshot]:
        q = db.query(PortfolioSnapshot).order_by(PortfolioSnapshot.date)
        if start:
            q = q.filter(PortfolioSnapshot.date >= start)
        if end:
            q = q.filter(PortfolioSnapshot.date <= end)
        return q.all()

    @staticmethod
    def get_ticker_snapshots(
        db: Session, ticker_id: int, start: date | None = None, end: date | None = None
    ) -> list[TickerSnapshot]:
        q = (
            db.query(TickerSnapshot)
            .filter(TickerSnapshot.ticker_id == ticker_id)
            .order_by(TickerSnapshot.date)
        )
        if start:
            q = q.filter(TickerSnapshot.date >= start)
        if end:
            q = q.filter(TickerSnapshot.date <= end)
        return q.all()

    @staticmethod
    def get_date_range_start(range_key: str) -> date | None:
        """Convert a range key (1M, 3M, 6M, YTD, 1Y, ALL) to a start date."""
        today = date.today()
        mapping = {
            "1W": today - timedelta(weeks=1),
            "1M": today - timedelta(days=30),
            "3M": today - timedelta(days=90),
            "6M": today - timedelta(days=180),
            "YTD": date(today.year, 1, 1),
            "1Y": today - timedelta(days=365),
        }
        return mapping.get(range_key.upper())  # None = ALL
