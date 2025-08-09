import { request } from 'graphql-request';

// Configuration
const TRENDING_ENDPOINT =
  'https://gateway.thegraph.com/api/subgraphs/id/6c58N5U4MtQE2Y8njfVrrAfRykzfqajMGeTMEvMmskVz';
const POLYMARKET_MARKETS = '/api/polymarket';

const TRENDING_HEADERS = {
  Authorization: 'Bearer b4b9fa0f76044607d30bda744ccb992d',
};

// GraphQL query for user positions - trending markets based on user activity
const USER_POSITIONS_QUERY = (address, limit = 10) => `{
  userPositions(
    orderBy: realizedPnl
    orderDirection: desc
    where: {user: "${address}"}
    first: ${limit}
  ) {
    id
    user
    tokenId
    totalBought
    realizedPnl
    avgPrice
  }
}`;

// Query for getting all top performing positions across users
const TOP_POSITIONS_QUERY = (limit = 20) => `{
  userPositions(
    orderBy: realizedPnl
    orderDirection: desc
    first: ${limit}
  ) {
    id
    user
    tokenId
    totalBought
    realizedPnl
    avgPrice
  }
}`;

// Format position data
function formatTrendingPosition(position) {
  const formatNumber = (number) => {
    return (parseFloat(number) / 1e6).toFixed(6);
  };

  const formatPrice = (price) => {
    return (parseFloat(price) / 1e6).toFixed(6);
  };

  return {
    // Position data
    id: position.id,
    user: position.user,
    tokenId: position.tokenId,
    totalBought: formatNumber(position.totalBought),
    realizedPnl: formatNumber(position.realizedPnl),
    avgPrice: formatPrice(position.avgPrice),

    // Market data (will be populated from Polymarket API)
    marketInfo: position.marketInfo
      ? {
          id: position.marketInfo.id,
          question: position.marketInfo.question,
          category: position.marketInfo.category,
          marketType: position.marketInfo.marketType,
          closed: position.marketInfo.closed,
          volume: position.marketInfo.volume,
          liquidity: position.marketInfo.liquidity,
          outcomes: position.marketInfo.outcomes
            ? JSON.parse(position.marketInfo.outcomes)
            : [],
          outcomePrices: position.marketInfo.outcomePrices
            ? JSON.parse(position.marketInfo.outcomePrices).map((price) =>
                parseFloat(price).toFixed(6)
              )
            : [],
          endDate: position.marketInfo.endDate,
          description: position.marketInfo.description
            ? position.marketInfo.description.slice(0, 200) + '...'
            : 'No description available',
        }
      : null,
  };
}

