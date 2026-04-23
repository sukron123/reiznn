import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Product, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Gamepad2, CreditCard, ShieldCheck, Zap, Loader2, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'account' | 'topup'>('all');
  const [purchasingProduct, setPurchasingProduct] = useState<Product | null>(null);
  const [gameId, setGameId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const { user, profile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'products'), where('isActive', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.game.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async () => {
    if (!user || !purchasingProduct || !profile) return;
    
    if (profile.balance < purchasingProduct.price) {
      alert('Saldo tidak mencukupi. Silakan hubungi admin untuk top-up saldo.');
      return;
    }

    if (purchasingProduct.category === 'topup' && !gameId) {
      alert('Silakan masukkan ID Game kamu.');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: Partial<Order> = {
        userId: user.uid,
        userEmail: user.email!,
        productId: purchasingProduct.id,
        productName: purchasingProduct.name,
        amount: purchasingProduct.price,
        status: 'completed', // For demo/MVP, auto-complete
        paymentMethod: 'Balance',
        gameId: gameId || undefined,
        details: purchasingProduct.category === 'account' ? 'Check your email/profile for account details' : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      
      // Update user balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-purchasingProduct.price)
      });

      // Update stock
      await updateDoc(doc(db, 'products', purchasingProduct.id), {
        stock: increment(-1)
      });

      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setPurchasingProduct(null);
        setGameId('');
      }, 3000);
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2rem] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Top Up & Beli Akun Game <span className="text-blue-300">Instan.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg md:text-xl font-medium opacity-90"
          >
            Layanan terpercaya untuk ribuan gamer. Proses otomatis, harga terbaik, dan dukungan 24/7.
          </motion.p>
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="flex flex-wrap gap-4 pt-4"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-semibold">100% Aman</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold">Instan</span>
            </div>
          </motion.div>
        </div>
        <div className="absolute right-[-10%] top-[-10%] w-[60%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      </section>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm w-full md:w-auto">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Semua
          </button>
          <button 
            onClick={() => setSelectedCategory('account')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === 'account' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Akun
          </button>
          <button 
            onClick={() => setSelectedCategory('topup')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === 'topup' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Top Up
          </button>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari game atau paket..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium tracking-wide">Memuat produk terbaik untukmu...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p) => (
            <motion.div 
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="aspect-[4/3] bg-slate-100 relative">
                <img src={p.imageUrl || `https://placehold.co/400x300/f1f5f9/64748b?text=${p.game}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wider">
                  {p.category}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{p.game}</span>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-black text-slate-900 leading-none">
                    Rp {p.price.toLocaleString()}
                  </p>
                  <span className="text-xs font-medium text-slate-400">Stok: {p.stock}</span>
                </div>
                <button 
                  onClick={() => user ? setPurchasingProduct(p) : alert('Silakan masuk terlebih dahulu.')}
                  className="w-full bg-slate-900 group-hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Gamepad2 className="w-4 h-4" /> Beli Sekarang
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
           <p className="text-slate-400 font-medium">Ops! Tidak ada produk yang ditemukan.</p>
        </div>
      )}

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchasingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setPurchasingProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden"
            >
              {purchaseSuccess ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Pesanan Berhasil!</h2>
                    <p className="text-slate-500">Terima kasih atas pembelianmu. Cek riwayat pesanan untuk detailnya.</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Detail Pesanan</h2>
                    <button 
                      onClick={() => setPurchasingProduct(null)}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl flex gap-4">
                    <img src={purchasingProduct.imageUrl || 'https://placehold.co/100'} className="w-20 h-20 rounded-xl object-cover shadow-sm bg-white" alt="" />
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{purchasingProduct.game}</span>
                      <h3 className="font-bold text-slate-800">{purchasingProduct.name}</h3>
                      <p className="font-black text-blue-600">Rp {purchasingProduct.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {purchasingProduct.category === 'topup' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">ID Game / No HP</label>
                      <input 
                        type="text" 
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        placeholder="Masukkan ID Game kamu..."
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 font-medium"
                      />
                    </div>
                  )}

                  <div className="pt-4 space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Metode Pembayaran</span>
                        <span className="text-slate-900 font-bold flex items-center gap-1">
                           <CreditCard className="w-4 h-4 text-blue-500" /> Saldo GameStore
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-sm pb-2 border-b">
                        <span className="text-slate-500 font-medium">Saldo Kamu</span>
                        <span className={`font-bold ${profile!.balance < purchasingProduct.price ? 'text-red-500' : 'text-green-600'}`}>
                           Rp {profile?.balance.toLocaleString()}
                        </span>
                     </div>
                  </div>

                  <button 
                    disabled={isProcessing || profile!.balance < purchasingProduct.price}
                    onClick={handlePurchase}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 active:scale-95"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" /> Memproses...
                      </>
                    ) : (
                      <>
                        Konfirmasi Pembayaran
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
