// src/app/api/stream/route.js - Next.js 14 App Router streaming route
import { streamBlocks, createRegistry, createRequest } from '@substreams/core';
import { createGrpcTransport } from '@substreams/node';
import { readFileSync } from 'fs';
import path from 'path';

// Store active connections and wallet filters
const connections = new Set();
const walletFilters = new Set();

// Initialize Substream connection
let substreamConnection = null;
let isConnected = false;

async function initializeSubstream() {
  if (substreamConnection && isConnected) {
    return substreamConnection;
  }

  try {
    console.log('🔄 Initializing Substream connection...');
    
    const transport = createGrpcTransport({
      baseUrl: process.env.SUBSTREAMS_ENDPOINT || 'https://polygon.streamingfast.io:443',
      token: process.env.STREAMINGFAST_API_TOKEN,
      httpVersion: 2,
      requestTimeoutMs: 30000,
    });

    // Load the substream package file
    const packagePath = path.join(process.cwd(), 'nooroofi-substream', 'nooroo-v0.1.0.spkg');
    console.log('📦 Loading package from:', packagePath);
    
    const packageBuffer = readFileSync(packagePath);
    
    const request = createRequest({
      substreamPackage: packageBuffer,
      outputModule: 'map_events', // Start with just events first
      productionMode: true,
      startBlockNum: 0, // Start from recent blocks
      stopBlockNum: 0,  // Stream indefinitely
    });

    console.log('🚀 Starting Substream...');
    substreamConnection = streamBlocks(transport, request);
    
    substreamConnection.on('data', (data) => {
      console.log('📊 Received data:', data);
      isConnected = true;
      
      // Broadcast the data to all connected clients
      broadcastToAll({
        type: 'transaction',
        data: data
      });
    });
    
    substreamConnection.on('error', (error) => {
      console.error('❌ Substream error:', error);
      isConnected = false;
      // Broadcast error to all connections
      broadcastToAll({
        type: 'error',
        data: { message: error.message, timestamp: Date.now() }
      });
    });

    substreamConnection.on('close', () => {
      console.log('🔌 Substream connection closed');
      isConnected = false;
    });

    console.log('✅ Substream initialized successfully');
    isConnected = true;
    
    return substreamConnection;
  } catch (error) {
    console.error('❌ Failed to initialize Substream:', error);
    throw error;
  }
}

// Broadcast message to all connected clients
function broadcastToAll(message) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  connections.forEach(controller => {
    try {
      controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
}

// Filter transactions based on wallet addresses
function filterForWallets(data) {
  if (!data) return data;
  
  // If no filters are set, return all data
  if (walletFilters.size === 0) {
    return data;
  }

  // Log the data structure to understand what we're working with
  console.log('🔍 Filtering data:', JSON.stringify(data, null, 2));

  // The data structure will depend on your substream output
  // For now, let's return the data as-is and add filtering later
  return data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const walletParam = searchParams.get('wallets');
  
  // Parse wallet addresses from query parameter
  if (walletParam) {
    const wallets = walletParam.split(',').map(w => w.trim().toLowerCase());
    wallets.forEach(wallet => walletFilters.add(wallet));
  }

  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller);
      
      // Send initial connection message
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: 'init',
            data: {
              message: 'Connected to transaction stream',
              activeFilters: Array.from(walletFilters),
              timestamp: Date.now()
            }
          })}\n\n`
        )
      );

      // Initialize Substream if not already done
      initializeSubstream().then((substream) => {
        console.log('🎯 Substream initialized, waiting for data...');
        
        // The data events are already handled in initializeSubstream()
        // Just send a connected message
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'connected',
              data: { message: 'Substream ready', timestamp: Date.now() }
            })}\n\n`
          )
        );
      }).catch((error) => {
        console.error('❌ Failed to initialize:', error);
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'error',
              data: { message: `Failed to connect to Substream: ${error.message}`, timestamp: Date.now() }
            })}\n\n`
          )
        );
      });
    },
    
    cancel() {
      connections.delete(this.controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}