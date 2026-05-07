import React from 'react';
import { TrendingUp, Heart, MessageSquare } from 'lucide-react';

interface BusinessMetricsProps {
  stats: any;
  convertingMetric: string;
  setConvertingMetric: (v: string) => void;
}

export const BusinessMetrics: React.FC<BusinessMetricsProps> = ({
  stats,
  convertingMetric,
  setConvertingMetric,
}) => {
  return (
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
  );
};
