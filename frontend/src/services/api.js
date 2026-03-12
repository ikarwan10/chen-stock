import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Tickers ──────────────────────────────────────────────
export const getTickers = () => api.get('/tickers/').then((r) => r.data);

export const createTicker = (data) =>
  api.post('/tickers/', data).then((r) => r.data);

export const updateTicker = (id, data) =>
  api.patch(`/tickers/${id}`, data).then((r) => r.data);

export const deleteTicker = (id) => api.delete(`/tickers/${id}`);

// ── Quotes ───────────────────────────────────────────────
export const getQuotes = () => api.get('/quotes/').then((r) => r.data);

export const refreshQuotes = () =>
  api.post('/quotes/refresh').then((r) => r.data);

// ── Dashboard ────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard/').then((r) => r.data);

// ── Transactions ─────────────────────────────────────────
export const getTransactions = (tickerId) =>
  api.get('/transactions/', { params: tickerId ? { ticker_id: tickerId } : {} }).then((r) => r.data);

export const createTransaction = (data) =>
  api.post('/transactions/', data).then((r) => r.data);

// ── History ──────────────────────────────────────────────
export const getTickerHistory = (tickerId, range = 'ALL') =>
  api.get(`/history/ticker/${tickerId}`, { params: { range } }).then((r) => r.data);

export const getPortfolioHistory = (range = 'ALL') =>
  api.get('/history/portfolio', { params: { range } }).then((r) => r.data);

export const getPortfolioDelta = (startDate, endDate) =>
  api.get('/history/portfolio/delta', { params: { start_date: startDate, end_date: endDate } }).then((r) => r.data);

export const takeSnapshot = () =>
  api.post('/history/snapshot').then((r) => r.data);

// ── Financial Status ─────────────────────────────────────
export const getPortfolioStatus = () =>
  api.get('/status/portfolio').then((r) => r.data);

export const getTickerStatus = (tickerId) =>
  api.get(`/status/ticker/${tickerId}`).then((r) => r.data);

export default api;
