import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, orderBy, getDocs, limit } from 'firebase/firestore';
import { Product, Order, UserProfile, ChatMessage } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie 
} from 'recharts';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, Plus, 
  Trash2, Edit2, Check, X, Loader2, DollarSign, MessageCircle, ArrowUpRight, ArrowDownRight, Clock, AlertCircle, Gamepad2
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { increment as fsIncrement } from 'firebase/firestore';

const Admin: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'chats'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', game: '', category: 'topup', price: 0, stock: 100, isActive: true, description: ''
  });

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
      setLoading(false);
    });

    return () => { unsubProducts(); unsubOrders(); unsubUsers(); };
  }, []);

  const stats = {
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalUsers: users.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length
  };

  // Mock revenue chart data
  const chartData = [
    { name: 'Mon', rev: 4000 },
    { name: 'Tue', rev: 3000 },
    { name: 'Wed', rev: 2000 },
    { name: 'Thu', rev: 2780 },
    { name: 'Fri', rev: 1890 },
    { name: 'Sat', rev: 2390 },
    { name: 'Sun', rev: 3490 },
  ];

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewProduct({ name: '', game: '', category: 'topup', price: 0, stock: 100, isActive: true, description: '' });
    } catch (error) { console.error(error); }
  };

  const toggleProductStatus = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'products', id), { isActive: !current });
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date().toISOString() });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="p-4 bg-slate-900 rounded-2xl text-white mb-6">
           <h2 className="text-xl font-black tracking-tight">Admin Hub</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Console v1.0.0</p>
        </div>
        <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </button>
        <button onClick={() => setView('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Package className="w-5 h-5" /> Produk
        </button>
        <button onClick={() => setView('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
          <ShoppingCart className="w-5 h-5" /> Pesanan
        </button>
        <button onClick={() => setView('customers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'customers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Users className="w-5 h-5" /> Pengguna
        </button>
        <button onClick={() => setView('chats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${view === 'chats' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
          <MessageCircle className="w-5 h-5" /> Chat Support
        </button>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-grow space-y-8 animate-in fade-in duration-500">
        
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Revenue" value={`Rp ${stats.revenue.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-green-600" />} trend="+12.5%" />
              <StatCard label="Total User" value={stats.totalUsers.toString()} icon={<Users className="w-6 h-6 text-blue-600" />} trend="+4.2%" />
              <StatCard label="Total Produk" value={stats.totalProducts.toString()} icon={<Package className="w-6 h-6 text-orange-600" />} />
              <StatCard label="Pending Order" value={stats.pendingOrders.toString()} icon={<Clock className="w-6 h-6 text-red-600" />} color="bg-red-50" />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-xl text-slate-800">Laporan Penjualan (Mingguan)</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border px-3 py-1.5 rounded-full uppercase tracking-widest leading-none">
                     <TrendingUp className="w-3.5 h-3.5" /> 24% Improvement
                  </div>
               </div>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="rev" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-green-500" /> Recent Success Orders
                  </h3>
                  <div className="space-y-4">
                     {orders.filter(o => o.status === 'completed').slice(0, 5).map(order => (
                       <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-800">{order.productName}</span>
                             <span className="text-xs text-slate-500">{order.userEmail}</span>
                          </div>
                          <span className="font-black text-sm text-green-600">+ Rp {order.amount.toLocaleString()}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" /> Urgent: Pending Orders
                  </h3>
                  <div className="space-y-4">
                     {orders.filter(o => o.status === 'pending').slice(0, 5).map(order => (
                       <div key={order.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-red-900">{order.productName}</span>
                             <span className="text-xs text-red-600/70">{format(new Date(order.createdAt), 'HH:mm')}</span>
                          </div>
                          <button onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-white text-green-600 p-2 rounded-xl border border-green-200 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                             <Check className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                     {orders.filter(o => o.status === 'pending').length === 0 && <p className="text-center py-6 text-slate-400 font-medium">Bagus! Tidak ada antrian.</p>}
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Produk</h2>
                <p className="text-slate-500 font-medium text-sm">Kelola katalog akun dan top-up kamu di sini.</p>
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                <Plus className="w-5 h-5" /> Produk Baru
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nama Produk</label>
                      <input 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all" 
                        placeholder="Contoh: 120 Diamonds Free Fire" 
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nama Game</label>
                      <input 
                        required
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all" 
                        placeholder="Contoh: Mobile Legends" 
                        value={newProduct.game}
                        onChange={e => setNewProduct({...newProduct, game: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Kategori</label>
                      <select 
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all"
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                      >
                        <option value="topup">Top Up</option>
                        <option value="account">Akun</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Harga (Rp)</label>
                      <input 
                        required
                        type="number"
                        className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-mono" 
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value)})}
                      />
                   </div>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200">Simpan Produk</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold">Batal</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between gap-6 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold overflow-hidden shadow-inner border border-slate-100">
                        {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <Gamepad2 className="w-7 h-7" />}
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800">{p.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.category === 'topup' ? 'border-orange-100 bg-orange-50 text-orange-600' : 'border-blue-100 bg-blue-50 text-blue-600'} uppercase`}>{p.category}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{p.game} • Rp {p.price.toLocaleString()} • Stok: {p.stock}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => toggleProductStatus(p.id, p.isActive)} className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${p.isActive ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white'}`}>
                        {p.isActive ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                     </button>
                     <button onClick={() => deleteDoc(doc(db, 'products', p.id))} className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-600 transition-all">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Semua Transaksi</h2>
                <p className="text-slate-500 font-medium text-sm">Monitor semua aliran kas dan status pesanan.</p>
             </div>
             <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between gap-6 hover:shadow-sm transition-all text-sm">
                     <div className="flex flex-col gap-1 w-40">
                        <span className="font-bold text-slate-800 line-clamp-1">{order.productName}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{format(new Date(order.createdAt), 'dd MMM, HH:mm')}</span>
                     </div>
                     <div className="flex flex-col items-center w-40 text-center">
                        <span className="text-xs text-slate-500 font-medium">Pembeli</span>
                        <span className="font-bold text-slate-700 text-xs truncate w-full">{order.userEmail}</span>
                     </div>
                     <div className="w-32 text-right">
                        <span className="font-black text-slate-900">Rp {order.amount.toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {order.status === 'pending' ? (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, 'completed')} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold border border-green-100 hover:bg-green-600 hover:text-white transition-all">Complete</button>
                            <button onClick={() => updateOrderStatus(order.id, 'failed')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"><X className="w-4 h-4" /></button>
                          </>
                        ) : (
                          <span className={`px-4 py-2 rounded-xl font-bold border capitalize ${
                            order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                            order.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-400'
                          }`}>{order.status}</span>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'customers' && (
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Database Pengguna</h2>
                  <p className="text-slate-500 font-medium text-sm">Lihat aktivitas dan saldo setiap pelanggan.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {users.map(u => (
                   <div key={u.uid} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase">{u.displayName?.slice(0, 2)}</div>
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{u.displayName}</span>
                           <span className="text-xs text-slate-400">{u.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo</span>
                         <span className="font-black text-blue-600">Rp {u.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateDoc(doc(db, 'users', u.uid), { balance: fsIncrement(50000) })}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          +50k
                        </button>
                        <button 
                           onClick={() => updateDoc(doc(db, 'users', u.uid), { role: u.role === 'admin' ? 'user' : 'admin' })}
                           className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                             u.role === 'admin' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                           }`}
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {view === 'chats' && (
          <ChatManager users={users} />
        )}

      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color?: string; trend?: string }> = ({ label, value, icon, color = 'bg-white', trend }) => (
  <div className={`${color} p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all group`}>
    <div className="flex justify-between items-start">
      <div className="bg-slate-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {trend && <span className="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <div className="space-y-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
    </div>
  </div>
);

// Simplified Chat Manager for Admin
const ChatManager: React.FC<{ users: UserProfile[] }> = ({ users }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (!selectedChat) return;
    const q = query(collection(db, 'chats', selectedChat, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });
    return unsub;
  }, [selectedChat]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedChat) return;
    await addDoc(collection(db, 'chats', selectedChat, 'messages'), {
      chatId: selectedChat,
      senderId: 'ADMIN',
      text: reply,
      createdAt: new Date().toISOString()
    });
    setReply('');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex h-[600px] shadow-sm">
       <div className="w-1/3 border-r overflow-y-auto bg-slate-50/50">
          <div className="p-4 border-b bg-white">
             <h4 className="font-black text-slate-800">Support Inbox</h4>
          </div>
          {users.map(u => (
            <button key={u.uid} onClick={() => setSelectedChat(u.uid)} className={`w-full p-4 flex items-center gap-3 border-b hover:bg-white transition-all text-left ${selectedChat === u.uid ? 'bg-white border-l-4 border-l-blue-600' : ''}`}>
               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs shrink-0">{u.displayName?.slice(0, 2)}</div>
               <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-800 text-sm truncate">{u.displayName}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">{u.email}</span>
               </div>
            </button>
          ))}
       </div>
       <div className="flex-grow flex flex-col">
          {selectedChat ? (
            <>
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                 {messages.map(m => (
                   <div key={m.id} className={`flex ${m.senderId === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] text-sm px-4 py-2 rounded-2xl font-medium shadow-sm ${m.senderId === 'ADMIN' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                         {m.text}
                      </div>
                   </div>
                 ))}
              </div>
              <form onSubmit={handleReply} className="p-4 border-t flex gap-2">
                 <input value={reply} onChange={e => setReply(e.target.value)} className="flex-grow bg-slate-50 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-100" placeholder="Ketik balasan admin..." />
                 <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-bold shadow-lg shadow-slate-200">Send</button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-slate-400 font-medium">Pilih percakapan untuk membalas</div>
          )}
       </div>
    </div>
  );
};

export default Admin;
