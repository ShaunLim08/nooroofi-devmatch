'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconSearch,
  IconFilter,
  IconTrendingUp,
  IconTrendingDown,
  IconCircle,
  IconChartLine,
  IconClock,
  IconUsers,
  IconBrain,
  IconSend,
  IconRobot,
  IconMicrophone,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const MarketCard = ({ market, index }) => {
  const isPositive = market.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {market.title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {market.description}
          </p>
        </div>
        <div className="flex items-center space-x-1 text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
          <IconCircle
            className={cn(
              'h-2 w-2',
              market.status === 'Active' ? 'text-green-500' : 'text-orange-500'
            )}
          />
          <span className="text-neutral-600 dark:text-neutral-300">
            {market.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            Current Price
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center">
            <img src="/usdc.png" alt="USDC" className="w-4 h-4 mr-1" />
            {market.price.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
            24h Change
          </div>
          <div
            className={cn(
              'text-xl font-bold flex items-center',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {isPositive ? (
              <IconTrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <IconTrendingDown className="h-4 w-4 mr-1" />
            )}
            {isPositive ? '+' : ''}
            {market.change.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center">
          <IconUsers className="h-3 w-3 text-neutral-400 mr-1" />
          <span className="text-neutral-500 dark:text-neutral-400">
            {market.participants}
          </span>
        </div>
        <div className="flex items-center">
          <IconChartLine className="h-3 w-3 text-neutral-400 mr-1" />
          <span className="text-neutral-500 dark:text-neutral-400 flex items-center">
            <img src="/usdc.png" alt="USDC" className="w-3 h-3 mr-1" />
            {market.volume}
          </span>
        </div>
        <div className="flex items-center">
          <IconClock className="h-3 w-3 text-neutral-400 mr-1" />
          <span className="text-neutral-500 dark:text-neutral-400">
            {market.timeLeft}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Probability
          </div>
          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {market.probability}%
          </div>
        </div>
        <div className="mt-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${market.probability}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatHistory = [
    {
      id: 1,
      type: 'user',
      message: 'What are the trending prediction markets right now?',
      timestamp: '2:30 PM',
    },
    {
      id: 2,
      type: 'assistant',
      message:
        'Based on The Graph data, I see strong activity in crypto predictions (Bitcoin $100K target) and political markets (US Election 2024). The Graph shows the Bitcoin market has 68% probability with $2.4M volume.',
      timestamp: '2:31 PM',
    },
    {
      id: 3,
      type: 'user',
      message: 'Which markets have the highest accuracy rates?',
      timestamp: '2:35 PM',
    },
    {
      id: 4,
      type: 'assistant',
      message:
        'From The Graph analytics, markets with longer time horizons show 94.2% average accuracy. The Graph data indicates climate agreement predictions (82% probability) and Tesla stock targets are performing well with consistent trader engagement.',
      timestamp: '2:36 PM',
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTyping(true);
      // Simulate AI response delay
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      setMessage('');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <IconBrain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              AI Market Analyst
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
              Powered by{' '}
              <img
                src="/thegraph.png"
                alt="The Graph"
                className="h-3 w-3 mx-1"
              />
              The Graph • Real-time insights
            </p>
          </div>
          <div className="ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              'flex',
              chat.type === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[80%] p-3 rounded-lg text-sm',
                chat.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none'
              )}
            >
              <p>{chat.message}</p>
              <p
                className={cn(
                  'text-xs mt-1 opacity-70',
                  chat.type === 'user'
                    ? 'text-blue-100'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
              >
                {chat.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ask about market trends, predictions, or analytics..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full p-3 pr-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-neutral-900 dark:text-neutral-100"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              <IconMicrophone className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <IconSend className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>💡 Try: "Analyze Bitcoin market trends"</span>
          <span>📊 "Show volume leaders"</span>
          <span>🎯 "Predict accuracy rates"</span>
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
      active
        ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
    )}
  >
    {children}
  </button>
);

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    'All',
    'Active',
    'Trending',
    'Sports',
    'Politics',
    'Crypto',
    'Technology',
  ];

  const markets = [
    {
      title: 'Bitcoin to reach $100,000 by 2024',
      description:
        'Will Bitcoin (BTC) reach or exceed $100,000 USD by December 31, 2024?',
      price: 45.5,
      change: 12.4,
      participants: '1.2K',
      volume: '245K',
      timeLeft: '45d',
      probability: 68,
      status: 'Active',
      category: 'Crypto',
    },
    {
      title: 'OpenAI GPT-5 Release Date',
      description: 'Will OpenAI release GPT-5 before June 2024?',
      price: 32.1,
      change: -5.2,
      participants: '890',
      volume: '156K',
      timeLeft: '12d',
      probability: 42,
      status: 'Active',
      category: 'Technology',
    },
    {
      title: 'US Presidential Election 2024',
      description: 'Who will win the 2024 US Presidential Election?',
      price: 67.8,
      change: 8.7,
      participants: '3.4K',
      volume: '1.2M',
      timeLeft: '89d',
      probability: 75,
      status: 'Active',
      category: 'Politics',
    },
    {
      title: 'Super Bowl 2024 Winner',
      description: 'Which team will win Super Bowl LVIII in 2024?',
      price: 28.9,
      change: -2.1,
      participants: '2.1K',
      volume: '456K',
      timeLeft: '67d',
      probability: 35,
      status: 'Active',
      category: 'Sports',
    },
    {
      title: 'Tesla Stock Price Target',
      description: 'Will Tesla (TSLA) stock reach $300 by end of 2024?',
      price: 52.4,
      change: 15.3,
      participants: '1.8K',
      volume: '389K',
      timeLeft: '78d',
      probability: 58,
      status: 'Trending',
      category: 'Technology',
    },
    {
      title: 'Climate Change Summit Agreement',
      description: 'Will a major climate agreement be signed at COP29?',
      price: 73.2,
      change: 4.6,
      participants: '756',
      volume: '123K',
      timeLeft: '156d',
      probability: 82,
      status: 'Active',
      category: 'Politics',
    },
  ];

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      market.category === activeFilter ||
      market.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white dark:from-neutral-900 dark:to-neutral-800 pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Prediction Markets
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Explore and analyze prediction markets across multiple platforms
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center mr-4">
              <IconFilter className="h-4 w-4 text-neutral-500 mr-2" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Filter:
              </span>
            </div>
            {filters.map((filter) => (
              <FilterButton
                key={filter}
                active={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Total Markets
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              247
            </div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +12 today
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Total Volume
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center">
              <img src="/usdc.png" alt="USDC" className="w-5 h-5 mr-1" />
              2.4M
            </div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +8.3%
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Active Traders
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              12.8K
            </div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +5.7%
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              Avg Accuracy
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              94.2%
            </div>
            <div className="text-xs text-green-500 flex items-center mt-1">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +1.2%
            </div>
          </div>
        </div>

        {/* Main Content - Markets and AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Markets */}
          <div className="lg:col-span-2">
            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMarkets.map((market, index) => (
                <MarketCard key={index} market={market} index={index} />
              ))}
            </div>

            {/* Empty State */}
            {filteredMarkets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-neutral-400 dark:text-neutral-600 mb-4">
                  <IconSearch className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No markets found
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>

          {/* Right Column - AI Assistant */}
          <div className="lg:col-span-1">
            <div className="sticky top-36">
              <AIAssistant />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