// Fetch market data from Polymarket for a token ID with filtering
async function fetchMarketDataForToken(tokenId) {
  try {
    const marketURL = `${POLYMARKET_MARKETS}?clob_token_ids=${tokenId}`;
    const marketData = await fetch(marketURL, { headers: TRENDING_HEADERS });

    if (marketData.ok) {
      const marketResponse = await marketData.json();
      const market = marketResponse[0];

      if (!market) return null;

      // Apply filtering for recent and high volume markets
      const volume = parseFloat(market.volume || 0);
      const liquidity = parseFloat(market.liquidity || 0);

      // Filter by minimum volume (1000) and liquidity (500)
      if (volume < 1000 || liquidity < 500) {
        return null;
      }

      // Filter by recency - markets should end within next 30 days
      const endDate = new Date(market.end_date_iso);
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      // Market should still be active and not too far in future
      if (endDate <= now || endDate > thirtyDaysFromNow) {
        return null;
      }

      return market;
    } else {
      console.error('Error fetching market data:', marketData.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching market data for token:', tokenId, error);
    return null;
  }
}

// Fetch trending markets based on user positions
export async function fetchTrendingMarkets(
  userAddress = null,
  limit = 10,
  sortBy = 'volume'
) {
  try {
    let query;

    // If user address provided, get their positions, otherwise get top positions globally
    if (userAddress) {
      query = USER_POSITIONS_QUERY(userAddress, limit * 2); // Get more to filter
    } else {
      query = TOP_POSITIONS_QUERY(limit * 2);
    }

    const data = await request(TRENDING_ENDPOINT, query, {}, TRENDING_HEADERS);
    const userPositions = data.userPositions;

    if (!userPositions || userPositions.length === 0) {
      return [];
    }

    // Fetch market data for each position
    const enrichedPositions = [];

    for (const position of userPositions) {
      const marketInfo = await fetchMarketDataForToken(position.tokenId);

      if (marketInfo) {
        position.marketInfo = marketInfo;
        const formattedPosition = formatTrendingPosition(position);
        enrichedPositions.push(formattedPosition);
      }
    }

    // Sort based on the specified criteria
    let sortedPositions = [...enrichedPositions];

    switch (sortBy) {
      case 'volume':
        sortedPositions.sort((a, b) => {
          const volumeA = parseFloat(a.marketInfo?.volume || 0);
          const volumeB = parseFloat(b.marketInfo?.volume || 0);
          return volumeB - volumeA;
        });
        break;

      case 'pnl':
        sortedPositions.sort((a, b) => {
          const pnlA = parseFloat(a.realizedPnl || 0);
          const pnlB = parseFloat(b.realizedPnl || 0);
          return pnlB - pnlA;
        });
        break;

      case 'liquidity':
        sortedPositions.sort((a, b) => {
          const liquidityA = parseFloat(a.marketInfo?.liquidity || 0);
          const liquidityB = parseFloat(b.marketInfo?.liquidity || 0);
          return liquidityB - liquidityA;
        });
        break;

      default:
        // Default sort by realized PnL
        sortedPositions.sort(
          (a, b) => parseFloat(b.realizedPnl) - parseFloat(a.realizedPnl)
        );
    }

    return sortedPositions.slice(0, limit);
  } catch (error) {
    console.error('Error fetching trending markets:', error);
    return [];
  }
}

// Format trending market data for UI display
export function formatTrendingMarketForUI(position) {
  if (!position || !position.marketInfo) {
    return null;
  }

  const marketInfo = position.marketInfo;
  const realizedPnl = parseFloat(position.realizedPnl);

  // Calculate probability from outcome prices
  let probability = 'N/A';
  if (marketInfo.outcomePrices && marketInfo.outcomePrices.length >= 2) {
    try {
      const yesPrice =
        parseFloat(marketInfo.outcomePrices[1]) ||
        parseFloat(marketInfo.outcomePrices[0]);
      probability = Math.round(yesPrice * 100);
    } catch (error) {
      console.warn('Error calculating probability:', error);
    }
  }

  // Determine outcome based on PnL and probability
  let outcome = 'Unknown';
  if (marketInfo.outcomes && marketInfo.outcomes.length >= 2) {
    outcome = realizedPnl > 0 ? marketInfo.outcomes[1] : marketInfo.outcomes[0];
  } else {
    outcome = realizedPnl > 0 ? 'Yes' : 'No';
  }

  return {
    id: position.tokenId,
    title: marketInfo.question || `Market ${position.tokenId.slice(0, 8)}...`,
    outcome: outcome,
    probability: probability,
    volume: formatVolumeDisplay(marketInfo.volume),
    users: 1, // Would need additional query to get actual user count
    change: realizedPnl >= 0 ? '+' : '',
    pnl: Math.abs(realizedPnl).toFixed(2),
    category: marketInfo.category || 'General',
    description: marketInfo.description,
    liquidity: formatVolumeDisplay(marketInfo.liquidity),
    marketType: marketInfo.marketType,
    closed: marketInfo.closed,
    endDate: marketInfo.endDate,
    rawPosition: position,
  };
}

// Format volume for display
function formatVolumeDisplay(volume) {
  const vol = parseFloat(volume) || 0;

  if (vol >= 1000000) {
    return `$${(vol / 1000000).toFixed(1)}M`;
  } else if (vol >= 1000) {
    return `$${(vol / 1000).toFixed(1)}K`;
  } else {
    return `$${vol.toFixed(0)}`;
  }
}

// Get trending markets formatted for UI
export async function getTrendingMarketsForUI(
  userAddress = null,
  limit = 6,
  sortBy = 'volume'
) {
  try {
    const trendingPositions = await fetchTrendingMarkets(
      userAddress,
      limit,
      sortBy
    );

    return trendingPositions
      .map((position) => formatTrendingMarketForUI(position))
      .filter((market) => market !== null);
  } catch (error) {
    console.error('Error getting trending markets for UI:', error);
    return [];
  }
}

// Fetch trending markets by multiple criteria
export async function fetchTrendingMarketsByActivity(limit = 10) {
  try {
    // Get top positions across all users
    const topPositions = await fetchTrendingMarkets(null, limit * 3, 'pnl');

    // Group by market/token to find most active markets
    const marketActivity = new Map();

    topPositions.forEach((position) => {
      const tokenId = position.tokenId;
      const existing = marketActivity.get(tokenId) || {
        positions: [],
        totalVolume: 0,
        totalPnl: 0,
        userCount: new Set(),
      };

      existing.positions.push(position);
      existing.totalVolume += parseFloat(position.marketInfo?.volume || 0);
      existing.totalPnl += parseFloat(position.realizedPnl || 0);
      existing.userCount.add(position.user);

      marketActivity.set(tokenId, existing);
    });

    // Convert to array and sort by activity score
    const trendingMarkets = Array.from(marketActivity.entries())
      .map(([tokenId, activity]) => {
        const bestPosition = activity.positions[0]; // First position (highest PnL)
        const activityScore = activity.totalVolume * activity.userCount.size;

        return {
          ...bestPosition,
          activityScore,
          userCount: activity.userCount.size,
          totalVolume: activity.totalVolume,
          avgPnl: activity.totalPnl / activity.positions.length,
        };
      })
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, limit);

    return trendingMarkets.map((market) => formatTrendingMarketForUI(market));
  } catch (error) {
    console.error('Error fetching trending markets by activity:', error);
    return [];
  }
}

// Export utility functions
export {
  formatTrendingPosition,
  fetchMarketDataForToken,
  formatVolumeDisplay,
  TRENDING_ENDPOINT,
  POLYMARKET_MARKETS,
  TRENDING_HEADERS,
};

// Default export
export default {
  fetchTrendingMarkets,
  getTrendingMarketsForUI,
  fetchTrendingMarketsByActivity,
  formatTrendingMarketForUI,
};
