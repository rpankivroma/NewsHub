import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import VerifyModal from './VerifyModal';
import ForgotPasswordModal from './ForgotPasswordModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'verify' | 'forgot-password';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = React.useState<AuthMode>('login');
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        try {
          await authService.login(email, password);
          const userData = await authService.getMe();
          onLoginSuccess(userData);
        } catch (err: any) {
          if (err.message.includes('verified')) {
            setMode('verify');
            setError('Please verify your email.');
          } else {
            throw err;
          }
        }
      } else {
        await authService.register(email, password, fullName);
        setMode('verify');
        setError('Registration successful! Please verify your email.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetModal = () => {
    setMode('login');
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleVerificationSuccess = async () => {
    try {
      setIsLoading(true);
      await authService.login(email, password);
      const userData = await authService.getMe();
      onLoginSuccess(userData);
    } catch (err: any) {
      setError('Verified! Please sign in.');
      setMode('login');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (mode === 'verify') {
      return (
        <VerifyModal 
          email={email}
          onClose={onClose}
          onSuccess={handleVerificationSuccess}
          onBack={() => setMode(fullName ? 'register' : 'login')}
        />
      );
    }

    if (mode === 'forgot-password') {
      return (
        <ForgotPasswordModal 
          initialEmail={email}
          onBack={() => setMode('login')}
          onSuccess={(resetEmail) => {
            setEmail(resetEmail);
            setMode('login');
            setError('Password reset successful! Please sign in.');
          }}
        />
      );
    }

    return (
      <div className="p-10 flex flex-col items-center">
        <div className="bg-blue-600 p-3 rounded-2xl mb-6 shadow-lg shadow-blue-200">
          <Newspaper className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {mode === 'login' ? 'Sign in to your NewsHub account' : 'Join our global news community'}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className={`p-3 text-sm rounded-xl border ${error.includes('successful') || error.includes('Registration successful') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setMode('forgot-password')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {(mode === 'login' || mode === 'register') && (
          <button 
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        )}
      </div>
    );
  };

  const isVerifying = mode === 'verify';

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          handleResetModal();
        }
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={() => {
            onClose();
            handleResetModal();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}
      </motion.div>
    </div>
  );
}
