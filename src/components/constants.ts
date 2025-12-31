
import { MetricCategory, MetricDefinition } from '../services/types';

export const METRICS: MetricDefinition[] = [
  // --- FUNDING LIQUIDITY - PRIMARY ---
  {
    id: 'SOFR',
    name: 'Daily SOFR',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Secured Overnight Financing Rate. Broad measure of the cost of borrowing cash overnight collateralized by Treasury securities.',
    fredId: 'SOFR',
    format: 'percent'
  },
  {
    id: 'FEDFUNDS',
    name: 'FED Interest Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Effective Federal Funds Rate (Daily). The interest rate at which depository institutions trade federal funds.',
    fredId: 'DFF', // Keeping DFF (Daily) despite user link to FEDFUNDS (Monthly) to ensure dashboard utility.
    format: 'percent'
  },
  {
    id: 'SRFTSYD',
    name: 'Standing Repo Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Standing Repo Facility Rate. The rate at which the Fed lends against Treasuries to eligible counterparties.',
    fredId: 'SRFTSYD',
    format: 'percent'
  },
  {
    id: 'TGCRRATE',
    name: 'GC Repo Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Tri-Party General Collateral Rate. A measure of rates on overnight, specific-counterparty tri-party repo transactions.',
    fredId: 'TGCRRATE', // Updated from TGCR
    format: 'percent'
  },
  {
    id: 'TGCRVOLUME',
    name: 'GC Repo Volume',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Total volume of Tri-Party General Collateral Repo transactions.',
    fredId: 'TGCRVOLUME', // Updated from TGCRVOL
    format: 'currency'
  },
  {
    id: 'IORB',
    name: 'IORB Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Interest on Reserve Balances. The rate of interest the Federal Reserve pays on balances maintained by or on behalf of eligible institutions in master accounts.',
    fredId: 'IORB',
    format: 'percent'
  },
  {
    id: 'RRPONTSYOFFR',
    name: 'ON RRP Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Overnight Reverse Repurchase Agreements Offering Rate. The rate the Fed pays on cash invested in its ON RRP facility.',
    fredId: 'RRPONTSYOFFR', // Updated from RRPONTSYAWARD
    format: 'percent'
  },
  {
    id: 'REPO_FAILS',
    name: 'Repo Fails (Weekly)',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Collateral',
    description: 'Settlement Fails: Fails to Deliver (US Treasuries). Sourced from NY Fed Primary Dealer Statistics (Weekly). Converted to Billions.',
    fredId: 'FRBCSNO',
    format: 'currency',
    transformScale: 0.001 // Convert Millions to Billions
  },
  {
    id: 'RRP_USAGE',
    name: 'Total RRP Usage',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Total Overnight Reverse Repurchase Agreements Volume. Proxy for excess cash in the system.',
    fredId: 'RRPONTSYD',
    format: 'currency'
  },
  {
    id: 'BANK_RESERVES',
    name: 'Bank Reserves',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Total Reserve Balances maintained by Federal Reserve Banks. Key indicator of banking system liquidity.',
    fredId: 'WRESBAL',
    format: 'currency'
  },
  {
    id: 'DTB3',
    name: '3 Month T-Bill',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Market',
    description: 'Market Yield on U.S. Treasury Securities at 3-Month Constant Maturity.',
    fredId: 'DTB3',
    format: 'percent'
  },
  {
    id: 'CP_RATE',
    name: '3M AA Fin CP Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: '3-Month AA Financial Commercial Paper Rate. Represents unsecured short-term funding costs for high-quality financial issuers.',
    fredId: 'RIFSPPFAAD90NB',
    format: 'percent'
  },
  {
    id: 'CD_3M',
    name: '3M CD Rate',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: '3-Month Certificate of Deposit Rate (Secondary Market). Represents unsecured bank funding cost.',
    fredId: 'IR3TCD01USM156N',
    format: 'percent'
  },
  {
    id: 'FOREIGN_USD',
    name: 'Foreign UST Holdings',
    category: MetricCategory.PRIMARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Securities Held in Custody for Foreign Official and International Accounts. Source: FRED (WMTSECL1).',
    fredId: 'WMTSECL1',
    format: 'currency',
    transformScale: 0.001 // WMTSECL1 is in Millions
  },

  // --- FUNDING LIQUIDITY - SECONDARY ---
  {
    id: 'SOFR_VOL',
    name: 'SOFR Volatility',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Rolling 30-day standard deviation of Daily SOFR.',
    format: 'number'
  },
  {
    id: 'SOFR_FED_SPREAD',
    name: 'SOFR - Fed Funds',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between SOFR and Fed Funds. Positive spread indicates secured funding is expensive relative to unsecured bank funding target.',
    format: 'spread'
  },
  {
    id: 'SOFR_IORB_SPREAD',
    name: 'SOFR - IORB',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between SOFR and IORB. Indicates attractiveness of lending in repo vs keeping reserves at Fed.',
    format: 'spread'
  },
  {
    id: 'SOFR_RRP_SPREAD',
    name: 'SOFR - ON RRP',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between SOFR and ON RRP. Measures incentive to lend in private market vs Fed facility.',
    format: 'spread'
  },
  {
    id: 'SOFR_TAIL',
    name: 'SOFR 99th % (Tail)',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: '99th Percentile of SOFR distribution over last year. Tail risk measure.',
    format: 'percent'
  },
  {
    id: 'GC_IORB_SPREAD',
    name: 'GC Repo - IORB',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'General Collateral Repo rate minus IORB. Arbitrage incentive measure.',
    format: 'spread'
  },
  {
    id: 'GC_RRP_SPREAD',
    name: 'GC Repo - ON RRP',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'General Collateral Repo rate minus ON RRP rate.',
    format: 'spread'
  },
  {
    id: 'GC_SOFR_SPREAD',
    name: 'GC Repo - SOFR',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Basis between tri-party GC and SOFR.',
    format: 'spread'
  },
  {
    id: 'GC_SRF_SPREAD',
    name: 'GC Repo - SRF',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Distance to the Standing Repo Facility rate (ceiling).',
    format: 'spread'
  },
  {
    id: 'IORB_DTB3_SPREAD',
    name: 'IORB - 3M T-Bill',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between risk-free reserve rate and 3M Bills.',
    format: 'spread'
  },
  {
    id: 'IORB_FED_SPREAD',
    name: 'IORB - Fed Funds',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between Interest on Reserves and Effective Fed Funds.',
    format: 'spread'
  },
  {
    id: 'SPECIALNESS',
    name: 'Specialness',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Collateral',
    description: 'SOFR minus GC Repo Rate. Higher Specialness = Collateral Scarcity. Often leads to lower yields as investors scramble for "good" collateral.',
    format: 'spread'
  },
  {
    id: 'RRP_DELTA',
    name: 'RRP Usage Delta',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Daily change in Total RRP Usage.',
    format: 'currency'
  },
  {
    id: 'RRP_LESS_RESERVES',
    name: 'Total RRP - Reserves',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Difference between RRP volume and Bank Reserves. Measures shift in liability composition of Fed balance sheet.',
    format: 'currency'
  },
  {
    id: 'RRP_FED_SPREAD',
    name: 'ON RRP - Fed Funds',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between RRP rate and Fed Funds.',
    format: 'spread'
  },
  {
    id: 'CP_DTB3_SPREAD',
    name: '3M CP - 3M T-Bill',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Credit spread: 3M Commercial Paper vs 3M T-Bill. Measure of private sector credit stress.',
    format: 'spread'
  },
  {
    id: 'CP_FED_SPREAD',
    name: '3M CP - Fed Funds',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between Commercial Paper and Fed policy rate.',
    format: 'spread'
  },
  {
    id: 'CP_SOFR_SPREAD',
    name: '3M CP - SOFR',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between Commercial Paper and SOFR.',
    format: 'spread'
  },
  {
    id: 'CD_DTB3_SPREAD',
    name: '3M CD - 3M T-Bill',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between 3M CD and 3M Treasury Bill. Measure of credit risk in the banking sector vs risk-free.',
    format: 'spread'
  },
  {
    id: 'CD_SOFR_SPREAD',
    name: '3M CD - SOFR',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between 3M CD and SOFR. Comparison of term unsecured bank funding vs overnight secured.',
    format: 'spread'
  },
  {
    id: 'CD_FED_SPREAD',
    name: '3M CD - Fed Funds',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Cash Funding',
    description: 'Spread between 3M CD and Effective Fed Funds Rate.',
    format: 'spread'
  },
  {
    id: 'DTB3_FED_SPREAD',
    name: '3M T-Bill - Fed Funds',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Market',
    description: 'Market pricing of near-term rate expectations relative to current policy.',
    format: 'spread'
  },
  {
    id: 'DTB3_RRP_SPREAD',
    name: '3M T-Bill - ON RRP',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Market',
    description: 'Spread between Bills and RRP floor.',
    format: 'spread'
  },
  {
    id: 'REPO_FAILS_GC_RATIO',
    name: 'Repo Fails / GC Vol',
    category: MetricCategory.SECONDARY,
    section: 'Funding Liquidity',
    liquidityType: 'Collateral',
    description: 'Ratio of Fails to Total Volume. Indicator of market dysfunction.',
    format: 'percent'
  },

  // --- DEALER STATISTICS - PRIMARY ---
  {
    id: 'DEALER_POS_TBILLS',
    name: 'Dealer Net: T-Bills',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Primary Dealer Net Positioning in Treasury Bills. Converted to Billions.',
    fredId: 'PALUMTSTB',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_POS_COUPONS',
    name: 'Dealer Net: Coupons',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Primary Dealer Net Positioning in Treasury Coupons (Notes & Bonds). Converted to Billions.',
    fredId: 'PALUMTSCO',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_POS_FRN',
    name: 'Dealer Net: FRNs',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Primary Dealer Net Positioning in Floating Rate Notes. Converted to Billions.',
    fredId: 'PALUMTSFR',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_POS_TIPS',
    name: 'Dealer Net: TIPS',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Primary Dealer Net Positioning in TIPS. Converted to Billions.',
    fredId: 'PALUMTSII',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_POS_MBS',
    name: 'Dealer Net: MBS',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Primary Dealer Net Positioning in Agency MBS. Converted to Billions.',
    fredId: 'PALUMTSAM',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_REPO_IN',
    name: 'Dealer Reverse Repo (In)',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Collateral',
    description: 'Securities In (Reverse Repo). Total collateral received by dealers via reverse repo.',
    format: 'currency'
  },
  {
    id: 'DEALER_REPO_OUT',
    name: 'Dealer Repo (Out)',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Cash Funding',
    description: 'Securities Out (Repo). Total collateral pledged by dealers via repo.',
    format: 'currency'
  },
  {
    id: 'DEALER_ASSETS',
    name: 'Dealer Total Assets',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Total Assets of Primary Dealers. Used for leverage calculation. Converted to Billions.',
    fredId: 'BOGZ1FL664090005Q',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_EQUITY',
    name: 'Dealer Total Equity',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Total Equity of Primary Dealers. Used for leverage calculation. Converted to Billions.',
    fredId: 'BOGZ1FL665080005Q',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_VOL_UST',
    name: 'Dealer Volume: UST',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Weekly Trading Volume of US Treasuries by Primary Dealers. Converted to Billions.',
    fredId: 'ADVPDPUSTT',
    format: 'currency',
    transformScale: 0.001
  },
  {
    id: 'DEALER_VOL_MBS',
    name: 'Dealer Volume: MBS',
    category: MetricCategory.PRIMARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Weekly Trading Volume of Agency MBS by Primary Dealers. Converted to Billions.',
    fredId: 'ADVPDPAMBSTT',
    format: 'currency',
    transformScale: 0.001
  },

  // --- DEALER STATISTICS - SECONDARY ---
  {
    id: 'DEALER_LEVERAGE',
    name: 'Dealer Leverage',
    category: MetricCategory.SECONDARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'Dealer Leverage Ratio = Total Assets / Total Equity. Indicates balance sheet constraints.',
    format: 'ratio'
  },
  {
    id: 'DEALER_TURNOVER_UST',
    name: 'Inventory Turnover: UST',
    category: MetricCategory.SECONDARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'UST Turnover = Weekly UST Volume / Total UST Net Position (Abs). Measures balance sheet velocity.',
    format: 'ratio'
  },
  {
    id: 'DEALER_TURNOVER_MBS',
    name: 'Inventory Turnover: MBS',
    category: MetricCategory.SECONDARY,
    section: 'Primary Dealer Statistics',
    liquidityType: 'Market',
    description: 'MBS Turnover = Weekly MBS Volume / MBS Net Position (Abs). Measures balance sheet velocity.',
    format: 'ratio'
  }
];
