from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.ticker import Ticker
from app.schemas.transaction import TransactionCreate


class TransactionService:

    @staticmethod
    def get_by_ticker(db: Session, ticker_id: int) -> list[Transaction]:
        return (
            db.query(Transaction)
            .filter(Transaction.ticker_id == ticker_id)
            .order_by(Transaction.date.desc())
            .all()
        )

    @staticmethod
    def get_all(db: Session) -> list[Transaction]:
        return db.query(Transaction).order_by(Transaction.date.desc()).all()

    @staticmethod
    def create(db: Session, data: TransactionCreate) -> Transaction:
        # Verify ticker exists
        ticker = db.query(Ticker).filter(Ticker.id == data.ticker_id).first()
        if not ticker:
            raise ValueError(f"Ticker with id {data.ticker_id} not found")

        txn = Transaction(
            ticker_id=data.ticker_id,
            type=data.type,
            date=data.date,
            quantity=data.quantity,
            price=data.price,
            fees=data.fees,
        )
        db.add(txn)
        db.commit()
        db.refresh(txn)
        return txn

    @staticmethod
    def compute_holdings(db: Session, ticker_id: int) -> dict:
        """Compute total quantity and average cost for a ticker from its transactions."""
        txns = (
            db.query(Transaction)
            .filter(Transaction.ticker_id == ticker_id)
            .order_by(Transaction.date)
            .all()
        )
        total_qty = Decimal("0")
        total_cost = Decimal("0")

        for txn in txns:
            if txn.type == "buy":
                total_cost += txn.quantity * txn.price + txn.fees
                total_qty += txn.quantity
            elif txn.type == "sell":
                if total_qty > 0:
                    avg = total_cost / total_qty
                    total_qty -= txn.quantity
                    total_cost = avg * total_qty

        avg_cost = (total_cost / total_qty) if total_qty > 0 else Decimal("0")
        return {
            "total_quantity": total_qty,
            "total_cost": total_cost,
            "avg_cost": avg_cost,
        }
