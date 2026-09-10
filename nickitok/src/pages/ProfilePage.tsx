import React, { useState } from 'react';
import { useAuth, useLanguage } from '../Contexts';
import { EN_TRANSLATIONS, TA_TRANSLATIONS } from '../constants';
import { motion } from 'motion/react';
import { Settings, Grid, Bookmark, AtSign, Calendar, Edit3, LogOut, ChevronRight } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const t = lang === 'en' ? EN_TRANSLATIONS : TA_TRANSLATIONS;
  const [tab, setTab] = useState<'posts' | 'saved'>('posts');

  if (!user) return null;

  const stats = [
    { label: t.nicks, value: '42' },
    { label: lang === 'en' ? 'Followers' : 'தொடர்பவர்கள்', value: user.followersCount },
    { label: lang === 'en' ? 'Following' : 'தொடர்கிறீர்கள்', value: user.followingCount },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen"
    >
      {/* Header Info */}
      <div className="px-6 pt-8 pb-6 flex flex-col items-center">
        <div className="relative mb-6">
           <div className="w-32 h-32 rounded-[2.5rem] bg-pink-100 overflow-hidden ring-4 ring-pink-50 shadow-2xl">
              <img src={user.profileIcons[0]} className="w-full h-full object-cover" alt="Profile" />
           </div>
           <button className="absolute bottom-1 -right-1 p-3 bg-pink-600 text-white rounded-2xl shadow-lg border-4 border-white active:scale-90 transition-all">
              <Edit3 size={18} />
           </button>
        </div>

        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{user.nickName}</h2>
        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-4">
           <AtSign size={14} className="text-pink-600" /> {user.username}
        </div>

        <p className="text-center text-gray-500 text-sm max-w-xs leading-relaxed mb-8 px-4 italic">
           {user.bio || "Crafting digital experiences in Nickitok. Coffee lover and tech enthusiast."}
        </p>

        {/* Stats */}
        <div className="flex w-full items-center justify-center gap-12 mb-8">
           {stats.map((s, i) => (
             <div key={i} className="flex flex-col items-center">
                <span className="text-2xl font-black text-gray-900">{s.value}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
             </div>
           ))}
        </div>

        {/* Settings Buttons */}
        <div className="w-full space-y-2">
           <button className="w-full flex items-center justify-between p-5 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all group">
              <div className="flex items-center gap-4 text-gray-700 font-bold">
                 <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                    <Settings size={20} />
                 </div>
                 {t.settings}
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
           </button>

           <button 
             onClick={logout}
             className="w-full flex items-center justify-between p-5 bg-pink-50 rounded-3xl hover:bg-pink-100 transition-all group"
           >
              <div className="flex items-center gap-4 text-pink-600 font-bold">
                 <div className="p-2 bg-white rounded-xl shadow-sm">
                    <LogOut size={20} />
                 </div>
                 {t.logout}
              </div>
              <ChevronRight size={18} className="text-pink-300 group-hover:text-pink-500 transition-colors" />
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={() => setTab('posts')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${tab === 'posts' ? 'border-b-4 border-pink-600 text-pink-600' : 'text-gray-400'}`}
        >
          <Grid size={20} />
        </button>
        <button 
          onClick={() => setTab('saved')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${tab === 'saved' ? 'border-b-4 border-pink-600 text-pink-600' : 'text-gray-400'}`}
        >
          <Bookmark size={20} />
        </button>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto pb-4 px-1">
        <div className="grid grid-cols-3 gap-1">
          {tab === 'posts' ? (
            <div className="col-span-3 py-20 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <Grid size={32} />
               </div>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No Posts Yet</p>
            </div>
          ) : (
            <div className="col-span-3 py-20 text-center">
               <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                  <Bookmark size={32} />
               </div>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No Saved Items</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
