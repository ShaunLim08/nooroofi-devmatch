'use client';

import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
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
  IconUser,
  IconSettings,
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconTarget,
  IconCoin,
  IconCalendar,
  IconMail,
  IconPhone,
  IconMapPin,
  IconEdit,
  IconBell,
  IconShield,
  IconWallet,
  IconHistory,
  IconAward,
  IconStar,
  IconClipboardList,
  IconTag,
  IconScale,
  IconBrain,
  IconTrendingUp3,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState('overview');
  const [tokenBalances, setTokenBalances] = useState([]);
  const [historicalTokenData, setHistoricalTokenData] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});
  const [tokenImages, setTokenImages] = useState({});
  const [coingeckoTokens, setCoingeckoTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [loadingCoingecko, setLoadingCoingecko] = useState(false);
  const [surveyData, setSurveyData] = useState({
    preferredTags: [],
    riskProfile: '',
    usageIntent: '',
  });

  // Get connected wallet address
  const connectedWallet = wallets.find(
    (wallet) => wallet.connectorType === 'injected'
  );
  const walletAddress = connectedWallet?.address;

  // Fetch Coingecko token list for verification
  const fetchCoingeckoTokens = async () => {
    setLoadingCoingecko(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
        },
      };

      const response = await fetch(
        'https://pro-api.coingecko.com/api/v3/coins/list',
        options
      );

      if (response.ok) {
        const data = await response.json();
        setCoingeckoTokens(data);
      } else {
        console.error('Error fetching Coingecko tokens:', response.status);
        // Fallback: use free API if pro API fails
        const fallbackResponse = await fetch(
          'https://api.coingecko.com/api/v3/coins/list'
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setCoingeckoTokens(fallbackData);
        }
      }
    } catch (error) {
      console.error('Error fetching Coingecko tokens:', error);
      // Try fallback free API
      try {
        const fallbackResponse = await fetch(
          'https://api.coingecko.com/api/v3/coins/list'
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setCoingeckoTokens(fallbackData);
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        setCoingeckoTokens([]);
      }
    } finally {
      setLoadingCoingecko(false);
    }
  };

  // Check if a token is verified by Coingecko
  const isTokenVerified = (contractAddress, symbol) => {
    if (!coingeckoTokens || coingeckoTokens.length === 0) return true; // If no data, show all tokens

    // Handle native MATIC token
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000' || symbol?.toLowerCase() === 'matic') {
      return true; // MATIC is always verified
    }

    return coingeckoTokens.some((token) => {
      // Check if the contract address matches any platform
      if (token.platforms) {
        const polygonAddress = token.platforms['polygon-pos'];
        if (
          polygonAddress &&
          polygonAddress.toLowerCase() === contractAddress.toLowerCase()
        ) {
          return true;
        }
      }

      // Also check by symbol as a fallback
      return (
        token.symbol && token.symbol.toLowerCase() === symbol.toLowerCase()
      );
    });
  };

  // Fetch token details including image from CoinGecko
  const fetchTokenDetails = async (contractAddress, symbol) => {
    try {
      let tokenId = null;

      // Handle native MATIC token (no contract address)
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000' || symbol?.toLowerCase() === 'matic') {
        tokenId = 'matic-network';
      } else {
        // First try to find the token ID from our tokens list
        const token = coingeckoTokens.find((token) => {
          // Check by contract address first (most reliable)
          if (token.platforms && token.platforms['polygon-pos']) {
            return token.platforms['polygon-pos'].toLowerCase() === contractAddress.toLowerCase();
          }
          // Fallback to symbol matching
          return token.symbol && token.symbol.toLowerCase() === symbol.toLowerCase();
        });

        if (token && token.id) {
          tokenId = token.id;
        } else {
          // Try common token mappings for Polygon
          const commonTokens = {
            'usdc': 'usd-coin',
            'usdt': 'tether',
            'weth': 'weth',
            'wbtc': 'wrapped-bitcoin',
            'dai': 'dai',
            'link': 'chainlink',
            'uni': 'uniswap',
            'aave': 'aave',
            'sushi': 'sushi',
            'crv': 'curve-dao-token',
            'bal': 'balancer',
            'comp': 'compound-governance-token'
          };
          
          tokenId = commonTokens[symbol?.toLowerCase()];
        }
      }

      if (!tokenId) {
        return null;
      }

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-cg-pro-api-key': process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
        },
      };

      let response = await fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${tokenId}`,
        options
      );

      // If pro API fails, try free API
      if (!response.ok) {
        response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${tokenId}`,
          { method: 'GET', headers: { accept: 'application/json' } }
        );
      }

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          image: data.image,
          market_cap_rank: data.market_cap_rank,
          description: data.description?.en,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching token details:', error);
      return null;
    }
  };

  // Fetch images for verified tokens
  const fetchTokenImages = async (tokens) => {
    const imageMap = {};
    
    for (const token of tokens) {
      const details = await fetchTokenDetails(token.contract, token.symbol);
      if (details && details.image) {
        imageMap[token.contract || 'native'] = details.image;
      }
    }
    
    setTokenImages(imageMap);
  };

  // Fetch token balances from The Graph Token API (Polygon/Matic)
  const fetchTokenBalances = async (address) => {
    if (!address) return;

    setLoadingTokens(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GRAPH_TOKEN_API_KEY}`,
        },
      };

      const response = await fetch(
        `https://token-api.thegraph.com/balances/evm/${address}?network_id=matic&limit=10&page=1`,
        options
      );

      if (response.ok) {
        const data = await response.json();
        const tokens = data.data || [];

        // Filter tokens based on Coingecko verification
        const verifiedTokens = tokens.filter((token) =>
          isTokenVerified(token.contract, token.symbol)
        );

        setTokenBalances(verifiedTokens);

        // Fetch metadata for verified tokens only
        if (verifiedTokens.length > 0) {
          fetchAllTokenMetadata(verifiedTokens);
        }
      } else {
        console.error('Error fetching token balances:', response.status);
        setTokenBalances([]);
      }
    } catch (error) {
      console.error('Error fetching token balances:', error);
      setTokenBalances([]);
    } finally {
      setLoadingTokens(false);
    }
  };

  // Fetch historical token data from The Graph Token API (Polygon/Matic)
  const fetchHistoricalTokenData = async (address) => {
    if (!address) return;

    setLoadingHistorical(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GRAPH_TOKEN_API_KEY}`,
        },
      };

      const response = await fetch(
        `https://token-api.thegraph.com/historical/balances/evm/${address}?network_id=matic&startTime=0&endTime=9999999999&limit=10&page=1`,
        options
      );

      if (response.ok) {
        const data = await response.json();
        const historicalTokens = data.data || [];

        // Filter historical tokens based on Coingecko verification
        const verifiedHistoricalTokens = historicalTokens.filter((token) =>
          isTokenVerified(token.contract, token.symbol)
        );

        setHistoricalTokenData(verifiedHistoricalTokens);

        // Fetch images for verified historical tokens only
        if (verifiedHistoricalTokens.length > 0) {
          await fetchTokenImages(verifiedHistoricalTokens);
        }
      } else {
        console.error('Error fetching historical token data:', response.status);
        setHistoricalTokenData([]);
      }
    } catch (error) {
      console.error('Error fetching historical token data:', error);
      setHistoricalTokenData([]);
    } finally {
      setLoadingHistorical(false);
    }
  };

  // Fetch token metadata from The Graph Token API
  const fetchTokenMetadata = async (contract, networkId = 'matic') => {
    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GRAPH_TOKEN_API_KEY}`,
        },
      };

      const response = await fetch(
        `https://token-api.thegraph.com/tokens/evm/${contract}?network_id=${networkId}`,
        options
      );

      if (response.ok) {
        const data = await response.json();
        return data.data?.[0] || null;
      } else {
        console.error('Error fetching token metadata:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  };

  // Fetch metadata for all tokens in balance
  const fetchAllTokenMetadata = async (tokens) => {
    if (!tokens || tokens.length === 0) return;

    setLoadingMetadata(true);
    const metadataMap = {};

    try {
      // Fetch metadata for each unique contract
      const uniqueContracts = [
        ...new Set(tokens.map((token) => token.contract)),
      ];

      const metadataPromises = uniqueContracts.map(async (contract) => {
        const metadata = await fetchTokenMetadata(contract, 'matic');
        if (metadata) {
          metadataMap[contract] = metadata;
        }
      });

      await Promise.all(metadataPromises);
      setTokenMetadata(metadataMap);

      // Fetch token images from CoinGecko
      await fetchTokenImages(tokens);
    } catch (error) {
      console.error('Error fetching all token metadata:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  // Fetch token balances and historical data when wallet address changes
  useEffect(() => {
    // First fetch Coingecko tokens for verification
    fetchCoingeckoTokens();
  }, []);

  useEffect(() => {
    if (walletAddress && coingeckoTokens.length > 0) {
      fetchTokenBalances(walletAddress);
      fetchHistoricalTokenData(walletAddress);
    }
  }, [walletAddress, coingeckoTokens]);

  // Available tags for selection
  const availableTags = [
    'Crypto',
    'Politics',
    'Sports',
    'Technology',
    'Finance',
    'Economics',
    'AI/ML',
    'Climate',
    'Gaming',
    'Entertainment',
    'Health',
    'Science',
    'Real Estate',
    'Stocks',
    'Commodities',
    'Elections',
    'World Events',
  ];

  const riskProfiles = [
    {
      value: 'conservative',
      label: 'Conservative',
      description: 'Low risk, steady returns',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Balanced risk and reward',
    },
    {
      value: 'aggressive',
      label: 'Aggressive',
      description: 'High risk, high potential returns',
    },
  ];

  const usageIntents = [
    {
      value: 'ai-gambling',
      label: 'AI Assisted Gambling',
      description: 'Use AI insights for prediction market betting',
      icon: IconBrain,
    },
    {
      value: 'investment',
      label: 'Investment',
      description: 'Long-term strategic market analysis and investment',
      icon: IconTrendingUp3,
    },
  ];

  const handleTagToggle = (tag) => {
    setSurveyData((prev) => ({
      ...prev,
      preferredTags: prev.preferredTags.includes(tag)
        ? prev.preferredTags.filter((t) => t !== tag)
        : [...prev.preferredTags, tag],
    }));
  };

  const handleRiskProfileChange = (profile) => {
    setSurveyData((prev) => ({ ...prev, riskProfile: profile }));
  };

  const handleUsageIntentChange = (intent) => {
    setSurveyData((prev) => ({ ...prev, usageIntent: intent }));
  };

  // Mock user data
  const userData = {
    name: 'Nuru Tan',
    username: '@nurudan',
    email: 'nuru.tan@email.com',
    phone: '+65 8123 4567',
    location: 'Singapore',
    joinDate: 'March 2023',
    avatar: '/api/placeholder/100/100',
    tier: 'Premium',
    accuracy: 87.3,
    totalVolume: 245000,
    activePositions: 12,
    totalTrades: 156,
  };

  const recentTrades = [
    {
      id: 1,
      market: 'Bitcoin to reach $100k by 2024',
      position: 'YES',
      amount: '1,200',
      probability: '68%',
      pnl: '+340',
      status: 'active',
      date: '2 days ago',
    },
    {
      id: 2,
      market: 'Tesla Stock Price Above $300',
      position: 'NO',
      amount: '800',
      probability: '72%',
      pnl: '-120',
      status: 'active',
      date: '1 week ago',
    },
    {
      id: 3,
      market: 'AI will pass Turing Test in 2024',
      position: 'YES',
      amount: '500',
      probability: '34%',
      pnl: '+85',
      status: 'closed',
      date: '2 weeks ago',
    },
    {
      id: 4,
      market: 'US Election 2024 Winner',
      position: 'YES',
      amount: '2,000',
      probability: '45%',
      pnl: '+420',
      status: 'active',
      date: '3 weeks ago',
    },
  ];

  const achievements = [
    {
      title: 'Early Adopter',
      description: 'Joined in the first quarter',
      icon: IconAward,
      color: 'text-blue-500',
    },
    {
      title: 'Accuracy Expert',
      description: 'Maintained 85%+ accuracy',
      icon: IconTarget,
      color: 'text-green-500',
    },
    {
      title: 'Volume Trader',
      description: 'Traded over $200K volume',
      icon: IconChartBar,
      color: 'text-purple-500',
    },
    {
      title: 'Market Leader',
      description: 'Top 100 on leaderboard',
      icon: IconStar,
      color: 'text-yellow-500',
    },
  ];

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-blue-500 text-white'
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-white dark:from-neutral-900 dark:to-neutral-800 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Profile
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 flex items-center">
            Manage your account and view your trading performance •{' '}
            <img src="/thegraph.png" alt="The Graph" className="h-4 w-4 mx-2" />
            Analytics by The Graph
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconUser className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {userData.name}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                  {userData.username}
                </p>
                <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-white">
                  {userData.tier} Member
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Accuracy Rate
                  </span>
                  <span className="font-semibold text-green-500">
                    {userData.accuracy}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total Volume
                  </span>
                  <span className="font-semibold flex items-center">
                    <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
                    {userData.totalVolume.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Active Positions
                  </span>
                  <span className="font-semibold text-orange-500">
                    {userData.activePositions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total Trades
                  </span>
                  <span className="font-semibold">{userData.totalTrades}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-6">
              <TabButton
                id="overview"
                label="Overview"
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <TabButton
                id="trades"
                label="Trading History"
                isActive={activeTab === 'trades'}
                onClick={setActiveTab}
              />
              <TabButton
                id="preferences"
                label="Preferences"
                isActive={activeTab === 'preferences'}
                onClick={setActiveTab}
              />
              <TabButton
                id="settings"
                label="Account Settings"
                isActive={activeTab === 'settings'}
                onClick={setActiveTab}
              />
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-xs font-medium">
                            Total P&L
                          </p>
                          <p className="text-2xl font-bold flex items-center">
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-5 h-5 mr-1"
                            />
                            4,520
                          </p>
                          <p className="text-green-200 text-xs">
                            +18.5% this month
                          </p>
                        </div>
                        <IconTrendingUp className="h-8 w-8 text-green-100" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs font-medium">
                            Win Rate
                          </p>
                          <p className="text-2xl font-bold">73.2%</p>
                          <p className="text-blue-200 text-xs">Above average</p>
                        </div>
                        <IconTarget className="h-8 w-8 text-blue-100" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs font-medium">
                            Avg Trade
                          </p>
                          <p className="text-2xl font-bold flex items-center">
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-5 h-5 mr-1"
                            />
                            1,245
                          </p>
                          <p className="text-purple-200 text-xs">
                            Risk managed
                          </p>
                        </div>
                        <IconCoin className="h-8 w-8 text-purple-100" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-medium">
                            Streak
                          </p>
                          <p className="text-2xl font-bold">7 wins</p>
                          <p className="text-orange-200 text-xs">
                            Current streak
                          </p>
                        </div>
                        <IconChartBar className="h-8 w-8 text-orange-100" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      Your milestones and accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                        >
                          <achievement.icon
                            className={cn('h-8 w-8', achievement.color)}
                          />
                          <div>
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                              {achievement.title}
                            </h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Token Balances */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconWallet className="h-5 w-5 text-purple-500" />
                      <span>Polygon Token Balances</span>
                      <img
                        src="/thegraph.png"
                        alt="The Graph"
                        className="h-4 w-4"
                      />
                    </CardTitle>
                    <CardDescription>
                      Your current token holdings on Polygon network • Powered
                      by The Graph Token API • Images & Verification by CoinGecko
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!walletAddress ? (
                      <div className="text-center py-8">
                        <IconWallet className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Connect your wallet to view token balances
                        </p>
                      </div>
                    ) : loadingTokens || loadingMetadata || loadingCoingecko ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {loadingCoingecko
                            ? 'Verifying tokens with CoinGecko...'
                            : loadingTokens
                            ? 'Loading Polygon token balances...'
                            : 'Loading token metadata...'}
                        </p>
                      </div>
                    ) : tokenBalances.length === 0 ? (
                      <div className="text-center py-8">
                        <IconCoin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          No verified token balances found on Polygon network
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                          Only showing tokens verified by CoinGecko to prevent
                          scam tokens
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">
                          Address: {walletAddress?.slice(0, 6)}...
                          {walletAddress?.slice(-4)}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tokenBalances.map((token, index) => {
                          const metadata = tokenMetadata[token.contract];
                          const tokenImage = tokenImages[token.contract || 'native'];
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                                  {tokenImage?.large ? (
                                    <img
                                      src={tokenImage.large}
                                      alt={token.symbol}
                                      className="w-12 h-12 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <span 
                                    className="text-white font-bold text-sm flex items-center justify-center w-full h-full"
                                    style={{
                                      display: tokenImage?.large ? 'none' : 'flex'
                                    }}
                                  >
                                    {token.symbol?.slice(0, 2) || '??'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
                                    <span>
                                      {metadata?.name ||
                                        token.name ||
                                        'Unknown Token'}
                                    </span>
                                    <div
                                      className="w-2 h-2 bg-green-500 rounded-full"
                                      title="Verified by CoinGecko"
                                    ></div>
                                  </h4>
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {metadata?.symbol || token.symbol} • Polygon
                                    • Verified
                                  </p>
                                  {metadata && (
                                    <div className="flex items-center space-x-3 text-xs text-neutral-400 mt-1">
                                      <span>
                                        Holders:{' '}
                                        {metadata.holders?.toLocaleString() ||
                                          'N/A'}
                                      </span>
                                      <span>•</span>
                                      <span>
                                        Supply:{' '}
                                        {metadata.total_supply
                                          ? (
                                              metadata.total_supply / 1e18
                                            ).toFixed(0)
                                          : 'N/A'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                  {parseFloat(token.value).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    }
                                  )}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                  {metadata?.symbol || token.symbol}
                                </div>
                                {metadata?.circulating_supply && (
                                  <div className="text-xs text-neutral-400">
                                    {(
                                      (parseFloat(token.value) /
                                        metadata.circulating_supply) *
                                      100
                                    ).toFixed(6)}
                                    % of supply
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              Connected Wallet:
                            </span>
                            <span className="text-sm font-mono text-neutral-900 dark:text-neutral-100">
                              {walletAddress?.slice(0, 6)}...
                              {walletAddress?.slice(-4)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              fetchCoingeckoTokens().then(() => {
                                fetchTokenBalances(walletAddress);
                                fetchHistoricalTokenData(walletAddress);
                              });
                            }}
                            className="mt-2 text-sm text-purple-500 hover:text-purple-600 transition-colors"
                            disabled={
                              loadingTokens ||
                              loadingMetadata ||
                              loadingHistorical ||
                              loadingCoingecko
                            }
                          >
                            {loadingTokens ||
                            loadingMetadata ||
                            loadingHistorical ||
                            loadingCoingecko
                              ? 'Refreshing...'
                              : 'Refresh Data'}
                          </button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Historical Token Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconHistory className="h-5 w-5 text-blue-500" />
                      <span>Historical Token Data</span>
                      <img
                        src="/thegraph.png"
                        alt="The Graph"
                        className="h-4 w-4"
                      />
                    </CardTitle>
                    <CardDescription>
                      Historical token balance changes on Polygon network •
                      Powered by The Graph Token API • Images & Verification by CoinGecko
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!walletAddress ? (
                      <div className="text-center py-8">
                        <IconHistory className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Connect your wallet to view historical data
                        </p>
                      </div>
                    ) : loadingHistorical ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Loading historical token data...
                        </p>
                      </div>
                    ) : historicalTokenData.length === 0 ? (
                      <div className="text-center py-8">
                        <IconHistory className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                          No verified historical token data found
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                          Only showing tokens verified by CoinGecko to prevent
                          scam tokens
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">
                          Address: {walletAddress?.slice(0, 6)}...
                          {walletAddress?.slice(-4)}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {historicalTokenData.map((token, index) => {
                          const metadata = tokenMetadata[token.contract];
                          const tokenImage = tokenImages[token.contract || 'native'];
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                                  {tokenImage?.large ? (
                                    <img
                                      src={tokenImage.large}
                                      alt={token.symbol}
                                      className="w-12 h-12 rounded-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <span 
                                    className="text-white font-bold text-sm flex items-center justify-center w-full h-full"
                                    style={{
                                      display: tokenImage?.large ? 'none' : 'flex'
                                    }}
                                  >
                                    {token.symbol?.slice(0, 2) || '??'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
                                    <span>
                                      {metadata?.name ||
                                        token.name ||
                                        'Unknown Token'}
                                    </span>
                                    <div
                                      className="w-2 h-2 bg-green-500 rounded-full"
                                      title="Verified by CoinGecko"
                                    ></div>
                                  </h4>
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {metadata?.symbol || token.symbol} •{' '}
                                    {new Date(
                                      token.datetime
                                    ).toLocaleDateString()}{' '}
                                    • Verified
                                  </p>
                                  {metadata && (
                                    <div className="text-xs text-neutral-400 mt-1">
                                      Decimals: {metadata.decimals} • Holders:{' '}
                                      {metadata.holders?.toLocaleString() ||
                                        'N/A'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-neutral-500">
                                      Open:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {token.open}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-neutral-500">
                                      Close:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {token.close}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-green-500">
                                      High:
                                    </span>
                                    <span className="ml-1 font-medium">
                                      {token.high}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-red-500">Low:</span>
                                    <span className="ml-1 font-medium">
                                      {token.low}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'trades' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <img
                      src="/thegraph.png"
                      alt="The Graph"
                      className="h-5 w-5"
                    />
                    <span>Trading History</span>
                  </CardTitle>
                  <CardDescription>
                    Your recent prediction market trades • Powered by The Graph
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                            {trade.market}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                            <span
                              className={cn(
                                'px-2 py-1 rounded text-xs font-medium',
                                trade.position === 'YES'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              )}
                            >
                              {trade.position}
                            </span>
                            <span className="flex items-center">
                              <img
                                src="/usdc.png"
                                alt="USDC"
                                className="w-3 h-3 mr-1"
                              />
                              {trade.amount}
                            </span>
                            <span>{trade.probability}</span>
                            <span>{trade.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={cn(
                              'text-lg font-semibold flex items-center',
                              trade.pnl.startsWith('+')
                                ? 'text-green-500'
                                : 'text-red-500'
                            )}
                          >
                            {trade.pnl.startsWith('+') ? '+' : '-'}
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-4 h-4 mx-1"
                            />
                            {trade.pnl.substring(1)}
                          </div>
                          <Badge
                            variant={
                              trade.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {trade.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Preferences Survey */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconClipboardList className="h-5 w-5" />
                      <span>User Preferences Survey</span>
                    </CardTitle>
                    <CardDescription>
                      Help us personalize your NooRooFi experience by telling us
                      about your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Preferred Tags Section */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <IconTag className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          Preferred Tags
                        </h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Select the market categories you're most interested in:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={cn(
                              'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                              surveyData.preferredTags.includes(tag)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600'
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                        Selected: {surveyData.preferredTags.length} tags
                      </p>
                    </div>

                    {/* Risk Profile Section */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <IconScale className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          Risk Profile
                        </h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        How would you describe your risk tolerance when trading
                        on prediction markets?
                      </p>
                      <div className="space-y-3">
                        {riskProfiles.map((profile) => (
                          <button
                            key={profile.value}
                            onClick={() =>
                              handleRiskProfileChange(profile.value)
                            }
                            className={cn(
                              'w-full p-4 rounded-lg border text-left transition-all duration-200',
                              surveyData.riskProfile === profile.value
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-green-300 dark:hover:border-green-600'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {profile.label}
                                </h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {profile.description}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  'w-4 h-4 rounded-full border-2 transition-all',
                                  surveyData.riskProfile === profile.value
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-neutral-300 dark:border-neutral-600'
                                )}
                              >
                                {surveyData.riskProfile === profile.value && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Usage Intent Section */}
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <IconBrain className="h-5 w-5 text-purple-500" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                          How do you envision yourself using NooRooFi?
                        </h3>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Select your primary use case to help us tailor the
                        experience:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {usageIntents.map((intent) => (
                          <button
                            key={intent.value}
                            onClick={() =>
                              handleUsageIntentChange(intent.value)
                            }
                            className={cn(
                              'p-6 rounded-lg border text-left transition-all duration-200',
                              surveyData.usageIntent === intent.value
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-purple-600'
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              <intent.icon
                                className={cn(
                                  'h-8 w-8 mt-1',
                                  surveyData.usageIntent === intent.value
                                    ? 'text-purple-500'
                                    : 'text-neutral-400'
                                )}
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                                  {intent.label}
                                </h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {intent.description}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  'w-4 h-4 rounded-full border-2 transition-all mt-1',
                                  surveyData.usageIntent === intent.value
                                    ? 'bg-purple-500 border-purple-500'
                                    : 'border-neutral-300 dark:border-neutral-600'
                                )}
                              >
                                {surveyData.usageIntent === intent.value && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                        onClick={() => {
                          // Here you would save the preferences to your backend
                          console.log('Saving preferences:', surveyData);
                        }}
                      >
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Preferences Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Preferences Summary</CardTitle>
                    <CardDescription>
                      Overview of your selected preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          Preferred Tags ({surveyData.preferredTags.length})
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {surveyData.preferredTags.length > 0 ? (
                            surveyData.preferredTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              No tags selected
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          Risk Profile
                        </h4>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {surveyData.riskProfile
                            ? riskProfiles.find(
                                (p) => p.value === surveyData.riskProfile
                              )?.label
                            : 'Not selected'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          Usage Intent
                        </h4>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {surveyData.usageIntent
                            ? usageIntents.find(
                                (i) => i.value === surveyData.usageIntent
                              )?.label
                            : 'Not selected'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconUser className="h-5 w-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Full Name
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-neutral-900 dark:text-neutral-100">
                            {userData.name}
                          </span>
                          <IconEdit className="h-4 w-4 text-neutral-400 cursor-pointer hover:text-neutral-600" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Email
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-neutral-900 dark:text-neutral-100">
                            {userData.email}
                          </span>
                          <IconEdit className="h-4 w-4 text-neutral-400 cursor-pointer hover:text-neutral-600" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Phone
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-neutral-900 dark:text-neutral-100">
                            {userData.phone}
                          </span>
                          <IconEdit className="h-4 w-4 text-neutral-400 cursor-pointer hover:text-neutral-600" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Location
                        </label>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-neutral-900 dark:text-neutral-100">
                            {userData.location}
                          </span>
                          <IconEdit className="h-4 w-4 text-neutral-400 cursor-pointer hover:text-neutral-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconSettings className="h-5 w-5" />
                      <span>Account Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          Email Notifications
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Receive updates about your trades
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Secure your account with 2FA
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          API Access
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Manage your API keys
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
