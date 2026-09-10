import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PostType } from '../types';
import { useAuth, useLanguage } from '../Contexts';
import { EN_TRANSLATIONS, TA_TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Hash, Globe, Lock, BrainCircuit, X, Loader2, AlertCircle } from 'lucide-react';
import { analyzeImage } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage, estimateBase64Size, formatBytes } from '../lib/utils';

const CreatePostPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const t = lang === 'en' ? EN_TRANSLATIONS : TA_TRANSLATIONS;
  const navigate = useNavigate();

  const [type, setType] = useState<PostType>('thought');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState('');

  const MAX_DOCUMENT_SIZE = 1000000; // ~1MB safety limit for Firestore

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        setAnalyzing(true);
        // Compress image immediately on upload
        const compressed = await compressImage(base64);
        const size = estimateBase64Size(compressed);
        
        if (size > MAX_DOCUMENT_SIZE) {
          setError(lang === 'en' 
            ? `Image is too large (${formatBytes(size)}). Even after compression, it exceeds the 1MB limit.` 
            : `படம் மிகப்பெரியது (${formatBytes(size)}). சுருக்கிய பிறகும், இது 1MB வரம்பை மீறுகிறது.`);
          return;
        }
        
        setImageUrl(compressed);
      } catch (err) {
        console.error('Compression error:', err);
        setError(lang === 'en' ? 'Failed to process image' : 'படத்தைச் செயலாக்கத் தவறிவிட்டது');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (file.size > MAX_DOCUMENT_SIZE * 0.75) { // 0.75 because base64 adds ~33%
        setError(lang === 'en' 
            ? `Video file is too large (${formatBytes(file.size)}). Max allowed is ~750KB for base64 storage.` 
            : `வீடியோ கோப்பு மிகப்பெரியது (${formatBytes(file.size)}). அதிகபட்சம் ~750KB அனுமதிக்கப்படுகிறது.`);
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    try {
      const base64 = imageUrl.split(',')[1];
      const result = await analyzeImage(base64, 'image/jpeg');
      setAnalysisResult(result || '');
      if (result) {
        setContent(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content && !imageUrl)) return;

    setLoading(true);
    try {
      const payload = {
        userId: user.id,
        userHandle: user.username,
        userAvatar: user.profileIcons[0],
        type,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        comments: 0,
        reposts: 0,
        saves: 0,
        views: 0,
        is18Plus: false,
        isPrivate
      };

      // Final sanity check for size
      const serializedSize = JSON.stringify(payload).length;
      if (serializedSize > MAX_DOCUMENT_SIZE) {
        setError(lang === 'en' 
            ? `Post is too large to publish. Please use a smaller image/video or less text.` 
            : `பதிவு வெளியிடுவதற்கு மிகப்பெரியது. சிறிய படம்/வீடியோ அல்லது குறைந்த உரையைப் பயன்படுத்தவும்.`);
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'posts'), payload);
      navigate('/');
    } catch (error: any) {
      console.error(error);
      setError(error.message || (lang === 'en' ? 'An error occurred during publishing' : 'வெளியிடும் போது ஒரு பிழை ஏற்பட்டது'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pb-24"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-gray-900">{lang === 'en' ? 'New Post' : 'புதிய பதிவு'}</h2>
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full text-gray-500">
          <X size={20} />
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 text-sm font-medium"
          >
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-6">
        {[
          { id: 'thought', icon: Hash, label: t.thoughts },
          { id: 'post', icon: Image, label: lang === 'en' ? 'Media' : 'ஊடகம்' },
          { id: 'nick', icon: Video, label: t.nicks },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setType(item.id as PostType)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-bold text-xs uppercase tracking-widest ${
              type === item.id ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={lang === 'en' ? "What's on your mind?" : "உங்கள் மனதில் என்ன இருக்கிறது?"}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 min-h-[200px] focus:border-pink-500 focus:ring-0 text-lg transition-all outline-none"
            maxLength={1000}
          />
          <div className="absolute bottom-4 right-6 text-xs font-bold text-gray-300">
            {content.length}/1000
          </div>
        </div>

        {type === 'post' && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
               <label className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold cursor-pointer hover:bg-blue-100 transition-all border border-blue-100">
                <Image size={18} />
                {lang === 'en' ? 'Pick Image' : 'படத்தைத் தேர்ந்தெடு'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {imageUrl && (
                <button 
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-100"
                >
                  {analyzing ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                  {t.analyzeImage}
                </button>
              )}
            </div>

            {imageUrl && (
              <div className="relative rounded-3xl overflow-hidden aspect-video shadow-md border-4 border-white group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                   type="button"
                   onClick={() => setImageUrl('')}
                   className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {type === 'nick' && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 px-6 py-3 bg-pink-50 text-pink-600 rounded-2xl font-bold cursor-pointer hover:bg-pink-100 transition-all border border-pink-100">
                <Video size={18} />
                {lang === 'en' ? 'Pick Video' : 'வீடியோவை தேர்ந்தெடுக்கவும்'}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            </div>

            {videoUrl && (
              <div className="relative rounded-3xl overflow-hidden aspect-[9/16] max-h-[400px] shadow-md border-4 border-white group mx-auto">
                <video src={videoUrl} controls className="w-full h-full object-cover" />
                <button 
                   type="button"
                   onClick={() => setVideoUrl('')}
                   className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-8 px-2">
           <button 
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-2 transition-all font-bold text-xs uppercase tracking-widest ${isPrivate ? 'text-pink-600' : 'text-gray-400'}`}
          >
            {isPrivate ? <Lock size={16} /> : <Globe size={16} />}
            {isPrivate ? (lang === 'en' ? 'Private' : 'தனிப்பட்டது') : (lang === 'en' ? 'Public' : 'பொதுவானது')}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || analyzing}
          className="w-full bg-pink-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : (lang === 'en' ? 'PUBLISH' : 'வெளியிடு')}
        </button>
      </form>
    </motion.div>
  );
};

export default CreatePostPage;
