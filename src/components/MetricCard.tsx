
import React from 'react';
import { MetricData } from '../types';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import Tooltip from './Tooltip';

interface MetricCardProps {
  data: MetricData;
  onClick: (data: MetricData) => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ data, onClick }) => {
  const { definition, currentValue, dailyChange, history, status } = data;
  const hasData = status === 'success' && currentValue !== null;
  
  // Last 30 points for sparkline
  const sparklineData = hasData ? history.slice(-30) : [];
  
  const isPositive = (dailyChange || 0) >= 0;
  
  const formatValue = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    if (definition.format === 'percent') return `${val.toFixed(2)}%`;
    if (definition.format === 'currency') return `$${val.toFixed(2)}B`;
    if (definition.format === 'spread') return `${(val * 100).toFixed(1)} bps`; 
    if (definition.format === 'ratio') return `${val.toFixed(2)}x`;
    return val.toFixed(2);
  };

  const deltaColor = isPositive ? 'text-accent-green' : 'text-accent-red';
  const strokeColor = isPositive ? '#10B981' : '#EF4444';

  const getTypeColor = (type: string) => {
    switch(type) {
        case 'Cash Funding': return 'text-blue-400';
        case 'Collateral': return 'text-purple-400';
        case 'Market': return 'text-orange-400';
        default: return 'text-gray-400';
    }
  }

  return (
    <div 
      onClick={() => hasData && onClick(data)}
      className={`bg-gray-900 border border-gray-800 rounded-lg p-4 transition-colors duration-200 relative group hover:z-30 ${hasData ? 'cursor-pointer hover:border-primary-500' : 'opacity-70 cursor-not-allowed'}`}
    >
        <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
            <Tooltip 
                placement="bottom-end"
                content={
                <div className="text-left space-y-1">
                    <div className={`font-bold border-b border-gray-600 pb-1 mb-1 ${getTypeColor(definition.liquidityType)}`}>
                        {definition.liquidityType} Liquidity
                    </div>
                    {definition.fredId && (
                        <div className="text-xs text-primary-400 font-mono">
                            FRED ID: {definition.fredId}
                        </div>
                    )}
                    <div className="text-gray-300 leading-snug">
                        {definition.description}
                    </div>
                    {!hasData && (
                        <div className="text-red-400 text-xs italic mt-2 border-t border-gray-700 pt-1">
                            Data unavailable. Upload CSV.
                        </div>
                    )}
                </div>
            }>
                <div className="w-5 h-5 rounded-full border border-gray-700 bg-gray-800 text-gray-500 hover:text-white hover:border-gray-500 hover:bg-gray-700 flex items-center justify-center text-xs font-serif italic font-bold cursor-help transition-all shadow-sm">
                    i
                </div>
            </Tooltip>
        </div>

        <div className="flex justify-between items-start mb-2 pr-6">
            <h3 className="text-sm font-medium text-gray-400 pb-0.5">{definition.name}</h3>
        </div>
        
        <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
                {hasData ? formatValue(currentValue) : 'N/A'}
            </span>
            {hasData && dailyChange !== null && (
                <span className={`text-xs font-mono ${deltaColor}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(dailyChange).toFixed(2)}
                </span>
            )}
        </div>

        <div className="h-10 w-full opacity-50 group-hover:opacity-100 transition-opacity overflow-hidden rounded-sm">
            {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                        <defs>
                            <linearGradient id={`color${definition.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={strokeColor} 
                            fillOpacity={1} 
                            fill={`url(#color${definition.id})`} 
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs italic bg-gray-900/50 rounded">
                    No Signal
                </div>
            )}
        </div>
    </div>
  );
};

export default MetricCard;
