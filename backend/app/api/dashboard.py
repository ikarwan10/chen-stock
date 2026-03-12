from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.pnl_service import PnlService


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
    portfolio = PnlService.compute_portfolio_pnl(db)

    if not portfolio["holdings"]:
        return DashboardOut(
            holdings=[],
            summary=PortfolioSummary(
                total_invested=Decimal("0"),
                total_market_value=Decimal("0"),
                total_pnl=Decimal("0"),
                total_pnl_pct=Decimal("0"),
            ),
        )

    holdings = []
    for h in portfolio["holdings"]:
        cost = h["total_cost"]
        mv = h["market_value"]
        gl = mv - cost
        gl_pct = (gl / cost * 100) if cost else Decimal("0")

        holdings.append(
            HoldingOut(
                ticker_id=h["ticker_id"],
                symbol=h["symbol"],
                name=h["name"],
                quantity=h["total_quantity"],
                avg_cost=h["avg_cost"],
                current_price=h["current_price"],
                market_value=mv,
                total_cost=cost,
                gain_loss=gl,
                gain_loss_pct=gl_pct,
                day_change=h["day_change"],
                day_change_pct=h["day_change_pct"],
            )
        )

    return DashboardOut(
        holdings=holdings,
        summary=PortfolioSummary(
            total_invested=portfolio["total_invested"],
            total_market_value=portfolio["total_market_value"],
            total_pnl=portfolio["net_pnl"],
            total_pnl_pct=portfolio["pnl_pct"],
        ),
    )
