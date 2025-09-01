// src/lib/chainGPT.ts
import axios from 'axios';

interface ChainGPTConfig {
  apiKey: string;
  baseUrl?: string;
}

interface AuditRequest {
  contractCode?: string;
  contractAddress?: string;
  question?: string;
  chatHistory?: 'on' | 'off';
  sdkUniqueId?: string;
}

interface ChainGPTResponse {
  data: {
    bot: string;
  };
}

export class ChainGPTClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(config: ChainGPTConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.chaingpt.org';
  }

  async auditContract(request: AuditRequest): Promise<string> {
    try {
      // First, try the blob method for non-streaming response
      const question = request.question || 
        `Audit the following contract:\n${request.contractCode || `Contract at address: ${request.contractAddress}`}`;

      console.log('Sending request to ChainGPT API...');
      console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'NOT SET');

      const response = await axios.post(
        `${this.baseUrl}/chat/stream`,
        {
          model: 'smart_contract_auditor',
          question,
          chatHistory: request.chatHistory || 'off',
          sdkUniqueId: request.sdkUniqueId || `audit-${Date.now()}`
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000,
          responseType: 'stream'
        }
      );

      // Handle streaming response
      return new Promise((resolve, reject) => {
        let fullResponse = '';
        
        response.data.on('data', (chunk: Buffer) => {
          const chunkStr = chunk.toString();
          fullResponse += chunkStr;
          console.log('Received chunk:', chunkStr.substring(0, 100) + '...');
        });
        
        response.data.on('end', () => {
          console.log('Stream ended. Full response length:', fullResponse.length);
          resolve(fullResponse);
        });
        
        response.data.on('error', (error: Error) => {
          console.error('Stream error:', error);
          reject(error);
        });

        // Add timeout handling
        setTimeout(() => {
          reject(new Error('Request timeout after 2 minutes'));
        }, 120000);
      });
    } catch (error) {
      console.error('ChainGPT API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw new Error(`Failed to audit contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getChatHistory(options: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}) {
    try {
      const params = new URLSearchParams({
        limit: (options.limit || 10).toString(),
        offset: (options.offset || 0).toString(),
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'DESC'
      });

      const response = await axios.get(
        `${this.baseUrl}/chat/chatHistory?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      throw error;
    }
  }
}
