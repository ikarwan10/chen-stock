from app.api.tickers import router as tickers_router
from app.api.quotes import router as quotes_router
from app.api.transactions import router as transactions_router
from app.api.dashboard import router as dashboard_router
from app.api.history import router as history_router
from app.api.status import router as status_router

__all__ = [
    "tickers_router",
    "quotes_router",
    "transactions_router",
    "dashboard_router",
    "history_router",
    "status_router",
]
