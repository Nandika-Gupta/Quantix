import { StockQuote, StockHistoryPoint, PortfolioAnalytics, Holding, PortfolioMetric } from '../types';

// Let's declare our static set of companies or fallbacks to make searches look realistic
interface BaseCompanyProfile {
  name: string;
  price: number;
  sector: string;
  peRatio: number;
  beta: number;
  low: number;
  high: number;
  description: string;
}

const KNOWN_TICKERS: Record<string, BaseCompanyProfile> = {
  AAPL: {
    name: 'Apple Inc.',
    price: 184.25,
    sector: 'Technology',
    peRatio: 30.12,
    beta: 1.12,
    low: 164.08,
    high: 199.62,
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company is famous for its hardware ecosystems, iOS platform, and specialized software subscriptions.',
  },
  MSFT: {
    name: 'Microsoft Corporation',
    price: 412.50,
    sector: 'Technology',
    peRatio: 35.45,
    beta: 0.90,
    low: 315.18,
    high: 430.82,
    description: 'Microsoft Corp. develops and supports software, services, devices, and solutions worldwide. Its Productivity and Business Processes segment includes Office, Exchange, SharePoint, Microsoft Teams, and LinkedIn, along with Azure Cloud Services.',
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    price: 172.90,
    sector: 'Communication Services',
    peRatio: 26.80,
    beta: 1.05,
    low: 115.35,
    high: 180.50,
    description: 'Alphabet Inc. provides search, online advertising, cloud computing, and hardware services under Google. It operates YouTube, Google Cloud, Chromebooks, Pixel phones, Android systems, and self-driving auto research (Waymo).',
  },
  AMZN: {
    name: 'Amazon.com, Inc.',
    price: 182.15,
    sector: 'Consumer Cyclical',
    peRatio: 41.20,
    beta: 1.15,
    low: 118.35,
    high: 191.70,
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions globally. It is structured into North America, International, and Amazon Web Services (AWS) segments, driving major technology and logistics leadership.',
  },
  NVIDIA: {
    name: 'NVIDIA Corporation',
    price: 924.50,
    sector: 'Technology',
    peRatio: 72.85,
    beta: 1.85,
    low: 373.56,
    high: 974.00,
    description: 'NVIDIA Corporation focuses on personal computer graphics, graphics processing units (GPUs), and artificial intelligence hardware and software. It is a key provider of tensor cores, system-on-a-chip units, and datacenter hardware.',
  },
  TSLA: {
    name: 'Tesla, Inc.',
    price: 178.60,
    sector: 'Consumer Cyclical',
    peRatio: 51.40,
    beta: 1.55,
    low: 138.80,
    high: 299.29,
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. Its segments include Automotive and Energy Storage.',
  },
  META: {
    name: 'Meta Platforms, Inc.',
    price: 475.20,
    sector: 'Communication Services',
    peRatio: 25.10,
    beta: 1.25,
    low: 244.30,
    high: 531.49,
    description: 'Meta Platforms, Inc. focuses on building products that enable people to connect and share through mobile devices, personal computers, virtual reality headsets, and wearables. It runs Facebook, Instagram, WhatsApp, and Quest VR.',
  },
  BRK_B: {
    name: 'Berkshire Hathaway Inc.',
    price: 405.10,
    sector: 'Financial Services',
    peRatio: 12.30,
    beta: 0.85,
    low: 330.50,
    high: 430.00,
    description: 'Berkshire Hathaway Inc. operates as a holding company led by Warren Buffett. It engages in diverse businesses including insurance, freight rail transportation, utilities, energy, manufacturing, service, and retail.',
  },
  JPM: {
    name: 'JPMorgan Chase & Co.',
    price: 195.80,
    sector: 'Financial Services',
    peRatio: 11.50,
    beta: 1.10,
    low: 135.24,
    high: 205.88,
    description: 'JPMorgan Chase & Co. operates as a financial services company worldwide. It offers consumer deposits, mortgage services, business banking, credit cards, investment banking, asset management, and commercial operations.',
  },
  V: {
    name: 'Visa Inc.',
    price: 275.40,
    sector: 'Financial Services',
    peRatio: 31.50,
    beta: 0.95,
    low: 220.35,
    high: 290.85,
    description: 'Visa Inc. operates as a payments technology company worldwide. The company facilitates global commerce through transfer of value and information among participants: consumers, merchants, financial institutions, and governments.',
  },
  XOM: {
    name: 'Exxon Mobil Corporation',
    price: 115.60,
    sector: 'Energy',
    peRatio: 13.10,
    beta: 1.05,
    low: 95.77,
    high: 123.75,
    description: 'Exxon Mobil Corp. explores for, produces, and sells crude oil and natural gas. It manufactures, transports, and sells petroleum products, petrochemicals, and specialty chemicals, operating as an active energy behemoth.',
  },
  KO: {
    name: 'The Coca-Cola Company',
    price: 62.40,
    sector: 'Consumer Defensive',
    peRatio: 24.50,
    beta: 0.55,
    low: 51.55,
    high: 64.95,
    description: 'The Coca-Cola Company, a beverage company, manufactures, markets, and sells various nonalcoholic beverages worldwide. It is famous for its iconic carbonated drinks, juices, waters, coffees, and teas.',
  },
  JNJ: {
    name: 'Johnson & Johnson',
    price: 148.50,
    sector: 'Healthcare',
    peRatio: 15.60,
    beta: 0.50,
    low: 143.13,
    high: 175.97,
    description: 'Johnson & Johnson researches and develops, manufactures, and sells various products in the healthcare field. It operates in Innovative Medicine (immunology, oncology, cardiovascular, neuroscience) and MedTech (medical devices).',
  },
  PFE: {
    name: 'Pfizer Inc.',
    price: 28.10,
    sector: 'Healthcare',
    peRatio: 14.20,
    beta: 0.65,
    low: 25.20,
    high: 40.95,
    description: 'Pfizer Inc. is a leading research-based biopharmaceutical company that discovers, develops, manufactures, and distributes medicines, vaccines, and therapeutics globally, driving public and specialized health.',
  },
};

