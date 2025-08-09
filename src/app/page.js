'use client';

import { useState } from 'react';
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
} from '@tabler/icons-react';

export default function Home() {
  const [trendingFilter, setTrendingFilter] = useState('volume');
  const [newFilter, setNewFilter] = useState('duration');

  // Mock data for demonstration
  const trendingMarkets = [
    {
      title: 'Will Bitcoin reach $100k by 2024?',
      created: '2 days ago',
      volume: '2.4M',
      probability: '68%',
      change: '+5.2%',
    },
    {
      title: 'US Election 2024 Winner',
      created: '1 week ago',
      volume: '1.8M',
      probability: '45%',
      change: '-2.1%',
    },
    {
      title: 'Tesla Stock Price Above $300',
      created: '3 days ago',
      volume: '950K',
      probability: '72%',
      change: '+8.7%',
    },
  ];

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
                      <SelectItem value="volume">Filter by Volume</SelectItem>
                      <SelectItem value="activity">
                        Filter by Activity
                      </SelectItem>
                      <SelectItem value="change">Filter by Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
                <div className="space-y-4">
                  {trendingMarkets.map((market, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {market.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <IconClock className="h-4 w-4 mr-1" />
                            {market.created}
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
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold">
                          {market.probability}
                        </div>
                        <div
                          className={`text-sm ${
                            market.change.startsWith('+')
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {market.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Right - New Markets (Wider) */}
          <div className="lg:col-span-2">
            <Card className="h-[350px]">
              <CardHeader>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <IconClock className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">New Markets</CardTitle>
                  </div>
                  <Select value={newFilter} onValueChange={setNewFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duration">
                        Filter by Duration
                      </SelectItem>
                      <SelectItem value="volume">Filter by Volume</SelectItem>
                      <SelectItem value="popularity">
                        Filter by Popularity
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)] overflow-y-auto">
                <div className="space-y-3">
                  {newMarkets.map((market, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <h4 className="font-medium text-sm mb-2 leading-tight">
                        {market.title}
                      </h4>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>{market.created}</span>
                        <span className="flex items-center">
                          <img
                            src="/usdc.png"
                            alt="USDC"
                            className="w-3 h-3 mr-1"
                          />
                          {market.volume}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {market.probability}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
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
