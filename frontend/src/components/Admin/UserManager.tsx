import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Shield, Trash2, AlertCircle, Loader2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';
import SearchInput from '../SearchInput';
import Pagination from '../Pagination';
import { adminService } from '../../services/adminService';
import { CustomSelect } from '../CustomSelect';

interface UserManagerProps {
  user: User;
  handleToggleUserBlock: (userId: number) => void;
  totalUsersCount?: number;
}

const PAGE_SIZE = 10;

export const UserManager: React.FC<UserManagerProps> = ({
  user: currentUser,
  handleToggleUserBlock: propHandleToggleUserBlock,
  totalUsersCount = 0
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'admin' | 'user'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState(totalUsersCount);

  // Update total users when prop changes
  useEffect(() => {
    if (totalUsersCount > 0) setTotalUsers(totalUsersCount);
  }, [totalUsersCount]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const is_admin = role === 'all' ? undefined : (role === 'admin');
      const status_filter = status === 'all' ? undefined : status;
      const data = await adminService.getUsers(page * PAGE_SIZE, PAGE_SIZE + 1, search, is_admin, status_filter);
      
      if (data.length > PAGE_SIZE) {
        setUsers(data.slice(0, PAGE_SIZE));
        setHasMore(true);
      } else {
        setUsers(data);
        setHasMore(false);
      }
      // Note: Backend doesn't return total count yet, maybe estimate or omit
      if (!search && role === 'all' && status === 'all') {
        setTotalUsers(prev => Math.max(prev, (page * PAGE_SIZE) + data.length));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, role, status]);

  const onToggle = async (userId: number) => {
    await propHandleToggleUserBlock(userId);
    fetchUsers();
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Search and Filters Match Screenshot */}
      <div className="bg-white rounded-[1.5rem] md:rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 text-center md:text-left">User Management</h3>
        
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium shadow-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
            <CustomSelect
              icon={Users}
              value={role}
              onChange={(e) => { setRole(e.target.value as any); setPage(0); }}
              className={cn(
                "w-full",
                role !== 'all' && "border-blue-600 text-blue-600 focus:ring-blue-100"
              )}
              containerClassName="flex-1 lg:min-w-[180px]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </CustomSelect>

            <CustomSelect
              icon={Filter}
              value={status}
              onChange={(e) => { setStatus(e.target.value as any); setPage(0); }}
              className={cn(
                "w-full",
                status !== 'all' && "border-blue-600 text-blue-600 focus:ring-blue-100"
              )}
              containerClassName="flex-1 lg:min-w-[180px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </CustomSelect>
          </div>
        </div>

        <div className="mt-6 text-center md:text-left">
          <p className="text-gray-400 text-xs font-medium">
            Showing {users.length > 0 ? (page * PAGE_SIZE + 1) : 0}-{page * PAGE_SIZE + users.length} of {totalUsers} users
          </p>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading users...</p>
        </div>
      ) : (
        <>
          {/* User Cards */}
          <div className="space-y-4 md:space-y-6">
            {users.map(u => (
              <div key={u.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-all relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-600 bg-blue-50">
                          {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">{u.full_name || 'Anonymous User'}</h4>
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs md:text-sm font-bold">
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Mail className="w-4 h-4" /> {u.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <Shield className="w-4 h-4" /> {u.is_admin ? 'Admin' : 'User'}
                          </span>
                        </div>
                      </div>
                                            <button
                        onClick={() => onToggle(u.id)}
                        disabled={Boolean((u.is_admin || u.is_super_admin) && !currentUser.is_super_admin || u.id === currentUser.id)}
                        className={cn(
                          "w-full lg:w-auto px-8 py-3 rounded-xl md:rounded-2xl font-extrabold text-sm transition-all active:scale-95",
                          u.status === 'blocked'
                            ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100"
                            : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100",
                          ((u.is_admin || u.is_super_admin) && !currentUser.is_super_admin || u.id === currentUser.id) && "opacity-50 cursor-not-allowed grayscale"
                        )}
                        title={u.id === currentUser.id ? "You cannot block yourself" : ((u.is_admin || u.is_super_admin) && !currentUser.is_super_admin) ? "Only Super Admin can block other admins" : ""}
                      >
                        {u.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    </div>

                    <p className="text-gray-600 leading-relaxed max-w-2xl font-medium text-sm md:text-base">
                      {u.bio || 'Chief Editor with 15 years of experience in digital journalism.'}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4 md:gap-x-12 pt-4 border-t border-gray-50">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Joined</p>
                        <p className="font-bold text-gray-900 text-xs md:text-sm">{u.joined_at ? new Date(u.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 2024'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Saved</p>
                        <p className="font-bold text-gray-900 text-xs md:text-sm">{u.saved_articles_count || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Newsletter</p>
                        <p className={cn("font-bold text-xs md:text-sm", u.newsletter_subscribed ? "text-green-600" : "text-gray-500")}>
                          {u.newsletter_subscribed ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</p>
                        <p className={cn("font-bold text-xs md:text-sm", u.status === 'active' ? "text-green-600" : "text-red-500")}>
                          {u.status === 'active' ? 'Active' : 'Blocked'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider shrink-0 text-center">Interests:</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                          {(typeof u.interests === 'string' && u.interests.length > 0 ? (u.interests as string).split(',') : ['Technology', 'Science', 'Health']).map((interest, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold tracking-tight">
                              {interest.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-20 text-center">
                <Shield className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-lg">No users found matching your criteria.</p>
              </div>
            )}
            
            <div className="mt-8 flex justify-center">
               <Pagination 
                 currentPage={page} 
                 hasMore={hasMore} 
                 onPageChange={setPage} 
                 disabled={loading} 
               />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
