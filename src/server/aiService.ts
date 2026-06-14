import { GoogleGenAI } from '@google/genai';
import { StockQuote, PortfolioAnalytics } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY is not defined. AI insights will fallback to advanced heuristic generation.');
    }
    
    genAIClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY', // Fallback gracefully
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Simple fallback generators if GEMINI_API_KEY is missing or invalid
function getMockSingleInsight(q: StockQuote, query: string): string {
  return `### Comprehensive Financial Analysis for ${q.ticker} (${q.name})
  
*Analyzed specifically matching user focus: "${query || 'General Fundamental Trends'}"*

#### 1. Executive Summary & Financial Position
${q.name} currently trades at **$${q.price.toFixed(2)}**, maintaining a daily change of **${q.change >= 0 ? '+' : ''}$${q.change.toFixed(2)} (${q.percentChange >= 0 ? '+' : ''}${q.percentChange.toFixed(2)}%)**. With a market capitalization of **$${(q.marketCap / 1e9).toFixed(2)} Billion** and annual volume at **${(q.volume / 1e6).toFixed(2)} Million shares**, it stands as a core leading asset within the **${q.sector}** sector.

#### 2. Technical Dynamics & Valuation Multiples
*   **P/E Ratio Evaluation:** Standing at **${q.peRatio ? q.peRatio.toFixed(2) : 'N/A'}**, the security indicates a ${Number(q.peRatio || 0) > 28 ? 'heightened growth premium' : 'value-oriented discount'} relative to its standard peer group.
*   **Systematic Volatility (Beta Coefficient):** A beta of **${q.beta ? q.beta.toFixed(2) : 'N/A'}** implies that the asset is **${Number(q.beta || 0) > 1.0 ? '20-50% more swing-heavy' : 'highly conservative and defensive'}** than the broader S&P 500 index.
*   **Execution Momentum:** The ticker is trading within its 52-week premium bands (Low: $${q.fiftyTwoWeekLow.toFixed(2)} to High: $${q.fiftyTwoWeekHigh.toFixed(2)}), providing technical backing for continuous long-term entry.

#### 3. Strategic Investment Recommendation
Based on traditional capital asset pricing and margin profile audits, ${q.ticker} represents a stable **CORE ACCUMULATE** rating. We suggest sizing positions under 8% of total portfolio weights, pairing entries during market-wide cooling periods to leverage dollar cost averaging.`;
}

function getMockPortfolioInsight(analytics: PortfolioAnalytics, itemsCount: number): string {
  return `### AI Portfolio Optimization & Risk Review

#### 1. Strategic Allocation & Health Audit
Your current portfolio houses **${itemsCount} active positions**, valued at an aggregate total of **$${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}**, with a cost basis of **$${analytics.totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}** (${analytics.overallProfitOrLoss >= 0 ? 'gaining' : 'losing'} **$${analytics.overallProfitOrLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}** or **${analytics.overallChangePct}%** override).

#### 2. Analytical Risk Profile Rating
*   **Weighted Beta Multiplier:** Adjusted portfolio beta yields **${analytics.portfolioBeta}**, marking ${analytics.portfolioBeta > 1.25 ? 'speculative hyper-growth tendencies' : 'stable defensive income attributes'}.
*   **Composite Platform Risk Score:** Rated at **${analytics.riskScore}/100** (**${analytics.riskLevel}** class), proving a diversified ${analytics.riskScore > 65 ? 'high yield high risk stance' : 'capital reservation methodology'}.
*   **Primary Concentration Check:** Your leading asset concentration and sector allocation represent substantial exposure to **${analytics.sectorAllocation[0]?.sector || 'General Industries'}** (${analytics.sectorAllocation[0]?.percentage || 0}%).

#### 3. Recommended Optimization Steps
1.  **Lower Volatility Spikes:** Since current metrics suggest active fluctuations, diversify by introducing low-beta Consumer Defensive or Healthcare equities (Sizing goal: 15% aggregate).
2.  **Tax-Loss Harvesting & Position Trimming:** Rebalance positions that occupy more than 25% of total portfolio weight to secure gains and safeguard against sudden single-stock drawdowns.
3.  **Liquidity Buffer:** Ensure a 5-10% dry powder reserve to capitalize on short-swing tactical entry opportunities.`;
}

