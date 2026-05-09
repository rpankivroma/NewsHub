import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import SearchInput from '../SearchInput';
import Pagination from '../Pagination';
import { adminService } from '../../services/adminService';
import { CustomSelect } from '../CustomSelect';

interface SubmissionManagerProps {
  handleUpdateSubmission: (id: number, status: string) => void;
}

const PAGE_SIZE = 10;

export const SubmissionManager: React.FC<SubmissionManagerProps> = ({
  handleUpdateSubmission
}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSubmissions(
        page * PAGE_SIZE, 
        PAGE_SIZE + 1, 
        search, 
        status === 'All' ? undefined : status.toLowerCase()
      );
      
      if (data.length > PAGE_SIZE) {
        setSubmissions(data.slice(0, PAGE_SIZE));
        setHasMore(true);
      } else {
        setSubmissions(data);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, search, status]);

  const handleAction = async (id: number, action: string) => {
    await handleUpdateSubmission(id, action);
    fetchSubmissions();
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-xl font-bold text-gray-900 shrink-0">Viewer Submissions</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <SearchInput onSearch={(q) => { setSearch(q); setPage(0); }} placeholder="Search submissions..." />
            </div>
            
            <CustomSelect
              icon={Filter}
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              containerClassName="w-full sm:w-48"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </CustomSelect>
          </div>
        </div>

        <div className="flex-1">
          {loading && submissions.length === 0 ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : submissions.length > 0 ? (
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
                        onClick={() => handleAction(sub.id, 'approved')}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button 
                        onClick={() => handleAction(sub.id, 'rejected')}
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
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-lg">No submissions found</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-gray-100">
           <Pagination 
             currentPage={page} 
             hasMore={hasMore} 
             onPageChange={setPage} 
             disabled={loading} 
           />
        </div>
      </div>
    </div>
  );
};
