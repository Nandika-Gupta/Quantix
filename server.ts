import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environmental parameters
dotenv.config();

import { dbService } from './src/server/db';
import { stockService } from './src/server/stockService';
import { aiService } from './src/server/aiService';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-portfolio-secret-key-2026';

const app = express();
app.use(express.json());

// Standard logging & response time tracking middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[LOG] ${new Date().toISOString()} | ${req.method} ${req.url} | Status: ${res.statusCode} | Duration: ${elapsed}ms`);
  });
  next();
});

// Custom authenticated request interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// User Identity JWT gate middleware
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. Authorization token missing.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authorization session.' });
  }
};

// ==========================================
// 1. STOCKS DATA ENDPOINTS
// ==========================================

// Get single stock quote details
app.get('/api/stocks/:ticker', (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker.toUpperCase().trim();
    if (!ticker) {
      res.status(400).json({ error: 'Ticker variable is mandatory.' });
      return;
    }
    const quote = stockService.getQuote(ticker);
    res.json(quote);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to capture stock values' });
  }
});

// Get historical price series points for charts
app.get('/api/stocks/:ticker/history', (req: Request, res: Response) => {
  try {
    const ticker = req.params.ticker.toUpperCase().trim();
    const points = parseInt(req.query.points as string) || 30; // default to 30 days of data
    
    if (points <= 0 || points > 365) {
      res.status(400).json({ error: 'Historical range must reside between 1 and 365 coordinate points.' });
      return;
    }

    const history = stockService.getHistory(ticker, points);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to construct dynamic price series' });
  }
});

// Head-to-head comparison metrics details
app.post('/api/stocks/compare', (req: Request, res: Response) => {
  try {
    const { tickers } = req.body;
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      res.status(400).json({ error: 'Invalid body parameter. List of "tickers" required.' });
      return;
    }

    if (tickers.length > 5) {
      res.status(400).json({ error: 'Side-by-side comparative analysis is limited to a maximum of 5 securities.' });
      return;
    }

    const results = tickers.map(t => {
      try {
        return stockService.getQuote(t.toString().toUpperCase().trim());
      } catch (e) {
        return { ticker: t, error: 'Ticker extraction failed' };
      }
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to parse multiple ticker vectors' });
  }
});

// ==========================================
// 2. USER AUTHENTICATION ENDPOINTS
// ==========================================

// Authentication Registration
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Direct input validations
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Provide a valid active email address.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Sign-up password must include at least 6 characters.' });
      return;
    }
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'Profile name is mandatory.' });
      return;
    }

    // Checking duplicates
    const duplicate = dbService.findUserByEmail(email);
    if (duplicate) {
      res.status(400).json({ error: 'An account is already configured under this email address.' });
      return;
    }

    // Secure encryption hashing
    const passwordHash = await bcrypt.hash(password, 10);
    const user = dbService.createUser({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
    });

    // Create session token
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed registration' });
  }
});

// Authentication Login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password variables are required.' });
      return;
    }

    const user = dbService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Incorrect credentials or profile does not exist.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Incorrect credential variables. Access denied.' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Authentication sequence failed' });
  }
});

// Retrieve verified profile metadata
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = dbService.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User workspace profile not located.' });
      return;
    }
    res.json({ id: user.id, email: user.email, name: user.name, createdAt: user.createdAt });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Authentication decoding error' });
  }
});

// ==========================================
// 3. SECURE PORTFOLIO CRUD ENDPOINTS
// ==========================================

// Get User Specific Portfolio details with integrated analytics
app.get('/api/portfolio', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const holdings = dbService.getHoldings(userId);
    const analytics = stockService.calculatePortfolioAnalytics(holdings);

    // Map live quote details to current holdings list
    const enrichedHoldings = holdings.map(h => {
      const quote = stockService.getQuote(h.ticker);
      const val = quote.price * h.shares;
      const cost = h.buyPrice * h.shares;
      const gainLoss = val - cost;
      const pctGainLoss = cost > 0 ? (gainLoss / cost) * 100 : 0;
      const portfolioPct = analytics.totalValue > 0 ? (val / analytics.totalValue) * 100 : 0;

      return {
        id: h.id,
        ticker: h.ticker,
        companyName: quote.name,
        shares: h.shares,
        buyPrice: h.buyPrice,
        currentPrice: quote.price,
        totalValue: Number(val.toFixed(2)),
        costBasis: Number(cost.toFixed(2)),
        profitOrLoss: Number(gainLoss.toFixed(2)),
        percentProfitOrLoss: Number(pctGainLoss.toFixed(2)),
        percentageOfPortfolio: Number(portfolioPct.toFixed(2)),
        sector: quote.sector,
        beta: quote.beta,
        buyDate: h.buyDate,
      };
    });

    res.json({
      holdings: enrichedHoldings,
      analytics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to construct user portfolio analytics' });
  }
});

