'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IconSearch,
  IconFilter,
  IconUser,
  IconTrendingUp,
  IconTrendingDown,
  IconEye,
  IconWallet,
  IconTarget,
  IconCalendar,
  IconChartLine,
  IconCoin,
  IconTrophy,
  IconLoader,
  IconAlertCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  getUserProfile,
  getOpenPositions,
  getHistoricalPositions,
  formatUserData,
} from '@/services/userStalkService';

// UI Components
const Card = ({ children, className = '', ...props }) => (
  <div
    className={cn(
      'bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('p-6 pb-4', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3
    className={cn(
      'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p
    className={cn(
      'text-sm text-neutral-600 dark:text-neutral-400 mt-1',
      className
    )}
    {...props}
  >
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    outline: 'border border-input',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default function StalkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('totalVolume');
  const [timeFilter, setTimeFilter] = useState('7D');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [copyTradeModal, setCopyTradeModal] = useState({
    open: false,
    user: null,
  });
  const [copyTradePositions, setCopyTradePositions] = useState([]);

  // Load copy trade positions from localStorage on component mount
  useEffect(() => {
    const savedPositions = localStorage.getItem('copyTradePositions');
    if (savedPositions) {
      setCopyTradePositions(JSON.parse(savedPositions));
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a wallet address');
      return;
    }

    // Validate wallet address format
    if (!searchQuery.match(/^0x[a-fA-F0-9]{40}$/)) {
      setSearchError('Please enter a valid Ethereum wallet address (0x...)');
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      const userProfile = await getUserProfile(searchQuery.trim());
      if (userProfile) {
        const formattedUser = formatUserData(userProfile, searchQuery.trim());
        setSearchedUsers([formattedUser]);
      } else {
        setSearchedUsers([]);
        setSearchError('No trading data found for this address');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Error fetching user data. Please try again.');
      setSearchedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // CopyTrade functions
  const openCopyTradeModal = (user) => {
    setCopyTradeModal({ open: true, user });
  };

  const closeCopyTradeModal = () => {
    setCopyTradeModal({ open: false, user: null });
  };

  const saveCopyTradePosition = (formData) => {
    const newPosition = {
      id: Date.now().toString(),
      ...formData,
      walletAddress: copyTradeModal.user.address,
      traderName:
        copyTradeModal.user.ensName ||
        `${copyTradeModal.user.address.slice(
          0,
          6
        )}...${copyTradeModal.user.address.slice(-4)}`,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    const updatedPositions = [...copyTradePositions, newPosition];
    setCopyTradePositions(updatedPositions);
    localStorage.setItem(
      'copyTradePositions',
      JSON.stringify(updatedPositions)
    );
    closeCopyTradeModal();
  };

  const filteredUsers = searchedUsers.sort((a, b) => {
    switch (sortBy) {
      case 'totalVolume':
        return b.totalVolume - a.totalVolume;
      case 'totalPnl':
        return b.totalPnl - a.totalPnl;
      case 'winRate':
        return b.winRate - a.winRate;
      case 'totalPositions':
        return b.totalPositions - a.totalPositions;
      default:
        return 0;
    }
  });

  // UserCard component
  const UserCard = ({ user, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => setSelectedUser(user)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <IconUser className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {user.ensName ||
                `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              {user.address.slice(0, 10)}...{user.address.slice(-4)}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs px-2 py-1 h-7"
          >
            <IconEye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-2 py-1 h-7"
            onClick={(e) => {
              e.stopPropagation();
              openCopyTradeModal(user);
            }}
          >
            <IconTarget className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Total Volume</span>
            <span className="text-sm font-semibold text-orange-600 flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.totalVolume.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Positions</span>
            <span className="text-sm font-medium">{user.totalPositions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Win Rate</span>
            <span className="text-sm font-medium text-green-500">
              {user.winRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Avg Position</span>
            <span className="text-sm font-medium flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.avgPositionSize}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Total PnL</span>
            <span
              className={`text-sm font-semibold flex items-center ${
                user.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.totalPnl >= 0 ? '+' : ''}
              {user.totalPnl.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Open Positions</span>
            <span className="text-sm font-medium">
              {user.openPositions || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Best Trade</span>
            <span className="text-sm font-medium text-green-500 flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />+
              {user.bestTrade || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Rank</span>
            <Badge className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300 text-xs">
              #{index + 1}
            </Badge>
          </div>
        </div>
      </div>

      <div className="h-16 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg flex items-center justify-center">
        <IconChartLine className="h-6 w-6 text-orange-500 mr-2" />
        <span className="text-xs text-orange-600 dark:text-orange-400">
          Data from The Graph Protocol
        </span>
      </div>
    </motion.div>
  );

  // UserDetailModal component
  const UserDetailModal = ({ user }) => {
    const [modalOpenPositions, setModalOpenPositions] = useState([]);
    const [modalHistoricalPositions, setModalHistoricalPositions] = useState(
      []
    );
    const [modalLoading, setModalLoading] = useState(true);

    useEffect(() => {
      const fetchPositions = async () => {
        if (!user?.address) return;

        setModalLoading(true);
        try {
          const [openPositions, historicalPositions] = await Promise.all([
            getOpenPositions(user.address),
            getHistoricalPositions(user.address),
          ]);

          setModalOpenPositions(openPositions);
          setModalHistoricalPositions(historicalPositions);
        } catch (error) {
          console.error('Error fetching modal positions:', error);
        } finally {
          setModalLoading(false);
        }
      };

      fetchPositions();
    }, [user?.address]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={() => setSelectedUser(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <IconUser className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {user.ensName ||
                      `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                    {user.address}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    openCopyTradeModal(user);
                  }}
                >
                  <IconTarget className="h-4 w-4 mr-2" />
                  CopyTrade
                </Button>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-orange-100 text-xs font-medium mb-1">
                        Total Volume
                      </p>
                      <div className="flex items-center flex-wrap">
                        <img
                          src="/usdc.png"
                          alt="USDC"
                          className="w-4 h-4 mr-1 flex-shrink-0"
                        />
                        <p className="text-lg font-bold break-all">
                          {user.totalVolume?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    <IconWallet className="h-6 w-6 text-orange-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-green-100 text-xs font-medium mb-1">
                        Win Rate
                      </p>
                      <p className="text-lg font-bold">{user.winRate || 0}%</p>
                    </div>
                    <IconTarget className="h-6 w-6 text-green-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-blue-100 text-xs font-medium mb-1">
                        Total PnL
                      </p>
                      <div className="flex items-center flex-wrap">
                        <img
                          src="/usdc.png"
                          alt="USDC"
                          className="w-4 h-4 mr-1 flex-shrink-0"
                        />
                        <p
                          className={`text-lg font-bold break-all ${
                            user.totalPnl >= 0 ? '' : 'text-red-200'
                          }`}
                        >
                          {user.totalPnl >= 0 ? '+' : ''}
                          {user.totalPnl?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    <IconTrendingUp className="h-6 w-6 text-blue-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-purple-100 text-xs font-medium mb-1">
                        Positions
                      </p>
                      <p className="text-lg font-bold">
                        {user.totalPositions || 0}
                      </p>
                    </div>
                    <IconCalendar className="h-6 w-6 text-purple-200 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <img
                      src="/thegraph.png"
                      alt="The Graph"
                      className="h-5 w-5"
                    />
                    <span>Detailed Metrics</span>
                    <span className="text-xs text-neutral-500">
                      • Powered by The Graph
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">
                      Total Positions
                    </span>
                    <span className="font-semibold">
                      {user.totalPositions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">
                      Average Position Size
                    </span>
                    <span className="font-semibold flex items-center">
                      <img
                        src="/usdc.png"
                        alt="USDC"
                        className="w-3 h-3 mr-1"
                      />
                      {user.avgPositionSize || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Best Trade</span>
                    <span className="font-semibold text-green-600">
                      +${user.bestTrade || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">ROI</span>
                    <span
                      className={`font-semibold ${
                        user.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {user.totalVolume
                        ? ((user.totalPnl / user.totalVolume) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <img
                      src="/thegraph.png"
                      alt="The Graph"
                      className="h-5 w-5"
                    />
                    <span>Protocol Analytics</span>
                    <span className="text-xs text-neutral-500">
                      • Powered by The Graph
                    </span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {['7D', '1M', '3M', '1Y', 'YTD', 'ALL'].map((filter) => (
                      <Button
                        key={filter}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'text-xs',
                          timeFilter === filter
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        )}
                        onClick={() => setTimeFilter(filter)}
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <IconChartLine className="h-12 w-12 text-orange-500 mx-auto" />
                      <p className="text-sm text-orange-600">
                        Analytics for {timeFilter} period
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        ${user.totalPnl >= 0 ? '+' : ''}
                        {user.totalPnl?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Open Positions Table */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconCoin className="h-5 w-5 text-green-500" />
                  <span>Open Positions</span>
                  <Badge variant="outline" className="ml-2">
                    {modalOpenPositions.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Currently active prediction market positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modalLoading ? (
                  <div className="text-center py-8">
                    <IconLoader className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-neutral-600">
                      Loading positions...
                    </p>
                  </div>
                ) : modalOpenPositions.length === 0 ? (
                  <div className="text-center py-8">
                    <IconCoin className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">
                      No open positions found
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Market
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Outcome
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Shares
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalOpenPositions.map((position, index) => (
                          <tr
                            key={index}
                            className="border-b border-neutral-100 dark:border-neutral-800"
                          >
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                                  {position.marketTitle || 'Unknown Market'}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  ID: {position.marketId}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  position.outcome === 'YES'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                )}
                              >
                                {position.outcome || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                              {position.shares || '0'}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-semibold flex items-center">
                                <img
                                  src="/usdc.png"
                                  alt="USDC"
                                  className="w-3 h-3 mr-1"
                                />
                                {position.value || '0'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Positions Table */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconTrophy className="h-5 w-5 text-purple-500" />
                  <span>Historical Positions</span>
                  <Badge variant="outline" className="ml-2">
                    {modalHistoricalPositions.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Previously closed prediction market positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modalLoading ? (
                  <div className="text-center py-8">
                    <IconLoader className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-neutral-600">
                      Loading historical positions...
                    </p>
                  </div>
                ) : modalHistoricalPositions.length === 0 ? (
                  <div className="text-center py-8">
                    <IconTrophy className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">
                      No historical positions found
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Market
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Outcome
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Invested
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            PnL
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                            Closed
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalHistoricalPositions.map((position, index) => (
                          <tr
                            key={index}
                            className="border-b border-neutral-100 dark:border-neutral-800"
                          >
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                                  {position.marketTitle || 'Unknown Market'}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  ID: {position.marketId}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  position.outcome === 'YES'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                )}
                              >
                                {position.outcome || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-medium flex items-center">
                                <img
                                  src="/usdc.png"
                                  alt="USDC"
                                  className="w-3 h-3 mr-1"
                                />
                                {position.invested || '0'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <span
                                  className={`font-semibold flex items-center mr-2 ${
                                    position.pnl >= 0
                                      ? 'text-green-500'
                                      : 'text-red-500'
                                  }`}
                                >
                                  {position.pnl >= 0 ? '+' : ''}
                                  <img
                                    src="/usdc.png"
                                    alt="USDC"
                                    className="w-3 h-3 mx-1"
                                  />
                                  {position.pnl || '0'}
                                </span>
                                <span
                                  className={`text-xs px-1 py-0.5 rounded ${
                                    position.pnl >= 0
                                      ? 'text-green-500 bg-green-50'
                                      : 'text-red-500 bg-red-50'
                                  }`}
                                >
                                  {position.pnl >= 0 ? '+' : ''}
                                  {position.pnlPercentage || '0.0'}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400 text-xs">
                              {position.closedAt
                                ? new Date(
                                    position.closedAt * 1000
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // CopyTrade Modal Component
  const CopyTradeModal = () => {
    const [formData, setFormData] = useState({
      label: '',
      deposit: '',
      takeProfit: '',
      stopLoss: '',
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (
        formData.label &&
        formData.deposit &&
        formData.takeProfit &&
        formData.stopLoss
      ) {
        saveCopyTradePosition(formData);
        setFormData({ label: '', deposit: '', takeProfit: '', stopLoss: '' });
      }
    };

    if (!copyTradeModal.open) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={closeCopyTradeModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              CopyTrade Position
            </h2>
            <button
              onClick={closeCopyTradeModal}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Copying trades from:
            </p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {copyTradeModal.user?.ensName ||
                `${copyTradeModal.user?.address.slice(
                  0,
                  6
                )}...${copyTradeModal.user?.address.slice(-4)}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Label
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter position label"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Deposit (USDC)
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Take Profit %
              </label>
              <input
                type="number"
                name="takeProfit"
                value={formData.takeProfit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="25.0"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Stop Loss %
              </label>
              <input
                type="number"
                name="stopLoss"
                value={formData.stopLoss}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="10.0"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={closeCopyTradeModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Create Position
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:from-neutral-900 dark:to-neutral-800 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Stalk Users
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 flex items-center">
            Search and analyze user trading performance by wallet address •{' '}
            <img src="/thegraph.png" alt="The Graph" className="h-4 w-4 mx-2" />
            Powered by The Graph
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Enter wallet address (0x...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isLoading ? (
                    <IconLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="totalVolume">Sort by Volume</option>
                  <option value="totalPnl">Sort by PnL</option>
                  <option value="winRate">Sort by Win Rate</option>
                  <option value="totalPositions">Sort by Positions</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {searchError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600">
                <IconAlertCircle className="h-5 w-5" />
                <span>{searchError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <IconLoader className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-neutral-600">
                Fetching user data from The Graph...
              </p>
            </CardContent>
          </Card>
        )}

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
        </div>

        {/* No results */}
        {filteredUsers.length === 0 && !isLoading && !searchError && (
          <div className="text-center py-12">
            <img
              src="/pepe.png"
              alt="Pepe"
              className="h-24 w-24 mx-auto mb-4 opacity-80"
            />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No users found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              Enter a wallet address above to search for trading data
            </p>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && <UserDetailModal user={selectedUser} />}

        {/* CopyTrade Modal */}
        <CopyTradeModal />

        {/* CopyTrade Positions Table */}
        {copyTradePositions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconTarget className="h-5 w-5 text-orange-500" />
                <span>My CopyTrade Positions</span>
                <Badge variant="outline" className="ml-2">
                  {copyTradePositions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Trader
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Label
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Deposit
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Take Profit
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Stop Loss
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {copyTradePositions.map((position) => (
                      <tr
                        key={position.id}
                        className="border-b border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {position.traderName}
                            </p>
                            <p className="text-xs text-neutral-500 font-mono">
                              {position.walletAddress.slice(0, 6)}...
                              {position.walletAddress.slice(-4)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-neutral-900 dark:text-neutral-100">
                            {position.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium flex items-center text-sm">
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3 mr-1"
                            />
                            {position.deposit}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-green-600 dark:text-green-400">
                            +{position.takeProfit}%
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-red-600 dark:text-red-400">
                            -{position.stopLoss}%
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                          >
                            {position.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400 text-xs">
                          {new Date(position.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
