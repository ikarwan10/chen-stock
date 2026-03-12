import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const fmt = (v) => `$${Number(v).toLocaleString()}`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-lg">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function PnlChart({ data, lines, height = 300 }) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-900 border border-gray-800 rounded-xl text-gray-500">
        No chart data yet. Snapshots are recorded daily.
      </div>
    );
  }

  const defaultLines = [
    { key: 'total_value', name: 'Market Value', color: '#818cf8' },
    { key: 'total_cost', name: 'Cost Basis', color: '#6b7280' },
    { key: 'net_pnl', name: 'Net P&L', color: '#34d399' },
  ];

  const chartLines = lines || defaultLines;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={fmt}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: 12 }}
          />
          {chartLines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
