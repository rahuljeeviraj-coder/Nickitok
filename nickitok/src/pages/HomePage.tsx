import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import { motion } from 'motion/react';
import { useLanguage } from '../Contexts';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { lang } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setPosts(docs);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <span className="text-4xl">👋</span>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Welcome to Nickitok</h3>
            <p className="text-sm text-gray-500 mt-2">Start following people to see their thoughts and videos here.</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </motion.div>
  );
};

export default HomePage;
