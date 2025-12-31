
import { DataPoint } from '../types';

export const calculateMean = (data: number[]): number => {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
};

export const calculateStdDev = (data: number[]): number => {
  if (data.length < 2) return 0;
  const mean = calculateMean(data);
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (data.length - 1);
  return Math.sqrt(variance);
};

export const calculateRollingStdDev = (data: DataPoint[], windowSize: number): DataPoint[] => {
  if (data.length < windowSize) return [];
  const result: DataPoint[] = [];
  
  // Sort by date ascending to ensure rolling window is correct
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (let i = windowSize; i < sortedData.length; i++) {
    const windowSlice = sortedData.slice(i - windowSize, i).map(d => d.value);
    const mean = calculateMean(windowSlice);
    const variance = windowSlice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / windowSize;
    result.push({
        date: sortedData[i].date,
        value: Math.sqrt(variance)
    });
  }
  return result;
};

export const calculateZScore = (value: number, mean: number, stdDev: number): number => {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
};

export const calculatePercentile = (data: number[], percentile: number): number => {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
};

// Helper to find value N days ago based on Date objects, not array indices
const getValueByLookback = (history: DataPoint[], daysAgo: number): number | null => {
    if (history.length === 0) return null;
    
    const current = history[history.length - 1];
    const currentDate = new Date(current.date).getTime();
    const targetDate = currentDate - (daysAgo * 24 * 60 * 60 * 1000);
    
    // Find point closest to target date
    let closestPoint: DataPoint | null = null;
    let minDiff = Infinity;
    
    // Iterate backwards as recent data is at the end
    for (let i = history.length - 1; i >= 0; i--) {
        const ptTime = new Date(history[i].date).getTime();
        const diff = Math.abs(ptTime - targetDate);
        
        if (diff < minDiff) {
            minDiff = diff;
            closestPoint = history[i];
        } else {
            // Optimization: If diff starts growing and we are past the target, we found the closest
            if (ptTime < targetDate) break; 
        }
    }
    
    // If the closest point is wildly off (e.g. data gap > 2x the lookback), maybe return null?
    // For now, we assume best effort is better than nothing for sparse data like Weekly Fails.
    return closestPoint ? closestPoint.value : null;
};

// Calculates simple velocity (change over period n days)
export const calculateVelocity = (history: DataPoint[], days: number): number => {
  if (history.length < 2) return 0;
  
  const current = history[history.length - 1].value;
  const past = getValueByLookback(history, days);
  
  if (past === null) return 0;
  return (current - past);
};

// Calculates acceleration (change in velocity)
export const calculateAcceleration = (history: DataPoint[], days: number): number => {
  // Accel = (V_now - V_prev)
  // V_now = Price_0 - Price_30
  // V_prev = Price_30 - Price_60
  
  if (history.length < 2) return 0;
  
  const p0 = history[history.length - 1].value;
  const p1 = getValueByLookback(history, days);
  const p2 = getValueByLookback(history, days * 2);
  
  if (p1 === null || p2 === null) return 0;
  
  const v1 = p0 - p1;
  const v2 = p1 - p2;
  
  return v1 - v2;
};

