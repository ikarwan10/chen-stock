import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, refreshQuotes, deleteTicker, getPortfolioHistory } from '../services/api';
import SummaryBar from '../components/SummaryBar';
import HoldingsTable from '../components/HoldingsTable';
import AddTickerModal from '../components/AddTickerModal';
import EditTickerModal from '../components/EditTickerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import PnlChart from '../components/PnlChart';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editTicker, setEditTicker] = useState(null);
  const [deletingTicker, setDeletingTicker] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const [res, hist] = await Promise.all([
        getDashboard(),
        getPortfolioHistory('3M').catch(() => ({ chart_data: [] })),
      ]);
      setData(res);
      setChartData(hist.chart_data || []);
    } catch (err) {
      setError('Failed to load dashboard. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshQuotes();
      await fetchDashboard();
    } catch {
      // silent — stale data still visible
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTicker) return;
    try {
      await deleteTicker(deletingTicker.ticker_id);
      setDeletingTicker(null);
      await fetchDashboard();
    } catch {
      setError('Failed to remove ticker.');
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
        <button onClick={fetchDashboard} className="ml-3 underline hover:text-red-100">
          Retry
        </button>
      </div>
    );
  }

  const isEmpty = !data?.holdings?.length;

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh Quotes'}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Ticker
          </button>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <>
          <SummaryBar summary={data.summary} />
          <div className="flex gap-2 mb-4">
            <button onClick={() => navigate('/history')}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300">
              Portfolio History
            </button>
            <button onClick={() => navigate('/status')}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300">
              Financial Status
            </button>
            <button onClick={() => navigate('/transactions')}
              className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300">
              All Transactions
            </button>
          </div>
          <HoldingsTable
            holdings={data.holdings}
            onEdit={setEditTicker}
            onDelete={setDeletingTicker}
          />
          {chartData.length > 0 && (
            <div className="mt-6 space-y-2">
              <h2 className="text-lg font-semibold">Portfolio P&L (3M)</h2>
              <PnlChart data={chartData} />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAdd && (
        <AddTickerModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchDashboard(); }}
        />
      )}
      {editTicker && (
        <EditTickerModal
          ticker={editTicker}
          onClose={() => setEditTicker(null)}
          onSuccess={() => { setEditTicker(null); fetchDashboard(); }}
        />
      )}
      {deletingTicker && (
        <ConfirmDialog
          title="Remove Ticker"
          message={`Remove ${deletingTicker.symbol} from your portfolio? This will delete all transactions for this ticker.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeletingTicker(null)}
        />
      )}
    </>
  );
}