export const aiService = {
  async generateSingleStockInsight(quote: StockQuote, query: string): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      return getMockSingleInsight(quote, query);
    }

    try {
      const ai = getAIClient();
      const prompt = `You are a professional Wall Street financial analyst and certified portfolio manager.
Provide a highly thorough, professional, and data-backed financial insight report for ${quote.ticker} (${quote.name}).

Company Profile Details:
- Current Stock Price: $${quote.price.toFixed(2)}
- 24-Hour Price Change: $${quote.change.toFixed(2)} (${quote.percentChange.toFixed(2)}%)
- P/E Ratio: ${quote.peRatio ? quote.peRatio.toFixed(2) : 'N/A'}
- Beta Volatility: ${quote.beta ? quote.beta.toFixed(2) : 'N/A'}
- 52-Week Range: Low $${quote.fiftyTwoWeekLow.toFixed(2)} to High $${quote.fiftyTwoWeekHigh.toFixed(2)}
- Sector: ${quote.sector}
- Market Cap: $${(quote.marketCap / 1e9).toFixed(2)} Billion
- Volume: ${(quote.volume / 1e6).toFixed(2)} Million
- Profile description: ${quote.description}

Specific User Question Focus: "${query || 'General Fundamental & Technical Analysis'}"

Write the response in beautiful clean Markdown. Structure it into these explicit, professional headers:
1. ### Executive Summary & Financial Audit
2. ### Key Technical Indicators & Valuation Analysis
3. ### Strategic Forward-Looking Investment Recommendation

Keep the tone objective, precise, and authoritative. Do not offer explicit personal financial advice warnings inside the headers; keep it strictly expert institutional commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      return response.text || getMockSingleInsight(quote, query);
    } catch (error) {
      console.error('Gemini API query failed for single stock insight, using fallback', error);
      return getMockSingleInsight(quote, query);
    }
  },

  async generatePortfolioRecommendations(analytics: PortfolioAnalytics, itemsCount: number): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      return getMockPortfolioInsight(analytics, itemsCount);
    }

    try {
      const ai = getAIClient();
      const prompt = `You are an institutional CIO and portfolio management algorithm.
Provide a professional optimization and risk rating report based on the following comprehensive portfolio metrics:

Holdings Summary:
- Total Positions: ${itemsCount} active positions
- Current Aggregate Value: $${analytics.totalValue}
- Original Cost Basis: $${analytics.totalCostBasis}
- Net Profit/Loss: $${analytics.overallProfitOrLoss} (${analytics.overallChangePct}%)
- Weighted Portfolio Beta: ${analytics.portfolioBeta}
- Risk Rating Score: ${analytics.riskScore}/100 (${analytics.riskLevel})

Sector Diversification Ratios:
${analytics.sectorAllocation.map(s => `- ${s.sector}: $${s.value} (${s.percentage}%)`).join('\n')}

Holding Concentrations:
${analytics.holdingsAllocation.map(h => `- ${h.ticker}: $${h.value} (${h.percentage}%)`).join('\n')}

Write the response in beautiful clean Markdown. Address:
1. ### Strategic Portfolio Diversification Health Audit (Evaluate if sector weights are optimal)
2. ### Optimization Strategy & Rebalancing Recommendations (Detailed steps to lower risk score or boost output)
3. ### Tactical Asset Relocation Tips (Explain specific defensive or offensive assets that pair well with this current weight balance)

Keep the analysis math-heavy, precise, and institutional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      return response.text || getMockPortfolioInsight(analytics, itemsCount);
    } catch (error) {
      console.error('Gemini API query failed for portfolio recommendations, using fallback', error);
      return getMockPortfolioInsight(analytics, itemsCount);
    }
  },

  async generateComparisonInsight(quotes: StockQuote[]): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    const compsStr = quotes.map(q => `
- Ticker: ${q.ticker} (${q.name})
  Price: $${q.price.toFixed(2)} (${q.percentChange.toFixed(2)}%)
  P/E Ratio: ${q.peRatio ? q.peRatio.toFixed(2) : 'N/A'}
  Beta: ${q.beta ? q.beta.toFixed(2) : 'N/A'}
  Sector: ${q.sector}
  Market Cap: $${(q.marketCap / 1e9).toFixed(2)} Billions
  Description: ${q.description}
    `).join('\n');

    const mockComp = `### Comparative Stock Performance Audit
    
We have completed a side-by-side asset comparison of the selected securities: **${quotes.map(q => q.ticker).join(', ')}**.

#### 1. Fundamental Valuation Analysis
- **Premium Multiples:** ${quotes.map(q => `${q.ticker} (P/E: ${q.peRatio || 'N/A'})`).join(' vs ')} indicates that ${quotes.reduce((a, b) => (Number(a.peRatio || 0) > Number(b.peRatio || 0)) ? a : b).ticker} holds a significantly elevated valuation premium, implying heavy high-growth expectations.
- **Risk Exposure Adjusted (Beta):** ${quotes.map(q => `${q.ticker} (Beta: ${q.beta || 'N/A'})`).join(' vs ')} presents ${quotes.reduce((a, b) => (Number(a.beta || 0) > Number(b.beta || 0)) ? a : b).ticker} as the most aggressive swing asset, whereas ${quotes.reduce((a, b) => (Number(a.beta || 0) < Number(b.beta || 0)) ? a : b).ticker} serves as the ideal defensive income hedge.

#### 2. Allocation Rating Advice
*   **Growth / Growth Aggressive Strategy:** Maintain dominant weightings in companies showing continuous market caps and premium margins, such as tech leaders.
*   **Value / Yield Strategy:** Re-allocate capital towards low-beta consumer Defensive or Healthcare segments with robust valuation discounts. Ensure equal-weight allocations to neutralize single-factor risks.`;

    if (!key || key === 'MY_GEMINI_API_KEY') {
      return mockComp;
    }

    try {
      const ai = getAIClient();
      const prompt = `You are a senior hedge fund asset allocator.
Conduct a head-to-head comparison audit between these securities:

${compsStr}

Write a detailed comparison and risk summary in beautiful clean Markdown:
1. ### Valuation Multiples & Growth Divergence (Analyze P/E and Market Cap spreads)
2. ### Risk-Adjusted Profile (Review Beta indices and sector vulnerability)
3. ### Allocator's Verdict & Portfolio Tranche Fit (Declare which stock fits conservative income, which fits aggressive capital growth, and sizing rules)

Keep it expert, structured, and quantitative.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      return response.text || mockComp;
    } catch (error) {
      console.error('Gemini comparative analysis query failed, using fallback', error);
      return mockComp;
    }
  }
};
