export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
