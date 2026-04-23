import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MessageSquare, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">GameStore</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">Beranda</Link>
            {user && (
              <>
                <Link to="/orders" className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1">
                  <User className="w-4 h-4" /> Pesanan
                </Link>
                <Link to="/chat" className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> Support
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">{profile?.displayName}</span>
                  <span className="text-xs text-blue-600 font-medium">Rp {profile?.balance?.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
