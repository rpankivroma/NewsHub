import React, { useState, useEffect } from 'react';
import { Shield, Plus, X, Search, Loader2, Trash2, Mail, Clock, Calendar, Download, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';
import { adminService } from '../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';
import SearchInput from '../SearchInput';

interface AdminStats {
  id: number;
  full_name: string;
  email: string;
  joined_at: string;
  last_login_at: string | null;
  hours_today: number;
  hours_week: number;
  hours_month: number;
}

const REPORT_COLUMNS = [
  { id: 'full_name', label: 'Full name' },
  { id: 'email', label: 'Email' },
  { id: 'joined_at', label: 'Joined at' },
  { id: 'time_in_company', label: 'Time in Company' },
  { id: 'last_login_at', label: 'Last Login' },
  { id: 'hours_today', label: 'Hours/Day' },
  { id: 'hours_week', label: 'Hours/Week' },
  { id: 'hours_month', label: 'Hours/Month' },
];

export const AdminManager: React.FC = () => {
  const [admins, setAdmins] = useState<AdminStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(REPORT_COLUMNS.map(c => c.id));
  const [searchUsers, setSearchUsers] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminService.getManageAdmins();
      setAdmins(data.admins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchUsers.trim()) return;
    setSearching(true);
    try {
      const data = await adminService.getUsers(0, 10, searchUsers);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!selectedUserId) return;
    try {
      await adminService.promoteToAdmin(selectedUserId);
      setNotification({ type: 'success', message: 'User successfully promoted to Admin' });
      setIsModalOpen(false);
      setSelectedUserId(null);
      setSearchUsers('');
      setUsers([]);
      fetchAdmins();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to promote user' });
    }
  };

  const handleDeleteAdmin = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this admin profile? This will also delete the user account.')) return;
    try {
      await adminService.deleteAdminProfile(userId);
      setNotification({ type: 'success', message: 'Admin profile deleted successfully' });
      fetchAdmins();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete admin' });
    }
  };

  const handleDownloadReport = async () => {
    if (selectedColumns.length === 0) return;
    try {
      const blob = await adminService.downloadAdminsReport(selectedColumns);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admins_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsReportModalOpen(false);
      setNotification({ type: 'success', message: 'Report generated and download started' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to generate report' });
    }
  };

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getTimeInCompany = (joinedAt: string) => {
    const joined = new Date(joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Admin Management</h3>
            <p className="text-gray-500 font-medium tracking-tight">Monitor and manage administrative permissions and activity</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-extrabold hover:bg-gray-800 transition-all shadow-lg shadow-gray-100 active:scale-95"
            >
              <Download className="w-5 h-5" />
              Download .excel report
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-extrabold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Admin
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div className={cn(
          "px-6 py-4 rounded-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
          notification.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {notification.message}
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Name</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Joined at</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Time in Company</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Last Login</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Hours/Day</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Hours/Week</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Hours/Month</th>
                <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-gray-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading admins...</p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                          {admin.full_name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 leading-none mb-1">{admin.full_name}</p>
                          <p className="text-xs font-bold text-gray-400">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                        <Calendar className="w-4 h-4 text-gray-300" />
                        {new Date(admin.joined_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-black">
                        {getTimeInCompany(admin.joined_at)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                        <Clock className="w-4 h-4 text-gray-300" />
                        {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Never'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{admin.hours_today}h</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{admin.hours_week}h</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{admin.hours_month}h</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-100">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900">Download Report</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select columns to include</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-3">
                {REPORT_COLUMNS.map((column) => (
                  <button
                    key={column.id}
                    onClick={() => toggleColumn(column.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                      selectedColumns.includes(column.id)
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "font-bold transition-colors",
                      selectedColumns.includes(column.id) ? "text-blue-700" : "text-gray-600"
                    )}>
                      {column.label}
                    </span>
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      selectedColumns.includes(column.id) 
                        ? "bg-blue-600 scale-100" 
                        : "bg-gray-100 scale-0 group-hover:scale-50"
                    )}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={handleDownloadReport}
                  disabled={selectedColumns.length === 0}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Download report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900">Add New Admin</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select user to promote</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-black text-gray-700 ml-1 uppercase tracking-wider">Search User</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by Email, ID or Name"
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-600 transition-all outline-none font-bold text-gray-700"
                      />
                    </div>
                    <button
                      onClick={handleSearchUsers}
                      disabled={searching || !searchUsers.trim()}
                      className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {users.length > 0 ? (
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => !u.is_admin && setSelectedUserId(u.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                            selectedUserId === u.id
                              ? "border-blue-600 bg-blue-50/50"
                              : u.is_admin 
                              ? "border-gray-50 bg-gray-50 opacity-60 cursor-not-allowed"
                              : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-gray-400">
                              {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-bold text-gray-900">{u.full_name || 'Anonymous'}</p>
                               <p className="text-xs font-bold text-gray-400">{u.email}</p>
                            </div>
                          </div>
                          {u.is_admin ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Already Admin</span>
                          ) : selectedUserId === u.id && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <Shield className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : searchUsers && !searching ? (
                    <div className="text-center py-8 text-gray-400 font-bold">
                      No users found.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                <button
                  onClick={handleAddAdmin}
                  disabled={!selectedUserId}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Add as Admin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
