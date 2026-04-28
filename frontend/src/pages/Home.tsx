import React from 'react';
import { motion } from 'motion/react';
import NewsCard from '../components/NewsCard';
import { ARTICLES, CATEGORIES } from '../constants';
import { Article } from '../types';

interface HomeProps {
  onArticleClick: (id: number) => void;
}

export default function Home({ onArticleClick }: HomeProps) {
  const featuredArticles = ARTICLES.filter(a => a.isFeatured);
  const latestArticles = ARTICLES.filter(a => !a.isFeatured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Browse by Topic */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Browse by Topic</h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(category => (
            <button 
              key={category.id} 
              className="px-5 py-2 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Stories */}
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

      {/* Latest News */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Latest News</h2>
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
      </section>
    </div>
  );
}
