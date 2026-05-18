import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import About from './pages/About';
import Donate from './pages/Donate';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { Article, User } from './types';
import { authService } from './services/authService';
import { newsService } from './services/newsService';
import { analyticsService } from './services/analyticsService';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const path = currentPage === 'article' && selectedArticleId 
      ? `/article/${selectedArticleId}` 
      : `/${currentPage}`;
    analyticsService.trackVisit(path);
  }, [currentPage, selectedArticleId]);

  useEffect(() => {
    const initApp = async () => {
      const token = authService.getToken();
      
      // Check for articleId in URL
      const urlParams = new URLSearchParams(window.location.search);
      const articleIdParam = urlParams.get('articleId');
      if (articleIdParam) {
        setSelectedArticleId(parseInt(articleIdParam));
        setCurrentPage('article');
        // Clear the query param
        window.history.replaceState({}, '', window.location.pathname);
      }

      try {
        const [categoriesData] = await Promise.all([
          newsService.getCategories(),
          token ? authService.getMe().then(u => setUser(u)).catch(() => null) : Promise.resolve(null)
        ]);
        setCategories(categoriesData);
      } catch (error) {
        console.error("App initialization failed", error);
      }
      setIsLoading(false);
    };
    initApp();
  }, []);

  const handleArticleClick = (id: number) => {
    setSelectedArticleId(id);
    setCurrentPage('article');
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    if (user?.is_admin) {
      const { adminService } = await import('./services/adminService');
      await adminService.adminLogout().catch(console.error);
    }
    authService.logout();
    setUser(null);
    setCurrentPage('home');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        onLoginClick={() => setIsAuthModalOpen(true)} 
        user={user}
        onLogout={handleLogout}
        onPageChange={(page) => {
            if (page === 'home') setSelectedCategory('All');
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }}
        onCategorySelect={(categoryName) => {
          setSelectedCategory(categoryName);
          setCurrentPage('home');
          window.scrollTo(0, 0);
        }}
        currentPage={currentPage}
        categories={categories}
      />

      <main className="pb-24">
        {currentPage === 'home' && (
          <Home 
            onArticleClick={handleArticleClick} 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        )}
        {currentPage === 'article' && selectedArticleId && (
          <ArticleDetail 
            articleId={selectedArticleId} 
            onBack={() => setCurrentPage('home')} 
            user={user}
            onLoginClick={() => setIsAuthModalOpen(true)}
          />
        )}
        {currentPage === 'about' && <About />}
        {currentPage === 'donate' && <Donate />}
        {currentPage === 'profile' && <Profile user={user} onUserUpdate={setUser} onArticleClick={handleArticleClick} />}
        {currentPage === 'admin' && <Admin user={user} />}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
               <svg className="bg-blue-600 p-1.5 rounded-lg w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5l10-5l-10-5z" />
                  <path d="M2 17l10 5l10-5" />
                  <path d="M2 12l10 5l10-5" />
               </svg>
               <span className="text-xl font-bold text-gray-900 tracking-tight">NewsHub</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500 font-medium">
               <button onClick={() => setCurrentPage('home')} className="hover:text-blue-600">Privacy Policy</button>
               <button onClick={() => setCurrentPage('home')} className="hover:text-blue-600">Terms of Service</button>
               <button onClick={() => setCurrentPage('about')} className="hover:text-blue-600">Contact Us</button>
            </div>
            <p className="text-sm text-gray-400">© 2026 NewsHub. All rights reserved.</p>
         </div>
      </footer>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
