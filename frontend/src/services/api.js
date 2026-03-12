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

export default api;
