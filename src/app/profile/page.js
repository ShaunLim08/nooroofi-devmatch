'use client';

import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import {
  getUserProfile,
  getOpenPositions,
  getHistoricalPositions,
  formatUserData,
} from '@/services/userStalkService';
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
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconTarget,
  IconCoin,
  IconCalendar,
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

  // The Graph data states
  const [userProfile, setUserProfile] = useState(null);
  const [openPositions, setOpenPositions] = useState([]);
  const [historicalPositions, setHistoricalPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token data states
  const [coingeckoTokens, setCoingeckoTokens] = useState([]);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [historicalTokenData, setHistoricalTokenData] = useState([]);
  const [tokenMetadata, setTokenMetadata] = useState({});

  // Token loading states
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [loadingCoingecko, setLoadingCoingecko] = useState(false);
  const [loadingHistorical, setLoadingHistorical] = useState(false);

  // Get wallet address
  const walletAddress = wallets?.[0]?.address;

  // Fetch user data from The Graph
  useEffect(() => {
    const fetchUserData = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch data from The Graph
        const [profile, openPos, historicalPos] = await Promise.all([
          getUserProfile(walletAddress),
          getOpenPositions(walletAddress),
          getHistoricalPositions(walletAddress),
        ]);

        setUserProfile(profile);
        setOpenPositions(openPos);
        setHistoricalPositions(historicalPos);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [walletAddress]);

  // Format user data for display
  const userData = userProfile
    ? formatUserData(userProfile, walletAddress)
    : {
        address: walletAddress || '',
        ensName: null,
        totalVolume: 0,
        totalPnl: 0,
        winRate: 0,
        totalPositions: 0,
        avgPositionSize: 0,
        openPositions: 0,
        bestTrade: 0,
      };

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

  // Get token image from CoinGecko or fallback
  const getTokenImage = (contractAddress, symbol, metadata) => {
    // First check metadata
    if (metadata?.image) return metadata.image;

    // Known token images for Polygon
    const knownTokenImages = {
      '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063':
        'https://assets.coingecko.com/coins/images/9956/thumb/4943.png', // DAI
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174':
        'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png', // USDC
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f':
        'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png', // USDT
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee':
        'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png', // MATIC
    };

    // Check for known token image
    const knownImage = knownTokenImages[contractAddress?.toLowerCase()];
    if (knownImage) return knownImage;

    // Try to find CoinGecko token by contract address
    if (coingeckoTokens && coingeckoTokens.length > 0) {
      const coingeckoToken = coingeckoTokens.find((token) => {
        if (token.platforms && token.platforms['polygon-pos']) {
          return (
            token.platforms['polygon-pos'].toLowerCase() ===
            contractAddress?.toLowerCase()
          );
        }
        return false;
      });

      if (coingeckoToken && coingeckoToken.image) {
        return coingeckoToken.image;
      }
    }

    return null;
  };
  const isTokenVerified = (contractAddress, symbol, name) => {
    if (!coingeckoTokens || coingeckoTokens.length === 0) return true; // If no data, show all tokens

    // First check against CoinGecko verification
    const coingeckoVerified = coingeckoTokens.some((token) => {
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

      // Also check by symbol as a fallback for known tokens
      return (
        token.symbol && token.symbol.toLowerCase() === symbol.toLowerCase()
      );
    });

    // If CoinGecko verified, return true
    if (coingeckoVerified) return true;

    // Known legitimate tokens on Polygon (even if not in CoinGecko)
    const knownTokens = {
      '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063': 'DAI', // DAI Stablecoin
      '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': 'MATIC', // Native MATIC
      '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'USDC', // USDC
      '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'USDT', // USDT
    };

    // Check if it's a known legitimate token
    if (knownTokens[contractAddress.toLowerCase()]) return true;

    // Filter out obvious spam tokens
    const spamIndicators = [
      'claim',
      'reward',
      'airdrop',
      'visit',
      'redeem',
      't.me',
      't.ly',
      'zerolends.com',
      '5000usdc.org',
      'eth-earn.net',
      'web3eth.vip',
      'adrp-ether.xyz',
      'ethenaDrop.io',
    ];

    const tokenText = `${symbol} ${name}`.toLowerCase();
    const isSpam = spamIndicators.some((indicator) =>
      tokenText.includes(indicator.toLowerCase())
    );

    // Return true only if not spam and has reasonable value
    return !isSpam;
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

        // Filter tokens based on CoinGecko verification and spam detection
        const verifiedTokens = tokens.filter((token) => {
          // Skip tokens with very low value (likely dust or spam)
          if (token.value < 0.01) return false;

          return isTokenVerified(token.contract, token.symbol, token.name);
        });

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

        // Filter historical tokens based on CoinGecko verification and spam detection
        const verifiedHistoricalTokens = historicalTokens.filter((token) => {
          // Skip tokens with very low value (likely dust or spam)
          if (token.value < 0.01) return false;

          return isTokenVerified(token.contract, token.symbol, token.name);
        });

        setHistoricalTokenData(verifiedHistoricalTokens);
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
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/005/356/906/non_2x/funny-cartoon-squirrel-free-vector.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
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
                    {userData.totalVolume?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Active Positions
                  </span>
                  <span className="font-semibold text-orange-500">
                    {openPositions.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total Positions
                  </span>
                  <span className="font-semibold">
                    {userData.totalPositions || 0}
                  </span>
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
                label="Copy Trades"
                isActive={activeTab === 'trades'}
                onClick={setActiveTab}
              />
              <TabButton
                id="preferences"
                label="Preferences"
                isActive={activeTab === 'preferences'}
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
                            {userData.totalPnl?.toLocaleString() || '0'}
                          </p>
                          <p className="text-green-200 text-xs">
                            {userData.totalPnl >= 0 ? 'Profitable' : 'Loss'}
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
                          <p className="text-2xl font-bold">
                            {userData.winRate?.toFixed(1) || '0'}%
                          </p>
                          <p className="text-blue-200 text-xs">
                            {userData.winRate > 50
                              ? 'Above average'
                              : 'Below average'}
                          </p>
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
                            {userData.avgPositionSize?.toLocaleString() || '0'}
                          </p>
                          <p className="text-purple-200 text-xs">
                            Per position
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
                            Total Positions
                          </p>
                          <p className="text-2xl font-bold">
                            {userData.totalPositions || 0}
                          </p>
                          <p className="text-orange-200 text-xs">
                            {openPositions.length || 0} active
                          </p>
                        </div>
                        <IconChartBar className="h-8 w-8 text-orange-100" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Token Balances */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <IconWallet className="h-5 w-5 text-purple-500" />
                      <span>Wallet Balances</span>
                      <img
                        src="/thegraph.png"
                        alt="The Graph"
                        className="h-4 w-4"
                      />
                    </CardTitle>
                    <CardDescription>
                      Your current token holdings on Polygon network • Powered
                      by The Graph Token API • Verified by CoinGecko
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
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                                  {(() => {
                                    const tokenImage = getTokenImage(
                                      token.contract,
                                      token.symbol,
                                      metadata
                                    );
                                    if (tokenImage) {
                                      return (
                                        <img
                                          src={tokenImage}
                                          alt={metadata?.symbol || token.symbol}
                                          className="w-full h-full object-cover rounded-full"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display =
                                              'flex';
                                          }}
                                        />
                                      );
                                    } else {
                                      return (
                                        <span className="text-white font-bold text-sm flex items-center justify-center w-full h-full">
                                          {token.symbol?.slice(0, 2) || '??'}
                                        </span>
                                      );
                                    }
                                  })()}
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
                    <span>Open Positons</span>
                  </CardTitle>
                  <CardDescription>
                    Your recent prediction market copy trades • Powered by The Graph
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading trading history...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">
                        Error loading trades: {error}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Open Positions */}
                      {openPositions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Active Positions ({openPositions.length})
                          </h3>
                          <div className="space-y-3">
                            {openPositions.map((position, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-l-4 border-green-500"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                                    {position.market || 'Market Position'}
                                  </h4>
                                  <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                                      ACTIVE
                                    </span>
                                    <span className="flex items-center">
                                      <img
                                        src="/usdc.png"
                                        alt="USDC"
                                        className="w-3 h-3 mr-1"
                                      />
                                      {position.amount?.toLocaleString() ||
                                        'N/A'}
                                    </span>
                                    <span>
                                      Token: {position.outcomeToken || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-blue-500">
                                    Active
                                  </div>
                                  <Badge variant="default" className="text-xs">
                                    Open
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Historical Positions
                      {historicalPositions.length > 0 && ( */}
                        <div>
                          {/* <h3 className="text-lg font-semibold mb-3 flex items-center">
                            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                            Trading History ({historicalPositions.length})
                          </h3> */}
                          <div className="space-y-3">
                            {historicalPositions
                              .slice(0, 10)
                              .map((position, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border-l-4 border-gray-400"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                                      {position.market || 'Historical Position'}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                                      <span className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium">
                                        CLOSED
                                      </span>
                                      <span className="flex items-center">
                                        <img
                                          src="/usdc.png"
                                          alt="USDC"
                                          className="w-3 h-3 mr-1"
                                        />
                                        {position.amount?.toLocaleString() ||
                                          'N/A'}
                                      </span>
                                      <span>
                                        Token: {position.outcomeToken || 'N/A'}
                                      </span>
                                      <span className="flex items-center">
                                        <IconCalendar className="w-3 h-3 mr-1" />
                                        {position.timestamp ? 
                                          new Date(position.timestamp * 1000).toLocaleDateString() : 
                                          'N/A'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div
                                      className={cn(
                                        'text-lg font-semibold flex items-center',
                                        position.pnl >= 0
                                          ? 'text-green-500'
                                          : 'text-red-500'
                                      )}
                                    >
                                      {position.pnl >= 0 ? (
                                        <IconTrendingUp className="w-4 h-4 mr-1" />
                                      ) : (
                                        <IconTrendingDown className="w-4 h-4 mr-1" />
                                      )}
                                      {position.pnl >= 0 ? '+' : ''}
                                      <img
                                        src="/usdc.png"
                                        alt="USDC"
                                        className="w-4 h-4 mx-1"
                                      />
                                      {Math.abs(
                                        position.pnl || 0
                                      ).toLocaleString()}
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge
                                        variant={position.pnl >= 0 ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {position.pnl >= 0 ? 'Profitable' : 'Loss'}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Closed
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          
                          {/* Show More Button if there are more than 10 positions */}
                          {historicalPositions.length > 10 && (
                            <div className="text-center mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-sm"
                                onClick={() => {
                                  // You can implement a show more functionality here
                                  console.log('Show more historical positions');
                                }}
                              >
                                <IconHistory className="w-4 h-4 mr-2" />
                                View All {historicalPositions.length} Positions
                              </Button>
                            </div>
                          )}
                        </div>
                      {/* )} */}

                      {openPositions.length === 0 &&
                        historicalPositions.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-neutral-500">
                              No trading history found for this wallet
                            </p>
                            <p className="text-sm text-neutral-400 mt-2">
                              Start trading to see your positions here
                            </p>
                          </div>
                        )}
                    </div>
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
