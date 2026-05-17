import React from 'react';
import { 
  Search, Filter, Calendar, User as UserIcon, Activity,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Info, Hash 
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { cn } from '../../lib/utils';
import { CustomSelect } from '../CustomSelect';

interface Log {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export const Journal = () => {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [total, setTotal] = React.useState(0);
  const [skip, setSkip] = React.useState(0);
  const [limit] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState('All');
  const [authorFilter, setAuthorFilter] = React.useState<number | undefined>(undefined);
  const [admins, setAdmins] = React.useState<{id: number, full_name: string}[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getLogs(
        skip, 
        limit, 
        search, 
        actionFilter === 'All' ? undefined : actionFilter,
        authorFilter
      );
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [skip, limit, search, actionFilter, authorFilter]);

  React.useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const users = await adminService.getUsers(0, 1000, undefined, true);
        setAdmins(users.map((u: any) => ({id: u.id, full_name: u.full_name})));
      } catch (err) {
        console.error("Failed to fetch admins", err);
      }
    };
    fetchAdmins();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const actions = [
    'All',
    'Admin Login',
    'Admin Logout',
    'Created Article',
    'Updated Article',
    'Deleted Article',
    'Approved Submission',
    'Rejected Submission',
    'Created Category',
    'Deleted Category',
    'Blocked User',
    'Unblocked User',
    'Deleted Comment',
    'Downloaded PDF Report'
  ];

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  const handlePageChange = (newPage: number) => {
    setSkip((newPage - 1) * limit);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 flex-1 w-full lg:max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search in log details..."
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-xl md:rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSkip(0);
              }}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <CustomSelect
              icon={Filter}
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setSkip(0);
              }}
              containerClassName="min-w-[160px] md:min-w-[180px]"
            >
              {actions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </CustomSelect>
            
            <CustomSelect
              icon={UserIcon}
              value={authorFilter || ''}
              onChange={(e) => {
                const val = e.target.value;
                setAuthorFilter(val ? parseInt(val) : undefined);
                setSkip(0);
              }}
              containerClassName="min-w-[160px] md:min-w-[180px]"
            >
              <option value="">All Admins</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>{admin.full_name}</option>
              ))}
            </CustomSelect>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 font-medium bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 self-start lg:self-auto">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          <span>Total Actions: <span className="text-gray-900 font-bold">{total}</span></span>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile Cards (shown on small screens) */}
        <div className="block lg:hidden divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-20 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center">
              <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No actions found.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {log.admin_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{log.admin_name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">Admin ID: {log.admin_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">
                      {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    log.action.includes('Delete') || log.action.includes('Block') ? "bg-red-50 text-red-600 border border-red-100" :
                    log.action.includes('Create') || log.action.includes('Login') || log.action.includes('Approve') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    "bg-blue-50 text-blue-600 border border-blue-100"
                  )}>
                    {log.action}
                  </span>
                </div>

                <p className="text-gray-600 text-sm font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {log.details}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (hidden on small screens) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Admin</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Action</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Details</th>
                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {log.admin_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{log.admin_name}</p>
                          <p className="text-xs text-gray-400 font-medium">ID: {log.admin_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider",
                        log.action.includes('Delete') || log.action.includes('Block') ? "bg-red-50 text-red-600" :
                        log.action.includes('Create') || log.action.includes('Login') || log.action.includes('Approve') ? "bg-emerald-50 text-emerald-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-md">
                        {log.details}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-gray-400 font-medium translate-y-1">
                          {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 md:px-8 py-6 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Showing <span className="text-gray-900 font-bold">{skip + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(skip + limit, total)}</span> of <span className="text-gray-900 font-bold">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {/* Responsive Pagination - only show current and neighbors on small screens */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  const isNeighbor = Math.abs(pageNumber - currentPage) <= 1;
                  const isFirstOrLast = pageNumber === 1 || pageNumber === totalPages;
                  
                  if (totalPages > 5 && !isNeighbor && !isFirstOrLast) {
                    if (pageNumber === 2 && currentPage > 3) return <span key="dots1" className="px-1 text-gray-400">...</span>;
                    if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots2" className="px-1 text-gray-400">...</span>;
                    return null;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handlePageChange(pageNumber)}
                      className={cn(
                        "w-8 md:w-10 h-8 md:h-10 rounded-xl text-xs md:text-sm font-bold transition-all",
                        currentPage === pageNumber 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                          : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
