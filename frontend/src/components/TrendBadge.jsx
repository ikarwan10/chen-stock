const ICONS = {
  Improving: '↑',
  Declining: '↓',
  Stable: '→',
};

const COLORS = {
  Improving: 'bg-emerald-900/40 text-emerald-400 border-emerald-700',
  Declining: 'bg-red-900/40 text-red-400 border-red-700',
  Stable: 'bg-gray-800 text-gray-400 border-gray-700',
};

export default function TrendBadge({ trend }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${COLORS[trend] || COLORS.Stable}`}
    >
      {ICONS[trend] || '→'} {trend}
    </span>
  );
}
