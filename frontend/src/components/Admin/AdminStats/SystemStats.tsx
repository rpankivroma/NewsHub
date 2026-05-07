import React from 'react';
import { Activity, Clock, Star } from 'lucide-react';

interface SystemStatsProps {
  stats: any;
}

export const SystemStats: React.FC<SystemStatsProps> = ({ stats }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <Activity className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">6. System / Admin Stats</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-amber-50/30 border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-amber-600 mb-1">Pending Articles</p>
            <p className="text-4xl font-black text-gray-900">{stats.system.pendingArticles}</p>
          </div>
          <Clock className="w-10 h-10 text-amber-200" />
        </div>
        <div className="p-8 rounded-3xl bg-red-50/30 border border-red-100 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-bold text-red-600 mb-1">Rejected Articles</p>
            <p className="text-4xl font-black text-gray-900">{stats.system.rejectedArticles}</p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-green-50/30 border border-green-100 space-y-2">
        <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4" /> Last Published Article
        </div>
        <h4 className="text-lg font-bold text-gray-900">{stats.system.lastPublished?.title || 'None'}</h4>
        <p className="text-xs font-bold text-gray-400">{stats.system.lastPublished?.time || ''}</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Star className="w-5 h-5 text-amber-500" />
          <h4>Recent Admin Activity</h4>
        </div>
        <div className="space-y-4">
          {stats.system.recentLogs.map((log: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-5 bg-gray-50/50 rounded-2xl">
              <div>
                <h5 className="font-bold text-gray-900">{log.action}</h5>
                <p className="text-xs text-gray-400 font-medium">{log.details}</p>
              </div>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
