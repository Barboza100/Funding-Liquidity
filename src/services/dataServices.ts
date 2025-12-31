
import { METRICS } from '../components/constants';
import { DataPoint, MetricData, MetricCategory } from './types';
import { calculateStdDev, calculatePercentile } from './mathUtils';

// Global cache for parsed CSV data
let parsedDataCache: Record<string, DataPoint[]> = {};

// API Key Management
let fredApiKey = '';
try {
  fredApiKey = localStorage.getItem('FRED_API_KEY') || '';
} catch (e) {
  console.warn('LocalStorage access denied');
}

export const getApiKey = (): string => fredApiKey;

export const setApiKey = (key: string): void => {
  fredApiKey = key;
  try {
    localStorage.setItem('FRED_API_KEY', key);
  } catch (e) {
    console.warn('LocalStorage access denied');
  }
};

const CORS_PROXY = "https://corsproxy.io/?";
const FRED_BASE_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=";

/**
 * Fetches a single series from FRED via CORS proxy.
 * Uses the public CSV endpoint which acts as a "built-in" access method
 * without requiring individual API keys from the user.
 */
export const fetchSeriesFromFred = async (fredId: string, scale?: number): Promise<DataPoint[]> => {
  // We add a random parameter to prevent browser caching of stale data
  const cacheBuster = `&_t=${new Date().getTime()}`;
  const url = `${CORS_PROXY}${FRED_BASE_URL}${fredId}${cacheBuster}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const lines = text.split('\n');
    const data: DataPoint[] = [];

    // FRED CSV format: DATE,VALUE
    // Skip header (line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');

      const datePart = parts[0];
      const valPart = parts[1];

      // FRED represents missing data as '.'
      if (datePart && valPart && valPart !== '.') {
        let val = parseFloat(valPart);
        if (!isNaN(val)) {
          if (scale) {
            val = val * scale;
          }
          data.push({ date: datePart, value: val });
        }
      }
    }
    return data;
  } catch (e) {
    console.warn(`Error fetching FRED ID: ${fredId}`, e);
    return [];
  }
};

/**
 * Orchestrates the fetching of all primary metrics with random delays
 * to mimic human behavior and avoid rate limiting.
 */
export const orchestrateLiveFetch = async (onProgress: (msg: string) => void): Promise<void> => {
  const primaryMetrics = METRICS.filter(m => m.category === MetricCategory.PRIMARY && m.fredId);

  for (let i = 0; i < primaryMetrics.length; i++) {
    const metric = primaryMetrics[i];
    if (!metric.fredId) continue;

    onProgress(`[${i + 1}/${primaryMetrics.length}] Fetching ${metric.name}...`);

    // Random "Human" Delay: 600ms to 1500ms
    const delay = Math.floor(Math.random() * 900) + 600;
    await new Promise(resolve => setTimeout(resolve, delay));

    const data = await fetchSeriesFromFred(metric.fredId, metric.transformScale);
    if (data.length > 0) {
      parsedDataCache[metric.id] = data;
    }
  }
  onProgress('Calibrating secondary liquidity metrics...');
  await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX
};

/**
 * Parses raw CSV text into the application's data structure.
 * Expected format: DATE, COLUMN_1, COLUMN_2...
 */
export const processCsvData = (csvText: string): boolean => {
  try {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return false;

    const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
    const dateIndex = headers.indexOf('DATE');

    if (dateIndex === -1) {
      console.error('CSV Missing "DATE" column');
      return false;
    }

    const tempCache: Record<string, DataPoint[]> = {};

    // Initialize arrays for found headers
    headers.forEach((h, i) => {
      if (i !== dateIndex) tempCache[h] = [];
    });

    // Parse Rows
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const date = cols[dateIndex]?.trim();

      if (!date) continue;

      headers.forEach((header, index) => {
        if (index !== dateIndex && tempCache[header]) {
          const val = parseFloat(cols[index]);
          if (!isNaN(val)) {
            tempCache[header].push({ date, value: val });
          }
        }
      });
    }

    parsedDataCache = tempCache;
    return true;
  } catch (e) {
    console.error("Error parsing CSV", e);
    return false;
  }
};

/**
 * helper to get data from the CSV cache
 */
const getPrimaryData = (id: string): DataPoint[] => {
  return parsedDataCache[id] || [];
};

// Calculate secondary metrics
const calculateSecondaryData = (id: string): DataPoint[] => {
  const getSeries = (metricId: string) => parsedDataCache[metricId] || [];

  const alignAndOperate = (idA: string, idB: string, op: (a: number, b: number) => number): DataPoint[] => {
    const seriesA = getSeries(idA);
    const seriesB = getSeries(idB);
    if (seriesA.length === 0 || seriesB.length === 0) return [];

    const mapB = new Map(seriesB.map(d => [d.date, d.value]));
    const result: DataPoint[] = [];

    seriesA.forEach(ptA => {
      const valB = mapB.get(ptA.date);
      if (valB !== undefined) {
        result.push({
          date: ptA.date,
          value: op(ptA.value, valB)
        });
      }
    });
    return result;
  };

  switch (id) {
    case 'SOFR_VOL': {
      const series = getSeries('SOFR');
      if (series.length < 30) return [];
      const res: DataPoint[] = [];
      for (let i = 30; i < series.length; i++) {
        const slice = series.slice(i - 30, i).map(d => d.value);
        res.push({ date: series[i].date, value: calculateStdDev(slice) });
      }
      return res;
    }
    case 'SOFR_TAIL': {
      const series = getSeries('SOFR');
      if (series.length < 365) return [];
      const res: DataPoint[] = [];
      for (let i = 365; i < series.length; i += 5) {
        const slice = series.slice(i - 365, i).map(d => d.value);
        res.push({ date: series[i].date, value: calculatePercentile(slice, 99) });
      }
      return res;
    }

    // Spreads
    case 'SOFR_FED_SPREAD': return alignAndOperate('SOFR', 'FEDFUNDS', (a, b) => a - b);
    case 'SOFR_IORB_SPREAD': return alignAndOperate('SOFR', 'IORB', (a, b) => a - b);
    case 'SOFR_RRP_SPREAD': return alignAndOperate('SOFR', 'RRPONTSYOFFR', (a, b) => a - b);
    case 'GC_IORB_SPREAD': return alignAndOperate('TGCRRATE', 'IORB', (a, b) => a - b);
    case 'GC_RRP_SPREAD': return alignAndOperate('TGCRRATE', 'RRPONTSYOFFR', (a, b) => a - b);
    case 'GC_SOFR_SPREAD': return alignAndOperate('TGCRRATE', 'SOFR', (a, b) => a - b);
    case 'IORB_DTB3_SPREAD': return alignAndOperate('IORB', 'DTB3', (a, b) => a - b);
    case 'IORB_FED_SPREAD': return alignAndOperate('IORB', 'FEDFUNDS', (a, b) => a - b);
    case 'SPECIALNESS': return alignAndOperate('SOFR', 'TGCRRATE', (a, b) => a - b);
    case 'RRP_FED_SPREAD': return alignAndOperate('RRPONTSYOFFR', 'FEDFUNDS', (a, b) => a - b);

    case 'CP_DTB3_SPREAD': return alignAndOperate('CP_RATE', 'DTB3', (a, b) => a - b);
    case 'CP_FED_SPREAD': return alignAndOperate('CP_RATE', 'FEDFUNDS', (a, b) => a - b);
    case 'CP_SOFR_SPREAD': return alignAndOperate('CP_RATE', 'SOFR', (a, b) => a - b);

    case 'DTB3_FED_SPREAD': return alignAndOperate('DTB3', 'FEDFUNDS', (a, b) => a - b);
    case 'DTB3_RRP_SPREAD': return alignAndOperate('DTB3', 'RRPONTSYOFFR', (a, b) => a - b);

    // CD Spreads
    case 'CD_DTB3_SPREAD': return alignAndOperate('CD_3M', 'DTB3', (a, b) => a - b);
    case 'CD_SOFR_SPREAD': return alignAndOperate('CD_3M', 'SOFR', (a, b) => a - b);
    case 'CD_FED_SPREAD': return alignAndOperate('CD_3M', 'FEDFUNDS', (a, b) => a - b);

    case 'RRP_DELTA': {
      const series = getSeries('RRP_USAGE');
      if (series.length < 2) return [];
      return series.slice(1).map((d, i) => ({
        date: d.date,
        value: d.value - series[i].value
      }));
    }
    case 'RRP_LESS_RESERVES': return alignAndOperate('RRP_USAGE', 'BANK_RESERVES', (a, b) => a - b);

    case 'DEALER_LEVERAGE': return alignAndOperate('DEALER_ASSETS', 'DEALER_EQUITY', (a, b) => b !== 0 ? a / b : 0);

    case 'DEALER_TURNOVER_UST': {
      const vol = getSeries('DEALER_VOL_UST');
      const bills = getSeries('DEALER_POS_TBILLS');
      if (!vol.length || !bills.length) return [];
      return alignAndOperate('DEALER_VOL_UST', 'DEALER_POS_TBILLS', (a, b) => b !== 0 ? a / Math.abs(b) : 0);
    }
    case 'DEALER_TURNOVER_MBS': {
      const vol = getSeries('DEALER_VOL_MBS');
      const pos = getSeries('DEALER_POS_MBS');
      if (!vol.length || !pos.length) return [];
      return alignAndOperate('DEALER_VOL_MBS', 'DEALER_POS_MBS', (a, b) => b !== 0 ? a / Math.abs(b) : 0);
    }

    default: return [];
  }
};

export const fetchAllMetrics = async (forceRefresh = false): Promise<MetricData[]> => {
  // If no CSV is loaded, metrics will simply be empty and display N/A.
  // We do NOT generate mock data.

  // 1. Process Secondary Calculations based on CSV data (if any)
  const secondaryDefs = METRICS.filter(m => m.category === MetricCategory.SECONDARY);
  secondaryDefs.forEach(def => {
    const data = calculateSecondaryData(def.id);
    if (data.length > 0) {
      parsedDataCache[def.id] = data;
    }
  });

  // 2. Assemble Result
  return METRICS.map(def => {
    // Look up in CSV cache
    const history = parsedDataCache[def.id] || [];

    // Sort just in case CSV was unordered
    history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const hasData = history.length > 0;
    const current = hasData ? history[history.length - 1] : null;
    const prev = hasData && history.length > 1 ? history[history.length - 2] : null;

    return {
      definition: def,
      currentValue: current ? current.value : null,
      prevValue: prev ? prev.value : null,
      dailyChange: (current && prev) ? current.value - prev.value : null,
      history,
      status: hasData ? 'success' : 'error'
    };
  });
};

