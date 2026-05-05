import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SubmissionManagerProps {
  submissions: any[];
  handleUpdateSubmission: (id: number, status: string) => void;
  fetchData: () => Promise<void>;
}

export const SubmissionManager: React.FC<SubmissionManagerProps> = ({
  submissions,
  handleUpdateSubmission,
  fetchData
}) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Viewer Submissions</h3>
        </div>
        {submissions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {submissions.map(sub => (
              <div key={sub.id} className="p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{sub.title}</h4>
                    <p className="text-sm text-gray-500">Submitted by <span className="font-semibold text-gray-900">{sub.full_name}</span> ({sub.email})</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(sub.submitted_at).toLocaleString()}</p>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                    sub.status === 'pending' ? "bg-amber-100 text-amber-600" :
                    sub.status === 'approved' ? "bg-green-100 text-green-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">{sub.content}</p>
                {sub.status === 'pending' && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleUpdateSubmission(sub.id, 'approved')}
                      className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateSubmission(sub.id, 'rejected')}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-500 font-bold rounded-xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No submissions found</p>
          </div>
        )}
      </div>
    </div>
  );
};
