'use client';

import { useState, useEffect } from 'react';
import { formatVolume } from '@/services/MarketData';
import {
  fetchUserPositions,
  calculateUserStats,
  getUserProfile,
} from '@/services/userStalkService';
import {
  fetchBestNewestMarkets,
  fetchNewestMarkets,
  fetchFreshestMarkets,
  fetchTrendingFromActivity,
  getTrendingMarketsForUI,
  calculateProbabilityFromPrices,
} from '@/services/NewestMarketsFixed';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconTrendingUp,
  IconClock,
  IconVolume,
  IconUsers,
  IconChartBar,
  IconTarget,
  IconFilter,
  IconExternalLink,
  IconLoader,
  IconAlertCircle,
} from '@tabler/icons-react';

export default function Home() {
  const [trendingFilter, setTrendingFilter] = useState('volume');
  const [newFilter, setNewFilter] = useState('duration');
  const [dashboardData, setDashboardData] = useState(null);
  const [popularMarkets, setPopularMarkets] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [trendingMarkets, setTrendingMarkets] = useState([]);
  const [newestMarkets, setNewestMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // User address for trending markets
  const USER_ADDRESS = '0x57ea53b3cf624d1030b2d5f62ca93f249adc95ba'; // Change as needed

  async function fetchTrendingMarkets() {
    try {
      console.log('Fetching newest markets using The Graph...');

      // Use the new service to get the newest markets directly
      let sortType = 'volume';

      switch (trendingFilter) {
        case 'volume':
          sortType = 'volume';
          break;
        case 'activity':
          sortType = 'activity';
          break;
        case 'change':
          sortType = 'fresh';
          break;
        default:
          sortType = 'volume';
      }

      const formattedMarkets = await getTrendingMarketsForUI(6, sortType);
      console.log('Newest markets data:', formattedMarkets);

      setTrendingMarkets(formattedMarkets);
    } catch (error) {
      console.error('Error fetching newest markets:', error);
      // Fallback to mock data if real data fails
      const mockTrending = [
        {
          id: 1,
          title: 'Loading newest markets...',
          outcome: 'Pending',
          probability: 50,
          volume: '$0',
          users: 0,
          change: '+',
          pnl: '0.0',
        },
      ];
      setTrendingMarkets(mockTrending);
    }
  }

  // Helper function moved to NewestMarkets service
  // function calculateProbabilityFromPrices - now imported
  // Load real market data on component mount
  useEffect(() => {
    loadMarketData();
    fetchTrendingMarkets();
  }, []);

  // Update trending markets when filter changes
  useEffect(() => {
    fetchTrendingMarkets();
  }, [trendingFilter]);

  const loadMarketData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the consolidated NewestMarkets service with individual fetching
      const markets = await fetchBestNewestMarkets(20);

      // Create simple dashboard data from newest markets
      const dashboardData = {
        totalMarkets: markets.length,
        totalVolume: markets.reduce(
          (sum, m) => sum + parseFloat(m.volume || 0),
          0
        ),
        activeTrades: markets.filter((m) => parseFloat(m.volume || 0) > 1000)
          .length,
        averageVolume:
          markets.length > 0
            ? markets.reduce((sum, m) => sum + parseFloat(m.volume || 0), 0) /
              markets.length
            : 0,
      };

      // Use markets as both popular markets and recent trades
      setDashboardData(dashboardData);
      setPopularMarkets(markets.slice(0, 10));
      setRecentTrades(
        markets.map((market) => ({
          id: market.tokenId,
          question: market.question,
          volume: market.volume,
          timestamp: new Date().toISOString(),
          maker: `0x${Math.random().toString(16).substr(2, 40)}`, // Generate mock address
          taker: `0x${Math.random().toString(16).substr(2, 40)}`, // Generate mock address
          marketData: market,
        }))
      );
    } catch (err) {
      console.error('Error loading market data:', err);
      setError('Failed to load market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load trending markets based on user trading data
  const fetchTrendingMarketsData = async () => {
    try {
      // Fetch user positions to analyze trending markets
      const userPositions = await fetchUserPositions();

      // Group positions by market to find trending ones
      const marketActivity = {};

      userPositions.forEach((position) => {
        const marketId = position.market;
        if (!marketActivity[marketId]) {
          marketActivity[marketId] = {
            marketId,
            totalVolume: 0,
            activeUsers: new Set(),
            totalPnL: 0,
            positions: [],
          };
        }

        marketActivity[marketId].totalVolume += parseFloat(
          position.outcomeTokensAmount || 0
        );
        marketActivity[marketId].activeUsers.add(position.user);
        marketActivity[marketId].totalPnL += parseFloat(position.netCost || 0);
        marketActivity[marketId].positions.push(position);
      });

      // Convert to array and sort by activity metrics
      const trendingData = Object.values(marketActivity)
        .map((market) => ({
          ...market,
          activeUsers: market.activeUsers.size,
          avgPnL: market.totalPnL / market.positions.length,
          activityScore: market.totalVolume * market.activeUsers.size,
        }))
        .sort((a, b) => {
          switch (trendingFilter) {
            case 'volume':
              return b.totalVolume - a.totalVolume;
            case 'users':
              return b.activeUsers - a.activeUsers;
            case 'pnl':
              return b.avgPnL - a.avgPnL;
            default:
              return b.activityScore - a.activityScore;
          }
        })
        .slice(0, 6); // Top 6 trending markets

      // Format for display
      const formattedTrending = trendingData.map((market) => ({
        id: market.marketId,
        title: `Market ${market.marketId.slice(0, 8)}...`,
        outcome: market.avgPnL > 0 ? 'Yes' : 'No',
        probability: Math.min(95, Math.max(5, 50 + market.avgPnL * 10)),
        volume: `$${(market.totalVolume / 1000).toFixed(1)}K`,
        users: market.activeUsers,
        change: market.avgPnL > 0 ? '+' : '',
        pnl: market.avgPnL.toFixed(2),
      }));

      setTrendingMarkets(formattedTrending);
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      // Fallback to mock data if real data fails
      const mockTrending = [
        {
          id: 1,
          title: 'Will Bitcoin reach $100k by 2024?',
          outcome: 'Yes',
          probability: 76,
          volume: '$2.3M',
          users: 1247,
          change: '+',
          pnl: '12.5',
        },
        {
          id: 2,
          title: 'US Elections 2024 Winner',
          outcome: 'Democratic',
          probability: 52,
          volume: '$8.7M',
          users: 3521,
          change: '-',
          pnl: '3.2',
        },
        {
          id: 3,
          title: 'AI Breakthrough in 2024',
          outcome: 'Yes',
          probability: 84,
          volume: '$1.8M',
          users: 892,
          change: '+',
          pnl: '18.9',
        },
        {
          id: 4,
          title: 'Tesla Stock Price Target',
          outcome: 'Above $300',
          probability: 67,
          volume: '$4.2M',
          users: 2156,
          change: '+',
          pnl: '7.8',
        },
        {
          id: 5,
          title: 'Climate Policy Changes',
          outcome: 'Major Reform',
          probability: 41,
          volume: '$3.1M',
          users: 1834,
          change: '-',
          pnl: '2.1',
        },
        {
          id: 6,
          title: 'Space Mission Success',
          outcome: 'Success',
          probability: 89,
          volume: '$0.9M',
          users: 456,
          change: '+',
          pnl: '15.3',
        },
      ];
      setTrendingMarkets(mockTrending);
    }
  };

  // Filter and sort popular markets based on selection
  const getFilteredMarkets = () => {
    if (!popularMarkets.length) return [];

    const filtered = [...popularMarkets];

    switch (trendingFilter) {
      case 'volume':
        return filtered.sort(
          (a, b) =>
            parseFloat(b.marketData?.volume || 0) -
            parseFloat(a.marketData?.volume || 0)
        );
      case 'activity':
        return filtered.sort((a, b) => b.activity.count - a.activity.count);
      case 'change':
        return filtered.sort((a, b) => Math.random() - 0.5); // Random for demo
      default:
        return filtered;
    }
  };

  // Get trending markets data from state
  const getTrendingMarkets = () => trendingMarkets;

  const newMarkets = [
    {
      title: 'AI will pass Turing Test in 2024',
      created: '2 hours ago',
      volume: '45K',
      probability: '34%',
    },
    {
      title: 'SpaceX Mars Mission Success',
      created: '5 hours ago',
      volume: '78K',
      probability: '28%',
    },
    {
      title: 'Ethereum 2.0 Full Launch',
      created: '1 day ago',
      volume: '156K',
      probability: '89%',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:to-gray-800 pt-16">
      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-2">
        {/* Big NoorooFi Logo */}
        <div className="text-center mb-8">
          <img
            src="/NoorooFi.png"
            alt="NoorooFi"
            className="h-48 w-auto mx-auto"
          />
        </div>

        <Card className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              {/* Left Squirrel */}
              <div className="flex-shrink-0">
                <img
                  src="/squirrel.png"
                  alt="Squirrel"
                  className="h-48 w-48 opacity-95"
                />
              </div>

              {/* Center Content */}
              <div className="text-center space-y-4 flex-1 px-8">
                <h1 className="text-4xl font-bold">Welcome to NoorooFi</h1>
                <p className="text-xl opacity-90">
                  Prediction Market Aggregator, Analytics Dashboard & Scanner
                  with AI
                </p>
                <p className="text-lg opacity-80 flex items-center justify-center">
                  Powered by{' '}
                  <img
                    src="/thegraph.png"
                    alt="The Graph"
                    className="h-5 w-5 mx-2"
                  />
                  <span className="font-semibold">
                    The Graph protocol for decentralized data indexing
                  </span>
                </p>
                <div className="flex justify-center space-x-4 mt-6">
                  <Badge variant="secondary" className="text-orange-600">
                    Real-time Analytics
                  </Badge>
                  <Badge variant="secondary" className="text-orange-600">
                    Alpha Copy Trading
                  </Badge>
                  <Badge variant="secondary" className="text-orange-600">
                    Nuru Massages
                  </Badge>
                </div>
              </div>

              {/* Right Squirrel */}
              <div className="flex-shrink-0">
                <img
                  src="/squirrel.png"
                  alt="Squirrel"
                  className="h-48 w-48 opacity-95"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4-Box Layout: Left Bigger, Right Wider */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Top Left - Trending Markets (Bigger) */}
          <div className="lg:col-span-3">
            <Card className="h-[350px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconTrendingUp className="h-5 w-5 text-orange-500" />
                    <CardTitle>Trending Markets</CardTitle>
                  </div>
                  <Select
                    value={trendingFilter}
                    onValueChange={setTrendingFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volume">
                        Best Newest Markets
                      </SelectItem>
                      <SelectItem value="activity">Recent Activity</SelectItem>
                      <SelectItem value="change">Freshest Markets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <IconLoader className="h-8 w-8 animate-spin text-orange-500" />
                    <span className="ml-2 text-neutral-600">
                      Loading markets...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full flex-col space-y-2">
                    <IconAlertCircle className="h-8 w-8 text-red-500" />
                    <span className="text-red-600 text-center">{error}</span>
                    <Button
                      onClick={loadMarketData}
                      size="sm"
                      variant="outline"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Always show newest markets from our new service */}
                    {getTrendingMarkets().map((market, index) => (
                      <div
                        key={market.id || market.tokenId || index}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {market.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <IconUsers className="h-4 w-4 mr-1" />
                              {market.users} activity
                            </span>
                            <span className="flex items-center">
                              <IconVolume className="h-4 w-4 mr-1" />
                              <img
                                src="/usdc.png"
                                alt="USDC"
                                className="w-3 h-3 mr-1"
                              />
                              {market.volume}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {market.category}
                            </Badge>
                            {market.source && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-50 text-orange-600"
                              >
                                {market.source}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-500">
                            {market.probability}%
                          </div>
                          <div className="text-sm text-green-500">
                            New Market
                          </div>
                        </div>
                      </div>
                    ))}

                    {getTrendingMarkets().length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <IconLoader className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading newest markets...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Right - Recent Trades (Wider) */}
          <div className="lg:col-span-2">
            <Card className="h-[350px]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <IconChartBar className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">Recent Trades</CardTitle>
                  <Badge variant="outline" className="ml-auto">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <IconLoader className="h-6 w-6 animate-spin text-orange-500" />
                    <span className="ml-2 text-sm text-neutral-600">
                      Loading trades...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrades.slice(0, 8).map((trade, index) => (
                      <div
                        key={trade.orderHash || index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {trade.formattedTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3"
                            />
                            <span className="font-medium">
                              {formatVolume(trade.volume)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {trade.maker
                              ? `${trade.maker.slice(
                                  0,
                                  6
                                )}...${trade.maker.slice(-4)}`
                              : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Left - Market Analytics (Bigger) */}
          <div className="lg:col-span-3">
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconChartBar className="h-5 w-5" />
                  <span>Market Analytics - Powered by</span>
                  <img
                    src="/thegraph.png"
                    alt="The Graph"
                    className="h-5 w-5"
                  />
                  <span>The Graph</span>
                </CardTitle>
                <CardDescription>
                  Real-time market data visualization and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-100px)]">
                <div className="h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-lg flex flex-col items-center justify-center space-y-4">
                  <div className="text-center space-y-4">
                    <IconChartBar className="h-16 w-16 mx-auto text-orange-500" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        Interactive Chart Component
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Market volume, price movements, and prediction accuracy
                        over time
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-5 h-5 mr-1"
                          />
                          45.2M
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Volume
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          87.3%
                        </div>
                        <div className="text-xs text-gray-500">
                          Accuracy Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          24h
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg Resolution
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Right - Statistics Cards (Wider) */}
          <div className="lg:col-span-2">
            <div className="h-[400px] flex flex-col justify-end">
              <div className="space-y-3">
                {/* Total Traders */}
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 h-[125px]">
                  <CardContent className="p-4 h-full flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          Total Traders
                        </p>
                        <p className="text-2xl font-bold">1,250,000</p>
                        <p className="text-purple-200 text-xs mt-1">
                          +12.5% this month
                        </p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <IconUsers className="h-7 w-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Markets */}
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 h-[125px]">
                  <CardContent className="p-4 h-full flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Active Markets
                        </p>
                        <p className="text-2xl font-bold">200,000</p>
                        <p className="text-green-200 text-xs mt-1">
                          +8.3% this week
                        </p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <IconTarget className="h-7 w-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Positions */}
                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 h-[125px]">
                  <CardContent className="p-4 h-full flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          Live Positions
                        </p>
                        <p className="text-2xl font-bold">2,000,000</p>
                        <p className="text-orange-200 text-xs mt-1">
                          +15.7% today
                        </p>
                      </div>
                      <div className="bg-white/20 p-3 rounded-full">
                        <IconChartBar className="h-7 w-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
