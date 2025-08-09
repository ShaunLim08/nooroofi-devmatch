import { request } from 'graphql-request';

// Configuration matching your existing setup
const GRAPH_ENDPOINT = 'https://gateway.thegraph.com/api/subgraphs/id/GquFeuWzLBPVLzFQjncbbS9nmGCSQpH4kdE4FHVCapp2';
const POLYMARKET_ENDPOINT = 'https://gamma-api.polymarket.com/markets';

const HEADERS = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}`,
};

// GraphQL Queries for your subgraph
const RECENT_TRADES_QUERY = `
  query RecentTrades($limit: Int = 20) {
    orderFilleds(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      orderHash
      maker
      taker
      makerAssetId
      takerAssetId
      makerAmountFilled
      takerAmountFilled
      fee
      blockTimestamp
    }
    negRiskCtfExchangeOrderFilleds(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      orderHash
      maker
      taker
      makerAssetId
      takerAssetId
      makerAmountFilled
      takerAmountFilled
      fee
      blockTimestamp
    }
  }
`;

const MARKET_CONDITIONS_QUERY = `
  query MarketConditions($limit: Int = 50) {
    conditionPreparations(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      id
      conditionId
      oracle
      questionId
      outcomeSlotCount
      blockTimestamp
    }
    conditionResolutions(first: 20, orderBy: blockTimestamp, orderDirection: desc) {
      id
      conditionId
      oracle
      questionId
      outcomeSlotCount
      payoutNumerators
      blockTimestamp
    }
  }
`;

const TOKEN_PAIRS_QUERY = `
  query TokenPairs($limit: Int = 100) {
    tokenRegistereds(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      id
      token0
      token1
      conditionId
      blockTimestamp
    }
    negRiskCtfExchangeTokenRegistereds(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      id
      token0
      token1
      conditionId
      blockTimestamp
    }
  }
`;

const FEE_ACTIVITY_QUERY = `
  query FeeActivity($limit: Int = 100) {
    feeChargeds(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      receiver
      tokenId
      amount
      blockTimestamp
    }
    negRiskCtfExchangeFeeChargeds(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
      receiver
      tokenId
      amount
      blockTimestamp
    }
  }
