import React from 'react';
import { User, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Article } from '../types';

interface NewsCardProps {
  article: Article;
  variant?: 'large' | 'small' | 'horizontal';
  onClick?: (id: number) => void;
}

export default function NewsCard({ article, variant = 'small', onClick }: NewsCardProps) {
  const isLarge = variant === 'large';
  
  return (
    <div 
      className={cn(
        "group cursor-pointer bg-white rounded-2xl overflow-hidden transition-all duration-300",
        isLarge ? "flex flex-col h-full" : "flex flex-col border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1"
      )}
      onClick={() => onClick?.(article.id)}
    >
      <div className={cn("relative overflow-hidden", isLarge ? "aspect-[16/9]" : "aspect-[3/2]")}>
        <img 
          src={article.imageUrl} 
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-blue-50/90 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
            {article.category}
          </span>
        </div>
      </div>
      
      <div className={cn("p-6 flex flex-col flex-grow", isLarge ? "bg-white" : "")}>
        <h3 className={cn(
          "font-bold text-gray-900 leading-tight mb-3 transition-colors group-hover:text-blue-600",
          isLarge ? "text-2xl" : "text-lg"
        )}>
          {article.title}
        </h3>
        
        {isLarge && (
          <p className="text-gray-600 text-sm mb-6 line-clamp-2">
            {article.excerpt}
          </p>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
