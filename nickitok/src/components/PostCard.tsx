import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, User, Smartphone, UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage, useAuth } from '../Contexts';
import { EN_TRANSLATIONS, TA_TRANSLATIONS } from '../constants';
import { toggleFollow, isFollowing, toggleLike, hasLiked, addComment, repost } from '../lib/firebase';

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onSave }) => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const t = lang === 'en' ? EN_TRANSLATIONS : TA_TRANSLATIONS;
  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const isMe = user?.id === post.userId;

  useEffect(() => {
    if (user && !isMe) {
      isFollowing(user.id, post.userId).then(setFollowing);
    }
    if (user) {
      hasLiked(post.id, user.id).then(setLiked);
    }
  }, [user, post.userId, isMe, post.id]);

  const handleFollow = async () => {
    if (!user || isMe) return;
    try {
      await toggleFollow(user.id, post.userId);
      setFollowing(!following);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const isNowLiked = await toggleLike(post.id, user.id);
      setLiked(isNowLiked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepost = async () => {
    if (!user) return;
    try {
      await repost(post.id, user.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    try {
      await addComment(post.id, user.id, user.username, user.profileIcons[0], commentText);
      setCommentText('');
      setShowCommentInput(false);
    } catch (error) {
      console.error(error);
    }
  };

  const renderContent = () => {
    switch (post.type) {
      case 'thought':
        return (
          <div className="bg-pink-50 p-6 rounded-2xl mb-4">
             <p className="text-xl font-medium text-pink-900 leading-relaxed italic">
               "{post.content}"
             </p>
          </div>
        );
      case 'app':
        return (
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2x mb-4 flex items-center gap-4">
            <img src={post.appIcon || 'https://api.dicebear.com/7.x/shapes/svg?seed=' + post.appName} className="w-16 h-16 rounded-2xl shadow-sm" alt={post.appName} />
            <div className="flex-1">
               <h4 className="font-bold text-gray-800">{post.appName}</h4>
               <p className="text-xs text-gray-500 mb-2 line-clamp-1">{post.description}</p>
               <button className="flex items-center gap-1 bg-pink-600 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                 <Smartphone size={10} /> Install
               </button>
            </div>
          </div>
        );
      case 'post':
        return (
          <div className="mb-4">
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                className="w-full aspect-square object-cover rounded-2xl mb-3 shadow-sm" 
                alt="Post" 
                referrerPolicy="no-referrer"
              />
            )}
            {post.videoUrl && (
              <video 
                src={post.videoUrl} 
                controls 
                className="w-full aspect-video object-cover rounded-2xl mb-3 shadow-sm bg-black" 
              />
            )}
            <p className="text-gray-800 text-sm leading-relaxed px-1">
              {post.content}
            </p>
          </div>
        );
      case 'nick':
      case 'video':
        return (
          <div className="mb-4">
            <div className="relative aspect-[9/16] max-h-[500px] rounded-2xl overflow-hidden mb-3 shadow-sm bg-black mx-auto">
              <video 
                src={post.videoUrl} 
                controls 
                className="w-full h-full object-cover" 
              />
            </div>
            <p className="text-gray-800 text-sm leading-relaxed px-1">
              {post.content}
            </p>
          </div>
        );
      default:
        return <p className="text-gray-800 mb-4">{post.content}</p>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-6 border-b border-gray-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 overflow-hidden ring-2 ring-pink-50">
            <img src={post.userAvatar} className="w-full h-full object-cover" alt={post.userHandle} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900">@{post.userHandle}</h3>
              {!isMe && (
                <button 
                  onClick={handleFollow}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${
                    following ? 'border-gray-200 text-gray-400' : 'border-pink-200 text-pink-600 bg-pink-50'
                  }`}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">10 mins ago • {post.type.toUpperCase()}</p>
          </div>
        </div>
        <button className="p-2 text-gray-300 hover:text-gray-500">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors group ${liked ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'}`}
            >
              <Heart size={20} className={`transition-transform group-active:scale-125 ${liked ? 'fill-pink-600' : ''}`} />
              <span className="text-xs font-semibold">{post.likes}</span>
            </button>
            <button 
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-xs font-semibold">{post.comments}</span>
            </button>
            <button 
              onClick={handleRepost}
              className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 transition-colors"
            >
              <Repeat2 size={20} />
              <span className="text-xs font-semibold">{post.reposts}</span>
            </button>
          </div>
          <button className="text-gray-400 hover:text-pink-600">
             <Bookmark size={20} />
          </button>
        </div>

        {showCommentInput && (
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-300 transition-all"
            />
            <button 
              type="submit"
              className="bg-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-700 transition-all"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
