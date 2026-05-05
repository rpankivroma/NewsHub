import React, { useEffect, useState } from 'react';
import { Article } from '../../types';
import { userService } from '../../services/userService';
import { Flame } from 'lucide-react';

export default function PersonalizedTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getPersonalizedFeed()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Personalized Content</h3>
        <p className="text-gray-400 max-w-xs">Select some interests in the About tab to see news tailored for you!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" /> Recommendations for You
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="group cursor-pointer flex gap-4 p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
            <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
               <img 
                 src={article.image_url || article.imageUrl || "https://images.unsplash.com/photo-1504711432869-efd597cdd042?w=200"} 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                 alt={article.title}
               />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{article.category}</span>
              <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{article.title}</h4>
              <p className="text-xs text-gray-400 font-medium">{article.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
