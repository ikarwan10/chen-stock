import { useState } from 'react';
import { createTransaction } from '../services/api';

export default function TransactionForm({ tickerId, symbol, onSuccess }) {
  const [type, setType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fees, setFees] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || !price) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createTransaction({
        ticker_id: tickerId,
        type,
        date,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        fees: parseFloat(fees) || 0,
      });
      setSuccess(`${type === 'buy' ? 'Buy' : 'Sell'} recorded!`);
      setQuantity('');
      setPrice('');
      setFees('0');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Record Transaction {symbol && <span className="text-indigo-400">— {symbol}</span>}
      </h3>

      {error && <p className="text-red-400 text-sm bg-red-900/20 rounded p-2">{error}</p>}
      {success && <p className="text-emerald-400 text-sm bg-emerald-900/20 rounded p-2">{success}</p>}

      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setType('buy')}
          className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
            type === 'buy' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setType('sell')}
          className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
            type === 'sell' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Shares</label>
          <input
            type="number"
            step="any"
            min="0.00000001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Price / share</label>
          <input
            type="number"
            step="any"
            min="0.0001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Fees</label>
          <input
            type="number"
            step="any"
            min="0"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
          type === 'buy'
            ? 'bg-emerald-600 hover:bg-emerald-500'
            : 'bg-red-600 hover:bg-red-500'
        }`}
      >
        {loading ? 'Saving…' : `Record ${type === 'buy' ? 'Buy' : 'Sell'}`}
      </button>
    </form>
  );
}
