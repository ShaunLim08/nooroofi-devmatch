// components/NoorooDashboard.jsx
'use client';
import { useState } from 'react';
import { useNoorooStream } from '@/hooks/useStream';

export default function NoorooDashboard() {
  const [selectedModule, setSelectedModule] = useState('map_transactions'); // Update with your module
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [newWallet, setNewWallet] = useState('');

  const { 
    data, 
    isConnected, 
    error, 
    progress, 
    availableModules 
  } = useNoorooStream({
    outputModule: selectedModule,
    walletAddresses: trackedWallets,
    startBlockNum: 'latest'
  });

  const addWallet = () => {
    if (newWallet.trim() && !trackedWallets.includes(newWallet.trim())) {
      setTrackedWallets([...trackedWallets, newWallet.trim()]);
      setNewWallet('');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nooroo Copy Trading Dashboard</h1>
      
      {/* Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-100">
        <div className="flex items-center gap-4 mb-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">Nooroo Stream: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        
        {progress && (
          <div className="text-sm text-gray-600">
            Processed Blocks: {progress.processedBlocks?.length || 0} | 
            Running Jobs: {progress.runningJobs?.length || 0}
          </div>
        )}
      </div>

      {/* Module Selection */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="font-bold mb-2">Available Nooroo Modules:</h3>
        <select 
          value={selectedModule} 
          onChange={(e) => setSelectedModule(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {availableModules.map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
      </div>

      {/* Wallet Management */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="font-bold mb-2">Track Wallets:</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            placeholder="Enter wallet address..."
            className="flex-1 p-2 border rounded"
          />
          <button onClick={addWallet} className="px-4 py-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
        
        <div className="space-y-1">
          {trackedWallets.map((wallet, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-sm">{wallet}</span>
              <button 
                onClick={() => setTrackedWallets(trackedWallets.filter((_, idx) => idx !== i))}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Display */}
      <div className="bg-white rounded-lg shadow">
        <h3 className="font-bold p-4 border-b">Live Nooroo Data ({data.length})</h3>
        <div className="max-h-96 overflow-y-auto">
          {data.map((item, index) => (
            <div key={index} className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-sm">Block #{item.blockNumber}</span>
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(item.data, null, 2)}
              </pre>
            </div>
          ))}
          
          {data.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Waiting for Nooroo data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}