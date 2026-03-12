import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTickerHistory, getTickerStatus } from '../services/api';
import PnlChart from '../components/PnlChart';
import TimeRangeSelector from '../components/TimeRangeSelector';
import TransactionForm from '../components/TransactionForm';
import TrendBadge from '../components/TrendBadge';
import Scorecard from '../components/Scorecard';

const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
const clr = (v) => (Number(v) >= 0 ? 'text-emerald-400' : 'text-red-400');

export default function TickerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [status, setStatus] = useState(null);
  const [range, setRange] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [h, s] = await Promise.all([
        getTickerHistory(id, range),
        getTickerStatus(id),
      ]);
      setHistory(h);
      setStatus(s);
    } catch {
      setError('Failed to load ticker data.');
    } finally {
      setLoading(false);
    }
  }, [id, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
        {error}
        <button onClick={() => navigate('/')} className="ml-3 underline hover:text-red-100">Back to Dashboard</button>
      </div>
    );
  }

  const { current, transactions, chart_data } = history;

  const valueLines = [
    { key: 'market_value', name: 'Market Value', color: '#818cf8' },
    { key: 'cost_basis', name: 'Cost Basis', color: '#6b7280' },
  ];

  const pnlLines = [
    { key: 'unrealized_pnl', name: 'Unrealized P&L', color: '#34d399' },
    { key: 'realized_pnl', name: 'Realized P&L', color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-bold">
            <span className="text-indigo-400">{history.symbol}</span>
            <span className="ml-2 text-gray-400 text-lg font-normal">{history.name}</span>
          </h1>
        </div>
        {status && <TrendBadge trend={status.trend} />}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card label="Shares" value={Number(current.quantity).toFixed(2)} />
        <Card label="Avg Cost" value={fmt(current.avg_cost)} />
        <Card label="Price" value={fmt(current.current_price)} />
        <Card label="Market Value" value={fmt(current.market_value)} />
        <Card label="Net P&L" value={fmt(current.net_pnl)} sub={pct(Number(current.net_pnl) / Math.max(Number(current.total_cost), 1) * 100)} positive={Number(current.net_pnl) >= 0} />
      </div>

      {/* Scorecard */}
      {status?.scorecard && <Scorecard scorecard={status.scorecard} />}

      {/* Time range + Value chart (FR-603) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Value Over Time</h2>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>
        <PnlChart data={chart_data} lines={valueLines} />
      </div>

      {/* PNL Timeline (FR-604) */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">P&L Timeline</h2>
        <PnlChart data={chart_data} lines={pnlLines} />
      </div>

      {/* Transaction form */}
      <TransactionForm tickerId={Number(id)} symbol={history.symbol} onSuccess={fetchData} />

      {/* Transaction list (FR-602) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/80 border-b border-gray-800">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Shares</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Fees</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Running Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {transactions.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No transactions recorded yet.</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-800/40">
                  <td className="px-3 py-2">{t.date}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === 'buy' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{Number(t.quantity).toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{fmt(t.price)}</td>
                  <td className="px-3 py-2 text-right">{fmt(t.fees)}</td>
                  <td className="px-3 py-2 text-right font-medium">{Number(t.running_qty).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Position details (FR-806) */}
      {status?.position && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Position Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500">Day High:</span> <span className="ml-1">{fmt(status.position.day_high)}</span></div>
            <div><span className="text-gray-500">Day Low:</span> <span className="ml-1">{fmt(status.position.day_low)}</span></div>
            <div><span className="text-gray-500">Volume:</span> <span className="ml-1">{Number(status.position.volume).toLocaleString()}</span></div>
            <div><span className="text-gray-500">% of Portfolio:</span> <span className="ml-1">{Number(status.pct_of_portfolio).toFixed(1)}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, sub, positive }) {
  const color = positive === undefined ? 'text-gray-100' : positive ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      {sub && <p className={`text-sm mt-0.5 ${color}`}>{sub}</p>}
    </div>
  );
}
