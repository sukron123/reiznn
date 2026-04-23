import React, { useEffect, useState, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { Send, User as UserIcon, Loader2, MessageSquare, Headphones } from 'lucide-react';
import { format } from 'date-fns';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // In this simplified version, each user has a private chat channel with ID being their UID
    const q = query(
      collection(db, 'chats', user.uid, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        chatId: user.uid,
        senderId: user.uid,
        text: newMessage,
        createdAt: new Date().toISOString() // Using ISO string as per blueprint, but usually serverTimestamp() is better for real production
      });
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-6 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl text-slate-900 tracking-tight">Customer Support</h1>
            <p className="text-xs text-green-500 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> CS sedangan online
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'} space-y-2`}>
                <div 
                  className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.senderId === user?.uid 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 px-12">
            <div className="bg-white p-6 rounded-full shadow-sm">
               <MessageSquare className="w-12 h-12 text-slate-400" />
            </div>
            <div>
               <p className="text-slate-600 font-bold">Belum ada percakapan</p>
               <p className="text-sm text-slate-500">Kirim pesan pertama kamu untuk memulai bantuan.</p>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan masalah kamu..."
            className="flex-grow px-6 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border-2 border-transparent focus:border-blue-500 transition-all font-medium text-slate-800"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
