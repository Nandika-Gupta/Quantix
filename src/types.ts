export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface Holding {
  id: string;
  userId: string;
  ticker: string;
  shares: number;
  buyPrice: number; // Avg cost basis
  buyDate: string;
}

export interface Analysis {
  id: string;
  userId: string;
  ticker: string;
  query: string;
  analysis: string;
  createdAt: string;
}

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  peRatio: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sector: string;
  marketCap: number;
  volume: number;
  description: string;
}

export interface StockHistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioMetric {
  ticker: string;
  name: string;
  shares: number;
  currentPrice: number;
  avgBuyPrice: number;
  currentValue: number;
  costBasis: number;
  profitOrLoss: number;
  pctProfitOrLoss: number;
  percentOfPortfolio: number;
  sector: string;
  beta: number | null;
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalCostBasis: number;
  overallProfitOrLoss: number;
  overallChangePct: number;
  portfolioBeta: number;
  riskScore: number; // 0-100 score
  riskLevel: string; // 'Low', 'Moderate', 'High', etc.
  sectorAllocation: { sector: string; value: number; percentage: number }[];
  holdingsAllocation: { ticker: string; value: number; percentage: number }[];
}
