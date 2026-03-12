import { useState } from 'react';
import { updateTicker, createTransaction } from '../services/api';

export default function EditTickerModal({ ticker, onClose, onSuccess }) {
  const [tab, setTab] = useState('buy'); // 'info' or 'buy'
  const [name, setName] = useState(ticker.name || '');
  const [assetType, setAssetType] = useState('stock');

  // Buy transaction fields
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fees, setFees] = useState('0');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateTicker(ticker.ticker_id, { name, asset_type: assetType });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update ticker.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuy = async (e) => {
    e.preventDefault();
    if (!quantity || !price) return;
    setLoading(true);
    setError('');
    try {
      await createTransaction({
        ticker_id: ticker.ticker_id,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold mb-1">
          Edit — <span className="text-indigo-400">{ticker.symbol}</span>
        </h2>
        <p className="text-sm text-gray-400 mb-4">{ticker.name}</p>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-4 bg-gray-800 rounded-lg p-1">
          <TabBtn active={tab === 'buy'} onClick={() => setTab('buy')}>Add Buy</TabBtn>
          <TabBtn active={tab === 'info'} onClick={() => setTab('info')}>Edit Info</TabBtn>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 rounded p-2 mb-3">{error}</p>}

        {tab === 'buy' ? (
          <form onSubmit={handleAddBuy} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Shares" type="number" step="any" min="0.00000001"
                value={quantity} onChange={setQuantity} required />
              <Field label="Price per share" type="number" step="any" min="0.0001"
                value={price} onChange={setPrice} required />
              <Field label="Date" type="date" value={date} onChange={setDate} required />
              <Field label="Fees" type="number" step="any" min="0" value={fees} onChange={setFees} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CancelBtn onClick={onClose} />
              <SubmitBtn loading={loading} label="Save Buy" />
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdateInfo} className="space-y-3">
            <Field label="Display name" value={name} onChange={setName} />
            <div>
              <label className="block text-sm text-gray-300 mb-1">Type</label>
              <select value={assetType} onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="stock">Stock</option>
                <option value="etf">ETF</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CancelBtn onClick={onClose} />
              <SubmitBtn loading={loading} label="Save" />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
        active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
      }`}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...props} />
    </div>
  );
}

function CancelBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700">
      Cancel
    </button>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50">
      {loading ? 'Saving…' : label}
    </button>
  );
}
