import { request } from 'graphql-request';

const GRAPH_ENDPOINT =
  'https://gateway.thegraph.com/api/subgraphs/id/6c58N5U4MtQE2Y8njfVrrAfRykzfqajMGeTMEvMmskVz';
const POLYMARKET_ENDPOINT = '/api/polymarket';

const HEADERS = {
  Authorization: 'Bearer b4b9fa0f76044607d30bda744ccb992d',
};

// Format position data from The Graph - Updated to match your code structure
function formatPosition(position) {
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

    // Market data - Simplified structure based on your code
    marketInfo: position.marketInfo
      ? {
          id: position.marketInfo.id,
          question: position.marketInfo.question,
          category: position.marketInfo.category,
          marketType: position.marketInfo.marketType,
          closed: position.marketInfo.closed,
          active: position.marketInfo.active,
          volume: position.marketInfo.volume,
          liquidity: position.marketInfo.liquidity,
          outcomes: position.marketInfo.outcomes || [],
          outcomePrices: position.marketInfo.outcomePrices || [],
          endDate: position.marketInfo.endDate,
          description: position.marketInfo.description
            ? position.marketInfo.description.slice(0, 200) + '...'
            : '',
        }
      : null,
  };
}

// Create GraphQL query for user positions - Enhanced with optional limit
function createUserPositionsQuery(address, limit = null) {
  const limitClause = limit ? `first: ${limit}` : ''; // Remove first to get all data as per your comment

  return `{
    userPositions(
      orderBy: realizedPnl
      orderDirection: desc
      where: {user: "${address.toLowerCase()}"}
      ${limitClause}
    ) {
      id
      user
      tokenId
      totalBought
      realizedPnl
      avgPrice
    }
  }`;
}

// Fetch user positions from The Graph - Updated to match your code structure
export async function fetchUserPositions(address, limit = 50) {
  try {
    const query = createUserPositionsQuery(address, limit);
    const data = await request(GRAPH_ENDPOINT, query, {}, HEADERS);

    if (!data || !data.userPositions) {
      throw new Error('No positions data received');
    }

    const userPositions = data.userPositions;

    // Fetch market info for each position - Following your approach
    for (const position of userPositions) {
      try {
        const marketURL = `${POLYMARKET_ENDPOINT}?clob_token_ids=${position.tokenId}`;
        const marketData = await fetch(marketURL, { headers: HEADERS });

        if (marketData.ok) {
          const marketResponse = await marketData.json();
          position.marketInfo = marketResponse[0] || null;
        } else {
          console.error('Error fetching market data:', marketData.status);
          position.marketInfo = null;
        }
      } catch (error) {
        console.warn(
          `Error fetching market data for token ${position.tokenId}:`,
          error
        );
        position.marketInfo = null;
      }
    }

    // Format all positions and log them like in your code
    const formattedPositions = userPositions.map((position) => {
      const formattedPosition = formatPosition(position);
      console.log(formattedPosition); // Log formatted position like your code
      return formattedPosition;
    });

    return formattedPositions;
  } catch (error) {
    console.error('Error fetching user positions:', error);
    throw error;
  }
}

// Calculate user statistics from positions
export function calculateUserStats(positions) {
  if (!positions || positions.length === 0) {
    return {
      totalPositions: 0,
      totalVolume: 0,
      totalProfit: 0,
      winRate: 0,
      avgInvested: 0,
      activePositions: 0,
    };
  }

  const totalPositions = positions.length;
  const totalVolume = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.totalBought),
    0
  );
  const totalProfit = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.realizedPnl),
    0
  );
  const profitablePositions = positions.filter(
    (pos) => parseFloat(pos.realizedPnl) > 0
  ).length;
  const winRate =
    totalPositions > 0 ? (profitablePositions / totalPositions) * 100 : 0;
  const avgInvested = totalPositions > 0 ? totalVolume / totalPositions : 0;
  const activePositions = positions.filter(
    (pos) => pos.marketInfo && !pos.marketInfo.closed
  ).length;

  return {
    totalPositions,
    totalVolume: Math.round(totalVolume),
    totalProfit: Math.round(totalProfit),
    winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
    avgInvested: Math.round(avgInvested),
    activePositions,
  };
}

