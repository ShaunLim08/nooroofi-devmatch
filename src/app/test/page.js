'use client';   

import { useState } from 'react';
import { useNoorooStream } from "@/hooks/useStream";

export default function NoorooDashboard() {
    const [selectedModule, setSelectedModule] = useState('map_events');
    
    const {
        data,
        isConnected,
        error,
        progress,
        availableModules
    } = useNoorooStream({
        outputModule: selectedModule, // Using selected module
        walletAddresses: ['0x23F56adFc8Ff61Ebe7cb1bFdE6ae86F6DCb8D64f'], // Example wallet addresses
        startBlockNum: 'latest'
    });

    // Debug logging
    console.log('Debug Info:', {
        selectedModule,
        data,
        isConnected,
        error,
        progress,
        availableModules
    });

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Substream Debug Dashboard</h1>
            
            {/* Module Selector */}
            <div className="bg-blue-50 p-4 rounded mb-4">
                <label className="block text-sm font-medium mb-2">Select Module:</label>
                <select 
                    value={selectedModule} 
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="map_events">map_events</option>
                    <option value="map_calls">map_calls</option>
                    <option value="map_events_calls">map_events_calls</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                    Current module: <code className="bg-gray-200 px-1 rounded">{selectedModule}</code>
                </p>
            </div>
            
            {/* Connection Status */}
            <div className={`p-4 mb-4 rounded ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                <h2 className="font-semibold">Status: {isConnected ? 'Connected' : 'Disconnected'}</h2>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Available Modules */}
            {availableModules && availableModules.length > 0 && (
                <div className="bg-blue-100 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-2">Available Modules:</h3>
                    <ul className="list-disc list-inside">
                        {availableModules.map((module, idx) => (
                            <li key={idx} className="text-sm">{module}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Progress Info */}
            {progress && (
                <div className="bg-yellow-100 p-4 rounded mb-4">
                    <h3 className="font-semibold mb-2">Progress:</h3>
                    <pre className="text-xs">{JSON.stringify(progress, null, 2)}</pre>
                </div>
            )}

            {/* Data Display */}
            <div className="bg-white border rounded">
                <h3 className="font-semibold p-4 border-b">Live Data ({data?.length || 0} items)</h3>
                <div className="max-h-96 overflow-y-auto">
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <div key={index} className="p-4 border-b">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-sm">Block: {item.blockNumber}</span>
                                    <span className="text-xs text-gray-500">
                                        {item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : 'No timestamp'}
                                    </span>
                                </div>
                                <details className="cursor-pointer">
                                    <summary className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        View Raw Data
                                    </summary>
                                    <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                                        {JSON.stringify(item.data, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            {isConnected ? 'Waiting for data...' : 'Not connected to stream'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}