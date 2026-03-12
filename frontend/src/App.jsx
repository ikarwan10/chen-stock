import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
