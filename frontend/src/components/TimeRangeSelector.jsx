const RANGES = ['1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

export default function TimeRangeSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            value === r
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
