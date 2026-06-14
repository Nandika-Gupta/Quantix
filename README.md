# Quantix AI: Financial Analytics & Portfolio Platform

Quantix is a premium, institutional-grade, full-stack investment portfolio manager and capital assets intelligence suite. It unites quantitative financial mathematics with advanced generative AI pipelines, presenting retail users with sophisticated analytics typically reserved for proprietary trading firms. Guided by systematic risk engines, Quantix calculates active correlation indices, industry allocations, beta coefficients, and delivers customized asset rebalancing recommendations powered by Google Gemini AI.

---

## 🚀 Overview

Quantix operates as a unified platform supporting multi-user registration, secure JWT session encryption, interactive historical quote analysis, and asset-allocation modeling. Leveraging React 19, Express, Tailwind CSS, Recharts, and official `@google/genai` SDK integrations, Quantix creates a high-performance workspace to track asset valuations, inspect concentration risk ratings, compare security metrics side-by-side, and export ready-to-print markdown financial audits.

---

## ✨ Features

- **🌐 Connected Market Intelligence Dashboard**: Instant ticker evaluations (e.g., AAPL, MSFT, NVIDIA, TSLA) presenting real-time price changes, annual volumes, P/E ratios, and 52-week position range charts.
- **📈 Interactive Historical Time-Series Visualizer**: Fully responsive vector area charts powered by `recharts`, allowing users to cycle through varying time ranges (`30/90/180/365` days) to gauge systematic momentum.
- **💼 Multi-Asset Portfolio Manager**: Advanced purchase matrix with automated dollar-weighted cost-average metrics, sector allocation mappings, and portfolio percentage weight calculators.
- **🛡️ Quantitative Risk Analysis Engine**: Automated calibration of weighted portfolio Beta coefficients and a custom 100-point Risk Score rating (Conservative, Moderate, Aggressive, Special Speculative) representing individual asset volatility relative to standard indices.
- **⚖️ Side-by-Side Equities Comparator**: Side-by-side spec comparison of up to 5 securities covering macro cap scales, valuation premiums (P/E multiples), beta coefficients, and sectors.
- **🤖 Gemini Generative AI Advisor**: Deep financial reports, risk rebalancing advise, and double/triple comparative asset verdicts utilizing the fast, secure, and data-dense `gemini-3.5-flash` model.
- **📑 Portable Markdown Financial Audit Export**: Instant on-the-fly markdown document printing containing full portfolio totals, active position weights, and risk parameters prepared for standard downloads.
- **💻 Integrated Developers API Specifications**: Active REST route specification panels mapping JSON payloads, JWT token security boundaries, average response times (<15ms), and specifications for programmatic developers.

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

## 📡 API Endpoints Reference

### 1. Profile Security
- **`POST /api/auth/register`**: Creates defensive owner credentials and registers a workspace.
  - *Payload*: `{ "name": "Name", "email": "user@example.com", "password": "password123" }`
- **`POST /api/auth/login`**: Authenticates user and responds with a bearer token.
  - *Payload*: `{ "email": "user@example.com", "password": "password123" }`
- **`GET /api/auth/me`***: Decrypts JWT and returns current owner profile metadata.

### 2. Market Capital Metrics
- **`GET /api/stocks/:ticker`**: Grabs real-time price change factors, P/E ratios, beta risk, volume, and sector descriptions.
- **`GET /api/stocks/:ticker/history`**: Fetches daily price-points for chart rendering.
  - *Query Params*: `?points=30` (Accepts values between 1 and 365)
- **`POST /api/stocks/compare`**: Compares details of multiple tickers.
  - *Payload*: `{ "tickers": ["AAPL", "MSFT", "TSLA"] }` (Max 5 tickers)

### 3. Secured Portfolios
- **`GET /api/portfolio`***: Grabs your portfolio’s composition, asset weights, and systematic health metrics.
- **`POST /api/portfolio`***: Adds an asset holding.
  - *Payload*: `{ "ticker": "NVIDIA", "shares": 25, "buyPrice": 128.5 }`
- **`PUT /api/portfolio/:id`***: Updates the share count or purchase average of a specific holding.
  - *Payload*: `{ "shares": 30, "buyPrice": 125.0 }`
