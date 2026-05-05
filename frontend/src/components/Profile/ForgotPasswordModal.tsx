import React, { useState } from 'react';
import { X, Mail, CheckCircle, ArrowRight, Lock, Key } from 'lucide-react';
import { authService } from '../../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export default function ForgotPasswordModal({ isOpen, onClose, email: initialEmail }: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState(initialEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // In a real app, this calls the backend auth/forgot-password
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email, code, newPassword);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Forgot Password?</h2>
                <p className="text-gray-500 mt-2 font-medium">Enter your email and we'll send you a recovery code.</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-bold pl-4">{error}</p>}
                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? 'Sending...' : 'Send Recovery Code'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Reset Password</h2>
                <p className="text-gray-500 mt-2 font-medium">Check your email for the code and enter a new password.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <input 
                  type="text"
                  required
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg py-4 px-6 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium tracking-widest text-center text-xl"
                />
                <input 
                  type="password"
                  required
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg py-4 px-6 outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
                {error && <p className="text-red-500 text-sm font-bold pl-4">{error}</p>}
                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  {loading ? 'Resetting...' : 'Update Password'}
                </button>
                
                <div className="text-center pt-4">
                  <button 
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Didn't get the code? Send me code again
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Password Reset!</h2>
                <p className="text-gray-500 mt-2 font-medium">Your password has been updated successfully.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-gray-900 text-white font-extrabold py-4 rounded-lg hover:bg-black transition-all"
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
