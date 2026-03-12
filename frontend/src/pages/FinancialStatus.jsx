import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolioStatus } from '../services/api';
import TrendBadge from '../components/TrendBadge';
import Scorecard from '../components/Scorecard';

const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
const clr = (v) => (Number(v) >= 0 ? 'text-emerald-400' : 'text-red-400');

export default function FinancialStatus() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await getPortfolioStatus();
        setData(res);
      } catch {
        setError('Failed to load financial status.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Financial Status</h1>
        </div>
        <TrendBadge trend={data.trend} />
      </div>

      {/* Summary cards (FR-802) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SumCard label="Current Value" value={fmt(data.current_value)} />
        <SumCard label="Total Invested" value={fmt(data.total_invested)} />
        <SumCard label="Unrealized P&L" value={fmt(data.unrealized_pnl)} sub={pct(data.unrealized_pnl_pct)} positive={Number(data.unrealized_pnl) >= 0} />
        <SumCard label="Net P&L" value={fmt(data.net_pnl)} sub={pct(data.net_pnl_pct)} positive={Number(data.net_pnl) >= 0} />
      </div>

      {/* Scorecard (FR-804) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Performance Scorecard</h2>
        <Scorecard scorecard={data.scorecard} />
      </div>

      {/* Per-ticker breakdown (FR-805) */}
      {data.breakdown?.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Ticker Breakdown</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Ticker</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Market Value</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Net P&L</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Unrealized</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Realized</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">% Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {data.breakdown.map((t) => (
                  <tr key={t.ticker_id} className="hover:bg-gray-800/40">
                    <td className="px-3 py-2">
                      <Link to={`/ticker/${t.ticker_id}`} className="text-indigo-400 hover:underline font-medium">
                        {t.symbol}
                      </Link>
                      <span className="ml-2 text-gray-500 text-xs">{t.name}</span>
                    </td>
                    <td className="px-3 py-2 text-right">{fmt(t.market_value)}</td>
                    <td className={`px-3 py-2 text-right font-medium ${clr(t.net_pnl)}`}>{fmt(t.net_pnl)}</td>
                    <td className={`px-3 py-2 text-right ${clr(t.unrealized_pnl)}`}>{fmt(t.unrealized_pnl)}</td>
                    <td className={`px-3 py-2 text-right ${clr(t.realized_pnl)}`}>{fmt(t.realized_pnl)}</td>
                    <td className="px-3 py-2 text-right">{Number(t.pct_of_portfolio).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SumCard({ label, value, sub, positive }) {
  const color = positive === undefined ? 'text-gray-100' : positive ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
      {sub && <p className={`text-sm mt-0.5 ${color}`}>{sub}</p>}
    </div>
  );
}