// Add ticker holding to portfolio
app.post('/api/portfolio', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { ticker, shares, buyPrice } = req.body;

    if (!ticker) {
      res.status(400).json({ error: 'Stock Ticker variable is mandatory.' });
      return;
    }
    if (!shares || parseFloat(shares) <= 0) {
      res.status(400).json({ error: 'Purchase share count must resolve higher than 0.' });
      return;
    }
    if (!buyPrice || parseFloat(buyPrice) < 0) {
      res.status(400).json({ error: 'Average buy price cannot resolve below 0.' });
      return;
    }

    const holding = dbService.addHolding(userId, ticker, parseFloat(shares), parseFloat(buyPrice));
    res.status(201).json(holding);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Position add action rejected' });
  }
});

// Update ticker holding share count
app.put('/api/portfolio/:holdingId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { holdingId } = req.params;
    const { shares, buyPrice } = req.body;

    if (shares !== undefined && parseFloat(shares) <= 0) {
      res.status(400).json({ error: 'Shares value must be positive.' });
      return;
    }
    if (buyPrice !== undefined && parseFloat(buyPrice) < 0) {
      res.status(400).json({ error: 'Cost purchase index cannot resolve below 0.' });
      return;
    }

    const result = dbService.updateHolding(
      userId,
      holdingId,
      shares !== undefined ? parseFloat(shares) : 0,
      buyPrice !== undefined ? parseFloat(buyPrice) : undefined
    );

    if (!result) {
      res.status(404).json({ error: 'Holding identifier not found inside user parameters.' });
      return;
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Position update modification rejected' });
  }
});

// Delete ticker holding from portfolio
app.delete('/api/portfolio/:holdingId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { holdingId } = req.params;

    const success = dbService.deleteHolding(userId, holdingId);
    if (!success) {
      res.status(404).json({ error: 'Requested portfolio asset reference was not found or already deleted.' });
      return;
    }

    res.json({ message: 'Position cleared successfully from active holdings.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Position purge execution rejected' });
  }
});

// ==========================================
// 4. AI-INSIGHT GENERATION ROUTES
// ==========================================

// Call Gemini single stock expert analytics
app.post('/api/ai/analyze', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { ticker, query } = req.body;

    if (!ticker) {
      res.status(400).json({ error: 'Symbol variable is necessary to analyze trends.' });
      return;
    }

    const symbol = ticker.toUpperCase().trim();
    const quote = stockService.getQuote(symbol);

    const insight = await aiService.generateSingleStockInsight(quote, query);
    
    // Log previous analyses in audit table
    dbService.saveAnalysis(userId, symbol, query || 'General Metrics Analysis', insight);

    res.json({ ticker: symbol, insight });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Generative investment query failed' });
  }
});

// Call Gemini comparative multiple stock analyst
app.post('/api/ai/compare', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tickers } = req.body;
    if (!tickers || !Array.isArray(tickers) || tickers.length < 2) {
      res.status(400).json({ error: 'A minimum of 2 tickers is required for side-by-side comparison.' });
      return;
    }

    const quotes = tickers.map(t => stockService.getQuote(t.toString().toUpperCase().trim()));
    const compInsight = await aiService.generateComparisonInsight(quotes);

    res.json({ compInsight });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Generative multiple comparison failed' });
  }
});

// Run AI Investment Optimizer Recommendations Based on Portfolio status
app.get('/api/portfolio/optimize', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const holdings = dbService.getHoldings(userId);

    if (holdings.length === 0) {
      res.json({
        recommendation: `### Portfolio Optimizer Rating
        Your portfolio is empty. Search for core assets (e.g., AAPL, MSFT, BRK_B) on the main dashboard tab and add holdings to receive AI optimizations.`
      });
      return;
    }

    const analytics = stockService.calculatePortfolioAnalytics(holdings);
    const recommendation = await aiService.generatePortfolioRecommendations(analytics, holdings.length);

    res.json({ recommendation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Investment optimization routine failed' });
  }
});