// Get open positions for internal use (not exported)
function getOpenPositionsFromData(positions) {
  return positions
    .filter((pos) => {
      // A position is "open" if:
      // 1. Market is not closed (from Polymarket) OR
      // 2. Market is active OR
      // 3. No realized PnL (indicating position still active)
      const marketNotClosed =
        pos.marketInfo &&
        (pos.marketInfo.active === true || pos.marketInfo.closed === false);
      const noRealizedPnl = parseFloat(pos.realizedPnl || '0') === 0;

      return marketNotClosed || noRealizedPnl;
    })
    .map((pos) => ({
      id: pos.id,
      position: pos.marketInfo?.question || 'Unknown Market',
      age: calculatePositionAge(pos.marketInfo?.endDate),
      value: parseFloat(pos.totalBought),
      tokenId: pos.tokenId,
      shares: parseFloat(pos.totalBought).toFixed(2),
      unrealizedPnl: '0.00', // Not available from schema
    }));
}

// Get historical positions for internal use (not exported)
function getHistoricalPositionsFromData(positions) {
  return positions
    .filter((pos) => {
      // A position is "historical" if:
      // 1. Market is closed AND has realized PnL
      const marketClosed =
        pos.marketInfo &&
        (pos.marketInfo.closed === true || pos.marketInfo.active === false);
      const hasRealizedPnl = parseFloat(pos.realizedPnl || '0') !== 0;

      return marketClosed && hasRealizedPnl;
    })
    .map((pos) => {
      const invested = parseFloat(pos.totalBought);
      const pnl = parseFloat(pos.realizedPnl);
      const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0;

      return {
        id: pos.id,
        position: pos.marketInfo?.question || 'Unknown Market',
        age: calculatePositionAge(pos.marketInfo?.endDate),
        invested: invested,
        pnl: pnl,
        pnlPercentage: Math.round(pnlPercentage * 10) / 10,
        closedAt: formatDate(pos.marketInfo?.endDate),
      };
    });
}

