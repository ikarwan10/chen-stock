"""History service — per-ticker and portfolio historical data (FR-601–607, FR-701–707)."""

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.ticker import Ticker
from app.models.transaction import Transaction
from app.services.pnl_service import PnlService
from app.services.snapshot_service import SnapshotService


class HistoryService:

    @staticmethod
    def get_ticker_history(db: Session, ticker_id: int, range_key: str = "ALL") -> dict:
        """Full history for a ticker: transactions + snapshots + current PNL (FR-601–606)."""
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return None

        start = SnapshotService.get_date_range_start(range_key)

        # Transactions (always return all for the list)
        txns = (
            db.query(Transaction)
            .filter(Transaction.ticker_id == ticker_id)
            .order_by(Transaction.date)
            .all()
        )

        # Snapshots for chart data
        snapshots = SnapshotService.get_ticker_snapshots(db, ticker_id, start=start)

        # Current holdings/PNL
        pnl = PnlService.compute_ticker_pnl(db, ticker_id)

        # Build running-total transaction list (FR-602)
        running_qty = Decimal("0")
        txn_list = []
        for t in txns:
            if t.type == "buy":
                running_qty += t.quantity
            else:
                running_qty -= t.quantity
            txn_list.append({
                "id": t.id,
                "date": t.date.isoformat(),
                "type": t.type,
                "quantity": str(t.quantity),
                "price": str(t.price),
                "fees": str(t.fees),
                "running_qty": str(running_qty),
            })

        # Chart data from snapshots (FR-603, FR-604)
        chart_data = [
            {
                "date": s.date.isoformat(),
                "market_value": str(s.market_value),
                "cost_basis": str(s.avg_cost * s.quantity),
                "unrealized_pnl": str(s.unrealized_pnl),
                "realized_pnl": str(s.realized_pnl),
                "market_price": str(s.market_price),
            }
            for s in snapshots
        ]

        return {
            "ticker_id": ticker.id,
            "symbol": ticker.symbol,
            "name": ticker.name,
            "transactions": txn_list,
            "chart_data": chart_data,
            "current": {
                "quantity": str(pnl["total_quantity"]),
                "avg_cost": str(pnl["avg_cost"]),
                "current_price": str(pnl["current_price"]),
                "market_value": str(pnl["market_value"]),
                "total_cost": str(pnl["total_cost"]),
                "unrealized_pnl": str(pnl["unrealized_pnl"]),
                "realized_pnl": str(pnl["realized_pnl"]),
                "net_pnl": str(pnl["net_pnl"]),
            },
        }

    @staticmethod
    def get_portfolio_history(db: Session, range_key: str = "ALL") -> dict:
        """Portfolio performance history with chart data (FR-701–707)."""
        start = SnapshotService.get_date_range_start(range_key)
        snapshots = SnapshotService.get_portfolio_snapshots(db, start=start)

        chart_data = [
            {
                "date": s.date.isoformat(),
                "total_value": str(s.total_value),
                "total_cost": str(s.total_cost),
                "net_pnl": str(s.net_pnl),
                "daily_change": str(s.daily_change),
            }
            for s in snapshots
        ]

        # Compute delta between first and last snapshot (FR-703)
        summary = None
        if len(snapshots) >= 2:
            first, last = snapshots[0], snapshots[-1]
            change = last.total_value - first.total_value
            change_pct = (change / first.total_value * 100) if first.total_value else Decimal("0")

            # Best and worst days (FR-705)
            best_day = max(snapshots, key=lambda s: s.daily_change)
            worst_day = min(snapshots, key=lambda s: s.daily_change)

            summary = {
                "start_date": first.date.isoformat(),
                "end_date": last.date.isoformat(),
                "start_value": str(first.total_value),
                "end_value": str(last.total_value),
                "net_change": str(change),
                "net_change_pct": str(change_pct),
                "best_day": {"date": best_day.date.isoformat(), "change": str(best_day.daily_change)},
                "worst_day": {"date": worst_day.date.isoformat(), "change": str(worst_day.daily_change)},
            }
        elif len(snapshots) == 1:
            s = snapshots[0]
            summary = {
                "start_date": s.date.isoformat(),
                "end_date": s.date.isoformat(),
                "start_value": str(s.total_value),
                "end_value": str(s.total_value),
                "net_change": "0",
                "net_change_pct": "0",
                "best_day": {"date": s.date.isoformat(), "change": str(s.daily_change)},
                "worst_day": {"date": s.date.isoformat(), "change": str(s.daily_change)},
            }

        return {
            "chart_data": chart_data,
            "summary": summary,
        }

    @staticmethod
    def get_portfolio_delta(db: Session, start_date: date, end_date: date) -> dict:
        """Delta between two specific dates (FR-703)."""
        from app.models.portfolio_snapshot import PortfolioSnapshot

        s1 = db.query(PortfolioSnapshot).filter(PortfolioSnapshot.date <= start_date).order_by(PortfolioSnapshot.date.desc()).first()
        s2 = db.query(PortfolioSnapshot).filter(PortfolioSnapshot.date <= end_date).order_by(PortfolioSnapshot.date.desc()).first()

        if not s1 or not s2:
            return {"error": "Insufficient snapshot data for the selected dates."}

        change = s2.total_value - s1.total_value
        change_pct = (change / s1.total_value * 100) if s1.total_value else Decimal("0")

        return {
            "start_date": s1.date.isoformat(),
            "end_date": s2.date.isoformat(),
            "start_value": str(s1.total_value),
            "end_value": str(s2.total_value),
            "net_change": str(change),
            "net_change_pct": str(change_pct),
        }
