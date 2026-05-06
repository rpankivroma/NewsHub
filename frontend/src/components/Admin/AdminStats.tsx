import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { 
  FileText, TrendingUp, Clock, Eye, Activity, Globe, Monitor, Smartphone,
  BarChart2, Briefcase, TrendingDown, Heart, MessageSquare, Star, Download, UserCheck, Filter, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Category } from '../../types';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e'];

interface AdminStatsProps {
  stats: any;
  categories: Category[];
  statsFilters: {
    days: number;
    topLimit: number;
    categoryFilter: string;
  };
  setStatsFilters: React.Dispatch<React.SetStateAction<any>>;
  engagementTrendPeriod: string;
  setEngagementTrendPeriod: (v: string) => void;
  trafficTrendDays: number;
  setTrafficTrendDays: (v: number) => void;
  convertingMetric: string;
  setConvertingMetric: (v: string) => void;
  downloadPDFReport: () => void;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  stats,
  categories,
  statsFilters,
  setStatsFilters,
  engagementTrendPeriod,
  setEngagementTrendPeriod,
  trafficTrendDays,
  setTrafficTrendDays,
  convertingMetric,
  setConvertingMetric,
  downloadPDFReport
}) => {
  return (
    <div id="analytics-dashboard" className="space-y-12 animate-in fade-in duration-500 pb-20 bg-gray-50 p-8 rounded-[3rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold text-gray-900">Comprehensive Analytics</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors",
                statsFilters.categoryFilter !== 'All' ? "text-blue-600" : "text-gray-400"
              )} />
              <select 
                value={statsFilters.categoryFilter}
                onChange={(e) => setStatsFilters((prev: any) => ({...prev, categoryFilter: e.target.value}))}
                className={cn(
                  "pl-10 pr-10 py-3 bg-white border rounded-2xl text-sm font-bold transition-all outline-none shadow-sm appearance-none cursor-pointer min-w-[160px]",
                  statsFilters.categoryFilter !== 'All' 
                    ? "border-blue-600 text-blue-600" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                )}
              >
                <option value="All">All Topics</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <button 
              onClick={downloadPDFReport}
              className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white font-bold rounded-2xl hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download className="w-5 h-5" /> Download Report
            </button>
          </div>
        </div>

        {/* 1. Content Performance */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">1. Content Performance</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Articles', value: stats.content.totalArticles, color: 'text-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Avg Reading Time', value: `${stats.content.avgReadingTime} min`, color: 'text-green-600', bg: 'bg-green-50/50' },
              { label: 'Avg Views', value: stats.content.avgViews, color: 'text-purple-600', bg: 'bg-purple-50/50' },
              { label: 'Total Views', value: stats.content.totalViews.toLocaleString(), color: 'text-amber-600', bg: 'bg-amber-50/50' },
            ].map((card, i) => (
              <div key={i} className={cn("p-6 rounded-3xl", card.bg)}>
                <p className="text-sm font-bold text-blue-400 mb-2">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h4>Top Viewed Articles</h4>
              </div>
              <select 
                value={statsFilters.topLimit}
                onChange={(e) => setStatsFilters((prev: any) => ({...prev, topLimit: parseInt(e.target.value)}))}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
            <div className="space-y-4">
              {stats.content.topViewed.map((art: any, i: number) => (
                <div key={art.id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 line-clamp-1">{art.title}</h5>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{art.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                      <Eye className="w-4 h-4" /> {art.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                      <Clock className="w-4 h-4" /> {art.readingTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h4>Least Viewed Articles</h4>
              </div>
              <div className="flex gap-3">
                <select 
                  value={statsFilters.days}
                  onChange={(e) => setStatsFilters((prev: any) => ({...prev, days: parseInt(e.target.value)}))}
                  className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              {stats.content.leastViewed.map((art: any) => (
                <div key={art.id} className="p-5 bg-pink-50/30 rounded-2xl border border-pink-50/50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-gray-900">{art.title}</h5>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {art.category} • Published {art.date}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 text-gray-500 font-bold text-sm bg-white/60 px-4 py-1.5 rounded-full border border-pink-100">
                    <Eye className="w-4 h-4" /> {art.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. User Engagement */}
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
              <select 
                value={engagementTrendPeriod}
                onChange={(e) => setEngagementTrendPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
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

        {/* 3. Traffic Analytics */}
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

        {/* 4. Category Performance */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">4. Category Performance</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Globe className="w-5 h-5 text-blue-500" />
                <h4>Articles per Category</h4>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categories.distribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      {stats.categories.distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h4>Most Popular Categories</h4>
              </div>
              <div className="space-y-4">
                {stats.categories.popular.map((p: any, i: number) => (
                  <div key={p.name} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black">
                        {i + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900">{p.name}</h5>
                        <p className="text-xs font-bold text-gray-400">{p.articles} articles</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-gray-900 font-black text-sm">
                      <Eye className="w-4 h-4 text-gray-400" /> {p.views.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Author Performance */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">5. Author Performance</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Authors', value: stats.authors.count, color: 'text-blue-600', bg: 'bg-blue-50/50' },
              { label: 'Avg Articles', value: stats.authors.avgArticles, subtext: 'Per author', color: 'text-green-600', bg: 'bg-green-50/50' },
              { label: 'Avg Views', value: stats.authors.avgViews, subtext: 'Per author', color: 'text-purple-600', bg: 'bg-purple-50/50' },
            ].map((card, i) => (
              <div key={i} className={cn("p-6 rounded-3xl", card.bg)}>
                <p className="text-xs font-bold text-blue-400 mb-1">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
                {card.subtext && <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-tighter">{card.subtext}</p>}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Star className="w-5 h-5 text-amber-500" />
                <h4>Top Performing Authors</h4>
              </div>
            </div>
            <div className="space-y-4">
              {stats.authors.top.map((a: any, i: number) => (
                <div key={a.name} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">{a.name}</h5>
                      <p className="text-xs font-bold text-gray-400">{a.articles} articles</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-indigo-600 font-black text-sm">
                    <Eye className="w-4 h-4 text-gray-400" /> {a.views.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. System / Admin Stats */}
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

        {/* 7. Business Metrics */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">7. Business Metrics</h3>
          </div>

          <div className="p-8 rounded-3xl bg-emerald-50/30 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> Click-Through Rate (CTR)
            </div>
            <p className="text-4xl font-black text-emerald-600">{stats.business.ctr}%</p>
            <p className="text-xs font-bold text-gray-400">
              {stats.content.totalViews.toLocaleString()} clicks / {stats.business.impressions.toLocaleString()} impressions
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Heart className="w-5 h-5 text-pink-500" />
                <h4>Top Converting Articles</h4>
              </div>
              <select 
                value={convertingMetric}
                onChange={(e) => setConvertingMetric(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none"
              >
                <option value="Total Engagement">Total Engagement</option>
                <option value="Likes">Likes</option>
                <option value="Comments">Comments</option>
              </select>
            </div>
            <div className="space-y-4">
              {stats.business.topConverting.map((art: any, i: number) => (
                <div key={art.id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black">
                      {i + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 line-clamp-1">{art.title}</h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{art.category}</span>
                        <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-3">
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><Heart className="w-3 h-3" /> {art.likes}</span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><MessageSquare className="w-3 h-3" /> {art.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600">{art.total}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};
