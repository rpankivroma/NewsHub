import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, User, Clock, ThumbsUp, ThumbsDown, Bookmark, 
  MessageSquare, AlertCircle, Star 
} from 'lucide-react';
import { Article } from '../types';
import { newsService } from '../services/newsService';

interface ArticleDetailProps {
  articleId: number;
  onBack: () => void;
}

export default function ArticleDetail({ articleId, onBack }: ArticleDetailProps) {
  const [article, setArticle] = React.useState<Article | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const data = await newsService.getArticle(articleId);
        setArticle(data);
      } catch (err: any) {
        setError(err.message || 'Article not found');
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

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
          className="w-full aspect-[21/9] object-cover"
        />
        
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {article.category}
            </span>
            {Boolean(article.is_featured) && (
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-600" /> Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
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
             <div className="bg-gray-50 p-8 rounded-3xl border-l-8 border-blue-600 mb-8">
                <p className="text-xl font-medium text-gray-900 leading-relaxed italic">{article.excerpt || article.content.substring(0, 150) + '...'}</p>
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

          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all font-bold">
                <ThumbsUp className="w-5 h-5" /> {article.likes}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all font-bold">
                <ThumbsDown className="w-5 h-5" /> {article.dislikes}
              </button>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100">
              <Bookmark className="w-5 h-5" /> Save Story
            </button>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-600 shadow-sm" /> Comments
        </h2>

        <div className="mb-12 p-12 bg-blue-50/30 rounded-[2rem] border border-blue-50 flex flex-col items-center">
           <AlertCircle className="w-10 h-10 text-blue-400 mb-4" />
           <p className="text-gray-600 font-medium mb-6">Join the conversation. Please sign in to leave a comment.</p>
           <button className="px-10 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95">
              Sign In to Comment
           </button>
        </div>

        <div className="space-y-8">
           <div className="flex items-center justify-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-medium italic">No comments posted for this article yet.</p>
           </div>
        </div>
      </section>
    </motion.div>
  );
}

