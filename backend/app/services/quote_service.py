import time
from decimal import Decimal

import yfinance as yf

from app.config import settings
from app.schemas.quote import QuoteOut


class QuoteService:
    """Fetch live quotes with in-memory cache and stale fallback (FR-201..205, NFR-02)."""

    _cache: dict[str, tuple[QuoteOut, float]] = {}  # symbol -> (quote, timestamp)

    @classmethod
    def get_quote(cls, symbol: str) -> QuoteOut:
        symbol = symbol.upper()
        now = time.time()

        # Check cache
        cached = cls._cache.get(symbol)
        if cached:
            quote, ts = cached
            if now - ts < settings.quote_cache_ttl:
                return quote

        # Fetch fresh
        try:
            quote = cls._fetch_from_yfinance(symbol)
            cls._cache[symbol] = (quote, now)
            return quote
        except Exception:
            # Fallback to stale cache (NFR-02)
            if cached:
                stale_quote = cached[0].model_copy(update={"is_stale": True})
                return stale_quote
            raise

    @classmethod
    def get_quotes(cls, symbols: list[str]) -> list[QuoteOut]:
        return [cls.get_quote(s) for s in symbols]

    @classmethod
    def clear_cache(cls, symbol: str | None = None):
        if symbol:
            cls._cache.pop(symbol.upper(), None)
        else:
            cls._cache.clear()

    @staticmethod
    def _fetch_from_yfinance(symbol: str) -> QuoteOut:
        ticker = yf.Ticker(symbol)
        info = ticker.info

        last_price = info.get("regularMarketPrice") or info.get("currentPrice") or 0
        prev_close = info.get("regularMarketPreviousClose") or last_price
        change = last_price - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0

        return QuoteOut(
            symbol=symbol.upper(),
            last_price=Decimal(str(last_price)),
            change=Decimal(str(round(change, 4))),
            change_percent=Decimal(str(round(change_pct, 4))),
            day_high=Decimal(str(info.get("dayHigh") or last_price)),
            day_low=Decimal(str(info.get("dayLow") or last_price)),
            volume=int(info.get("volume") or 0),
            is_stale=False,
        )
