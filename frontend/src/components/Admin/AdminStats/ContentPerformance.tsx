import React from 'react';
import { FileText, TrendingUp, TrendingDown, Eye, Clock, Calendar, List } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CustomSelect } from '../../CustomSelect';

interface ContentPerformanceProps {
  stats: any;
  statsFilters: {
    topLimit: number;
    days: number;
  };
  setStatsFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const ContentPerformance: React.FC<ContentPerformanceProps> = ({
  stats,
  statsFilters,
  setStatsFilters,
}) => {
  return (
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
          <CustomSelect
            icon={List}
            value={statsFilters.topLimit}
            onChange={(e) => setStatsFilters((prev: any) => ({...prev, topLimit: parseInt(e.target.value)}))}
            containerClassName="w-40"
            className="py-2"
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </CustomSelect>
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
            <CustomSelect
              icon={Calendar}
              value={statsFilters.days}
              onChange={(e) => setStatsFilters((prev: any) => ({...prev, days: parseInt(e.target.value)}))}
              containerClassName="w-48"
              className="py-2"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </CustomSelect>
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
  );
};
