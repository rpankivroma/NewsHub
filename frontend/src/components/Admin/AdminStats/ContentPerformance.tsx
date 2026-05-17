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
    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 md:space-y-12">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">1. Content Performance</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Articles', value: stats.content.totalArticles, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Avg Reading', value: `${stats.content.avgReadingTime}m`, valueDesktop: `${stats.content.avgReadingTime} min`, color: 'text-green-600', bg: 'bg-green-50/50' },
          { label: 'Avg Views', value: stats.content.avgViews, color: 'text-purple-600', bg: 'bg-purple-50/50' },
          { label: 'Total Views', value: stats.content.totalViews >= 1000 ? (stats.content.totalViews / 1000).toFixed(1) + 'k' : stats.content.totalViews, valueDesktop: stats.content.totalViews.toLocaleString(), color: 'text-amber-600', bg: 'bg-amber-50/50' },
        ].map((card, i) => (
          <div key={i} className={cn("p-4 md:p-6 rounded-2xl md:rounded-3xl", card.bg)}>
            <p className="text-[10px] md:text-sm font-bold text-blue-400 mb-1 md:mb-2 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl md:text-3xl font-extrabold text-gray-900">
              <span className="hidden md:inline">{card.valueDesktop || card.value}</span>
              <span className="inline md:hidden">{card.value}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h4 className="text-lg">Top Viewed Articles</h4>
          </div>
          <CustomSelect
            icon={List}
            value={statsFilters.topLimit}
            onChange={(e) => setStatsFilters((prev: any) => ({...prev, topLimit: parseInt(e.target.value)}))}
            containerClassName="w-full md:w-40"
            className="py-2"
          >
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </CustomSelect>
        </div>
        <div className="space-y-3 md:space-y-4">
          {stats.content.topViewed.map((art: any, i: number) => (
            <div key={art.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-gray-50/50 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-colors gap-4">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                  {i + 1}
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 line-clamp-1 text-sm md:text-base">{art.title}</h5>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{art.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 md:gap-6 ml-12 sm:ml-0">
                <span className="flex items-center gap-1.5 text-gray-500 font-bold text-xs md:text-sm">
                  <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" /> {art.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500 font-bold text-xs md:text-sm">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> {art.readingTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h4 className="text-lg">Least Viewed Articles</h4>
          </div>
          <CustomSelect
            icon={Calendar}
            value={statsFilters.days}
            onChange={(e) => setStatsFilters((prev: any) => ({...prev, days: parseInt(e.target.value)}))}
            containerClassName="w-full md:w-48"
            className="py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </CustomSelect>
        </div>
        <div className="space-y-3 md:space-y-4">
          {stats.content.leastViewed.map((art: any) => (
            <div key={art.id} className="p-4 md:p-5 bg-pink-50/30 rounded-xl md:rounded-2xl border border-pink-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-gray-900 text-sm md:text-base">{art.title}</h5>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {art.category} • Published {art.date}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-gray-500 font-bold text-xs md:text-sm bg-white/60 px-4 py-1.5 rounded-full border border-pink-100 self-start sm:self-auto">
                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" /> {art.views.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