// Generates simulated live quotes and real historical series for any ticker.
// We seed this based on the ticker to ensure deterministic results.
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export const stockService = {
  getQuote(ticker: string): StockQuote {
    const symbol = ticker.toUpperCase().trim();
    const hash = getDeterministicHash(symbol);
    
    // Check if we already have detailed configurations
    if (KNOWN_TICKERS[symbol]) {
      const p = KNOWN_TICKERS[symbol];
      // Inject slight daily fluctuation based on current time
      const fluctPercent = ((hash % 100) - 50) / 1000; // e.g. -5% to +5% fluctuation
      const price = Number((p.price * (1 + fluctPercent)).toFixed(2));
      const change = Number((price * fluctPercent).toFixed(2));
      const percentChange = Number((fluctPercent * 100).toFixed(2));

      return {
        ticker: symbol,
        name: p.name,
        price,
        change,
        percentChange,
        peRatio: p.peRatio,
        beta: p.beta,
        fiftyTwoWeekHigh: p.high,
        fiftyTwoWeekLow: p.low,
        sector: p.sector,
        marketCap: (hash % 8) * 10000000000 + 40000000000,
        volume: (hash % 15) * 2000000 + 4000000,
        description: p.description,
      };
    }

    // Dynamic Generator for any completely unknown ticker
    const sectors = ['Technology', 'Financial Services', 'Healthcare', 'Energy', 'Consumer Cyclical', 'Consumer Defensive', 'Industrials'];
    const sector = sectors[hash % sectors.length];
    const nameStr = `${symbol.substring(0, 1) + symbol.substring(1).toLowerCase()} Corp.`;
    const priceStr = (hash % 250) + 10;
    const peVal = (hash % 40) + 10;
    const betaVal = Number((0.4 + (hash % 15) / 10).toFixed(2));
    const rangeLow = Number((priceStr * 0.75).toFixed(2));
    const rangeHigh = Number((priceStr * 1.35).toFixed(2));

    const finalPct = Number((((hash % 40) - 20) / 10).toFixed(2)); // -2% to 2%
    const change = Number((priceStr * finalPct / 100).toFixed(2));

    return {
      ticker: symbol,
      name: nameStr,
      price: priceStr,
      change,
      percentChange: finalPct,
      peRatio: peVal,
      beta: betaVal,
      fiftyTwoWeekHigh: rangeHigh,
      fiftyTwoWeekLow: rangeLow,
      sector,
      marketCap: (hash % 10) * 1200000000 + 500000000,
      volume: (hash % 20) * 500000 + 100000,
      description: `${nameStr} is a dynamic company in the ${sector} industry. It operates highly active business segments aiming to pioneer technological and operational solutions, creating long-term value for clients.`,
    };
  },

  getHistory(ticker: string, pointsCount: number = 30): StockHistoryPoint[] {
    const symbol = ticker.toUpperCase().trim();
    const hash = getDeterministicHash(symbol);
    const quote = this.getQuote(symbol);

    const history: StockHistoryPoint[] = [];
    let currentPrice = quote.price;

    const baseDate = new Date();
    // Start generating backwards
    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      
      // Seeded random walk
      const dateHash = getDeterministicHash(symbol + d.toDateString());
      const dailyPercentChange = (((dateHash % 200) - 100) / 3000); // slight random deviation (-3.3% to +3.3%)
      
      // Also add a momentum vector depending on ticker characteristics
      const momentum = (hash % 10 > 5) ? 0.001 : -0.0005; // slight general upwards or downwards trend
      
      const prevClose = currentPrice;
      currentPrice = Number((prevClose * (1 + dailyPercentChange + momentum)).toFixed(2));
      const dailyLow = Number((Math.min(prevClose, currentPrice) * (1 - (dateHash % 30) / 1000)).toFixed(2));
      const dailyHigh = Number((Math.max(prevClose, currentPrice) * (1 + (dateHash % 30) / 1000)).toFixed(2));
      const dailyOpen = Number((prevClose * (1 + ((dateHash % 40) - 20) / 3000)).toFixed(2));
      const dailyVol = Math.floor(quote.volume * (0.6 + (dateHash % 80) / 100));

      history.push({
        date: d.toISOString().split('T')[0],
        open: dailyOpen,
        high: dailyHigh,
        low: dailyLow,
        close: currentPrice,
        volume: dailyVol,
      });
    }

    return history;
  },

  calculatePortfolioAnalytics(holdings: Holding[]): PortfolioAnalytics {
    if (holdings.length === 0) {
      return {
        totalValue: 0,
        totalCostBasis: 0,
        overallProfitOrLoss: 0,
        overallChangePct: 0,
        portfolioBeta: 1.0,
        riskScore: 0,
        riskLevel: 'No Holdings',
        sectorAllocation: [],
        holdingsAllocation: [],
      };
    }

    let totalValue = 0;
    let totalCostBasis = 0;
    let weightedBetaSum = 0;

    const sectorValues: Record<string, number> = {};
    const holdingMetrics: PortfolioMetric[] = [];

    holdings.forEach((h) => {
      const quote = this.getQuote(h.ticker);
      const val = quote.price * h.shares;
      const basis = h.buyPrice * h.shares;
      const gainLoss = val - basis;
      const gainLossPct = basis > 0 ? (gainLoss / basis) * 100 : 0;

      totalValue += val;
      totalCostBasis += basis;

      if (quote.beta) {
        weightedBetaSum += quote.beta * val;
      } else {
        weightedBetaSum += 1.0 * val; // default fallback beta of 1.0
      }

      // Track Sectors
      sectorValues[quote.sector] = (sectorValues[quote.sector] || 0) + val;

      holdingMetrics.push({
        ticker: h.ticker,
        name: quote.name,
        shares: h.shares,
        currentPrice: quote.price,
        avgBuyPrice: h.buyPrice,
        currentValue: Number(val.toFixed(2)),
        costBasis: Number(basis.toFixed(2)),
        profitOrLoss: Number(gainLoss.toFixed(2)),
        pctProfitOrLoss: Number(gainLossPct.toFixed(2)),
        percentOfPortfolio: 0, // Filled subsequently
        sector: quote.sector,
        beta: quote.beta,
      });
    });

    const portfolioBeta = totalValue > 0 ? Number((weightedBetaSum / totalValue).toFixed(2)) : 1.0;
    const overallGainLoss = totalValue - totalCostBasis;
    const overallChangePct = totalCostBasis > 0 ? Number(((overallGainLoss / totalCostBasis) * 100).toFixed(2)) : 0;

    // Calculate details allocation
    const holdingsAllocation = holdingMetrics.map((hm) => {
      const percent = totalValue > 0 ? Number(((hm.currentValue / totalValue) * 100).toFixed(2)) : 0;
      hm.percentOfPortfolio = percent;
      return {
        ticker: hm.ticker,
        value: hm.currentValue,
        percentage: percent,
      };
    }).sort((a,b) => b.value - a.value);

    const sectorAllocation = Object.entries(sectorValues).map(([sector, value]) => {
      const percentage = totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(2)) : 0;
      return {
        sector,
        value: Number(value.toFixed(2)),
        percentage,
      };
    }).sort((a,b) => b.value - a.value);

    // Formulate a beautiful proprietary portfolio Risk Score (0 - 100)
    // Formula components:
    // 1. Beta score: Portfolio Beta centered around index (1.0). (0-50 pts)
    //    Beta < 0.8: safe conservative
    //    Beta > 1.3: volatile aggressive
    // 2. Diversity score: High concentration penalizes (Max weight of single stock) (0-50 pts)
    //    If max allocation of one stock is > 40%, diversify penalty adds up to 30 pts.
    // Let's model a robust math rule:
    const betaComponent = Math.min(50, Math.max(10, Math.floor(portfolioBeta * 30)));
    const maxWeight = holdingsAllocation.length > 0 ? holdingsAllocation[0].percentage : 0;
    const concentrationComponent = maxWeight > 35 ? Math.min(50, Math.floor((maxWeight - 35) * 1.5)) : 10;
    
    // Raw sum
    let riskScore = Math.min(99, Math.max(5, Math.floor(betaComponent + concentrationComponent)));
    
    let riskLevel = 'Moderate';
    if (riskScore < 30) riskLevel = 'Conservative';
    else if (riskScore < 50) riskLevel = 'Moderate Conservative';
    else if (riskScore < 75) riskLevel = 'Moderately Aggressive / Active';
    else riskLevel = 'Highly Aggressive / Speculative';

    return {
      totalValue: Number(totalValue.toFixed(2)),
      totalCostBasis: Number(totalCostBasis.toFixed(2)),
      overallProfitOrLoss: Number(overallGainLoss.toFixed(2)),
      overallChangePct,
      portfolioBeta,
      riskScore,
      riskLevel,
      sectorAllocation,
      holdingsAllocation,
    };
  },
};
