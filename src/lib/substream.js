// lib/substream.js
import {
  createAuthInterceptor,
  createRequest,
  streamBlocks,
  fetchSubstream,
  createRegistry,
  unpackMapOutput,
  isEmptyMessage
} from '@substreams/core';

import { createConnectTransport } from "@connectrpc/connect-web";

export class SubstreamService {
  constructor() {
    this.endpoint = process.env.NEXT_PUBLIC_SUBSTREAM_ENDPOINT;
    this.token = process.env.NEXT_PUBLIC_SUBSTREAM_TOKEN;
    this.packageUrl = process.env.NEXT_PUBLIC_SUBSTREAM_PACKAGE;
    this.pkg = null;
    this.registry = null;
    this.transport = null;
    this.cursor = null;
  }

  async initialize() {
    try {
      console.log('Loading Nooroo package from:', this.packageUrl);
      
      // Fetch your local package
      this.pkg = await fetchSubstream(this.packageUrl);
      this.registry = createRegistry(this.pkg);

      // Debug: Log your available modules
      if (this.pkg.modules?.modules) {
        console.log('Available Nooroo modules:', 
          this.pkg.modules.modules.map(m => ({
            name: m.name,
            kind: m.kind,
            output: m.output?.type
          }))
        );
      }

      this.transport = createConnectTransport({
        baseUrl: this.endpoint,
        interceptors: [createAuthInterceptor(this.token)],
        useBinaryFormat: true,
        jsonOptions: { typeRegistry: this.registry }
      });

      console.log('Nooroo Substreams service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Nooroo Substreams:', error);
      throw error;
    }
  }

  async startStream(options = {}) {
    if (!this.pkg || !this.transport) {
      await this.initialize();
    }

    const {
      outputModule, // Your Nooroo module name
      startBlockNum = 'latest',
      stopBlockNum = undefined,
      onData = () => {},
      onError = () => {},
      onProgress = () => {},
      params = undefined
    } = options;

    console.log(`Starting Nooroo stream with module: ${outputModule}`);

    const request = createRequest({
      substreamPackage: this.pkg,
      outputModule,
      productionMode: true,
      startBlockNum,
      stopBlockNum,
      startCursor: this.cursor || undefined,
      ...(params && { params })
    });

    try {
      for await (const statefulResponse of streamBlocks(this.transport, request)) {
        if (statefulResponse.response) {
          await this.handleResponseMessage(statefulResponse.response, onData, onError);
        }

        if (statefulResponse.progress) {
          this.handleProgressMessage(statefulResponse.progress, onProgress);
        }
      }
    } catch (error) {
      console.error('Nooroo streaming error:', error);
      onError(error);
      
      // Auto-reconnect after 5 seconds
      setTimeout(() => this.startStream(options), 5000);
    }
  }

  async handleResponseMessage(response, onData, onError) {
    switch (response.message.case) {
      case 'blockScopedData':
        const blockData = response.message.value;
        this.cursor = blockData.cursor;
        
        for (const output of blockData.outputs) {
          if (!isEmptyMessage(output)) {
            try {
              const decodedOutput = unpackMapOutput(output, this.registry);
              onData({
                type: 'blockData',
                blockNumber: blockData.blockNumber,
                cursor: blockData.cursor,
                timestamp: blockData.timestamp,
                data: decodedOutput
              });
            } catch (err) {
              console.error('Error unpacking Nooroo output:', err);
            }
          }
        }
        break;

      case 'blockUndoSignal':
        const undoSignal = response.message.value;
        this.cursor = undoSignal.lastValidCursor;
        onData({
          type: 'undo',
          lastValidBlock: undoSignal.lastValidBlock,
          cursor: undoSignal.lastValidCursor
        });
        break;
    }
  }

  handleProgressMessage(progress, onProgress) {
    onProgress({
      runningJobs: progress.runningJobs || [],
      processedBlocks: progress.processedBlocks || [],
      traceId: progress.traceId
    });
  }
}