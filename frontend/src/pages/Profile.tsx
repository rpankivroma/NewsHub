import React from 'react';
import { User as UserIcon, Mail, Shield, Edit2, Bookmark, Flame, Send, Check, X, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { ARTICLES } from '../constants';
import { User } from '../types';

interface ProfileProps {
  user: User | null;
}

export default function Profile({ user }: ProfileProps) {
  const [activeTab, setActiveTab] = React.useState('about');
  const [isEditing, setIsEditing] = React.useState(false);
  
  if (!user) {
    return <div className="max-w-6xl mx-auto px-4 py-24 text-center">Please login to view your profile.</div>;
  }
  const tabs = [
    { id: 'about', label: 'About', icon: UserIcon },
    { id: 'saved', label: 'Saved (2)', icon: Bookmark },
    { id: 'personalized', label: 'Personalized', icon: Flame },
    { id: 'submissions', label: 'My Submissions (0)', icon: Send },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header Banner */}
      <div className="relative mb-8">
        <div className="h-48 w-full bg-blue-600 rounded-3xl" />
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative">
             <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                <img src={user.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"} alt="Avatar" className="w-full h-full object-cover" />
             </div>
          </div>
          <div className="mb-4">
             <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{user.full_name}</h1>
             <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> {user.is_admin ? 'Admin' : 'User'}</span>
             </div>
          </div>
        </div>
        <div className="absolute top-[13.5rem] right-0">
           {isEditing ? (
             <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md shadow-green-100 transition-all active:scale-95"
                >
                   <Check className="w-4 h-4" /> Save
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 shadow-md transition-all active:scale-95"
                >
                   <X className="w-4 h-4" /> Cancel
                </button>
             </div>
           ) : (
             <button 
               onClick={() => setIsEditing(true)}
               className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
             >
                <Edit2 className="w-4 h-4" /> Edit Profile
             </button>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-28 mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {tabs.map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
               activeTab === tab.id 
                 ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                 : "bg-white text-gray-500 border border-transparent hover:bg-gray-50"
             )}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 md:p-12 mb-12 min-h-[400px]">
         {activeTab === 'about' && (
           <div className="space-y-10">
              <div className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-900">Bio</h3>
                 {isEditing ? (
                   <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-6 outline-none focus:border-blue-600 transition-all"
                    defaultValue={user.bio || "No bio yet."}
                    rows={4}
                   />
                 ) : (
                   <p className="text-gray-600 leading-relaxed">Tech enthusiast and avid news reader.</p>
                 )}
              </div>
              
              <div className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-900">Interested Topics</h3>
                 <div className="flex flex-wrap gap-2">
                    {['Technology', 'Science', 'Health'].map(t => (
                      <span key={t} className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">{t}</span>
                    ))}
                    {isEditing && (
                       <button className="px-4 py-1.5 border-2 border-gray-100 text-gray-400 rounded-full text-xs font-bold hover:border-blue-200 hover:text-blue-500 transition-all">
                          <Plus className="w-3 h-3 inline mr-1" /> Add
                       </button>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xl font-bold text-gray-900">Custom Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {['Innovation', 'Research', 'Wellness'].map(t => (
                      <span key={t} className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100">{t}</span>
                    ))}
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'saved' && (
           <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Saved Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {ARTICLES.slice(0, 2).map(article => (
                  <div key={article.id} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                    <img src={article.imageUrl} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 leading-snug">{article.title}</h4>
                      <p className="text-xs text-gray-400 font-medium">{article.date} • {article.category}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
         )}
         
         {activeTab === 'submissions' && (
            <div className="flex flex-col items-center justify-center text-center h-[300px]">
               <h3 className="text-xl font-bold text-gray-900 mb-2">My News Submissions</h3>
               <p className="text-gray-400 mb-8 max-w-xs">No news submissions yet. Click "Submit News" to contribute!</p>
               <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                  <Plus className="w-5 h-5" /> Submit News
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
