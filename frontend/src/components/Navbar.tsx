import React from 'react';
import { Newspaper, ChevronDown, User, LogOut, Heart, LayoutDashboard, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onLoginClick: () => void;
  user?: any;
  onLogout: () => void;
  onPageChange: (page: string) => void;
  onCategorySelect?: (categoryName: string) => void;
  currentPage: string;
  categories: any[];
}

export default function Navbar({ onLoginClick, user, onLogout, onPageChange, onCategorySelect, currentPage, categories }: NavbarProps) {
  const [isTopicsOpen, setIsTopicsOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Donate', id: 'donate', icon: Heart }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => {
            onPageChange('home');
            setIsMobileMenuOpen(false);
          }}
        >
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">NewsHub</span>
        </div>

        {/* Desktop Navigation */}
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
                        onCategorySelect?.(category.name);
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
          {/* User Section (Desktop & Mobile) */}
          <div className="hidden sm:flex items-center gap-3">
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

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-gray-900">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      onPageChange(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all",
                      currentPage === link.id 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    {link.name}
                  </button>
                ))}

                <div className="pt-4 mt-4 border-t">
                  <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topics</p>
                  <div className="grid grid-cols-1 gap-1">
                    {categories.map(category => (
                      <button 
                        key={category.id}
                        className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-xl transition-all"
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            onCategorySelect?.(category.name);
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t sm:hidden">
                {user ? (
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        onPageChange('profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium"
                    >
                      <User className="w-5 h-5 text-blue-600" />
                      Profile
                    </button>
                    {user.is_admin && (
                      <button 
                        onClick={() => {
                          onPageChange('admin');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium"
                      >
                        <LayoutDashboard className="w-5 h-5 text-blue-600" />
                        Admin Panel
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    Login to NewsHub
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