- **`DELETE /api/portfolio/:id`***: Deletes a holding from your portfolio.

### 4. Generative AI Pipeline
- **`POST /api/ai/analyze`***: Generates fundamental stock analysis leveraging defined user focus.
  - *Payload*: `{ "ticker": "AAPL", "query": "Is Apple’s valuation too steep given their current P/E multiple?" }`
- **`POST /api/ai/compare`***: Performs side-by-side asset rebalancing reviews on selected assets.
  - *Payload*: `{ "tickers": ["AMZN", "META"] }`
- **`GET /api/portfolio/optimize`***: Reviews overall portfolio asset metrics and recommends sector rebalancing.
- **`GET /api/portfolio/report`***: Assembles and downloads a completed PDF/Markdown report of current asset health.

### 5. Utilities
- **`GET /api/specs`**: Swagger-style manifest used by the Developers tab.
- **`GET /api/history`***: Lists log archives of previous AI analyses.

*\* Requires passing `Authorization: Bearer <JWT_TOKEN>` in request headers.*

---

## 🗄️ Database Schema Representation

The file-backed custom JSON database structure maintains persistent collections formatted as follows:

```json
{
  "users": [
    {
      "id": "e7b8a7f9c",
      "email": "analyst@quantix.com",
      "name": "Alex Mercer",
      "passwordHash": "$2a$10$hashed_password_string_using_bcrypt_rounds",
      "createdAt": "2026-06-13T17:19:02.000Z"
    }
  ],
  "holdings": [
    {
      "id": "j9d8f3k2",
      "userId": "e7b8a7f9c",
      "ticker": "AAPL",
      "shares": 10.5,
      "buyPrice": 178.4,
      "buyDate": "2026-06-13"
    }
  ],
  "analyses": [
    {
      "id": "n8m7v6x5",
      "userId": "e7b8a7f9c",
      "ticker": "AAPL",
      "query": "Growth Prospects Review",
      "analysis": "### Executive Summary & Financial Audit...",
      "createdAt": "2026-06-13T17:21:00.000Z"
    }
  ]
}
```

---

## 🤖 Generative AI Pipeline Flow

Quantix orchestrates structured data streams into targeted prompt coordinates before querying the Google Gemini 3.5 Flash model:

### 1. Ingestion Stage
Data is ingested from internal endpoints, extracting current stock values, Beta indicators, 52-week pricing envelopes, and specific context queries submitted by the user.

### 2. Context Prompt Conditioning
Data is fed into strict, pre-compiled institutional system templates:
- **Single Stock Analyst Prompt**: Configures the model as a professional Wall Street portfolio manager, instructing it to analyze valuation margins and technical momentum while structuring outputs with custom Markdown headers.
- **Portfolio Optimizer Prompt**: Aggregates total holdings value, weighted portfolio beta indices, risk scores, sector percentages, and concentration ratios, requesting structured steps to reduce exposure limits.

### 3. Execution & Failure Prevention
- **API Call**: Initiates non-blocking async generation.
- **Graceful Heuristic Fallback**: If `GEMINI_API_KEY` is not provided or fails due to network limitations, Quantix’s mock-intelligence model takes over. This fallback system uses the mock financial definitions in `aiService.ts` to output deterministic, mathematically precise data reports, maintaining complete system availability.

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

## 📈 Future System Improvements

1. **Relational PostgreSQL Integration**: Scale the database layer to PostgreSQL via cloud SQL or Supabase using Prisma/Drizzle.
2. **Real-time WebSockets Ingest**: Transition the mock stock data service to real-time Yahoo Finance or AlphaVantage streaming socket APIs for live market updates.
3. **Multi-Factor Portfolio Beta Modeling**: Improve capital calculations to model historical covariant risks and modern correlation matrices.
4. **OAuth Core Authentication Integration**: Add Google, GitHub, or Okta Single Sign-On (SSO) login options.

---

## 🤝 Contributing Guide

1. **Fork the Repository** and clone your customized branch.
2. **Ensure complete linter compliance** (`npm run lint`).
3. **Execute standard smoke tests** (`npm run test`) to ensure portfolio calculation logic is preserved.
4. **Document any API modifications** in the spec details inside `server.ts` to keep the developer redoc panel fully synchronized.
