'use client';

import React, { useState } from 'react';
import { usePrivy, useLoginWithEmail } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconUser,
  IconWallet,
  IconLogin,
  IconLogout,
  IconMail,
  IconKey,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export default function PrivyLoginButton() {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout 
  } = usePrivy();
  
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Don't render anything if Privy is not ready
  if (!ready) {
    return (
      <Button variant="outline" disabled className="border-orange-200">
        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </Button>
    );
  }

  // If user is authenticated, show user info and logout
  if (authenticated && user) {
    return (
      <div className="flex items-center space-x-3">
        {/* User Info */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <IconUser className="h-4 w-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {user.email?.address || 'User'}
            </p>
            {user.wallet && (
              <p className="text-xs text-orange-600 dark:text-orange-400 font-mono">
                {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
              </p>
            )}
          </div>
          {user.wallet && (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <IconWallet className="h-3 w-3 mr-1" />
              Wallet
            </Badge>
          )}
        </div>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <IconLogout className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    );
  }

  // If not authenticated, show login options
  if (showEmailLogin) {
    return (
      <div className="flex items-center space-x-2">
        {!codeSent ? (
          // Email input phase
          <>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={async () => {
                  if (email) {
                    setIsLoading(true);
                    try {
                      await sendCode({ email });
                      setCodeSent(true);
                    } catch (error) {
                      console.error('Failed to send code:', error);
                    }
                    setIsLoading(false);
                  }
                }}
                disabled={!email || isLoading}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <IconMail className="h-4 w-4 mr-1" />
                    Send Code
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={() => setShowEmailLogin(false)}
              variant="outline"
              size="sm"
              className="border-neutral-200"
            >
              Cancel
            </Button>
          </>
        ) : (
          // Code input phase
          <>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="px-3 py-2 text-sm border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-36"
                disabled={isLoading}
                maxLength={6}
              />
              <Button
                onClick={async () => {
                  if (code) {
                    setIsLoading(true);
                    try {
                      await loginWithCode({ code });
                    } catch (error) {
                      console.error('Failed to login with code:', error);
                    }
                    setIsLoading(false);
                  }
                }}
                disabled={!code || isLoading}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <IconKey className="h-4 w-4 mr-1" />
                    Login
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={() => {
                setCodeSent(false);
                setCode('');
              }}
              variant="outline"
              size="sm"
              className="border-neutral-200"
            >
              Back
            </Button>
          </>
        )}
      </div>
    );
  }

  // Default login buttons
  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => setShowEmailLogin(true)}
        variant="outline"
        size="sm"
        className="border-orange-200 text-orange-600 hover:bg-orange-50"
      >
        <IconMail className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Email Login</span>
      </Button>
      <div className="flex items-center space-x-2">
        <Button
          onClick={login}
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <IconLogin className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Login</span>
        </Button>
        <img src="/privy.png" alt="Powered by Privy" className="h-6 w-auto" />
      </div>
    </div>
  );
}
