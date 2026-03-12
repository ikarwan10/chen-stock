import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TickerDetail from './pages/TickerDetail';
import PortfolioHistory from './pages/PortfolioHistory';
import FinancialStatus from './pages/FinancialStatus';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ticker/:id" element={<TickerDetail />} />
          <Route path="/history" element={<PortfolioHistory />} />
          <Route path="/status" element={<FinancialStatus />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
