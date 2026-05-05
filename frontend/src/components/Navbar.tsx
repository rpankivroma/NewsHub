import React from 'react';
import { Newspaper, ChevronDown, User, LogOut, Info, Heart, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  onLoginClick: () => void;
  user?: any;
  onLogout: () => void;
  onPageChange: (page: string) => void;
  currentPage: string;
  categories: any[];
}

export default function Navbar({ onLoginClick, user, onLogout, onPageChange, currentPage, categories }: NavbarProps) {
  const [isTopicsOpen, setIsTopicsOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onPageChange('home')}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">NewsHub</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onPageChange('home')}
            className={cn("text-sm font-medium transition-colors hover:text-blue-600", currentPage === 'home' ? "text-blue-600" : "text-gray-600")}
          >
            Home
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              onMouseEnter={() => setIsTopicsOpen(true)}
              onClick={() => setIsTopicsOpen(!isTopicsOpen)}
            >
              Topics <ChevronDown className="w-4 h-4" />
            </button>
            
            {isTopicsOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setIsTopicsOpen(false)}
              >
                {categories.map(category => (
                  <button 
                    key={category.id}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => {
                        setIsTopicsOpen(false);
                        onPageChange('home'); // or filter by topic
                    }}
                  >
                    {category.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="px-4 py-2 text-xs text-gray-400 italic">No topics available</p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => onPageChange('about')}
            className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600", currentPage === 'about' ? "text-blue-600" : "text-gray-600")}
          >
             About
          </button>
          <button 
            onClick={() => onPageChange('donate')}
            className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600", currentPage === 'donate' ? "text-blue-600" : "text-gray-600")}
          >
            <Heart className="w-4 h-4" /> Donate
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.is_admin && (
                <button 
                    onClick={() => onPageChange('admin')}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    title="Admin Panel"
                >
                    <LayoutDashboard className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => onPageChange('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={onLoginClick}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
