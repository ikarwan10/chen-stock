import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
const clr = (v) => (Number(v) >= 0 ? 'text-emerald-400' : 'text-red-400');

const SORT_KEYS = ['symbol', 'quantity', 'avg_cost', 'current_price', 'market_value', 'gain_loss', 'gain_loss_pct', 'day_change_pct'];

export default function HoldingsTable({ holdings, onEdit, onDelete }) {
  const [sortKey, setSortKey] = useState('symbol');
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();

  const sorted = [...holdings].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    av = Number(av) || av;
    bv = Number(bv) || bv;
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    if (!SORT_KEYS.includes(key)) return;
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const thClass = (key) =>
    `px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none hover:text-indigo-400 ${
      sortKey === key ? 'text-indigo-400' : 'text-gray-400'
    }`;

  const arrow = (key) => (sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : '');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-900/80 border-b border-gray-800">
          <tr>
            <th className={thClass('symbol')} onClick={() => toggleSort('symbol')}>
              Ticker{arrow('symbol')}
            </th>
            <th className={thClass('quantity')} onClick={() => toggleSort('quantity')}>
              Shares{arrow('quantity')}
            </th>
            <th className={thClass('avg_cost')} onClick={() => toggleSort('avg_cost')}>
              Avg Cost{arrow('avg_cost')}
            </th>
            <th className={thClass('current_price')} onClick={() => toggleSort('current_price')}>
              Price{arrow('current_price')}
            </th>
            <th className={thClass('market_value')} onClick={() => toggleSort('market_value')}>
              Market Value{arrow('market_value')}
            </th>
            <th className={thClass('gain_loss')} onClick={() => toggleSort('gain_loss')}>
              Gain / Loss{arrow('gain_loss')}
            </th>
            <th className={thClass('gain_loss_pct')} onClick={() => toggleSort('gain_loss_pct')}>
              G/L %{arrow('gain_loss_pct')}
            </th>
            <th className={thClass('day_change_pct')} onClick={() => toggleSort('day_change_pct')}>
              Day{arrow('day_change_pct')}
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sorted.map((h) => (
            <tr key={h.ticker_id} className="hover:bg-gray-800/40 transition-colors cursor-pointer" onClick={() => navigate(`/ticker/${h.ticker_id}`)}>
              <td className="px-3 py-3 font-medium">
                <span className="text-indigo-400 hover:underline">{h.symbol}</span>
                <span className="ml-2 text-gray-500 text-xs">{h.name}</span>
              </td>
              <td className="px-3 py-3">{Number(h.quantity).toFixed(2)}</td>
              <td className="px-3 py-3">{fmt(h.avg_cost)}</td>
              <td className="px-3 py-3">{fmt(h.current_price)}</td>
              <td className="px-3 py-3 font-medium">{fmt(h.market_value)}</td>
              <td className={`px-3 py-3 font-medium ${clr(h.gain_loss)}`}>
                {fmt(h.gain_loss)}
              </td>
              <td className={`px-3 py-3 ${clr(h.gain_loss_pct)}`}>
                {pct(h.gain_loss_pct)}
              </td>
              <td className={`px-3 py-3 ${clr(h.day_change_pct)}`}>
                {pct(h.day_change_pct)}
              </td>
              <td className="px-3 py-3 text-right">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(h); }}
                  className="text-gray-400 hover:text-indigo-400 p-1"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(h); }}
                  className="text-gray-400 hover:text-red-400 p-1 ml-1"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
