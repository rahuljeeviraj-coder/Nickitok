import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, LanguageProvider, useLanguage } from './Contexts';
import { EN_TRANSLATIONS, TA_TRANSLATIONS } from './constants';
import { Home, Search, CirclePlus, MessageSquare, User, Sparkles, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import NicksPage from './pages/NicksPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';

const AppContent: React.FC = () => {
  const { user, loading, login, loginAsGuest } = useAuth();
  const { lang, setLang } = useLanguage();
  const t = lang === 'en' ? EN_TRANSLATIONS : TA_TRANSLATIONS;
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-3xl font-black text-pink-600 tracking-tighter"
        >
          Nickitok
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 bg-gray-50">
        <h1 className="text-6xl font-black text-pink-600 mb-2 tracking-tighter">Nickitok</h1>
        <p className="text-gray-500 mb-8 text-center max-w-xs font-medium">
          The next generation social platform.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={login}
            className="flex items-center justify-center gap-3 bg-white border border-gray-200 px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 font-medium text-gray-700"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            {t.login}
          </button>
          
          <button 
            onClick={loginAsGuest}
            className="w-full py-4 text-gray-400 text-sm font-bold hover:text-pink-600 transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: Home, label: t.home, path: '/' },
    { icon: Search, label: t.explore, path: '/explore' },
    { icon: CirclePlus, label: t.addPost, path: '/create', primary: true },
    { icon: MessageSquare, label: t.community, path: '/community' },
    { icon: User, label: t.profile, path: '/profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-gray-100">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-3xl font-black text-pink-600 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
          Nickitok
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <Languages size={20} />
          </button>
          <button 
             onClick={() => navigate('/nicks')}
             className="p-2 bg-pink-100 text-pink-600 rounded-full transition-colors"
          >
            <Sparkles size={18} fill="currentColor" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/nicks" element={<NicksPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/create" element={<CreatePostPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 py-2 flex items-center justify-between z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                item.primary 
                ? 'bg-pink-600 text-white -translate-y-4 shadow-lg shadow-pink-200' 
                : isActive ? 'text-pink-600 scale-110' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon size={item.primary ? 28 : 24} strokeWidth={isActive ? 2.5 : 2} />
              {!item.primary && <span className="text-[10px] mt-1 font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
