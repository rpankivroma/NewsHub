import React, { useEffect, useState } from 'react';
import { Article, Category } from '../../types';
import { userService } from '../../services/userService';
import { newsService } from '../../services/newsService';
import { Bookmark, Search } from 'lucide-react';
import Pagination from '../Pagination';
import SearchInput from '../SearchInput';
import { cn } from '../../lib/utils';

interface SavedTabProps {
  onArticleClick?: (id: number) => void;
}

const PAGE_SIZE = 6;

export default function SavedTab({ onArticleClick }: SavedTabProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    newsService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    userService.getSavedArticles(page * PAGE_SIZE, PAGE_SIZE + 1, search, selectedCategoryId)
      .then(data => {
        if (data.length > PAGE_SIZE) {
          setArticles(data.slice(0, PAGE_SIZE));
          setHasMore(true);
        } else {
          setArticles(data);
          setHasMore(false);
        }
      })
      .finally(() => setLoading(false));
  }, [page, search, selectedCategoryId]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(0);
  };

  const handleCategoryChange = (id: number | undefined) => {
    setSelectedCategoryId(id);
    setPage(0);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" /> Saved Articles
        </h3>
        <div className="w-full md:w-64">
           <SearchInput onSearch={handleSearch} placeholder="Search saved articles..." />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryChange(undefined)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold transition-all border",
            selectedCategoryId === undefined
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-600"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold transition-all border",
              selectedCategoryId === cat.id
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-blue-600"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && articles.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Articles</h3>
          <p className="text-gray-400 max-w-xs">
            {search || selectedCategoryId 
              ? "No articles matched your filters." 
              : "Articles you bookmark will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <div 
                key={article.id} 
                onClick={() => onArticleClick?.(article.id)}
                className="group cursor-pointer flex gap-4 p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              >
                <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                  <img 
                    src={article.image_url || article.imageUrl || "https://images.unsplash.com/photo-1504711432869-efd597cdd042?w=200"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={article.title}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">{article.category}</span>
                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-1 leading-snug group-hover:text-blue-600 transition-colors text-sm">{article.title}</h4>
                  <p className="text-[10px] text-gray-400 font-medium">{article.date || new Date(article.created_at || '').toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Pagination 
            currentPage={page} 
            hasMore={hasMore} 
            onPageChange={setPage} 
            disabled={loading} 
          />
        </>
      )}
    </div>
  );
}
