import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, toggleFollow, isFollowing, toggleLike, hasLiked, repost } from '../lib/firebase';
import { Post } from '../types';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Music, UserPlus, UserCheck, Video as VideoIcon } from 'lucide-react';
import { useAuth } from '../Contexts';

const NickItem: React.FC<{ nick: Post; isActive: boolean }> = ({ nick, isActive }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMe = user?.id === nick.userId;

  useEffect(() => {
    if (user && !isMe) {
      isFollowing(user.id, nick.userId).then(setFollowing);
    }
    if (user) {
      hasLiked(nick.id, user.id).then(setLiked);
    }
  }, [user, nick.userId, isMe, nick.id]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(err => console.log("Playback blocked:", err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handleFollow = async () => {
    if (!user || isMe) return;
    try {
      await toggleFollow(user.id, nick.userId);
      setFollowing(!following);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const isNowLiked = await toggleLike(nick.id, user.id);
      setLiked(isNowLiked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async () => {
    if (!user) return;
    try {
      await repost(nick.id, user.id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full w-full nick-item relative group shrink-0">
      {/* Background Media */}
      {nick.videoUrl ? (
        <video 
          ref={videoRef}
          src={nick.videoUrl} 
          className="w-full h-full object-cover"
          loop
          playsInline
        />
      ) : nick.imageUrl ? (
        <img 
          src={nick.imageUrl} 
          className="w-full h-full object-cover opacity-80"
          alt="Nick"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
           <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <VideoIcon className="text-gray-600" size={32} />
              </div>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Media Unavailable</p>
           </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Interaction Bar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
         <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg bg-gray-200">
                <img src={nick.userAvatar} className="w-full h-full object-cover" alt={nick.userHandle} />
            </div>
            {!isMe && !following && (
              <button 
                onClick={handleFollow}
                className="absolute -bottom-2 translate-x-1/2 right-1/2 bg-pink-600 text-white rounded-full p-0.5 border border-white"
              >
                 <UserPlus size={14} />
              </button>
            )}
            {!isMe && following && (
               <div className="absolute -bottom-2 translate-x-1/2 right-1/2 bg-green-500 text-white rounded-full p-0.5 border border-white">
                  <UserCheck size={14} />
               </div>
            )}
         </div>

         <button 
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group/btn"
          >
            <div className={`p-3 backdrop-blur-md rounded-full transition-all active:scale-90 ${liked ? 'bg-pink-600' : 'bg-white/10 group-hover/btn:bg-white/20'}`}>
                <Heart size={26} className={`text-white ${liked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-white text-[10px] font-black">{nick.likes}</span>
         </button>

         <button className="flex flex-col items-center gap-1 group/btn">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover/btn:bg-white/20 transition-all active:scale-90">
                <MessageCircle size={26} className="text-white" />
            </div>
            <span className="text-white text-[10px] font-black">{nick.comments}</span>
         </button>

         <button 
            onClick={handleRepost}
            className="flex flex-col items-center gap-1 group/btn"
          >
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full group-hover/btn:bg-white/20 transition-all active:scale-90">
                <Share2 size={26} className="text-white" />
            </div>
            <span className="text-white text-[10px] font-black">{nick.reposts}</span>
         </button>
      </div>

      {/* Info Area */}
      <div className="absolute left-6 bottom-6 right-20">
         <h4 className="font-black text-white text-lg mb-1">@{nick.userHandle}</h4>
         <p className="text-white/90 text-sm line-clamp-2 font-medium mb-4">
            {nick.content}
         </p>
         <div className="flex items-center gap-2 overflow-hidden text-white/80">
            <Music size={14} className="flex-shrink-0 animate-spin-slow" />
            <div className="text-[10px] font-bold tracking-widest whitespace-nowrap overflow-hidden">
               <motion.div 
                 animate={{ x: [0, -100] }}
                 transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
               >
                 Original sound - {nick.userHandle} • {nick.userHandle} Special Vibes
               </motion.div>
            </div>
         </div>
      </div>
    </div>
  );
};

const NicksPage: React.FC = () => {
  const [nicks, setNicks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('type', '==', 'nick'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      setNicks(docs);
      if (docs.length > 0 && !activeId) {
        setActiveId(docs[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.getAttribute('data-id'));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.8, // Require 80% visibility to trigger playback
      }
    );

    const elements = containerRef.current?.querySelectorAll('.nick-wrapper');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [nicks]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
       <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (nicks.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
       <h3 className="text-xl font-bold mb-2">No Nicks Yet</h3>
       <p className="text-gray-400 text-sm">Be the first to share a moment!</p>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-140px)] overflow-y-auto nick-container bg-black rounded-3xl mx-2 my-2 overflow-hidden snap-y snap-mandatory scroll-smooth"
    >
      {nicks.map((nick) => (
        <div 
          key={nick.id} 
          data-id={nick.id}
          className="h-full w-full snap-start nick-wrapper"
        >
          <NickItem nick={nick} isActive={activeId === nick.id} />
        </div>
      ))}
    </div>
  );
};

export default NicksPage;
