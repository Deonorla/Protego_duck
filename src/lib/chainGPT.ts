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
      const question = request.question || 
        `Perform a comprehensive security audit of the following smart contract. 
         Focus on identifying vulnerabilities, security issues, gas optimizations, and provide severity ratings:
         ${request.contractCode || `Contract at address: ${request.contractAddress}`}`;

      const response = await axios.post(
        `${this.baseUrl}/chat/stream`,
        {
          model: 'smart_contract_auditor',
          question,
          chatHistory: request.chatHistory || 'off',
          sdkUniqueId: request.sdkUniqueId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2 minutes timeout for complex audits
        }
      );

      // Handle streaming response
      return new Promise((resolve, reject) => {
        let fullResponse = '';
        
        response.data.on('data', (chunk: Buffer) => {
          fullResponse += chunk.toString();
        });
        
        response.data.on('end', () => {
          resolve(fullResponse);
        });
        
        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('ChainGPT API Error:', error);
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