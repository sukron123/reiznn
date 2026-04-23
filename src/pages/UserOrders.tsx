import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const UserOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ords);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-100';
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'failed': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-white p-3 rounded-2xl border shadow-sm">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Pesanan</h1>
          <p className="text-slate-500 font-medium">Lacak semua pembelian dan status akun game kamu.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white h-24 rounded-2xl border animate-pulse" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                  {order.productName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg">{order.productName}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                    {order.gameId && <span>• ID: <span className="text-slate-800 font-bold">{order.gameId}</span></span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                    <p className="text-xl font-black text-slate-900">Rp {order.amount.toLocaleString()}</p>
                 </div>
                 <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
             <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Belum ada pesanan</h2>
          <p className="text-slate-500 mt-2">Mulai petualanganmu dengan membeli produk game pertama.</p>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
