import yfinance as yf
from sqlalchemy.orm import Session

from app.models.ticker import Ticker
from app.schemas.ticker import TickerCreate, TickerUpdate


class TickerService:

    @staticmethod
    def validate_symbol(symbol: str) -> dict | None:
        """Validate ticker symbol against yfinance. Returns info dict or None."""
        try:
            info = yf.Ticker(symbol).info
            # yfinance returns a dict with at least 'symbol' for valid tickers
            if info and info.get("regularMarketPrice") is not None:
                return info
        except Exception:
            pass
        return None

    @staticmethod
    def get_all(db: Session) -> list[Ticker]:
        return db.query(Ticker).order_by(Ticker.symbol).all()

    @staticmethod
    def get_by_id(db: Session, ticker_id: int) -> Ticker | None:
        return db.query(Ticker).filter(Ticker.id == ticker_id).first()

    @staticmethod
    def get_by_symbol(db: Session, symbol: str) -> Ticker | None:
        return db.query(Ticker).filter(Ticker.symbol == symbol.upper()).first()

    @staticmethod
    def create(db: Session, data: TickerCreate) -> Ticker:
        symbol_upper = data.symbol.upper().strip()

        # Validate symbol against yfinance (FR-104)
        info = TickerService.validate_symbol(symbol_upper)
        if info is None:
            raise ValueError(f"Invalid ticker symbol: {symbol_upper}")

        # Use company name from API if not provided
        name = data.name or info.get("shortName") or info.get("longName") or symbol_upper

        ticker = Ticker(
            symbol=symbol_upper,
            name=name,
            asset_type=data.asset_type,
        )
        db.add(ticker)
        db.commit()
        db.refresh(ticker)
        return ticker

    @staticmethod
    def update(db: Session, ticker_id: int, data: TickerUpdate) -> Ticker | None:
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return None
        if data.name is not None:
            ticker.name = data.name
        if data.asset_type is not None:
            ticker.asset_type = data.asset_type
        db.commit()
        db.refresh(ticker)
        return ticker

    @staticmethod
    def delete(db: Session, ticker_id: int) -> bool:
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return False
        db.delete(ticker)
        db.commit()
        return True
