import React, { useEffect, useState } from 'react';
import { Send, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { userService } from '../../services/userService';
import { User } from '../../types';
import SubmissionModal from './SubmissionModal';

interface SubmissionsTabProps {
  user: User | null;
}

export default function SubmissionsTab({ user }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState<any>(null);

  const fetchSubmissions = () => {
    setLoading(true);
    userService.getSubmissions()
      .then(setSubmissions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSubmissionToEdit(null);
    fetchSubmissions();
  };

  const handleEdit = (sub: any) => {
    if (sub.status === 'pending') {
      setSubmissionToEdit(sub);
      setIsModalOpen(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-600 border-green-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" /> My Submissions
          </h3>
          <button 
            onClick={() => { setSubmissionToEdit(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Submission
          </button>
        </div>
        
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My News Submissions</h3>
            <p className="text-gray-400 mb-8 max-w-xs">No news submissions yet. Click "New Submission" to contribute!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div 
                key={sub.id} 
                className="p-6 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 pr-6 relative flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                        {sub.category || 'Uncategorized'}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{sub.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{sub.excerpt || sub.content}</p>
                    
                    {sub.status === 'pending' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(sub); }}
                        className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-3 h-3 rotate-45" /> Edit Pending Submission
                      </button>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 ${getStatusStyle(sub.status)}`}>
                    {getStatusIcon(sub.status)}
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Submitted on {new Date(sub.submitted_at).toLocaleDateString()}</span>
                  {sub.image_url && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                      <img src={sub.image_url} alt="News" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SubmissionModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        user={user} 
        submissionToEdit={submissionToEdit}
      />
    </>
  );
}
