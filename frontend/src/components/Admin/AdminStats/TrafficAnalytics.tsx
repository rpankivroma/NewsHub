import React from 'react';
import { Globe, TrendingUp, Monitor, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { cn } from '../../../lib/utils';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e'];

interface TrafficAnalyticsProps {
  stats: any;
  trafficTrendDays: number;
  setTrafficTrendDays: (v: number) => void;
}

export const TrafficAnalytics: React.FC<TrafficAnalyticsProps> = ({
  stats,
  trafficTrendDays,
  setTrafficTrendDays,
}) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Globe className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">3. Traffic Analytics</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Today's Visits", value: stats.traffic.todayVisits, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Total Visits', value: stats.traffic.totalVisits.toLocaleString(), subtext: 'Last 30 days', color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'New Users', value: stats.traffic.newUsers.toLocaleString(), subtext: `${Math.round((stats.traffic.newUsers/stats.traffic.totalVisits)*100 || 0)}%`, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Returning', value: stats.traffic.returningUsers.toLocaleString(), subtext: `${Math.round((stats.traffic.returningUsers/stats.traffic.totalVisits)*100 || 0)}%`, color: 'text-orange-600', bg: 'bg-orange-50/50' },
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
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h4>Traffic Trends</h4>
          </div>
          <select 
            value={trafficTrendDays}
            onChange={(e) => setTrafficTrendDays(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.traffic.trafficTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} name="Total Visits" />
              <Line type="monotone" dataKey="new" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="New Users" />
              <Line type="monotone" dataKey="returning" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Returning" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 pt-8">
         <div className="space-y-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
               <Monitor className="w-5 h-5 text-blue-500" />
               <h4>Device Type</h4>
            </div>
            <div className="h-[250px] flex items-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={stats.traffic.deviceDist}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                        {stats.traffic.deviceDist.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="space-y-2">
                  {stats.traffic.deviceDist.map((d: any, i: number) => (
                     <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-xs font-bold text-gray-600">{d.name}: {Math.round((d.value/stats.traffic.totalVisits)*100 || 0)}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
               <Activity className="w-5 h-5 text-orange-500" />
               <h4>New vs Returning</h4>
            </div>
            <div className="h-[250px] flex items-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={stats.traffic.returningDist}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                        <Cell fill="#ef4444" />
                        <Cell fill="#f59e0b" />
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                     <span className="text-xs font-bold text-orange-500">New Users: {Math.round((stats.traffic.newUsers/stats.traffic.totalVisits)*100 || 0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <span className="text-xs font-bold text-red-500">Returning: {Math.round((stats.traffic.returningUsers/stats.traffic.totalVisits)*100 || 0)}%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
