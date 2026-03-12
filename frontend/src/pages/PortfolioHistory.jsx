import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolioHistory, getPortfolioDelta } from '../services/api';
import PnlChart from '../components/PnlChart';
import TimeRangeSelector from '../components/TimeRangeSelector';

const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
const clr = (v) => (Number(v) >= 0 ? 'text-emerald-400' : 'text-red-400');

export default function PortfolioHistory() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date-range delta (FR-703)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [delta, setDelta] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getPortfolioHistory(range);
      setData(res);
    } catch {
      setError('Failed to load portfolio history.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelta = async () => {
    if (!startDate || !endDate) return;
    try {
      const res = await getPortfolioDelta(startDate, endDate);
      setDelta(res);
    } catch {
      setDelta({ error: 'Could not compute delta for those dates.' });
    }
  };

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
        <button onClick={fetchData} className="ml-3 underline hover:text-red-100">Retry</button>
      </div>
    );
  }

  const valueLines = [
    { key: 'total_value', name: 'Market Value', color: '#818cf8' },
    { key: 'total_cost', name: 'Cost Basis', color: '#6b7280' },
  ];

  const pnlLines = [
    { key: 'net_pnl', name: 'Net P&L', color: '#34d399' },
    { key: 'daily_change', name: 'Daily Change', color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-bold">Portfolio History</h1>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      {/* Value vs Cost chart (FR-702) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Value vs. Cost Basis</h2>
        <PnlChart data={data.chart_data} lines={valueLines} />
      </div>

      {/* PNL chart */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">P&L Over Time</h2>
        <PnlChart data={data.chart_data} lines={pnlLines} />
      </div>

      {/* Summary table (FR-705) */}
      {data.summary && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Period Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Start Value</p>
              <p className="font-medium">{fmt(data.summary.start_value)}</p>
              <p className="text-xs text-gray-500">{data.summary.start_date}</p>
            </div>
            <div>
              <p className="text-gray-500">End Value</p>
              <p className="font-medium">{fmt(data.summary.end_value)}</p>
              <p className="text-xs text-gray-500">{data.summary.end_date}</p>
            </div>
            <div>
              <p className="text-gray-500">Net Change</p>
              <p className={`font-medium ${clr(data.summary.net_change)}`}>{fmt(data.summary.net_change)}</p>
              <p className={`text-sm ${clr(data.summary.net_change_pct)}`}>{pct(data.summary.net_change_pct)}</p>
            </div>
            <div>
              <p className="text-gray-500">Best / Worst Day</p>
              <p className="text-emerald-400 text-xs">Best: {data.summary.best_day.date} ({fmt(data.summary.best_day.change)})</p>
              <p className="text-red-400 text-xs">Worst: {data.summary.worst_day.date} ({fmt(data.summary.worst_day.change)})</p>
            </div>
          </div>
        </div>
      )}

      {/* Date-range delta (FR-703) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Compare Two Dates</h3>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button onClick={handleDelta}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
            Compare
          </button>
        </div>
        {delta && !delta.error && (
          <div className="flex gap-6 text-sm mt-2">
            <div><span className="text-gray-500">Start:</span> {fmt(delta.start_value)} <span className="text-gray-500 text-xs">({delta.start_date})</span></div>
            <div><span className="text-gray-500">End:</span> {fmt(delta.end_value)} <span className="text-gray-500 text-xs">({delta.end_date})</span></div>
            <div><span className="text-gray-500">Change:</span> <span className={clr(delta.net_change)}>{fmt(delta.net_change)} ({pct(delta.net_change_pct)})</span></div>
          </div>
        )}
        {delta?.error && <p className="text-red-400 text-sm">{delta.error}</p>}
      </div>
    </div>
  );
}
