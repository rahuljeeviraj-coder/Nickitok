import React, { useState } from 'react';
import { Search, TrendingUp, Users, Hash, AppWindow, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../Contexts';
import { EN_TRANSLATIONS, TA_TRANSLATIONS } from '../constants';

const ExplorePage: React.FC = () => {
  const { lang } = useLanguage();
  const t = lang === 'en' ? EN_TRANSLATIONS : TA_TRANSLATIONS;
  const [activeCategory, setActiveCategory] = useState('trending');

  const categories = [
    { id: 'trending', icon: TrendingUp, label: lang === 'en' ? 'Trending' : 'ட்ரெண்டிங்' },
    { id: 'apps', icon: AppWindow, label: t.apps },
    { id: 'ai', icon: Sparkles, label: 'Gen AI' },
    { id: 'tunes', icon: Play, label: 'Tunes' },
  ];

  const trends = [
    { tag: '#NickitokVibes', posts: '12.4k' },
    { tag: '#TamilNadu', posts: '8.2k' },
    { tag: '#GeminiMagic', posts: '5.1k' },
    { tag: '#AppShare', posts: '3.9k' },
    { tag: '#DailyThoughts', posts: '2.8k' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24"
    >
      {/* Search Input */}
      <div className="relative mb-8 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={lang === 'en' ? "Search everything..." : "தேடுக..."}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-5 pl-16 pr-6 focus:border-pink-500 focus:bg-white focus:shadow-xl focus:shadow-pink-50 transition-all outline-none text-sm font-bold"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-[1.8rem] whitespace-nowrap transition-all border-2 ${
              activeCategory === cat.id 
              ? 'bg-pink-600 border-pink-600 text-white shadow-xl shadow-pink-100' 
              : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
            }`}
          >
            <cat.icon size={20} />
            <span className="font-black text-xs uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content Rendering based on category */}
      {activeCategory === 'trending' ? (
        <div className="space-y-4">
           <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-black text-gray-900 tracking-tighter">Popular Today</h3>
              <button className="text-pink-600 font-bold text-xs uppercase tracking-widest">See All</button>
           </div>

           {trends.map((trend, i) => (
             <button key={i} className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all group border border-transparent hover:border-gray-200">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-pink-600 shadow-sm font-black text-sm">
                      {i + 1}
                   </div>
                   <div className="text-left">
                      <p className="font-black text-gray-900 leading-tight">{trend.tag}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{trend.posts} posts</p>
                   </div>
                </div>
                <Hash size={18} className="text-gray-300 group-hover:text-pink-600 transition-colors" />
             </button>
           ))}
        </div>
      ) : (() => {
        const currentCategory = categories.find((c) => c.id === activeCategory);
        const CategoryIcon = currentCategory ? currentCategory.icon : Sparkles;
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                 <CategoryIcon size={32} className="text-pink-600" />
             </div>
             <h3 className="font-black text-lg text-gray-900">Exploring {activeCategory.toUpperCase()}</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 px-12">New features and content coming soon to this section.</p>
          </div>
        );
      })()}
    </motion.div>
  );
};

export default ExplorePage;
