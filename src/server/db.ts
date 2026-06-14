import fs from 'fs';
import path from 'path';
import { User, Holding, Analysis } from '../types';

interface DatabaseSchema {
  users: User[];
  holdings: Holding[];
  analyses: Analysis[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data_db.json');

function initDb(): DatabaseSchema {
  const defaultSchema: DatabaseSchema = {
    users: [],
    holdings: [],
    analyses: [],
  };

  try {
    const parentDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultSchema, null, 2), 'utf-8');
      return defaultSchema;
    }

    const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Database initialization failed, using in-memory backup', error);
    return defaultSchema;
  }
}

// Memory database instance/cache
let dbCache: DatabaseSchema = initDb();

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to persist database state', error);
  }
}

export const dbService = {
  // Users CRUD
  getUsers(): User[] {
    return dbCache.users;
  },

  findUserByEmail(email: string): User | undefined {
    return dbCache.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id: string): User | undefined {
    return dbCache.users.find(u => u.id === id);
  },

  createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
    };
    dbCache.users.push(newUser);
    saveDb();
    return newUser;
  },

  // Holdings CRUD
  getHoldings(userId: string): Holding[] {
    return dbCache.holdings.filter(h => h.userId === userId);
  },

  addHolding(userId: string, ticker: string, shares: number, buyPrice: number): Holding {
    const normalizedTicker = ticker.toUpperCase().trim();
    
    // Check if user already has a holding in this ticker
    const existing = dbCache.holdings.find(h => h.userId === userId && h.ticker === normalizedTicker);
    if (existing) {
      // Calculate new dollar average cost basis
      const prevTotal = existing.shares * existing.buyPrice;
      const addedTotal = shares * buyPrice;
      const totalShares = existing.shares + shares;
      existing.buyPrice = totalShares > 0 ? Number(( (prevTotal + addedTotal) / totalShares ).toFixed(4)) : buyPrice;
      existing.shares = totalShares;
      saveDb();
      return existing;
    }

    const newHolding: Holding = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      ticker: normalizedTicker,
      shares,
      buyPrice,
      buyDate: new Date().toISOString().split('T')[0],
    };
    
    dbCache.holdings.push(newHolding);
    saveDb();
    return newHolding;
  },

  updateHolding(userId: string, holdingId: string, shares: number, buyPrice?: number): Holding | null {
    const holding = dbCache.holdings.find(h => h.id === holdingId && h.userId === userId);
    if (!holding) return null;

    holding.shares = shares;
    if (buyPrice !== undefined) {
      holding.buyPrice = buyPrice;
    }
    
    saveDb();
    return holding;
  },

  deleteHolding(userId: string, holdingId: string): boolean {
    const initialLen = dbCache.holdings.length;
    dbCache.holdings = dbCache.holdings.filter(h => !(h.id === holdingId && h.userId === userId));
    const success = dbCache.holdings.length < initialLen;
    if (success) {
      saveDb();
    }
    return success;
  },

  // Analyses CRUD
  getAnalyses(userId: string): Analysis[] {
    return dbCache.analyses.filter(a => a.userId === userId);
  },

  saveAnalysis(userId: string, ticker: string, query: string, analysisText: string): Analysis {
    const newAnalysis: Analysis = {
      id: Math.random().toString(36).substring(2, 11),
      userId,
      ticker: ticker.toUpperCase().trim(),
      query,
      analysis: analysisText,
      createdAt: new Date().toISOString(),
    };
    dbCache.analyses.push(newAnalysis);
    saveDb();
    return newAnalysis;
  },
};
