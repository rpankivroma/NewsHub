import React from 'react';
import { Briefcase, Globe, TrendingUp, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e'];

interface CategoryPerformanceProps {
  stats: any;
}

export const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({ stats }) => {
  return (
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
  );
};