// Generate Markdown PDF Report for user portfolio downlinks
app.get('/api/portfolio/report', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = dbService.findUserById(userId)!;
    const holdings = dbService.getHoldings(userId);
    const analytics = stockService.calculatePortfolioAnalytics(holdings);

    const lines = [
      `# AI FINANCIAL ANALYTICS & PORTFOLIO EXPORT REPORT`,
      `**Prepared For:** ${user.name} (${user.email})`,
      `**Timestamp Generated:** ${new Date().toLocaleString()}`,
      `---`,
      `## 1. COMPOSITE PORTFOLIO HEALTH AUDIT`,
      `- **Active Positions:** ${holdings.length} distinct investments`,
      `- **Aggregate Portfolio Valuation:** $${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `- **Historical Position Cost Basis:** $${analytics.totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `- **Aggregate Gain/Loss Metric:** ${analytics.overallProfitOrLoss >= 0 ? '+' : ''}$${analytics.overallProfitOrLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${analytics.overallChangePct}%)`,
      `- **Systematic Beta Sensitivity:** ${analytics.portfolioBeta} (Volatility index)`,
      `- **Platform Risk Score & Status:** ${analytics.riskScore}/100 rating (**${analytics.riskLevel}** profile)`,
      `---`,
      `## 2. ACTIVE SECURITY HOLDINGS INDEX`,
    ];

    if (holdings.length === 0) {
      lines.push(`*Empty - No asset positions are currently assigned to this account.*`);
    } else {
      holdings.forEach(h => {
        const quote = stockService.getQuote(h.ticker);
        const curVal = h.shares * quote.price;
        const totalCost = h.shares * h.buyPrice;
        const diff = curVal - totalCost;
        const pct = totalCost > 0 ? (diff / totalCost) * 100 : 0;
        lines.push(`### 📈 ${h.ticker} - ${quote.name} (${quote.sector})`);
        lines.push(`- **Shares:** ${h.shares} units`);
        lines.push(`- **Buy Avg Cost:** $${h.buyPrice.toFixed(2)}  |  **Current Quote:** $${quote.price.toFixed(2)}`);
        lines.push(`- **Total Position Allocation:** $${curVal.toFixed(2)} (${totalCost > 0 ? ((curVal / analytics.totalValue) * 100).toFixed(1) : '0'}% weighting)`);
        lines.push(`- **Absolute Position Change:** ${diff >= 0 ? '+' : ''}$${diff.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`);
        lines.push(``);
      });
    }

    lines.push(`---`);
    lines.push(`## 3. SECTOR ASSET ALLOCATION RATIOS`);
    if (analytics.sectorAllocation.length === 0) {
      lines.push(`*N/A - No capital distributions mapped.*`);
    } else {
      analytics.sectorAllocation.forEach(s => {
        lines.push(`- **${s.sector}:** $${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${s.percentage}%)`);
      });
    }

    lines.push(`---`);
    lines.push(`*Disclaimer: This analytics assessment report was parsed by autonomous financial models and does not hold statutory guarantee. Perform detailed independent validation prior to allocating physical investment capital.*`);

    const reportContent = lines.join('\n');
    
    // Set headers to trigger browser download dialog with markdown doc extension
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Portfolio_Audit_Report_${user.name.replace(/\s+/g, '_')}.md`);
    res.send(reportContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Report formatting sequence failed' });
  }
});

// Get previously generated audit history
app.get('/api/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const list = dbService.getAnalyses(userId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'History audit parsing failed' });
  }
});

// ==========================================
// 5. REST RE-DOC API DOCUMENTATION CONFIG
// ==========================================
app.get('/api/specs', (req: Request, res: Response) => {
  res.json({
    platform: 'AI Financial Analytics & Portfolio Management API',
    version: '1.2.0',
    protocol: 'RESTful Over HTTP',
    authModel: 'Bearer JWT Web Tokens',
    routes: [
      { path: '/api/auth/register', method: 'POST', description: 'Create a new account workspace portfolio', reqBody: '{ email, password, name }' },
      { path: '/api/auth/login', method: 'POST', description: 'Exchange credentials for JWT session key', reqBody: '{ email, password }' },
      { path: '/api/auth/me', method: 'GET', description: 'Decrypt verified owner metadata credentials', secure: true },
      { path: '/api/stocks/:ticker', method: 'GET', description: 'Look up live simulated index metrics details' },
      { path: '/api/stocks/:ticker/history', method: 'GET', description: 'Acquire sequential daily historical rates, query: ?points=30' },
      { path: '/api/stocks/compare', method: 'POST', description: 'Look up multi-company side-by-side specs', reqBody: '{ tickers: [ "AAPL", "MSFT" ] }' },
      { path: '/api/portfolio', method: 'GET', description: 'Grab detailed holding structures with metrics and overall composite ratios', secure: true },
      { path: '/api/portfolio', method: 'POST', description: 'Commit new holding vector coordinate into account', secure: true, reqBody: '{ ticker, shares, buyPrice }' },
      { path: '/api/portfolio/:holdingId', method: 'PUT', description: 'Revamp share coefficients of defined position', secure: true, reqBody: '{ shares, buyPrice }' },
      { path: '/api/portfolio/:holdingId', method: 'DELETE', description: 'Dismantle and sell position', secure: true },
      { path: '/api/ai/analyze', method: 'POST', description: 'Trigger single-security AI fundamental reporting', secure: true, reqBody: '{ ticker, query }' },
      { path: '/api/ai/compare', method: 'POST', description: 'Trigger double or triple comparative analysis', secure: true, reqBody: '{ tickers: ["TSLA", "NVIDIA"] }' },
      { path: '/api/portfolio/optimize', method: 'GET', description: 'Examine complete portfolio diversification audit report via Gemini AI model', secure: true },
      { path: '/api/portfolio/report', method: 'GET', description: 'Download markdown printed report', secure: true },
      { path: '/api/history', method: 'GET', description: 'Assess log archives for single queries triggered on account', secure: true }
    ],
  });
});

// ==========================================
// 6. FRONTEND VITE INTEGRATION ROUTING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend compiled bundle
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INIT] Full-Stack AI Financial Platform successfully deployed.`);
    console.log(`[INIT] Active Service endpoint: http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[CRITICAL] Server initialization fatal failure', error);
});
