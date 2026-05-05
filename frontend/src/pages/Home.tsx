import React from 'react';
import { motion } from 'motion/react';
import NewsCard from '../components/NewsCard';
import { Article } from '../types';
import { newsService } from '../services/newsService';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeProps {
  onArticleClick: (id: number) => void;
}

export default function Home({ onArticleClick }: HomeProps) {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTopic, setSelectedTopic] = React.useState<string>('All');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          newsService.getArticles(),
          newsService.getCategories()
        ]);
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load news');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredArticles = articles.filter(a => Boolean(a.is_featured));
  const filteredArticles = selectedTopic === 'All' 
    ? articles 
    : articles.filter(a => a.category === selectedTopic);
  
  const latestArticles = filteredArticles.filter(a => !Boolean(a.is_featured));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Clock className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching the latest news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4">
          <AlertCircle className="w-8 h-8" />
          <p className="font-bold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Browse by Topic */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Browse by Topic</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setSelectedTopic('All')}
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
              onClick={() => setSelectedTopic(category.name)}
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

      {/* Featured Stories */}
      {featuredArticles.length > 0 && (
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Latest News</h2>
        {latestArticles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestArticles.map((article, idx) => (
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
            <p className="text-gray-400 font-medium italic">No recent news stories found.</p>
          </div>
        )}
      </section>
    </div>
  );
}

