import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Edit2, Trash2, Star, Eye, Heart, TrendingUp, X, Upload, Loader2, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Article, Category, User } from '../../types';
import SearchInput from '../SearchInput';
import Pagination from '../Pagination';
import { adminService } from '../../services/adminService';

interface ArticleManagerProps {
  categories: Category[];
  user: User | null;
  handleSaveArticle: (e: React.FormEvent) => void;
  handleEditArticle: (article: Article) => void;
  handleDeleteArticle: (id: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isEditingArticle: boolean;
  setIsEditingArticle: (v: boolean) => void;
  currentArticle: Partial<Article> | null;
  setCurrentArticle: React.Dispatch<React.SetStateAction<Partial<Article> | null>>;
}

const PAGE_SIZE = 10;

export const ArticleManager: React.FC<ArticleManagerProps> = ({
  categories,
  user,
  handleSaveArticle: propHandleSaveArticle,
  handleEditArticle,
  handleDeleteArticle: propHandleDeleteArticle,
  handleFileUpload,
  isUploading,
  fileInputRef,
  isEditingArticle,
  setIsEditingArticle,
  currentArticle,
  setCurrentArticle
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const categoryId = selectedTopic !== 'all' 
        ? categories.find(c => c.name === selectedTopic)?.id 
        : undefined;
        
      const data = await adminService.getArticles(page * PAGE_SIZE, PAGE_SIZE + 1, search, categoryId);
      
      if (data.length > PAGE_SIZE) {
        setArticles(data.slice(0, PAGE_SIZE));
        setHasMore(true);
      } else {
        setArticles(data);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search, selectedTopic]);

  const handleNewArticle = () => {
    setCurrentArticle({
      title: '',
      excerpt: '',
      content: '',
      image_url: '',
      category_id: categories[0]?.id || 1,
      is_featured: false
    });
    setIsEditingArticle(true);
  };

  const onSave = async (e: React.FormEvent) => {
    await propHandleSaveArticle(e);
    fetchArticles();
  };

  const onDelete = async (id: number) => {
    await propHandleDeleteArticle(id);
    fetchArticles();
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-12">
      {/* Header / Search bar */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <SearchInput onSearch={(q) => { setSearch(q); setPage(0); }} placeholder="Search articles..." />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <select 
              value={selectedTopic}
              onChange={(e) => { setSelectedTopic(e.target.value); setPage(0); }}
              className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button 
            onClick={handleNewArticle}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> New Article
          </button>
        </div>
      </div>

      {loading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading articles...</p>
        </div>
      ) : (
        <>
          {/* Edit / Create Form Overlay */}
          {isEditingArticle && currentArticle && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-10 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {currentArticle.id ? 'Edit Article' : 'Create New Article'}
                </h3>
                <button 
                  onClick={() => setIsEditingArticle(false)}
                  className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={onSave} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Title</label>
                    <input 
                      type="text"
                      required
                      value={currentArticle.title}
                      onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-gray-900"
                      placeholder="Article title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Category</label>
                    <select 
                      required
                      value={currentArticle.category_id}
                      onChange={(e) => setCurrentArticle({...currentArticle, category_id: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-gray-900 appearance-none"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Excerpt</label>
                  <input 
                    type="text"
                    required
                    value={currentArticle.excerpt}
                    onChange={(e) => setCurrentArticle({...currentArticle, excerpt: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                    placeholder="Short description..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Content</label>
                  <textarea 
                    rows={10}
                    required
                    value={currentArticle.content}
                    onChange={(e) => setCurrentArticle({...currentArticle, content: e.target.value})}
                    className="w-full px-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700 leading-relaxed"
                    placeholder="Write your article content here..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Author</label>
                    <input 
                      type="text"
                      value={currentArticle.author || user?.full_name || ''}
                      readOnly
                      className="w-full px-6 py-4 bg-gray-100/50 border border-gray-50 rounded-2xl font-bold text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-500 ml-1 uppercase tracking-wider">Image</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={currentArticle.image_url || ''}
                          onChange={(e) => setCurrentArticle({...currentArticle, image_url: e.target.value})}
                          className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium text-gray-700"
                          placeholder="Image URL or upload from PC"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-6 py-4 bg-white border border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:shadow-lg transition-all flex items-center gap-3 whitespace-nowrap active:scale-95 disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <Upload className="w-5 h-5 text-blue-600" />}
                        <span>Upload from PC</span>
                      </button>
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    {currentArticle.image_url && (
                      <div className="relative w-40 h-24 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                        <img src={currentArticle.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group py-2">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={!!currentArticle.is_featured}
                        onChange={(e) => setCurrentArticle({...currentArticle, is_featured: e.target.checked})}
                        className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Mark as Featured</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="submit"
                    className="px-10 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                  >
                    {currentArticle.id ? 'Update' : 'Create Article'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditingArticle(false);
                      setCurrentArticle(null);
                    }}
                    className="px-10 py-4 bg-gray-100 text-gray-500 font-extrabold rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1">
              {articles.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {articles.map(article => (
                    <div key={article.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex gap-8 max-w-4xl">
                        <div className="relative shrink-0">
                          <img 
                            src={article.image_url || article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400"} 
                            className="w-48 h-32 object-cover rounded-3xl shadow-sm group-hover:scale-[1.02] transition-transform duration-500" 
                          />
                          {article.is_featured ? (
                            <div className="absolute -top-3 -right-3 bg-white p-2 rounded-2xl shadow-lg border border-amber-50">
                              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-2xl text-xs font-extrabold uppercase tracking-widest">{article.category}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter shrink-0">{article.date || new Date(article.created_at || '').toLocaleDateString()}</span>
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-xl line-clamp-1 mb-2 tracking-tight group-hover:text-blue-600 transition-colors">{article.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1 mb-4 font-medium">{article.excerpt}</p>
                          <div className="flex items-center gap-6 text-xs text-gray-400 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-2">
                              {article.author && (
                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-500">
                                  {article.author?.charAt(0)}
                                </div>
                              )}
                              {article.author}
                            </span>
                            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {article.likes || 0}</span>
                            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {article.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleEditArticle(article)}
                          className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 rounded-2xl transition-all active:scale-90"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDelete(article.id)}
                          className="p-4 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 hover:shadow-xl hover:shadow-red-50 rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium text-lg">No articles found</p>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-gray-100">
               <Pagination 
                 currentPage={page} 
                 hasMore={hasMore} 
                 onPageChange={setPage} 
                 disabled={loading} 
               />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
