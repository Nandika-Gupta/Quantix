# Quantix AI: Financial Analytics & Portfolio Platform

Quantix is a premium, institutional-grade, full-stack investment portfolio manager and capital assets intelligence suite. It unites quantitative financial mathematics with advanced generative AI pipelines, presenting retail users with sophisticated analytics typically reserved for proprietary trading firms. Guided by systematic risk engines, Quantix calculates active correlation indices, industry allocations, beta coefficients, and delivers customized asset rebalancing recommendations powered by Google Gemini AI.

---

##  Overview

Quantix operates as a unified platform supporting multi-user registration, secure JWT session encryption, interactive historical quote analysis, and asset-allocation modeling. Leveraging React 19, Express, Tailwind CSS, Recharts, and official `@google/genai` SDK integrations, Quantix creates a high-performance workspace to track asset valuations, inspect concentration risk ratings, compare security metrics side-by-side, and export ready-to-print markdown financial audits.

---

##  Features

- ** Connected Market Intelligence Dashboard**: Instant ticker evaluations (e.g., AAPL, MSFT, NVIDIA, TSLA) presenting real-time price changes, annual volumes, P/E ratios, and 52-week position range charts.
- ** Interactive Historical Time-Series Visualizer**: Fully responsive vector area charts powered by `recharts`, allowing users to cycle through varying time ranges (`30/90/180/365` days) to gauge systematic momentum.
- ** Multi-Asset Portfolio Manager**: Advanced purchase matrix with automated dollar-weighted cost-average metrics, sector allocation mappings, and portfolio percentage weight calculators.
- ** Quantitative Risk Analysis Engine**: Automated calibration of weighted portfolio Beta coefficients and a custom 100-point Risk Score rating (Conservative, Moderate, Aggressive, Special Speculative) representing individual asset volatility relative to standard indices.
- ** Side-by-Side Equities Comparator**: Side-by-side spec comparison of up to 5 securities covering macro cap scales, valuation premiums (P/E multiples), beta coefficients, and sectors.
- ** Gemini Generative AI Advisor**: Deep financial reports, risk rebalancing advise, and double/triple comparative asset verdicts utilizing the fast, secure, and data-dense `gemini-3.5-flash` model.
- ** Portable Markdown Financial Audit Export**: Instant on-the-fly markdown document printing containing full portfolio totals, active position weights, and risk parameters prepared for standard downloads.
- ** Integrated Developers API Specifications**: Active REST route specification panels mapping JSON payloads, JWT token security boundaries, average response times (<15ms), and specifications for programmatic developers.

---

## 🛠️ Complete Tech Stack

### 1. Frontend Technologies
- **UI & View Layer**: React 19 (TypeScript SPAs)
- **Styling Architecture**: Tailwind CSS Integration (Vite-in-JS plugin compiling utility styles)
- **Vector Graphics & UI Icons**: Lucide React
- **Data Visualization & Charts**: Recharts & D3-scale utilities
- **State Management**: Stable client React Context and localized secure local storage session trackers
- **Motion & Transitions**: Motion (React Layout Animations)

### 2. Backend Technologies
- **Execution Run-Time**: Node.js 22 LTS Alpine
- **Server Framework**: Express (v4 with TypeScript runtime)
- **Dev Runner**: TSX (direct execution of server TypeScript types)
- **Compiler Bundling**: Esbuild (Bundles full server code into a production CJS module inside `/dist/server.cjs` to bypass native ES Module path errors)

### 3. Database Technologies
- **Engine**: Local file-backed database layer (`data_db.json`)
- **Control Rules**: Fully buffered cache memory schema writing sync JSON payloads on ACID-like operations (Users, Portfolios, AI Log records)

### 4. AI/ML Technologies
- **Cognitive Model Layer**: Google Gemini 3.5 Flash Model
- **SDK Protocol**: Modern official `@google/genai` TypeScript SDK
- **Integrations**: Custom context prompts parsing quantitative holding statistics, sector allocations, and customized stock metrics

### 5. Deployment & DevOps
- **Containerization**: Multi-stage lightweight `Dockerfile` (separates compile builds from runtime packages to construct a highly minimized runner image)
- **Reverse Proxy routing**: Configured for Cloud Run continuous deployment, binding automatically to ingress port `3000` on host `0.0.0.0`.

### 6. Testing Framework
- **Custom Suite**: Custom Smoke Verification Suite (`tests/smoke.test.ts`) utilizing `tsx` executing validation benchmarks:
  - Deterministic stock price generator boundaries
  - Asset-allocation algebraic math checks (WACC cost-basis, beta coefficients, risk ratings)
  - Memory-DB CRUD transaction states and file-backed persistence accuracy

### 7. Security Features
- **Session Protection**: JSON Web Tokens (JWT) using cryptographically signed headers
- **Credential Safety**: Hashed user passwords leveraging `bcryptjs` with 10-rounds cryptographic salt indices
- **Data Encapsulation**: Strictly decoupled API endpoints routing Gemini key configurations server-side (preventing environment credentials leak to user browsers)

---

## 📐 Architecture & System Flow

