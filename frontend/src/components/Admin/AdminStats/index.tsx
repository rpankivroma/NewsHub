import React from 'react';
import { Filter, ChevronDown, Download } from 'lucide-react';
import { cn } from '../../../lib/utils';

import { ContentPerformance } from './ContentPerformance';
import { UserEngagement } from './UserEngagement';
import { TrafficAnalytics } from './TrafficAnalytics';
import { CategoryPerformance } from './CategoryPerformance';
import { AuthorPerformance } from './AuthorPerformance';
import { UsersByCountry } from './UsersByCountry';
import { SystemStats } from './SystemStats';
import { BusinessMetrics } from './BusinessMetrics';
import { CustomSelect } from '../../CustomSelect';

interface AdminStatsProps {
  stats: any;
  statsFilters: {
    days: number;
    topLimit: number;
    sectionFilter: string;
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

const SECTIONS = [
  "Content Performance",
  "User Engagement",
  "Traffic Analytics",
  "Category Performance",
  "Author Performance",
  "Users by Country",
  "System / Admin Stats",
  "Business Metrics"
];

export const AdminStats: React.FC<AdminStatsProps> = ({
  stats,
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
  const showSection = (name: string) => statsFilters.sectionFilter === 'All' || statsFilters.sectionFilter === name;

  return (
    <div id="analytics-dashboard" className="space-y-12 animate-in fade-in duration-500 pb-20 bg-gray-50 p-8 rounded-[3rem]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <h2 className="text-3xl font-bold text-gray-900">Comprehensive Analytics</h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Section Filter */}
            <CustomSelect
              icon={Filter}
              value={statsFilters.sectionFilter}
              onChange={(e) => setStatsFilters((prev: any) => ({...prev, sectionFilter: e.target.value}))}
              className={cn(
                statsFilters.sectionFilter !== 'All' && "border-blue-600 text-blue-600 font-bold"
              )}
              containerClassName="min-w-[220px]"
            >
              <option value="All">All Stats (Full Report)</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </CustomSelect>

            <button 
              onClick={downloadPDFReport}
              className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white font-bold rounded-2xl hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all active:scale-95 whitespace-nowrap"
            >
              <Download className="w-5 h-5" /> Download Report
            </button>
          </div>
        </div>

        {showSection("Content Performance") && (
          <ContentPerformance 
            stats={stats} 
            statsFilters={statsFilters} 
            setStatsFilters={setStatsFilters} 
          />
        )}

        {showSection("User Engagement") && (
          <UserEngagement 
            stats={stats} 
            engagementTrendPeriod={engagementTrendPeriod} 
            setEngagementTrendPeriod={setEngagementTrendPeriod} 
          />
        )}

        {showSection("Traffic Analytics") && (
          <TrafficAnalytics 
            stats={stats} 
            trafficTrendDays={trafficTrendDays} 
            setTrafficTrendDays={setTrafficTrendDays} 
          />
        )}

        {showSection("Category Performance") && <CategoryPerformance stats={stats} />}

        {showSection("Author Performance") && <AuthorPerformance stats={stats} />}

        {showSection("Users by Country") && <UsersByCountry stats={stats} />}

        {showSection("System / Admin Stats") && <SystemStats stats={stats} />}

        {showSection("Business Metrics") && (
          <BusinessMetrics 
            stats={stats} 
            convertingMetric={convertingMetric} 
            setConvertingMetric={setConvertingMetric} 
          />
        )}
    </div>
  );
};
