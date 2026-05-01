import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { authService } from '../services/authService';

interface ForgotPasswordModalProps {
  initialEmail?: string;
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export default function ForgotPasswordModal({ initialEmail = '', onSuccess, onBack }: ForgotPasswordModalProps) {
  const [email, setEmail] = React.useState(initialEmail);
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setIsResetting(true);
      setError('A reset code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(email, code, newPassword);
      onSuccess(email);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Mail className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {isResetting ? 'Reset Password' : 'Forgot Password'}
      </h2>
      <p className="text-center text-gray-500 mb-8">
        {isResetting 
          ? 'Enter the code from email and your new password' 
          : 'Enter your email to receive a recovery code'}
      </p>

      {isResetting ? (
        <form onSubmit={handleResetPassword} className="w-full space-y-4">
          {error && (
            <div className={`p-3 text-sm rounded-xl border ${error.includes('sent') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {error}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Reset Code"
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Resetting...' : 'Update Password'}
          </button>

          <div className="flex justify-center mt-2">
            <button 
              type="button"
              onClick={handleRequestReset}
              disabled={isLoading}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Resend code
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRequestReset} className="w-full space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
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
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
          >
            {isLoading ? 'Sending...' : 'Send Recovery Code'}
          </button>
        </form>
      )}

      <button 
        onClick={isResetting ? () => setIsResetting(false) : onBack}
        className="mt-8 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Go back to login
      </button>
    </div>
  );
}
