
import React, { useState, useMemo } from 'react';
import { MetricData, TimeRange } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ReferenceLine, Legend 
} from 'recharts';
import { calculateVelocity, calculateAcceleration, calculateMean, calculateStdDev, calculateZScore, calculateRollingStdDev } from '../services/mathUtils';

interface DetailModalProps {
  metric: MetricData | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ metric, onClose }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [showZScore, setShowZScore] = useState(false);
  const [showVol, setShowVol] = useState(false);

  if (!metric) return null;

  // Filter history based on range
  const displayHistory = useMemo(() => {
    if (!metric.history || metric.history.length === 0) return [];
    const total = metric.history.length;
    let days = 365;
    switch (timeRange) {
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
      case '2Y': days = 730; break;
      case '5Y': days = 1825; break;
      case 'MAX': days = total; break;
    }
    return metric.history.slice(Math.max(0, total - days));
  }, [metric, timeRange]);

  // Calculate stats for current view
  const stats = useMemo(() => {
    if (displayHistory.length === 0) return { mean: 0, stdDev: 0, data: [] };
    const rawValues = displayHistory.map(d => d.value);
    const mean = calculateMean(rawValues);
    const stdDev = calculateStdDev(rawValues);
    
    // Calculate real rolling volatility (30-day window)
    const rollingVolData = calculateRollingStdDev(displayHistory, 30);
    const volMap = new Map(rollingVolData.map(d => [d.date, d.value]));

    const dataWithStats = displayHistory.map(d => ({
      ...d,
      zScore: calculateZScore(d.value, mean, stdDev),
      vol: volMap.get(d.date) || 0 // Use real calculated vol
    }));
    
    return { mean, stdDev, data: dataWithStats };
  }, [displayHistory]);

  const velocity = useMemo(() => ({
    '1M': calculateVelocity(metric.history, 30),
    '3M': calculateVelocity(metric.history, 90),
    '1Y': calculateVelocity(metric.history, 365),
    '4Y': calculateVelocity(metric.history, 365 * 4),
  }), [metric]);

  const acceleration = useMemo(() => ({
    '1M': calculateAcceleration(metric.history, 30),
    '3M': calculateAcceleration(metric.history, 90),
    '1Y': calculateAcceleration(metric.history, 365),
    '4Y': calculateAcceleration(metric.history, 365 * 4),
  }), [metric]);
  
  // Handle overlay click to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatYAxis = (val: number) => {
      if (showZScore) return val.toFixed(1);
      if (metric.definition.format === 'currency') return `$${val}B`;
      return val.toFixed(2);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 border border-gray-700 w-full max-w-6xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-start bg-gray-850">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{metric.definition.name}</h2>
              <span className="px-2 py-0.5 rounded bg-primary-600/20 text-primary-500 text-xs font-mono border border-primary-600/30">
                {metric.definition.id}
              </span>
            </div>
            <p className="text-gray-400 mt-1 max-w-2xl">{metric.definition.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chart Section */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex bg-gray-800 rounded-lg p-1">
                {(['1M', '3M', '1Y', '2Y', '5Y', 'MAX'] as TimeRange[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${timeRange === r ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                    <input type="checkbox" checked={showZScore} onChange={e => setShowZScore(e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-primary-500 focus:ring-offset-gray-900" />
                    Show Z-Score
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                    <input type="checkbox" checked={showVol} onChange={e => setShowVol(e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-primary-500 focus:ring-offset-gray-900" />
                    Show 30D Rolling Vol
                 </label>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[400px] w-full bg-gray-950 rounded-lg border border-gray-800 p-4">
              {stats.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF" 
                        tickFormatter={(val) => val.slice(0,7)} 
                        minTickGap={30}
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                        stroke="#9CA3AF"
                        tickFormatter={formatYAxis} 
                        domain={['auto', 'auto']}
                        style={{ fontSize: '12px' }}
                    />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#F3F4F6' }}
                        itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey={showZScore ? "zScore" : "value"} 
                        name={showZScore ? "Z-Score" : metric.definition.name}
                        stroke="#3B82F6" 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={{ r: 6 }}
                    />
                    {showVol && !showZScore && (
                        <Line 
                            type="monotone"
                            dataKey="vol"
                            name="30D Rolling Vol"
                            stroke="#EF4444"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            yAxisId={0}
                        />
                    )}
                    {showZScore && (
                        <>
                            <ReferenceLine y={2} stroke="#EF4444" strokeDasharray="3 3" label="+2σ" />
                            <ReferenceLine y={-2} stroke="#EF4444" strokeDasharray="3 3" label="-2σ" />
                        </>
                    )}
                    </LineChart>
                </ResponsiveContainer>
              ) : (
                  <div className="flex items-center justify-center h-full text-gray-600">No History Available</div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Stats Summary */}
             <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Distribution ({timeRange})</h4>
                <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Mean</span>
                        <span className="text-white">{stats.mean.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Std Dev</span>
                        <span className="text-white">{stats.stdDev.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Current Z</span>
                        <span className="text-white">
                            {metric.currentValue !== null 
                              ? `${calculateZScore(metric.currentValue, stats.mean, stats.stdDev).toFixed(2)}σ` 
                              : 'N/A'}
                        </span>
                    </div>
                </div>
             </div>

            {/* Velocity & Acceleration */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Momentum Analytics</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-500">
                                <th className="py-2 font-medium">Period</th>
                                <th className="py-2 font-medium text-right">Vel</th>
                                <th className="py-2 font-medium text-right">Accel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 font-mono">
                            {['1M', '3M', '1Y', '4Y'].map(p => {
                                const v = velocity[p as keyof typeof velocity];
                                const a = acceleration[p as keyof typeof acceleration];
                                return (
                                    <tr key={p}>
                                        <td className="py-2 text-gray-300">{p}</td>
                                        <td className={`py-2 text-right ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {v.toFixed(3)}
                                        </td>
                                        <td className={`py-2 text-right ${a >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                            {a.toFixed(3)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
