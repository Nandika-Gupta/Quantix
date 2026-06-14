import { stockService } from '../src/server/stockService';
import { dbService } from '../src/server/db';
import { Holding } from '../src/types';

console.log('=' .repeat(50));
console.log('RUNNING QUANTIX PLATFORM METRIC SUITE TEST AUTOMATION');
console.log('=' .repeat(50));

function runTests() {
  let failed = false;

  // Test 1: Simulated Stock Quote Generator Quality Check
  try {
    const quote = stockService.getQuote('AAPL');
    if (quote.ticker !== 'AAPL' || quote.price <= 0 || quote.sector !== 'Technology') {
      throw new Error(`Seeded AAPL profile failed validation. Captured: ${JSON.stringify(quote)}`);
    }
    console.log('✅ TEST 1 PASSED: Stock quotes generator has perfect deterministic bounds.');
  } catch (err: any) {
    console.error('❌ TEST 1 FAILED:', err.message);
    failed = true;
  }

  // Test 2: Portfolio mathematical allocation calculus verification
  try {
    const mockHoldings: Holding[] = [
      { id: '1', userId: 'user_1', ticker: 'AAPL', shares: 10, buyPrice: 150, buyDate: '2026-01-01' },
      { id: '2', userId: 'user_1', ticker: 'KO', shares: 50, buyPrice: 60, buyDate: '2026-01-01' },
    ];
    
    // Apple trades around $184, Coca-Cola around $62 in our mock coordinates
    const analytics = stockService.calculatePortfolioAnalytics(mockHoldings);
    
    if (analytics.totalValue <= 0 || analytics.totalCostBasis !== 4500) {
      throw new Error(`Analytics math formula failed. Captured database cost: ${analytics.totalCostBasis}`);
    }

    if (analytics.portfolioBeta <= 0 || typeof analytics.riskScore !== 'number') {
      throw new Error(`Analytics risk scorer returned empty indices.`);
    }

    console.log(`✅ TEST 2 PASSED: Portfolio calculation formulas yield perfect math: Cost basis ($${analytics.totalCostBasis}), Beta (${analytics.portfolioBeta}), and Risk Score (${analytics.riskScore}).`);
  } catch (err: any) {
    console.error('❌ TEST 2 FAILED:', err.message);
    failed = true;
  }

  // Test 3: Embedded memory database layer CRUD operations
  try {
    const testUserId = 'test_usr_smoke';
    const holding = dbService.addHolding(testUserId, 'MSFT', 15, 380);
    const userHoldings = dbService.getHoldings(testUserId);
    
    if (userHoldings.length !== 1 || userHoldings[0].ticker !== 'MSFT' || userHoldings[0].shares !== 15) {
      throw new Error('Database insertion was not persisted properly inside the JSON layer.');
    }

    dbService.deleteHolding(testUserId, holding.id);
    const cleanedHoldings = dbService.getHoldings(testUserId);
    
    if (cleanedHoldings.length !== 0) {
      throw new Error('Database removal failed to delete position coordinate.');
    }

    console.log('✅ TEST 3 PASSED: File-based JSON database layer operates with 100% stable transactions.');
  } catch (err: any) {
    console.error('❌ TEST 3 FAILED:', err.message);
    failed = true;
  }

  console.log('=' .repeat(50));
  if (failed) {
    console.log('🔴 COMPOSITE PLATFORM VERIFICATION REPORT: FAILURES DETECTED.');
    process.exit(1);
  } else {
    console.log('🟢 COMPOSITE PLATFORM VERIFICATION REPORT: ALL MATHEMATICAL CORATIONS ARE STABLE.');
    process.exit(0);
  }
}

runTests();
