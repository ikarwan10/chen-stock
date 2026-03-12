export default function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 max-w-md">
        <svg className="w-16 h-16 mx-auto text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Welcome to Chen's Stocks</h2>
        <p className="text-gray-400 mb-6">
          Track your investments, monitor live prices, and see your portfolio performance at a glance.
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Your First Ticker
        </button>
      </div>
    </div>
  );
}
