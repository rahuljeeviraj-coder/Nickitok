import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  User as FirebaseUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './lib/firebase';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Sync with Firestore
        const userRef = doc(db, 'users', fUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUser(userSnap.data() as User);
        } else {
          const newUser: User = {
            id: fUser.uid,
            username: fUser.isAnonymous ? `guest_${fUser.uid.slice(0, 5)}` : (fUser.email?.split('@')[0] || 'user'),
            nickName: fUser.isAnonymous ? 'Guest Account' : (fUser.displayName || 'Nickitok User'),
            profileIcons: [fUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + fUser.uid],
            followersCount: 0,
            followingCount: 0,
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, { ...user, ...data }, { merge: true });
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, loginAsGuest, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Language Context
interface LanguageContextType {
  lang: 'en' | 'ta';
  setLang: (lang: 'en' | 'ta') => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
