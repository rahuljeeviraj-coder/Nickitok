import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Message } from '../types';
import { useAuth, useLanguage } from '../Contexts';
import { EN_TRANSLATIONS, TA_TRANSLATIONS } from '../constants';
import MessageBubble from '../components/MessageBubble';
import { Send, Users } from 'lucide-react';
import { motion } from 'motion/react';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const t = lang === 'en' ? EN_TRANSLATIONS : TA_TRANSLATIONS;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(docs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        senderId: user.id,
        senderName: user.nickName,
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-140px)] bg-gray-50"
    >
      <div className="bg-white px-6 py-3 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
             <Users size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{t.community}</h2>
            <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 1.2k Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={lang === 'en' ? "Type something..." : "ஏதாவது தட்டச்சு செய்க..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800"
          />
          <button 
            type="submit"
            className="p-2 bg-pink-600 text-white rounded-xl shadow-md active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default CommunityPage;