```
                      +---------------------------------------+
                      |           React 19 Frontend           |
                      |   (Vite, Tailwind, Recharts, Motion)   |
                      +-------------------+---------------+---+
                                          |               ^
                          POST /api/auth  |               |  JWT / Enriched
                          GET /api/stocks |               |  Portfolio Object
                                          v               |
                      +-------------------+---------------+---+
                      |         Node.js Express Server        |
                      |       (Vite Dev Middleware Mode)      |
                      +----+--------------+--------------+----+
                           |              |              |
         Read / Sync JSON  |              |              |  Google GenAI SDK
                           v              v              v
               +-----------+--+     +-----+----+   +-----+------------+
               |  JSON-File   |     | Stock    |   | Gemini API       |
               |  Database    |     | Service  |   | gemini-3.5-flash |
               | (data_db.json)     | (Quotes) |   | (insights)       |
               +--------------+     +----------+   +------------------+
```

1. **Development Layer**: In local development, the Express server boots Vite in `middlewareMode` with HMR disabled per container controls. This allows a single Express process to serve Hot API endpoints while routing asset bundles to standard browsers.
2. **Production Layer**: A multi-stage Docker builder compiles the React frontend assets into `dist/`. Esbuild packages `server.ts` into a self-contained CJS bundle in `dist/server.cjs`, allowing Node to execute server routing without file system overhead.

---

## 📁 Folder Structure

```
quantix-platform/
├── dist/                          # Production Compiled Output Assets
│   ├── index.html                 # Minified SPA entrance
│   ├── assets/                    # Compiled JS/CSS bundles
│   └── server.cjs                 # Self-contained bundled Express Server Code
├── src/
│   ├── App.tsx                    # Main App Controller with central state management
│   ├── main.tsx                   # Client Mount Configuration
│   ├── index.css                  # Global Tailwind imports
│   ├── types.ts                   # Centralized model interfaces and enums
│   ├── components/                # Client UI Components
│   │   ├── AuthPage.tsx           # JWT Sign-up & Login Interface
│   │   ├── Dashboard.tsx          # Analytical search & AI advisor query engine
│   │   ├── Portfolio.tsx          # Holding controller & total totals dashboard
│   │   ├── Analytics.tsx          # Recharts concentric risk/beta charts
│   │   ├── Comparison.tsx         # Multiple assets head-to-head metrics
│   │   ├── ApiDocs.tsx            # Swagger-style REST specs panel
│   │   └── HistoryLogs.tsx        # Previously logged AI review archives
│   └── server/                    # Core Server Modules
│       ├── db.ts                  # File-based database service with synchronous persistence
│       ├── stockService.ts        # Algorithmic stock models and quantitative algebra
│       └── aiService.ts           # Google Gemini API connector with fallback systems
├── tests/
│   └── smoke.test.ts              # Automated model testing suite
├── server.ts                      # Full-Stack entry point (Express, Vite proxy, JWT gates)
├── package.json                   # Project scripts and library dependency maps
├── tsconfig.json                  # Compiler configuration
├── vite.config.ts                 # React dev/build packaging guidelines
├── Dockerfile                     # Optimized production multi-stage build instructions
├── metadata.json                  # Sandbox configurations
└── .env.example                   # Prototype configuration template
```

---

## ⚙️ Installation & Configuration

### Prerequisites
- Node.js 22 LTS or newer
- NPM (v10 or newer)

### 1. Environment Config
Configure your local environment variables. Create a `.env` file in the root directory:

```env
# Port parameter (Hardcoded to 3000 inside host container namespaces)
PORT=3000

# Security secret phrase to encrypt user JWT sessions
JWT_SECRET=super-secured-financial-platform-secret-2026

# Google Gemini API Key (Obtained from Google AI Studio)
# If left blank, the suite will gracefully fall back to advanced heuristic calculators.
GEMINI_API_KEY=AIzaSy...
```

### 2. Dependency Resolution
Install packages mapped in the package manifest:

```bash
npm install
```

---

## 🏃 Running Locally

### Start Development Server
Launches the full-stack system with active Vite middleware mapping live API routes:

```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) inside your web browser.

### Execute Code Quality Linter
Performs type checks without outputting build files:

```bash
npm run lint
```

### Run Mathematical Integration Tests
Initiates the automated smoke tests to verify mathematics integrity, mock database transactions, and quote constraints:

```bash
npm run test
```

### Compile Production Bundle
Compiles CSS, minifies the React SPA, and bundles the Node server using Esbuild:

```bash
npm run build
```

### Launch Production Container locally
Launches the compiled production package instantly:

```bash
npm run start
```

---



## 🖼️ User Interface Sections

- **Market Dashboard**: Features an interactive search bar, trending ticker shortcuts, responsive Recharts area graphs displaying pricing history, and the Gemini expert query module.
- **My Portfolio**: Evaluates total asset valuation, cost bases, net profits/losses, sector definitions, average cost figures, and triggers the AI rebalancing recommendations panel.
- **Risk Analytics Engine**: Concentric visual dials showing portfolio risk scores, sector pie charts with responsive legend flags, and horizontal bar charts highlighting single-weight asset concentrations.
- **Asset Compare**: Grid matrix comparing macro cap weights, daily variances, dividend metrics, valuation layers, and AI comparison summaries.
- **Audit Archives**: An expandable history repository of previous stock reports.
- **Developers API REST Specs**: A live specification guide describing route schemas and active JWT payload coordinates.

---

## 🐳 Deployment Guide

Quantix is ready for production hosting. To launch the platform inside isolated Docker runtimes:

### 1. Compile Docker Container
Builds the multi-stage Alpine runner layer:

```bash
docker build -t quantix-platform:latest .
```

### 2. Run Container Instantly
Starts runtime mapping on port 3000 with your secure API credentials:

```bash
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET="your_production_secret" \
  -e GEMINI_API_KEY="your_google_studio_key" \
  --name quantix_service \
  quantix-platform:latest
```

---
