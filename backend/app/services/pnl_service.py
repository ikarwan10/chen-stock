"""PNL calculation engine — unrealized and realized PNL (FR-401, FR-402)."""

from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.ticker import Ticker
from app.models.transaction import Transaction
from app.services.quote_service import QuoteService


class PnlService:

    @staticmethod
    def compute_holdings(db: Session, ticker_id: int) -> dict:
        """Compute quantity, avg cost, total cost, and realized PNL for a ticker using FIFO."""
        txns = (
            db.query(Transaction)
            .filter(Transaction.ticker_id == ticker_id)
            .order_by(Transaction.date, Transaction.id)
            .all()
        )

        lots: list[dict] = []  # FIFO lots: [{qty, price}]
        realized_pnl = Decimal("0")
        total_fees = Decimal("0")

        for txn in txns:
            total_fees += txn.fees
            if txn.type == "buy":
                lots.append({"qty": txn.quantity, "price": txn.price})
            elif txn.type == "sell":
                sell_qty = txn.quantity
                sell_price = txn.price
                while sell_qty > 0 and lots:
                    lot = lots[0]
                    if lot["qty"] <= sell_qty:
                        realized_pnl += lot["qty"] * (sell_price - lot["price"])
                        sell_qty -= lot["qty"]
                        lots.pop(0)
                    else:
                        realized_pnl += sell_qty * (sell_price - lot["price"])
                        lot["qty"] -= sell_qty
                        sell_qty = Decimal("0")

        total_qty = sum(l["qty"] for l in lots)
        total_cost = sum(l["qty"] * l["price"] for l in lots)
        avg_cost = (total_cost / total_qty) if total_qty > 0 else Decimal("0")

        return {
            "total_quantity": total_qty,
            "total_cost": total_cost,
            "avg_cost": avg_cost,
            "realized_pnl": realized_pnl,
            "total_fees": total_fees,
        }

    @staticmethod
    def compute_ticker_pnl(db: Session, ticker_id: int) -> dict:
        """Full PNL for a single ticker including unrealized."""
        holdings = PnlService.compute_holdings(db, ticker_id)
        ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        if not ticker:
            return holdings

        qty = holdings["total_quantity"]
        cost = holdings["total_cost"]

        current_price = Decimal("0")
        market_value = Decimal("0")
        unrealized_pnl = Decimal("0")
        day_change = Decimal("0")
        day_change_pct = Decimal("0")

        if qty > 0:
            try:
                quote = QuoteService.get_quote(ticker.symbol)
                current_price = quote.last_price
                market_value = qty * current_price
                unrealized_pnl = market_value - cost
                day_change = quote.change
                day_change_pct = quote.change_percent
            except Exception:
                pass

        return {
            **holdings,
            "current_price": current_price,
            "market_value": market_value,
            "unrealized_pnl": unrealized_pnl,
            "net_pnl": unrealized_pnl + holdings["realized_pnl"],
            "day_change": day_change,
            "day_change_pct": day_change_pct,
        }

    @staticmethod
    def compute_portfolio_pnl(db: Session) -> dict:
        """Aggregate PNL across all tickers."""
        tickers = db.query(Ticker).all()
        total_invested = Decimal("0")
        total_market_value = Decimal("0")
        total_realized = Decimal("0")
        total_unrealized = Decimal("0")
        total_fees = Decimal("0")
        holdings = []

        for ticker in tickers:
            pnl = PnlService.compute_ticker_pnl(db, ticker.id)
            total_invested += pnl["total_cost"]
            total_market_value += pnl["market_value"]
            total_realized += pnl["realized_pnl"]
            total_unrealized += pnl["unrealized_pnl"]
            total_fees += pnl["total_fees"]
            holdings.append({
                "ticker_id": ticker.id,
                "symbol": ticker.symbol,
                "name": ticker.name,
                **pnl,
            })

        net_pnl = total_unrealized + total_realized
        pnl_pct = (net_pnl / total_invested * 100) if total_invested else Decimal("0")

        return {
            "total_invested": total_invested,
            "total_market_value": total_market_value,
            "total_realized_pnl": total_realized,
            "total_unrealized_pnl": total_unrealized,
            "net_pnl": net_pnl,
            "pnl_pct": pnl_pct,
            "total_fees": total_fees,
            "holdings": holdings,
        }
