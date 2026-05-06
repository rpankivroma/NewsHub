import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { Article } from '../types';
import { newsService } from '../services/newsService';
import { AlertCircle, Clock, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeProps {
  onArticleClick: (id: number) => void;
}

const PAGE_SIZE = 12;

export default function Home({ onArticleClick }: HomeProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    newsService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const categoryId = selectedTopic !== 'All' 
          ? categories.find(c => c.name === selectedTopic)?.id 
          : undefined;
        
        const articlesData = await newsService.getArticles(page * PAGE_SIZE, PAGE_SIZE + 1, search, categoryId);
        
        if (articlesData.length > PAGE_SIZE) {
          setArticles(articlesData.slice(0, PAGE_SIZE));
          setHasMore(true);
        } else {
          setArticles(articlesData);
          setHasMore(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load news');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [page, search, selectedTopic, categories]);

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    setPage(0);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(0);
  };

  const featuredArticles = articles.filter(a => Boolean(a.is_featured));
  const latestArticles = articles.filter(a => !Boolean(a.is_featured));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Topics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <section className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Browse by Topic</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleTopicChange('All')}
              className={cn(
                "px-5 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm",
                selectedTopic === 'All' 
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "bg-white border-gray-100 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              All Topics
            </button>
            {categories.map(category => (
              <button 
                key={category.id} 
                onClick={() => handleTopicChange(category.name)}
                className={cn(
                  "px-5 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm",
                  selectedTopic === category.name 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                    : "bg-white border-gray-100 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        <div className="w-full md:w-80">
          <SearchInput onSearch={handleSearch} placeholder="Search articles..." />
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4 mb-12">
          <AlertCircle className="w-8 h-8" />
          <p className="font-bold text-lg">{error}</p>
        </div>
      ) : isLoading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Clock className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Fetching the latest news...</p>
        </div>
      ) : (
        <>
          {/* Featured Stories (only on first page and when not searching) */}
          {page === 0 && !search && featuredArticles.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Featured Stories</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredArticles.map((article, idx) => (
                  <motion.div 
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                  >
                    <NewsCard article={article} variant="large" onClick={onArticleClick} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Latest News */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
              {search ? `Search results for "${search}"` : 'Latest News'}
            </h2>
            {articles.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article, idx) => (
                  <motion.div 
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                  >
                    <NewsCard article={article} variant="small" onClick={onArticleClick} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">No news stories found.</p>
              </div>
            )}
          </section>

          <Pagination 
            currentPage={page} 
            hasMore={hasMore} 
            onPageChange={setPage} 
            disabled={isLoading}
          />
        </>
      )}
    </div>
  );
}

