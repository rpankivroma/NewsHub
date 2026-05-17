import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User, Clock, ThumbsUp, ThumbsDown, Bookmark, 
  MessageSquare, AlertCircle, Star, Loader2, CheckCircle
} from 'lucide-react';
import { Article, User as UserType } from '../types';
import { newsService } from '../services/newsService';
import { CommentSection } from '../components/CommentSection';
import { cn } from '../lib/utils';

interface ArticleDetailProps {
  articleId: number;
  onBack: () => void;
  user: UserType | null;
  onLoginClick: () => void;
}

export default function ArticleDetail({ articleId, onBack, user, onLoginClick }: ArticleDetailProps) {
  const [article, setArticle] = React.useState<Article | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Interaction states
  const [interactions, setInteractions] = React.useState({
    liked: false,
    disliked: false,
    saved: false
  });
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const initArticle = async () => {
      setIsLoading(true);
      try {
        const [articleData, interactionsData] = await Promise.all([
          newsService.getArticle(articleId),
          newsService.getInteractions(articleId)
        ]);
        setArticle(articleData);
        setInteractions(interactionsData);
      } catch (err: any) {
        setError(err.message || 'Article not found');
      } finally {
        setIsLoading(false);
      }
    };
    initArticle();
  }, [articleId]);

  const handleLike = async () => {
    if (!user) return onLoginClick();
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await newsService.likeArticle(articleId);
      setInteractions(prev => ({
        ...prev,
        liked: result.liked,
        disliked: false // Toggle off dislike if it was on
      }));
      if (article) {
        setArticle({
          ...article,
          likes: result.count,
          // We need current dislike count too, but let's assume we can re-fetch or estimate
        });
      }
      // Re-fetch full article to get accurate counts
      const updatedArticle = await newsService.getArticle(articleId);
      setArticle(updatedArticle);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDislike = async () => {
    if (!user) return onLoginClick();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await newsService.dislikeArticle(articleId);
      setInteractions(prev => ({
        ...prev,
        disliked: result.disliked,
        liked: false
      }));
      const updatedArticle = await newsService.getArticle(articleId);
      setArticle(updatedArticle);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!user) return onLoginClick();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await newsService.saveArticle(articleId);
      setInteractions(prev => ({ ...prev, saved: result.saved }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Clock className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium tracking-wide">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{error || 'Article not found'}</h2>
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" /> Go Back Home
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8">
        <img 
          src={article.image_url || article.imageUrl} 
          alt={article.title} 
          className="w-full aspect-[16/9] md:aspect-[21/9] object-cover"
        />
        
        <div className="p-6 md:p-12">
          <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
            <span className="px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {article.category}
            </span>
            {Boolean(article.is_featured) && (
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-600" /> Featured
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="block font-bold text-gray-900 leading-tight">{article.author}</span>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-gray-400">Contributor</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-blue-600 font-bold">
              <span>{article.views?.toLocaleString()} views</span>
            </div>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed mb-12">
             <div className="bg-gray-50 p-6 md:p-8 rounded-2xl md:rounded-3xl border-l-8 border-blue-600 mb-8">
                <p className="text-lg md:text-xl font-medium text-gray-900 leading-relaxed italic">{article.excerpt || article.content.substring(0, 150) + '...'}</p>
             </div>
             <div className="space-y-6">
               {article.content.split('\n').map((p, i) => (
                 <p key={i}>{p}</p>
               ))}
               {article.content.length < 500 && (
                 <p className="text-gray-400 italic text-sm mt-8">Full article content from database displayed above.</p>
               )}
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-6 border-y border-gray-100 gap-6">
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={handleLike}
                disabled={isProcessing}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-bold transition-all active:scale-95",
                  interactions.liked 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                )}
              >
                <ThumbsUp className={cn("w-5 h-5", interactions.liked && "fill-white")} /> {article.likes}
              </button>
              <button 
                onClick={handleDislike}
                disabled={isProcessing}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-bold transition-all active:scale-95",
                  interactions.disliked 
                    ? "bg-red-600 text-white shadow-lg shadow-red-100" 
                    : "bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600"
                )}
              >
                <ThumbsDown className={cn("w-5 h-5", interactions.disliked && "fill-white")} /> {article.dislikes}
              </button>
            </div>
            <button 
              onClick={handleSave}
              disabled={isProcessing}
              className={cn(
                "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95",
                interactions.saved 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                  : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
              )}
            >
              {interactions.saved ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-5 h-5" /> Save Story
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <CommentSection 
        articleId={articleId} 
        currentUser={user} 
        onLoginClick={onLoginClick} 
      />
    </motion.div>
  );
}

