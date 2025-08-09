'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  IconSearch,
  IconUser,
  IconTrendingUp,
  IconTrendingDown,
  IconCoin,
  IconTarget,
  IconChartLine,
  IconCalendar,
  IconFilter,
  IconEye,
  IconWallet,
  IconPercent,
  IconClock,
  IconDollarSign,
  IconTrophy,
  IconGraph,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function StalkPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('netWorth');
  const [timeFilter, setTimeFilter] = useState('7D');
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock user data for demonstration
  const users = [
    {
      id: 1,
      address: '0x742d35Cc6C4b7B1d8d8123C5f8B9e1234',
      username: 'CryptoWhale',
      avatar: '/api/placeholder/40/40',
      netWorth: 245000,
      totalClosed: 156,
      winRate: 73.2,
      avgInvested: 1580,
      feeEarned: 2400,
      totalProfit: 18500,
      avgMonthlyProfit: 3200,
      profitHistory: [
        { period: '7D', profit: 850 },
        { period: '1M', profit: 3200 },
        { period: '3M', profit: 9800 },
        { period: '1Y', profit: 18500 },
      ],
    },
    {
      id: 2,
      address: '0x8A2d35Cc6C4b7B1d8d8789B5f8B9e5678',
      username: 'PredictorPro',
      avatar: '/api/placeholder/40/40',
      netWorth: 189000,
      totalClosed: 203,
      winRate: 68.5,
      avgInvested: 920,
      feeEarned: 1850,
      totalProfit: 14200,
      avgMonthlyProfit: 2800,
      profitHistory: [
        { period: '7D', profit: 650 },
        { period: '1M', profit: 2800 },
        { period: '3M', profit: 8400 },
        { period: '1Y', profit: 14200 },
      ],
    },
    {
      id: 3,
      address: '0x9B3e35Cc6C4b7B1d8d8456C5f8B9e9012',
      username: 'MarketMaven',
      avatar: '/api/placeholder/40/40',
      netWorth: 156000,
      totalClosed: 89,
      winRate: 81.4,
      avgInvested: 2100,
      feeEarned: 1200,
      totalProfit: 22000,
      avgMonthlyProfit: 4100,
      profitHistory: [
        { period: '7D', profit: 920 },
        { period: '1M', profit: 4100 },
        { period: '3M', profit: 12300 },
        { period: '1Y', profit: 22000 },
      ],
    },
    {
      id: 4,
      address: '0x7C4f35Cc6C4b7B1d8d8321D5f8B9e3456',
      username: 'DataDriven',
      avatar: '/api/placeholder/40/40',
      netWorth: 134000,
      totalClosed: 278,
      winRate: 65.1,
      avgInvested: 480,
      feeEarned: 3200,
      totalProfit: 8900,
      avgMonthlyProfit: 1850,
      profitHistory: [
        { period: '7D', profit: 420 },
        { period: '1M', profit: 1850 },
        { period: '3M', profit: 5550 },
        { period: '1Y', profit: 8900 },
      ],
    },
    {
      id: 5,
      address: '0x6D5e35Cc6C4b7B1d8d8987E5f8B9e7890',
      username: 'AlphaTrade',
      avatar: '/api/placeholder/40/40',
      netWorth: 98000,
      totalClosed: 145,
      winRate: 76.8,
      avgInvested: 675,
      feeEarned: 980,
      totalProfit: 12800,
      avgMonthlyProfit: 2600,
      profitHistory: [
        { period: '7D', profit: 580 },
        { period: '1M', profit: 2600 },
        { period: '3M', profit: 7800 },
        { period: '1Y', profit: 12800 },
      ],
    },
  ];

  const filteredUsers = users
    .filter(
      (user) =>
        user.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'netWorth':
          return b.netWorth - a.netWorth;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'totalProfit':
          return b.totalProfit - a.totalProfit;
        case 'avgMonthlyProfit':
          return b.avgMonthlyProfit - a.avgMonthlyProfit;
        default:
          return 0;
      }
    });

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
              {user.username}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              {user.address.slice(0, 10)}...{user.address.slice(-4)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          <IconEye className="h-4 w-4 mr-1" />
          View
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Net Worth</span>
            <span className="text-sm font-semibold text-orange-600 flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.netWorth.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Total Closed</span>
            <span className="text-sm font-medium">{user.totalClosed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Win Rate</span>
            <span className="text-sm font-medium text-green-500">
              {user.winRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Avg Invested</span>
            <span className="text-sm font-medium flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.avgInvested}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Fee Earned</span>
            <span className="text-sm font-medium flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.feeEarned}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Total Profit</span>
            <span className="text-sm font-semibold text-green-500 flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.totalProfit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-neutral-500">Monthly Avg</span>
            <span className="text-sm font-medium flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
              {user.avgMonthlyProfit}
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
          Profit Trend: {timeFilter}
        </span>
      </div>
    </motion.div>
  );

  const UserDetailModal = ({ user }) => (
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
                  {user.username}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                  {user.address}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs font-medium">
                      Net Worth
                    </p>
                    <p className="text-2xl font-bold flex items-center">
                      <img
                        src="/usdc.png"
                        alt="USDC"
                        className="w-5 h-5 mr-2"
                      />
                      {user.netWorth.toLocaleString()}
                    </p>
                  </div>
                  <IconWallet className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs font-medium">
                      Win Rate
                    </p>
                    <p className="text-2xl font-bold">{user.winRate}%</p>
                  </div>
                  <IconTarget className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-medium">
                      Total Profit
                    </p>
                    <p className="text-2xl font-bold flex items-center">
                      <img
                        src="/usdc.png"
                        alt="USDC"
                        className="w-5 h-5 mr-2"
                      />
                      {user.totalProfit.toLocaleString()}
                    </p>
                  </div>
                  <IconTrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs font-medium">
                      Monthly Avg
                    </p>
                    <p className="text-2xl font-bold flex items-center">
                      <img
                        src="/usdc.png"
                        alt="USDC"
                        className="w-5 h-5 mr-2"
                      />
                      {user.avgMonthlyProfit}
                    </p>
                  </div>
                  <IconCalendar className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <img src="/thegraph.png" alt="The Graph" className="h-5 w-5" />
                  <span>Detailed Metrics</span>
                  <span className="text-xs text-neutral-500">• Powered by The Graph</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">
                    Total Closed Positions
                  </span>
                  <span className="font-semibold">{user.totalClosed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">
                    Average Invested
                  </span>
                  <span className="font-semibold flex items-center">
                    <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
                    {user.avgInvested}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Fee Earned</span>
                  <span className="font-semibold text-orange-600">
                    ${user.feeEarned}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">ROI</span>
                  <span className="font-semibold text-green-500">
                    {(
                      (user.totalProfit /
                        (user.avgInvested * user.totalClosed)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <img src="/thegraph.png" alt="The Graph" className="h-5 w-5" />
                  <span>Profit History</span>
                  <span className="text-xs text-neutral-500">• Powered by The Graph</span>
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
                      Profit chart for {timeFilter} period
                    </p>
                    <p className="text-lg font-bold text-orange-600">
                      $
                      {user.profitHistory.find((p) => p.period === timeFilter)
                        ?.profit || user.totalProfit}
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
              </CardTitle>
              <CardDescription>
                Currently active prediction market positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Position
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Age
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Value
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            Bitcoin $100K by 2024
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            YES
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        15 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          1,245
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <IconEye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            Tesla Stock $300
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            NO
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        8 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          890
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <IconEye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            AI Turing Test 2024
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            YES
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        3 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          650
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <IconEye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Historical Positions Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconTrophy className="h-5 w-5 text-purple-500" />
                <span>Historical Positions</span>
              </CardTitle>
              <CardDescription>
                Previously closed prediction market positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Position
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Age
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Invested
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        PnL
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-neutral-600 dark:text-neutral-400">
                        Closed At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            US Election 2024
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            YES
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        45 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          2,000
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-green-500 flex items-center mr-2">
                            +
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3 mx-1"
                            />
                            420
                          </span>
                          <span className="text-xs text-green-500 bg-green-50 px-1 py-0.5 rounded">
                            +21.0%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        Nov 15, 2023
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            Ethereum $3000
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            NO
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        30 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          1,500
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-red-500 flex items-center mr-2">
                            -
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3 mx-1"
                            />
                            180
                          </span>
                          <span className="text-xs text-red-500 bg-red-50 px-1 py-0.5 rounded">
                            -12.0%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        Oct 28, 2023
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            Climate Agreement COP29
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            YES
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        22 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          800
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-green-500 flex items-center mr-2">
                            +
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3 mx-1"
                            />
                            312
                          </span>
                          <span className="text-xs text-green-500 bg-green-50 px-1 py-0.5 rounded">
                            +39.0%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        Oct 10, 2023
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            SpaceX Mars Mission
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            NO
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        18 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          1,200
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-green-500 flex items-center mr-2">
                            +
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3 mx-1"
                            />
                            96
                          </span>
                          <span className="text-xs text-green-500 bg-green-50 px-1 py-0.5 rounded">
                            +8.0%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        Sep 22, 2023
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            Apple Stock $200
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            YES
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        12 days
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          950
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-green-500 flex items-center mr-2">
                            +
                            <img
                              src="/usdc.png"
                              alt="USDC"
                              className="w-3 h-3 mx-1"
                            />
                            285
                          </span>
                          <span className="text-xs text-green-500 bg-green-50 px-1 py-0.5 rounded">
                            +30.0%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-neutral-600 dark:text-neutral-400">
                        Sep 05, 2023
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );

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
              <div className="flex-1 relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by wallet address or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="netWorth">Net Worth</SelectItem>
                    <SelectItem value="winRate">Win Rate</SelectItem>
                    <SelectItem value="totalProfit">Total Profit</SelectItem>
                    <SelectItem value="avgMonthlyProfit">
                      Monthly Profit
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Time..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7D">7 Days</SelectItem>
                    <SelectItem value="1M">1 Month</SelectItem>
                    <SelectItem value="3M">3 Months</SelectItem>
                    <SelectItem value="1Y">1 Year</SelectItem>
                    <SelectItem value="YTD">YTD</SelectItem>
                    <SelectItem value="ALL">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
        </div>

        {/* No results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <IconUser className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              No users found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              Try adjusting your search query or filters
            </p>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && <UserDetailModal user={selectedUser} />}
      </div>
    </div>
  );
}
