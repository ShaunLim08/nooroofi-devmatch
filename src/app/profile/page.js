'use client';

import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [surveyData, setSurveyData] = useState({
    preferredTags: [],
    riskProfile: '',
    usageIntent: '',
  });

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
