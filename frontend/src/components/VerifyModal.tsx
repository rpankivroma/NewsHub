import React from 'react';
import { motion } from 'motion/react';
import { X, Lock, RefreshCcw, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

interface VerifyModalProps {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
  onBack: () => void;
}

export default function VerifyModal({ email, onClose, onSuccess, onBack }: VerifyModalProps) {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.verifyEmail(email, code);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authService.resendCode(email);
      setError('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center">
      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
      <p className="text-center text-gray-500 mb-8">
        We sent a code to <span className="font-semibold text-gray-700">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className={`p-3 text-sm rounded-lg border ${error.includes('sent') ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {error}
          </div>
        )}

        <div className="relative">
          <input 
            type="text" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            required
            autoFocus
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-center text-2xl font-bold tracking-[0.5em] text-gray-900 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-70"
        >
          {isLoading ? 'Verifying...' : 'Verify Now'}
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button 
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Resend code
        </button>
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
