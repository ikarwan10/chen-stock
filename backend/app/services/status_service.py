"""Financial Status service — portfolio and per-ticker health check (FR-801–808)."""

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.ticker import Ticker
from app.models.portfolio_snapshot import PortfolioSnapshot
from app.models.ticker_snapshot import TickerSnapshot
from app.services.pnl_service import PnlService
from app.services.quote_service import QuoteService


class StatusService:

    @staticmethod
    def _trend_direction(change_pct: Decimal) -> str:
        """Classify trend: Improving / Declining / Stable (±1% threshold) (FR-803)."""
        if change_pct > 1:
            return "Improving"
        elif change_pct < -1:
            return "Declining"
        return "Stable"

    @staticmethod
    def _compute_period_change(
        snapshots: list, attr: str = "total_value"
    ) -> dict:
        """Compute $ and % change from first to last snapshot in list."""
        if len(snapshots) < 2:
            return {"change": "0", "change_pct": "0"}
        first_val = getattr(snapshots[0], attr)
        last_val = getattr(snapshots[-1], attr)
        change = last_val - first_val
        pct = (change / first_val * 100) if first_val else Decimal("0")
        return {"change": str(change), "change_pct": str(pct)}

    @staticmethod
    def _get_scorecard_periods(today: date) -> dict[str, date]:
        """Return start dates for daily, weekly, monthly, YTD scorecard periods."""
        return {
            "daily": today - timedelta(days=1),
            "weekly": today - timedelta(weeks=1),
            "monthly": today - timedelta(days=30),
            "ytd": date(today.year, 1, 1),
        }

    @staticmethod
    def portfolio_status(db: Session) -> dict:
        """Full portfolio financial status check (FR-801–805, FR-808)."""
        portfolio = PnlService.compute_portfolio_pnl(db)
        today = date.today()

        # Scorecard (FR-804)
        scorecard = {}
        for period_name, start in StatusService._get_scorecard_periods(today).items():
            snaps = (
                db.query(PortfolioSnapshot)
                .filter(PortfolioSnapshot.date >= start)
                .order_by(PortfolioSnapshot.date)
                .all()
            )
            scorecard[period_name] = StatusService._compute_period_change(snaps)

        # Trend direction (FR-803) — based on monthly change
        monthly_pct = Decimal(scorecard["monthly"]["change_pct"])
        trend = StatusService._trend_direction(monthly_pct)

        # Per-ticker breakdown sorted by PNL contribution (FR-805)
        breakdown = sorted(
            portfolio["holdings"],
            key=lambda h: h.get("net_pnl", Decimal("0")),
            reverse=True,
        )
        ticker_breakdown = [
            {
                "ticker_id": h["ticker_id"],
                "symbol": h["symbol"],
                "name": h["name"],
                "net_pnl": str(h["net_pnl"]),
                "unrealized_pnl": str(h["unrealized_pnl"]),
                "realized_pnl": str(h["realized_pnl"]),
                "market_value": str(h["market_value"]),
                "pct_of_portfolio": str(
                    (h["market_value"] / portfolio["total_market_value"] * 100)
                    if portfolio["total_market_value"]
                    else Decimal("0")
                ),
            }
            for h in breakdown
            if h["total_quantity"] > 0
        ]

        return {
            "scope": "portfolio",
            "current_value": str(portfolio["total_market_value"]),
            "total_invested": str(portfolio["total_invested"]),
            "unrealized_pnl": str(portfolio["total_unrealized_pnl"]),
            "unrealized_pnl_pct": str(
                (portfolio["total_unrealized_pnl"] / portfolio["total_invested"] * 100)
                if portfolio["total_invested"]
                else Decimal("0")
            ),
            "realized_pnl": str(portfolio["total_realized_pnl"]),
            "net_pnl": str(portfolio["net_pnl"]),
            "net_pnl_pct": str(portfolio["pnl_pct"]),
            "trend": trend,
            "scorecard": scorecard,
            "breakdown": ticker_breakdown,
        }

    @staticmethod
    def ticker_status(db: Session, ticker_id: int) -> dict | None:
        """Per-ticker financial status check (FR-801–804, FR-806, FR-808)."""
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return None

        pnl = PnlService.compute_ticker_pnl(db, ticker.id)
        today = date.today()

        # Scorecard (FR-804)
        scorecard = {}
        for period_name, start in StatusService._get_scorecard_periods(today).items():
            snaps = (
                db.query(TickerSnapshot)
                .filter(TickerSnapshot.ticker_id == ticker_id, TickerSnapshot.date >= start)
                .order_by(TickerSnapshot.date)
                .all()
            )
            scorecard[period_name] = StatusService._compute_period_change(snaps, "market_value")

        # Trend (FR-803) — based on monthly change
        monthly_pct = Decimal(scorecard["monthly"]["change_pct"])
        trend = StatusService._trend_direction(monthly_pct)

        # Position details (FR-806)
        position = {
            "shares": str(pnl["total_quantity"]),
            "avg_cost": str(pnl["avg_cost"]),
            "current_price": str(pnl["current_price"]),
        }

        # Get extra quote details for FR-806
        try:
            quote = QuoteService.get_quote(ticker.symbol)
            position["day_high"] = str(quote.day_high)
            position["day_low"] = str(quote.day_low)
            position["volume"] = quote.volume
        except Exception:
            position["day_high"] = "0"
            position["day_low"] = "0"
            position["volume"] = 0

        # % of total portfolio
        portfolio = PnlService.compute_portfolio_pnl(db)
        pct_of_portfolio = (
            (pnl["market_value"] / portfolio["total_market_value"] * 100)
            if portfolio["total_market_value"]
            else Decimal("0")
        )

        return {
            "scope": "ticker",
            "ticker_id": ticker.id,
            "symbol": ticker.symbol,
            "name": ticker.name,
            "current_value": str(pnl["market_value"]),
            "total_invested": str(pnl["total_cost"]),
            "unrealized_pnl": str(pnl["unrealized_pnl"]),
            "unrealized_pnl_pct": str(
                (pnl["unrealized_pnl"] / pnl["total_cost"] * 100)
                if pnl["total_cost"]
                else Decimal("0")
            ),
            "realized_pnl": str(pnl["realized_pnl"]),
            "net_pnl": str(pnl["net_pnl"]),
            "net_pnl_pct": str(
                (pnl["net_pnl"] / pnl["total_cost"] * 100)
                if pnl["total_cost"]
                else Decimal("0")
            ),
            "trend": trend,
            "scorecard": scorecard,
            "position": position,
            "pct_of_portfolio": str(pct_of_portfolio),
        }
