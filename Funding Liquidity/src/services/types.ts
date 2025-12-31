
export enum MetricCategory {
  PRIMARY = 'Primary Raw Data',
  SECONDARY = 'Secondary Calculated Metrics',
}

export type LiquidityType = 'Cash Funding' | 'Collateral' | 'Market';

export interface MetricDefinition {
  id: string;
  name: string;
  category: MetricCategory;
  section?: string; // Optional grouping for UI (e.g., 'Funding', 'Dealer Stats')
  description: string; // Hover state explanation
  liquidityType: LiquidityType; // Classification
  sourceUrl?: string; // Optional source link
  fredId?: string; // The specific FRED Series ID required for this metric
  format: 'percent' | 'currency' | 'number' | 'spread' | 'ratio';
  transformScale?: number; // Optional multiplier (e.g., 0.001 to convert Millions to Billions)
}

export interface DataPoint {
  date: string; // ISO Date YYYY-MM-DD
  value: number;
}

export type DataStatus = 'loading' | 'success' | 'error';

export interface MetricData {
  definition: MetricDefinition;
  currentValue: number | null;
  prevValue: number | null;
  dailyChange: number | null;
  history: DataPoint[]; // Full history
  status: DataStatus;
}

export interface CorrelationData {
  spy: number;
  vix: number;
}

export type TimeRange = '1M' | '3M' | '1Y' | '2Y' | '5Y' | 'MAX';

export interface CalculatedStats {
  velocity1M: number;
  velocity3M: number;
  velocity1Y: number;
  acceleration1M: number;
  acceleration3M: number;
  volatility30D: number;
  zScoreCurrent: number;
  correlation: CorrelationData;
}

