const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
const clr = (v) => (Number(v) >= 0 ? 'text-emerald-400' : 'text-red-400');

const LABELS = {
  daily: 'Day',
  weekly: 'Week',
  monthly: 'Month',
  ytd: 'YTD',
};

export default function Scorecard({ scorecard }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Object.entries(LABELS).map(([key, label]) => {
        const data = scorecard[key] || { change: '0', change_pct: '0' };
        const val = Number(data.change);
        const valPct = Number(data.change_pct);
        return (
          <div
            key={key}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-lg font-semibold ${clr(val)}`}>{fmt(val)}</p>
            <p className={`text-sm ${clr(valPct)}`}>{pct(valPct)}</p>
          </div>
        );
      })}
    </div>
  );
}