// Calculate position age
function calculatePositionAge(endDate) {
  if (!endDate) return 'Unknown';

  const end = new Date(endDate);
  const now = new Date();
  const diffTime = Math.abs(now - end);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Validate Ethereum address
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Get user profile data - Updated to fetch all positions by default
export async function getUserProfile(address) {
  try {
    if (!isValidAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    // Fetch all positions (no limit) as per your code suggestion
    const positions = await fetchUserPositions(address, null);
    const stats = calculateUserStats(positions);

    // Debug: Log position analysis
    console.log(`Total positions fetched: ${positions.length}`);
    positions.forEach((pos, index) => {
      console.log(`Position ${index + 1}:`, {
        tokenId: pos.tokenId,
        totalBought: pos.totalBought,
        realizedPnl: pos.realizedPnl,
        avgPrice: pos.avgPrice,
        marketClosed: pos.marketInfo?.closed,
        marketActive: pos.marketInfo?.active,
        marketQuestion: pos.marketInfo?.question?.slice(0, 50) + '...',
      });
    });

    const openPositions = getOpenPositionsFromData(positions);
    const historicalPositions = getHistoricalPositionsFromData(positions);

    console.log(
      `Open positions: ${openPositions.length}, Historical positions: ${historicalPositions.length}`
    );

    return {
      address: address.toLowerCase(),
      positions,
      stats,
      openPositions,
      historicalPositions,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Format user data for display
export function formatUserData(userProfile, address) {
  if (!userProfile || !userProfile.stats) {
    return {
      id: address,
      address: address,
      ensName: null,
      totalVolume: 0,
      totalPnl: 0,
      winRate: 0,
      totalPositions: 0,
      avgPositionSize: 0,
      openPositions: 0,
      bestTrade: 0,
    };
  }

  const { stats, positions } = userProfile;

  // Calculate best trade (highest realized PnL)
  const bestTrade =
    positions && positions.length > 0
      ? Math.max(...positions.map((pos) => parseFloat(pos.realizedPnl)))
      : 0;

  return {
    id: address,
    address: address,
    ensName: null, // Could be enhanced with ENS lookup
    totalVolume: stats.totalVolume || 0,
    totalPnl: stats.totalProfit || 0,
    winRate: stats.winRate || 0,
    totalPositions: stats.totalPositions || 0,
    avgPositionSize: stats.avgInvested || 0,
    openPositions: stats.activePositions || 0,
    bestTrade: Math.round(bestTrade),
  };
}

// Get open positions with proper formatting
export async function getOpenPositions(address) {
  try {
    const userProfile = await getUserProfile(address);
    if (!userProfile || !userProfile.positions) {
      return [];
    }

    return userProfile.positions
      .filter((pos) => {
        // Enhanced logic to determine open positions
        const marketNotClosed =
          pos.marketInfo &&
          (pos.marketInfo.active === true || pos.marketInfo.closed === false);
        const noRealizedPnl = parseFloat(pos.realizedPnl || '0') === 0;

        return marketNotClosed || noRealizedPnl;
      })
      .map((pos) => ({
        marketId: pos.tokenId,
        marketTitle: pos.marketInfo?.question || 'Unknown Market',
        outcome: determineOutcome(pos, pos.marketInfo),
        shares: parseFloat(pos.totalBought).toFixed(2),
        value: parseFloat(pos.totalBought).toFixed(2),
        unrealizedPnl: '0.00', // Not available from schema
      }));
  } catch (error) {
    console.error('Error getting open positions:', error);
    return [];
  }
}

// Get historical positions with proper formatting
export async function getHistoricalPositions(address) {
  try {
    const userProfile = await getUserProfile(address);
    if (!userProfile || !userProfile.positions) {
      return [];
    }

    return userProfile.positions
      .filter((pos) => {
        // Enhanced logic to determine historical positions
        const marketClosed =
          pos.marketInfo &&
          (pos.marketInfo.closed === true || pos.marketInfo.active === false);
        const hasRealizedPnl = parseFloat(pos.realizedPnl || '0') !== 0;

        return marketClosed && hasRealizedPnl;
      })
      .map((pos) => {
        const invested = parseFloat(pos.totalBought);
        const pnl = parseFloat(pos.realizedPnl);
        const pnlPercentage = invested > 0 ? (pnl / invested) * 100 : 0;

        return {
          marketId: pos.tokenId,
          marketTitle: pos.marketInfo?.question || 'Unknown Market',
          outcome: determineOutcome(pos, pos.marketInfo),
          invested: invested.toFixed(2),
          pnl: pnl.toFixed(2),
          pnlPercentage: pnlPercentage.toFixed(1),
          closedAt: pos.marketInfo?.endDate
            ? new Date(pos.marketInfo.endDate).getTime() / 1000
            : null,
        };
      });
  } catch (error) {
    console.error('Error getting historical positions:', error);
    return [];
  }
}

// Determine the outcome (YES/NO) based on position and market data - Enhanced
function determineOutcome(position, marketInfo) {
  if (!marketInfo || !marketInfo.outcomes) {
    return 'N/A';
  }

  try {
    // Handle both string and array outcomes from the API
    const outcomes = Array.isArray(marketInfo.outcomes)
      ? marketInfo.outcomes
      : typeof marketInfo.outcomes === 'string'
      ? JSON.parse(marketInfo.outcomes)
      : [];

    if (outcomes.length === 0) {
      return 'N/A';
    }

    // For Polymarket, typically outcomes are ['NO', 'YES'] or similar
    // The tokenId often corresponds to the outcome index
    // This is a simplified mapping - could be enhanced with more market data analysis

    // Try to match tokenId with outcome index
    if (outcomes.length === 2) {
      // Binary market - common case
      const isYesToken =
        position.tokenId.toString().endsWith('1') ||
        position.tokenId.toString().includes('yes') ||
        outcomes[1]?.toLowerCase().includes('yes');
      return isYesToken ? 'YES' : 'NO';
    } else {
      // Multi-outcome market
      const tokenIndex = parseInt(position.tokenId) % outcomes.length;
      return outcomes[tokenIndex] || 'N/A';
    }
  } catch (error) {
    console.warn('Error determining outcome:', error);
    return 'N/A';
  }
}
