import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions, getTickers } from '../services/api';

const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [tickers, setTickers] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, tk] = await Promise.all([getTransactions(), getTickers()]);
        setTxns(t);
        setTickers(tk);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tickerMap = Object.fromEntries(tickers.map((t) => [t.id, t]));

  const filtered = filter
    ? txns.filter((t) => t.ticker_id === Number(filter))
    : txns;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Tickers</option>
          {tickers.map((t) => (
            <option key={t.id} value={t.id}>{t.symbol}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/80 border-b border-gray-800">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Ticker</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Shares</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Fees</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-500">No transactions found.</td></tr>
            ) : (
              filtered.map((t) => {
                const ticker = tickerMap[t.ticker_id];
                const total = Number(t.quantity) * Number(t.price) + Number(t.fees);
                return (
                  <tr key={t.id} className="hover:bg-gray-800/40">
                    <td className="px-3 py-2">{t.date}</td>
                    <td className="px-3 py-2">
                      {ticker ? (
                        <Link to={`/ticker/${ticker.id}`} className="text-indigo-400 hover:underline">{ticker.symbol}</Link>
                      ) : (
                        <span className="text-gray-500">#{t.ticker_id}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === 'buy' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{Number(t.quantity).toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{fmt(t.price)}</td>
                    <td className="px-3 py-2 text-right">{fmt(t.fees)}</td>
                    <td className="px-3 py-2 text-right font-medium">{fmt(total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
