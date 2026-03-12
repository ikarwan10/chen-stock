from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.ticker_service import TickerService
from app.services.quote_service import QuoteService
from app.services.transaction_service import TransactionService


class HoldingOut(BaseModel):
    ticker_id: int
    symbol: str
    name: str
    quantity: Decimal
    avg_cost: Decimal
    current_price: Decimal
    market_value: Decimal
    total_cost: Decimal
    gain_loss: Decimal
    gain_loss_pct: Decimal
    day_change: Decimal
    day_change_pct: Decimal


class PortfolioSummary(BaseModel):
    total_invested: Decimal
    total_market_value: Decimal
    total_pnl: Decimal
    total_pnl_pct: Decimal


class DashboardOut(BaseModel):
    holdings: list[HoldingOut]
    summary: PortfolioSummary


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    """Aggregate dashboard: all holdings + portfolio summary (FR-301, FR-302)."""
    tickers = TickerService.get_all(db)

    if not tickers:
        return DashboardOut(
            holdings=[],
            summary=PortfolioSummary(
                total_invested=Decimal("0"),
                total_market_value=Decimal("0"),
                total_pnl=Decimal("0"),
                total_pnl_pct=Decimal("0"),
            ),
        )

    # Fetch quotes for all tickers at once
    symbols = [t.symbol for t in tickers]
    quotes_map: dict[str, dict] = {}
    for sym in symbols:
        try:
            q = QuoteService.get_quote(sym)
            quotes_map[sym] = q
        except Exception:
            quotes_map[sym] = None

    total_invested = Decimal("0")
    total_market_value = Decimal("0")
    holdings: list[HoldingOut] = []

    for ticker in tickers:
        h = TransactionService.compute_holdings(db, ticker.id)
        qty = h["total_quantity"]
        cost = h["total_cost"]
        avg = h["avg_cost"]

        quote = quotes_map.get(ticker.symbol)
        if quote and qty > 0:
            price = quote.last_price
            mv = qty * price
            gl = mv - cost
            gl_pct = (gl / cost * 100) if cost else Decimal("0")
            day_chg = quote.change
            day_chg_pct = quote.change_percent
        else:
            price = Decimal("0")
            mv = Decimal("0")
            gl = Decimal("0")
            gl_pct = Decimal("0")
            day_chg = Decimal("0")
            day_chg_pct = Decimal("0")

        total_invested += cost
        total_market_value += mv

        holdings.append(
            HoldingOut(
                ticker_id=ticker.id,
                symbol=ticker.symbol,
                name=ticker.name,
                quantity=qty,
                avg_cost=avg,
                current_price=price,
                market_value=mv,
                total_cost=cost,
                gain_loss=gl,
                gain_loss_pct=gl_pct,
                day_change=day_chg,
                day_change_pct=day_chg_pct,
            )
        )

    total_pnl = total_market_value - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100) if total_invested else Decimal("0")

    return DashboardOut(
        holdings=holdings,
        summary=PortfolioSummary(
            total_invested=total_invested,
            total_market_value=total_market_value,
            total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct,
        ),
    )