`;

// Utility functions
const formatNumber = (number) => {
  return (parseFloat(number) / 1e6).toFixed(6);
};

const formatTimestamp = (timestamp) => {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const formatVolume = (volume) => {
  if (volume > 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume > 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toFixed(2);
};

// Enhanced market data fetching with Polymarket integration
async function fetchMarketDataForTokens(tokenIds) {
  const marketDataMap = new Map();
  
  // Batch fetch market data from Polymarket
  const batchSize = 10;
  for (let i = 0; i < tokenIds.length; i += batchSize) {
    const batch = tokenIds.slice(i, i + batchSize);
    const tokenIdParams = batch.join(',');
    
    try {
      const marketURL = `${POLYMARKET_ENDPOINT}?clob_token_ids=${tokenIdParams}`;
      const response = await fetch(marketURL, { headers: HEADERS });
      
      if (response.ok) {
        const markets = await response.json();
        markets.forEach(market => {
          if (market.clob_token_ids) {
            market.clob_token_ids.forEach(tokenId => {
              marketDataMap.set(tokenId, market);
            });
          }
        });
      }
    } catch (error) {
      console.warn(`Error fetching market data for batch ${i}:`, error);
    }
  }
  
  return marketDataMap;
}

// Main API functions
export async function fetchRecentTrades(limit = 20) {
  try {
    const data = await request(GRAPH_ENDPOINT, RECENT_TRADES_QUERY, { limit }, HEADERS);
    
    const ctfTrades = (data.orderFilleds || []).map(trade => ({
      ...trade,
      exchange: 'CTF',
      volume: parseFloat(formatNumber(trade.makerAmountFilled)) + parseFloat(formatNumber(trade.takerAmountFilled)),
      formattedTime: formatTimestamp(trade.blockTimestamp),
    }));

    const negRiskTrades = (data.negRiskCtfExchangeOrderFilleds || []).map(trade => ({
      ...trade,
      exchange: 'NegRisk',
      volume: parseFloat(formatNumber(trade.makerAmountFilled)) + parseFloat(formatNumber(trade.takerAmountFilled)),
      formattedTime: formatTimestamp(trade.blockTimestamp),
    }));

    const allTrades = [...ctfTrades, ...negRiskTrades]
      .sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

    // Fetch market data for unique token IDs
    const uniqueTokenIds = [...new Set([
      ...allTrades.map(t => t.makerAssetId),
      ...allTrades.map(t => t.takerAssetId)
    ])];
    
    const marketDataMap = await fetchMarketDataForTokens(uniqueTokenIds);

    // Enhance trades with market information
    const enrichedTrades = allTrades.map(trade => ({
      ...trade,
      makerMarket: marketDataMap.get(trade.makerAssetId),
      takerMarket: marketDataMap.get(trade.takerAssetId),
    }));

    return {
      allTrades: enrichedTrades,
      ctfTrades,
      negRiskTrades,
      totalVolume: allTrades.reduce((sum, trade) => sum + trade.volume, 0),
      marketCount: marketDataMap.size,
    };
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    throw error;
  }
}

export async function fetchMarketConditions(limit = 50) {
  try {
    const data = await request(GRAPH_ENDPOINT, MARKET_CONDITIONS_QUERY, { limit }, HEADERS);
    
    const conditions = (data.conditionPreparations || []).map(condition => {
      const resolution = (data.conditionResolutions || []).find(
        res => res.conditionId === condition.conditionId
      );

      return {
        ...condition,
        isResolved: !!resolution,
        resolution: resolution?.payoutNumerators,
        formattedTime: formatTimestamp(condition.blockTimestamp),
        title: `Market ${condition.conditionId.slice(0, 8)}...`,
      };
    });

    // Fetch market data for active conditions
    const activeConditions = conditions.filter(c => !c.isResolved);
    
    // Get token pairs for these conditions to fetch market data
    const tokenData = await request(GRAPH_ENDPOINT, TOKEN_PAIRS_QUERY, { limit: 200 }, HEADERS);
    const allTokenPairs = [
      ...(tokenData.tokenRegistereds || []),
      ...(tokenData.negRiskCtfExchangeTokenRegistereds || [])
    ];

    // Map conditions to token IDs
    const conditionTokenMap = new Map();
    allTokenPairs.forEach(pair => {
      if (!conditionTokenMap.has(pair.conditionId)) {
        conditionTokenMap.set(pair.conditionId, []);
      }
      conditionTokenMap.get(pair.conditionId).push(pair.token0, pair.token1);
    });

    // Fetch market data for all tokens
    const allTokenIds = Array.from(new Set(
      Array.from(conditionTokenMap.values()).flat()
    ));
    
    const marketDataMap = await fetchMarketDataForTokens(allTokenIds);

    // Enhance conditions with market data
    const enrichedConditions = conditions.map(condition => {
      const tokenIds = conditionTokenMap.get(condition.conditionId) || [];
      const marketData = tokenIds.map(tokenId => marketDataMap.get(tokenId)).filter(Boolean)[0];
      
      return {
        ...condition,
        marketData,
        tokenIds,
        question: marketData?.question || condition.title,
        category: marketData?.category || 'Unknown',
        volume: marketData?.volume || '0',
        liquidity: marketData?.liquidity || '0',
      };
    });

    return {
      allConditions: enrichedConditions,
      activeMarkets: enrichedConditions.filter(c => !c.isResolved),
      resolvedMarkets: enrichedConditions.filter(c => c.isResolved),
      totalMarkets: enrichedConditions.length,
    };
  } catch (error) {
    console.error('Error fetching market conditions:', error);
    throw error;
  }
}

export async function fetchTradingVolume(limit = 100) {
  try {
    const data = await request(GRAPH_ENDPOINT, FEE_ACTIVITY_QUERY, { limit }, HEADERS);
    
    const ctfFees = (data.feeChargeds || []).map(fee => ({
      ...fee,
      exchange: 'CTF',
      formattedAmount: formatNumber(fee.amount),
      formattedTime: formatTimestamp(fee.blockTimestamp),
    }));

    const negRiskFees = (data.negRiskCtfExchangeFeeChargeds || []).map(fee => ({
      ...fee,
      exchange: 'NegRisk', 
      formattedAmount: formatNumber(fee.amount),
      formattedTime: formatTimestamp(fee.blockTimestamp),
    }));

    const allFees = [...ctfFees, ...negRiskFees]
      .sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

    const totalFees = allFees.reduce((sum, fee) => sum + parseFloat(fee.formattedAmount), 0);
    
    // Calculate 24h metrics
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
    const recent24hFees = allFees.filter(fee => parseInt(fee.blockTimestamp) > oneDayAgo);
    const volume24h = recent24hFees.reduce((sum, fee) => sum + parseFloat(fee.formattedAmount), 0) * 100;

    return {
      allFees,
      ctfFees,
      negRiskFees,
      totalFees,
      volume24h,
      feeCount: allFees.length,
      recentFees: recent24hFees,
    };
  } catch (error) {
    console.error('Error fetching trading volume:', error);
    throw error;
  }
}

export async function fetchTokenPairs(limit = 100) {
  try {
    const data = await request(GRAPH_ENDPOINT, TOKEN_PAIRS_QUERY, { limit }, HEADERS);
    
    const ctfPairs = (data.tokenRegistereds || []).map(pair => ({
      ...pair,
      exchange: 'CTF',
      formattedTime: formatTimestamp(pair.blockTimestamp),
    }));

    const negRiskPairs = (data.negRiskCtfExchangeTokenRegistereds || []).map(pair => ({
      ...pair,
      exchange: 'NegRisk',
      formattedTime: formatTimestamp(pair.blockTimestamp),
    }));

    const allPairs = [...ctfPairs, ...negRiskPairs]
      .sort((a, b) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

    // Fetch market data for token pairs
    const uniqueTokenIds = [...new Set([
      ...allPairs.map(p => p.token0),
      ...allPairs.map(p => p.token1)
    ])];
    
    const marketDataMap = await fetchMarketDataForTokens(uniqueTokenIds);

    // Enhance pairs with market information
    const enrichedPairs = allPairs.map(pair => ({
      ...pair,
      token0Market: marketDataMap.get(pair.token0),
      token1Market: marketDataMap.get(pair.token1),
      marketData: marketDataMap.get(pair.token0) || marketDataMap.get(pair.token1),
    }));

    return {
      allPairs: enrichedPairs,
      ctfPairs,
      negRiskPairs,
      totalPairs: allPairs.length,
      marketDataMap,
    };
  } catch (error) {
    console.error('Error fetching token pairs:', error);
    throw error;
  }
}

// Combined dashboard data fetch
export async function fetchDashboardData() {
  try {
    const [trades, conditions, volume, pairs] = await Promise.all([
      fetchRecentTrades(20),
      fetchMarketConditions(30),
      fetchTradingVolume(50),
      fetchTokenPairs(50),
    ]);

    // Calculate aggregate statistics
    const stats = {
      totalTrades: trades.allTrades.length,
      totalVolume24h: volume.volume24h,
      activeMarkets: conditions.activeMarkets.length,
      totalMarkets: conditions.totalMarkets,
      totalFees: volume.totalFees,
      recentTraders: new Set([
        ...trades.allTrades.map(t => t.maker),
        ...trades.allTrades.map(t => t.taker)
      ]).size,
    };

    return {
      trades,
      conditions,
      volume,
      pairs,
      stats,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// Popular markets based on trading activity
export async function fetchPopularMarkets(limit = 10) {
  try {
    const trades = await fetchRecentTrades(100);
    const conditions = await fetchMarketConditions(100);
    
    // Count trading activity per token
    const tokenActivity = new Map();
    
    trades.allTrades.forEach(trade => {
      [trade.makerAssetId, trade.takerAssetId].forEach(tokenId => {
        const current = tokenActivity.get(tokenId) || { count: 0, volume: 0 };
        tokenActivity.set(tokenId, {
          count: current.count + 1,
          volume: current.volume + trade.volume,
        });
      });
    });

    // Get top tokens by activity
    const topTokens = Array.from(tokenActivity.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit * 2); // Get more to account for filtering

    // Fetch market data for top tokens
    const topTokenIds = topTokens.map(([tokenId]) => tokenId);
    const marketDataMap = await fetchMarketDataForTokens(topTokenIds);

    // Create popular markets list
    const popularMarkets = topTokens
      .map(([tokenId, activity]) => {
        const marketData = marketDataMap.get(tokenId);
        if (!marketData) return null;

        return {
          tokenId,
          activity,
          marketData,
          question: marketData.question,
          category: marketData.category,
          volume: marketData.volume,
          probability: calculateProbability(marketData),
          change24h: '0%', // Would need historical data
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return popularMarkets;
  } catch (error) {
    console.error('Error fetching popular markets:', error);
    throw error;
  }
}

// Helper function to calculate probability from market data
function calculateProbability(marketData) {
  if (!marketData.outcomePrices || !Array.isArray(marketData.outcomePrices)) {
    return 'N/A';
  }
  
  try {
    const prices = marketData.outcomePrices.map(p => parseFloat(p));
    if (prices.length >= 2) {
      // For binary markets, typically the second outcome is "YES"
      const yesPrice = prices[1] || prices[0];
      return `${Math.round(yesPrice * 100)}%`;
    }
  } catch (error) {
    console.warn('Error calculating probability:', error);
  }
  
  return 'N/A';
}

// Export utility functions for use in components
export {
  formatNumber,
  formatTimestamp,
  formatVolume,
  HEADERS,
  GRAPH_ENDPOINT,
  POLYMARKET_ENDPOINT,
};

// Default export for easier importing
export default {
  fetchRecentTrades,
  fetchMarketConditions,
  fetchTradingVolume,
  fetchTokenPairs,
  fetchDashboardData,
  fetchPopularMarkets,
};
