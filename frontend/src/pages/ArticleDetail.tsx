import React from 'react';
import { ArrowLeft, User, Clock, ThumbsUp, ThumbsDown, Bookmark, MessageSquare } from 'lucide-react';
import { Article } from '../types';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full aspect-[21/9] object-cover"
        />
        
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
              {article.category}
            </span>
            {article.isFeatured && (
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
          </div>

          <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed mb-12">
            <p className="text-xl font-medium mb-6 text-gray-600">{article.excerpt}</p>
            <p>{article.content}</p>
            {/* Mocked extra text */}
            <p className="mt-4">
              In a landmark announcement today, researchers unveiled a new AI system that promises to revolutionize multiple industries. 
              The technology, which combines advanced machine learning with quantum computing principles, has demonstrated unprecedented capabilities 
              in solving complex problems. Early adopters in healthcare, finance, and manufacturing are already reporting significant improvements 
              in efficiency and accuracy.
            </p>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-gray-100">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                <ThumbsUp className="w-4 h-4" /> {article.likes}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                <ThumbsDown className="w-4 h-4" /> {article.dislikes}
              </button>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
              <Bookmark className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" /> Comments (1)
        </h2>

        <div className="mb-12 p-10 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col items-center">
          <p className="text-gray-600 mb-4">Please log in to leave a comment</p>
          <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            Log In
          </button>
        </div>

        <div className="space-y-8">
           <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Jane Reader" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">Jane Reader</span>
                  <span className="text-xs text-gray-400">Apr 23, 2026</span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-2xl rounded-tl-none">
                  This is truly groundbreaking! Can't wait to see how this technology evolves.
                </p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
