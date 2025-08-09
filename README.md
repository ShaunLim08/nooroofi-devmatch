# 📊 Nooroofi - Polymarket Analytics Platform

A comprehensive analytics and tracking platform for Polymarket prediction markets that combines The Graph Protocol infrastructure with real-time market data to provide traders and researchers with powerful market intelligence tools.

## 🎯 What This Project Is About

This platform solves the challenge of accessing and analyzing prediction market data by providing:

- **Real-time market discovery** - Find the newest and most active Polymarket prediction markets
- **User position tracking** - Analyze any trader's portfolio and performance across all markets
- **Market intelligence** - Get insights on volume, liquidity, trends, and trading patterns
- **Unified data access** - Combines on-chain data from The Graph with market metadata from Polymarket APIs

Built with Next.js and integrating multiple data sources, it serves traders, researchers, and developers who need structured access to prediction market data.

---

## 🔗 The Graph Protocol Integration

### 📈 **The Graph Subgraph**

- **Folder**: [`nooroofi-subgraphs`](https://github.com/ShaunLim08/nooroofi-subgraphs)
- **Primary Endpoint**: `https://gateway.thegraph.com/api/subgraphs/id/6c58N5U4MtQE2Y8njfVrrAfRykzfqajMGeTMEvMmskVz`
- **Alternative Endpoint**: `https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/orderbook-subgraph/0.0.1/gn`
- **Purpose**: Queries on-chain Polymarket data including user positions, trading activity, and market events
- **Location in code**:
  - [`src/services/NewestMarketsFixed.js`](src/services/NewestMarketsFixed.js) - Main market data service
  - [`src/services/TrendingMarketData.js`](src/services/TrendingMarketData.js) - Trending market analysis
- **Key Queries**:
  ```graphql
  userPositions(orderBy: realizedPnl, orderDirection: desc)
  conditionPreparations(orderBy: timestamp, orderDirection: desc)
  ```

### 🌊 **The Graph Substream**

- **Folder**: [`nooroofi-substream`](https://github.com/ShaunLim08/nooroofi-substream)
- **Purpose**: Real-time streaming of Polymarket events for live updates
- **Features**:
  - Live market creation notifications
  - Real-time trading activity feeds
  - Event-driven market updates
- **Integration**: Processes blockchain events in real-time to feed the subgraph with the latest data

### 🔌 **The Graph Token API**

- **Implementation**: Direct token ID queries to Polymarket's REST API
- **Data Flow**: Token IDs extracted from subgraph queries → Used to fetch detailed market data via `/api/polymarket` proxy endpoint
- **Location**: ([app/profile/page.js](https://github.com/ShaunLim08/nooroofi-devmatch/blob/main/src/app/profile/page.js) - CORS proxy for Polymarket API calls

---

## 📦 Smart Contract Integration

### 🔗 **Smart Contracts Repository**

- **Folder**: [`nooroofi-contracts`](https://github.com/ShaunLim08/nooroofi-contracts)
- **Deployed Sepolia Contract**: [`0x81dc5f9ce084ad3d3e0feb4f3f1956463eeaf12c`](https://sepolia.etherscan.io/address/0x81dc5f9ce084ad3d3e0feb4f3f1956463eeaf12c)
- **Network**: Sepolia Testnet
- **Purpose**: Smart contracts for enhanced prediction market functionality
- **Integration**: Contract interactions handled through subgraph queries and direct blockchain calls

## 🚀 **Getting Started**

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ShaunLim08/nooroofi-devmatch.git
   cd nooroofi-devmatch
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🔗 **Related Repositories**

| Repository                                                               | Purpose                                         | Status    |
| ------------------------------------------------------------------------ | ----------------------------------------------- | --------- |
| [`nooroofi-subgraphs`](https://github.com/ShaunLim08/nooroofi-subgraphs) | The Graph subgraph for indexing Polymarket data | ✅ Active |
| [`nooroofi-substream`](https://github.com/ShaunLim08/nooroofi-substream) | Real-time data streaming from blockchain        | ✅ Active |
| [`nooroofi-contracts`](https://github.com/ShaunLim08/nooroofi-contracts) | Smart contracts for enhanced functionality      | ✅ Active |
| `nooroofi-devmatch`                                                      | Frontend application (this repo)                | ✅ Active |

---
