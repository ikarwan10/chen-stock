const fmt = (v) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;

export default function SummaryBar({ summary }) {
  const { total_invested, total_market_value, total_pnl, total_pnl_pct } = summary;
  const isUp = Number(total_pnl) >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card label="Total Invested" value={fmt(total_invested)} />
      <Card label="Market Value" value={fmt(total_market_value)} />
      <Card
        label="Total P&L"
        value={fmt(total_pnl)}
        sub={pct(total_pnl_pct)}
        positive={isUp}
      />
      <Card
        label="Return"
        value={pct(total_pnl_pct)}
        positive={isUp}
      />
    </div>
  );
}

function Card({ label, value, sub, positive }) {
  const color =
    positive === undefined
      ? 'text-gray-100'
      : positive
        ? 'text-emerald-400'
        : 'text-red-400';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
      {sub && <p className={`text-sm mt-0.5 ${color}`}>{sub}</p>}
    </div>
  );
}
