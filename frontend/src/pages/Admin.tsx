import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, FileText, Send, Users as UsersIcon, Heart, Info,
  TrendingUp, CheckCircle, Clock, MessageSquare, Plus, Edit2, Trash2, Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ARTICLES } from '../constants';

import { User } from '../types';

interface AdminProps {
  user: User | null;
}

export default function Admin({ user }: AdminProps) {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (!user || !user.is_admin) {
    return <div className="max-w-6xl mx-auto px-4 py-24 text-center">Unauthorized. You must be an admin to view this page.</div>;
  }

  const stats = [
    { label: 'Total Articles', value: '45', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: '1,284', icon: UsersIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending News', value: '3', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Comments', value: '842', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const categoryData = [
    { name: 'Technology', value: 12 },
    { name: 'Business', value: 8 },
    { name: 'Science', value: 10 },
    { name: 'Health', value: 6 },
    { name: 'Sports', value: 9 },
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const adminTabs = [
    { id: 'dashboard', label: 'Statistics', icon: LayoutDashboard },
    { id: 'articles', label: 'Articles', icon: FileText },
    { id: 'submissions', label: 'Submissions (3)', icon: Send },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'donations', label: 'Donations', icon: Heart },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-12 tracking-tight">Admin Panel</h1>

      <div className="flex gap-2 mb-12 overflow-x-auto pb-2">
         {adminTabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "bg-white text-gray-500 border border-gray-100 hover:border-blue-200 hover:text-blue-600"
              )}
            >
               <tab.icon className="w-4 h-4" />
               {tab.label}
            </button>
         ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-12">
           {/* Stats Grid */}
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                   </div>
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-7 h-7", stat.color)} />
                   </div>
                </div>
              ))}
           </div>

           {/* Charts Grid */}
           <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <h3 className="text-xl font-bold text-gray-900 mb-10">Articles by Category</h3>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <h3 className="text-xl font-bold text-gray-900 mb-10">Category Distribution</h3>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           {/* Popular articles list */}
           <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" /> Most Popular Articles
                 </h3>
              </div>
              <div className="space-y-4">
                 {ARTICLES.map((article, i) => (
                   <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-6">
                         <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {i + 1}
                         </div>
                         <div>
                            <h4 className="font-bold text-gray-900">{article.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                               <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">{article.category}</span>
                               <span>👍 {article.likes}</span>
                               <span>👎 {article.dislikes}</span>
                            </div>
                         </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                         <Edit2 className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'articles' && (
         <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
               <h3 className="text-xl font-bold text-gray-900">Manage Articles</h3>
               <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100">
                  <Plus className="w-5 h-5" /> New Article
               </button>
            </div>
            <div className="divide-y divide-gray-100">
               {ARTICLES.map(article => (
                 <div key={article.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex gap-6 max-w-2xl">
                       <img src={article.imageUrl} className="w-32 h-20 object-cover rounded-xl shrink-0" />
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-gray-900 truncate">{article.title}</h4>
                             {article.isFeatured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{article.author} • {article.date}</p>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold uppercase tracking-wider">{article.category}</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 className="w-5 h-5" />
                       </button>
                       <button className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}
