// Better approach for latest markets
export async function getLatestMarketsDirectly() {
  try {
    // Try different Polymarket API endpoints for recent markets
    const endpoints = [
      'https://gamma-api.polymarket.com/markets?active=true&limit=50&offset=0&order=desc&order_by=volume', // Active markets by volume
      'https://gamma-api.polymarket.com/markets?closed=false&limit=50&offset=0', // Open markets
      'https://gamma-api.polymarket.com/markets?limit=100&offset=0', // All recent markets
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        headers: { Authorization: 'Bearer b4b9fa0f76044607d30bda744ccb992d' },
      });

      if (response.ok) {
        const markets = await response.json();

        // Filter for truly recent markets (last 30 days)
        const recentMarkets = markets
          .filter((market) => {
            const createdDate = new Date(market.createdAt);
            const thirtyDaysAgo = new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            );
            return createdDate > thirtyDaysAgo;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (recentMarkets.length > 0) {
          return recentMarkets;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching latest markets:', error);
  }
  return [];
}
