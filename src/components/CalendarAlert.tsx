import React, { useMemo } from 'react';

const CalendarAlert: React.FC = () => {
  const alertInfo = useMemo(() => {
    const today = new Date();
    // For demo purposes, let's pretend today is close to a quarter end if not actually.
    // Or strictly follow instructions.
    // Strict implementation:
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    const lastDayOfMonth = new Date(nextMonth.getTime() - 1);
    
    const diffTime = lastDayOfMonth.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Quarter ends are March(2), June(5), Sept(8), Dec(11)
    const isQuarterEnd = [2, 5, 8, 11].includes(currentMonth) && diffDays <= 3;
    const isMonthEnd = diffDays <= 3;

    if (isQuarterEnd) {
      return {
        active: true,
        type: 'Quarter-End',
        message: `Quarter-End approaching in ${diffDays} days. Liquidity tightening expected due to G-SIB reporting.`
      };
    } else if (isMonthEnd) {
      return {
        active: true,
        type: 'Month-End',
        message: `Month-End approaching in ${diffDays} days. Expect standard balance sheet constraints.`
      };
    }
    
    // Fallback for demo if not near date: disable or show 'Safe'
    return { active: false, type: '', message: '' };
  }, []);

  if (!alertInfo.active) return null;

  return (
    <div className="w-full bg-accent-yellow/20 border-b border-accent-yellow/40 px-6 py-3 flex items-center justify-center gap-3">
        <span className="text-accent-yellow text-xl">⚠️</span>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="text-accent-yellow font-bold uppercase tracking-wider text-xs border border-accent-yellow px-2 py-0.5 rounded">
                {alertInfo.type} Alert
            </span>
            <span className="text-gray-200 text-sm font-medium">
                {alertInfo.message}
            </span>
        </div>
    </div>
  );
};

export default CalendarAlert;
