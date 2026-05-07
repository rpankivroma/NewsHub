import React from 'react';
import { UserCheck, Star, Eye } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface AuthorPerformanceProps {
  stats: any;
}

export const AuthorPerformance: React.FC<AuthorPerformanceProps> = ({ stats }) => {
  return (
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
  );
};
