import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import UserOrders from './pages/UserOrders';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/orders" element={user ? <UserOrders /> : <Navigate to="/login" />} />
          <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/admin/*" element={isAdmin ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-white border-t py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} GameStore & TopUp Hub. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

