import React from 'react';
import { Activity, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../CustomSelect';

interface UserEngagementProps {
  stats: any;
  engagementTrendPeriod: string;
  setEngagementTrendPeriod: (v: string) => void;
}

export const UserEngagement: React.FC<UserEngagementProps> = ({
  stats,
  engagementTrendPeriod,
  setEngagementTrendPeriod,
}) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <Activity className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">2. User Engagement</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.engagement.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Active Users', value: stats.engagement.activeUsers, subtext: 'Last 30 days', color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Avg Likes', value: stats.engagement.avgLikes.toFixed(1), subtext: 'Per article', color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Avg Comments', value: stats.engagement.avgComments, subtext: 'Per article', color: 'text-orange-600', bg: 'bg-orange-50/50' },
        ].map((card, i) => (
          <div key={i} className={cn("p-6 rounded-3xl", card.bg)}>
            <p className="text-xs font-bold text-blue-400 mb-1">{card.label}</p>
            <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
            {card.subtext && <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-tighter">{card.subtext}</p>}
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Activity className="w-5 h-5 text-blue-500" />
            <h4>New Users Trend</h4>
          </div>
          <CustomSelect
            icon={Calendar}
            value={engagementTrendPeriod}
            onChange={(e) => setEngagementTrendPeriod(e.target.value)}
            className="py-2"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </CustomSelect>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.engagement.newUsersTrend}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
