import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import ToastContainer, { useToast } from './components/ToastContainer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import Causes from './pages/Causes';
import CreateCause from './pages/CreateCause';

function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/causes" element={<Causes />} />
          <Route path="/create-cause" element={<CreateCause />} />
        </Routes>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider apiKey={import.meta.env.VITE_XAMAN_API_KEY}>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;
