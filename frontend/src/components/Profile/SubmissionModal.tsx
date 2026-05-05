import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, CheckCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { User, Category } from '../../types';
import { newsService } from '../../services/newsService';
import { userService } from '../../services/userService';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  submissionToEdit?: any;
}

export default function SubmissionModal({ isOpen, onClose, user, submissionToEdit }: SubmissionModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    newsService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (submissionToEdit) {
      setTitle(submissionToEdit.title || '');
      setCategory(submissionToEdit.category || '');
      setExcerpt(submissionToEdit.excerpt || '');
      setContent(submissionToEdit.content || '');
      setImageUrl(submissionToEdit.image_url || '');
    } else {
      setTitle('');
      setCategory('');
      setExcerpt('');
      setContent('');
      setImageUrl('');
    }
  }, [submissionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await userService.uploadSubmissionPhoto(file);
      setImageUrl(result.url);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatus('idle');

    try {
      const data = {
        title,
        category,
        excerpt,
        content,
        image_url: imageUrl,
        email: user.email,
        full_name: user.full_name
      };

      if (submissionToEdit) {
        await userService.updateSubmission(submissionToEdit.id, data);
      } else {
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit news');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" /> 
            {submissionToEdit ? 'Edit News Submission' : 'Submit News'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {status === 'success' ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {submissionToEdit ? 'Update Successful!' : 'Submission Successful!'}
              </h3>
              <p className="text-gray-500">Thank you for your contribution. Our editors will review it shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Headline</label>
                  <input 
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="News headline..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 outline-none focus:border-blue-600 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3.5 px-4 outline-none focus:border-blue-600 transition-all font-medium appearance-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Excerpt (Short Summary)</label>
                <textarea 
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="One sentence summary..."
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 outline-none focus:border-blue-600 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Content (Articles)</label>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full story content..."
                  rows={6}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 outline-none focus:border-blue-600 transition-all font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Cover Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden group cursor-pointer hover:border-blue-400 hover:bg-blue-50/10 transition-all"
                >
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <Camera className="w-8 h-8 text-gray-300" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Click to upload photo</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-lg border border-red-100 italic font-medium">
                  <AlertCircle className="w-5 h-5" />
                  Failed to {submissionToEdit ? 'update' : 'submit'}. Please try again.
                </div>
              )}

              <button 
                disabled={loading || uploading}
                className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : submissionToEdit ? 'Update Submission' : 'Send to Editors'}
                <Send className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
