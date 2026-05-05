import React from 'react';
import { Search, Filter, Mail, Shield, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

interface UserManagerProps {
  users: User[];
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  handleToggleUserBlock: (userId: number) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  userSearchQuery,
  setUserSearchQuery,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  handleToggleUserBlock,
}) => {
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase())) || 
                        (u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));
    const matchesRole = selectedRole === 'all' || (selectedRole === 'admin' ? u.is_admin : !u.is_admin);
    const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* New Search and Filters */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 space-y-6">
        <h3 className="text-2xl font-extrabold text-gray-900">User Management</h3>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative group min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-10 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none font-bold text-gray-700 cursor-pointer text-sm outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="relative group min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-10 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none font-bold text-gray-700 cursor-pointer text-sm outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest pt-2">
          Showing 1-{filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* User Cards */}
      <div className="space-y-6">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-8 items-start">
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

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-2xl font-extrabold text-gray-900 mb-1">{u.full_name || 'Anonymous User'}</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Mail className="w-4 h-4" /> {u.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Shield className="w-4 h-4" /> {u.is_admin ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleUserBlock(u.id)}
                    className={cn(
                      "px-8 py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-95",
                      u.status === 'blocked' 
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100" 
                        : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100"
                    )}
                  >
                    {u.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                </div>

                <p className="text-gray-600 leading-relaxed max-w-2xl font-medium">
                  {u.bio || 'Chief Editor with 15 years of experience in digital journalism.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Joined</p>
                    <p className="font-bold text-gray-900">{u.joined_at ? new Date(u.joined_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 2024'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Saved Articles</p>
                    <p className="font-bold text-gray-900">{u.saved_articles_count || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Newsletter</p>
                    <p className={cn("font-bold", u.newsletter_subscribed ? "text-green-600" : "text-gray-500")}>
                      {u.newsletter_subscribed ? 'Subscribed' : 'Not subscribed'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Status</p>
                    <p className={cn("font-bold", u.status === 'active' ? "text-green-600" : "text-red-500")}>
                      {u.status === 'active' ? 'Active' : 'Blocked'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof u.interests === 'string' && u.interests.length > 0 ? (u.interests as string).split(',') : ['Technology', 'Science', 'Health']).map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold tracking-tight">
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof u.tags === 'string' && u.tags.length > 0 ? (u.tags as string).split(',') : ['Innovation', 'Research', 'Wellness']).map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold tracking-tight">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-20 text-center">
            <Shield className="w-12 h-12 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-lg">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
