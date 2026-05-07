import React from 'react';
import { Globe } from 'lucide-react';
import { 
  ComposableMap, 
  Geographies, 
  Geography,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { cn } from '../../../lib/utils';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface UsersByCountryProps {
  stats: any;
}

export const UsersByCountry: React.FC<UsersByCountryProps> = ({ stats }) => {
  const geoDist = stats.traffic?.geoDist || [];
  const [content, setContent] = React.useState("");

  const maxCount = Math.max(...geoDist.map((d: any) => d.count), 1);

  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(["#eff6ff", "#2563eb"]);

  const topCountries = geoDist.slice(0, 10);
  const totalCountries = geoDist.filter((d: any) => d.country !== 'Unknown' && d.country !== 'Local').length;
  const largestMarket = geoDist.find((d: any) => d.country !== 'Unknown' && d.country !== 'Local') || { country: 'N/A', count: 0 };
  const totalVisits = stats.traffic?.totalVisits || 1;

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
      <div className="p-10 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Users by Country</h3>
          <p className="text-gray-500">Geographic distribution of your audience</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl">
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Map Column */}
          <div className="lg:col-span-2 bg-gray-50 rounded-[2rem] p-8 border border-gray-100 relative">
             {content && (
               <div className="absolute top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-xl z-10 animate-in zoom-in-95">
                 {content}
               </div>
             )}
             
             <ComposableMap projectionConfig={{ scale: 140 }}>
                <Geographies geography={geoUrl}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => {
                      const countryName = geo.properties.name;
                      const countryData = geoDist.find((d: any) => d.country === countryName);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            const count = countryData ? countryData.count : 0;
                            const percent = ((count / totalVisits) * 100).toFixed(1);
                            setContent(`${countryName}: ${count} unique visitors (${percent}%)`);
                          }}
                          onMouseLeave={() => setContent("")}
                          fill={countryData ? colorScale(countryData.count) : "#e2e8f0"}
                          stroke="#ffffff"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#ffa500", outline: "none", cursor: "pointer" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
              
              <div className="mt-8 flex items-center justify-center gap-6">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fewer visitors</span>
                <div className="flex gap-1">
                  {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
                    <div 
                      key={v} 
                      className="w-8 h-6 rounded-md shadow-inner" 
                      style={{ backgroundColor: colorScale(v * maxCount) }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">More visitors</span>
              </div>
              <p className="text-center text-xs text-gray-400 mt-6 font-medium">Hover over countries to see detailed visitor counts</p>
          </div>

          {/* Stats Column */}
          <div className="space-y-10">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                <span>Top 10 Countries</span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Visitors</span>
              </h4>
              <div className="space-y-4">
                {topCountries.filter((d: any) => d.country !== 'Local' && d.country !== 'Unknown').slice(0, 10).map((d: any, i: number) => (
                  <div key={d.country} className="flex items-center justify-between group bg-white p-2 rounded-xl hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        i < 3 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      )}>
                        {i + 1}
                      </div>
                      <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors uppercase text-sm">{d.country}</span>
                    </div>
                    <span className="font-black text-gray-900">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100 grid grid-cols-1 gap-8">
              <div className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Geographic Distribution</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Countries</p>
                    <div className="text-3xl font-black text-gray-900">{totalCountries}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Largest Market</p>
                <div className="text-xl font-black text-blue-600 truncate mb-1">{largestMarket.country}</div>
                <p className="text-sm text-gray-500 font-medium">
                  {largestMarket.count} users ({((largestMarket.count / totalVisits) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
