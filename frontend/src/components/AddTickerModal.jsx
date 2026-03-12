import { useState } from 'react';
import { createTicker, createTransaction } from '../services/api';

export default function AddTickerModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = ticker info, 2 = buy transaction
  const [symbol, setSymbol] = useState('');
  const [assetType, setAssetType] = useState('stock');
  const [tickerId, setTickerId] = useState(null);
  const [tickerName, setTickerName] = useState('');

  // Transaction fields
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fees, setFees] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTicker = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ticker = await createTicker({
        symbol: symbol.trim().toUpperCase(),
        asset_type: assetType,
      });
      setTickerId(ticker.id);
      setTickerName(ticker.name);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add ticker. Check symbol and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!quantity || !price) return;
    setLoading(true);
    setError('');
    try {
      await createTransaction({
        ticker_id: tickerId,
        type: 'buy',
        date,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        fees: parseFloat(fees) || 0,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => onSuccess();

  return (
    <Overlay onClose={onClose}>
      {step === 1 ? (
        <form onSubmit={handleAddTicker} className="space-y-4">
          <h2 className="text-lg font-bold">Add Ticker</h2>
          <p className="text-sm text-gray-400">Enter a stock, ETF, or crypto symbol.</p>

          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded p-2">{error}</p>}

          <div>
            <label className="block text-sm text-gray-300 mb-1">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. AAPL"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Type</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="stock">Stock</option>
              <option value="etf">ETF</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50">
              {loading ? 'Validating…' : 'Add Ticker'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <h2 className="text-lg font-bold">
            Record Buy — <span className="text-indigo-400">{symbol.toUpperCase()}</span>
          </h2>
          <p className="text-sm text-gray-400">{tickerName} added! Now record your first purchase (or skip).</p>

          {error && <p className="text-red-400 text-sm bg-red-900/20 rounded p-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Shares</label>
              <input type="number" step="any" min="0.00000001" value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Price per share</label>
              <input type="number" step="any" min="0.0001" value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Date</label>
              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Fees</label>
              <input type="number" step="any" min="0" value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleSkip}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700">
              Skip for now
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Transaction'}
            </button>
          </div>
        </form>
      )}
    </Overlay>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        {children}
      </div>
    </div>
  );
}
