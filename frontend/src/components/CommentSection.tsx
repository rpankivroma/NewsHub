import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, User, Trash2, Send, Clock, 
  AlertCircle, Loader2 
} from 'lucide-react';
import { newsService } from '../services/newsService';
import { User as UserType } from '../types';
import { cn } from '../lib/utils';

interface Comment {
  id: number;
  content: string;
  user_id: number;
  user_full_name: string;
  user_avatar_url: string | null;
  created_at: string;
}

interface CommentSectionProps {
  articleId: number;
  currentUser: UserType | null;
  onLoginClick: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  articleId, 
  currentUser, 
  onLoginClick 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const data = await newsService.getComments(articleId);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return onLoginClick();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const added = await newsService.addComment(newComment, articleId);
      setComments(prev => [added, ...prev]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await newsService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  return (
    <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-600 shadow-sm" /> Comments
          <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {comments.length}
          </span>
        </h2>
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full min-h-[150px] p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none text-gray-700 resize-none font-medium placeholder:text-gray-400 group-hover:border-gray-200"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className={cn(
                "absolute bottom-4 right-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:scale-100 disabled:shadow-none translate-y-0 hover:-translate-y-0.5",
                isSubmitting && "cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" /> Post Comment
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 font-medium flex items-center gap-2 px-4"><AlertCircle className="w-4 h-4" /> {error}</p>}
        </form>
      ) : (
        <div className="mb-12 p-12 bg-blue-50/30 rounded-[2rem] border border-blue-50 flex flex-col items-center text-center">
          <AlertCircle className="w-10 h-10 text-blue-400 mb-4" />
          <p className="text-gray-600 font-medium mb-6">Join the conversation. Please sign in to leave a comment.</p>
          <button 
            onClick={onLoginClick}
            className="px-10 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-50/50 rounded-3xl p-6 border border-transparent hover:border-gray-100 hover:bg-white transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                      {comment.user_avatar_url ? (
                        <img src={comment.user_avatar_url} alt={comment.user_full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{comment.user_full_name}</h4>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  {(currentUser?.is_admin || currentUser?.id === comment.user_id) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium italic">No comments posted for this article yet.</p>
        </div>
      )}
    </section>
  );
};
