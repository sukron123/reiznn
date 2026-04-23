import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Github, Chrome, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center space-y-4 mb-8">
        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Selamat Datang</h1>
        <p className="text-slate-500">Masuk untuk mulai berbelanja akun dan top-up game favoritmu.</p>
      </div>

      <button
        onClick={signIn}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all"
      >
        <Chrome className="w-5 h-5 text-red-500" />
        Masuk dengan Google
      </button>

      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-xs text-slate-400">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
};

export default Login;
