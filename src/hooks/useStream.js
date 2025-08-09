// hooks/useNoorooStream.js
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SubstreamService } from '../lib/substream';

export function useNoorooStream(moduleConfig = {}) {
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [availableModules, setAvailableModules] = useState([]);
  const serviceRef = useRef(null);

  const {
    outputModule = 'map_transactions', // Replace with your actual module name
    startBlockNum = 'latest',
    walletAddresses = [],
    ...otherOptions
  } = moduleConfig;

  const handleData = useCallback((newData) => {
    console.log('Received Nooroo data:', newData);
    
    setData(prev => {
      if (newData.type === 'undo') {
        return prev.filter(item => item.blockNumber <= newData.lastValidBlock);
      } else {
        // Filter for wallet addresses if specified
        if (walletAddresses.length > 0 && newData.data) {
          const hasMatchingWallet = checkForWalletMatch(newData.data, walletAddresses);
          if (!hasMatchingWallet) return prev;
        }
        
        return [newData, ...prev.slice(0, 99)];
      }
    });
  }, [walletAddresses]);

  const handleError = useCallback((err) => {
    console.error('Nooroo stream error:', err);
    setError(err.message);
    setIsConnected(false);
  }, []);

  const handleProgress = useCallback((progressData) => {
    setProgress(progressData);
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      serviceRef.current = new SubstreamService();
      
      // Initialize to get available modules
      await serviceRef.current.initialize();
      
      // Extract module names for debugging
      if (serviceRef.current.pkg?.modules?.modules) {
        const modules = serviceRef.current.pkg.modules.modules.map(m => m.name);
        setAvailableModules(modules);
        console.log('Available Nooroo modules:', modules);
      }
      
      await serviceRef.current.startStream({
        outputModule,
        startBlockNum,
        onData: handleData,
        onError: handleError,
        onProgress: handleProgress,
        ...otherOptions
      });
      
      setIsConnected(true);
    } catch (err) {
      handleError(err);
    }
  }, [outputModule, startBlockNum, handleData, handleError, handleProgress, otherOptions]);

  const disconnect = useCallback(() => {
    if (serviceRef.current) {
    //   serviceRef.current.stop();
      serviceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    data,
    isConnected,
    error,
    progress,
    availableModules,
    connect,
    disconnect
  };
}

// Helper function to check if data contains tracked wallets
function checkForWalletMatch(data, walletAddresses) {
  if (!data || walletAddresses.length === 0) return true;
  
  // Adapt this based on your Nooroo data structure
  const dataStr = JSON.stringify(data).toLowerCase();
  return walletAddresses.some(wallet => 
    dataStr.includes(wallet.toLowerCase().replace('0x', ''))
  );
}