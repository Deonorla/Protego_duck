// src/app/api/sei-mcp/analyze-contract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ThreatAnalyzer } from '../../../../services/threatAnalyzer';

let threatAnalyzer: ThreatAnalyzer;

// Initialize analyzer with ChainGPT API key
if (process.env.CHAINGPT_API_KEY) {
  threatAnalyzer = new ThreatAnalyzer(process.env.CHAINGPT_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    if (!threatAnalyzer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ChainGPT API key not configured. Please set CHAINGPT_API_KEY environment variable.' 
        },
        { status: 500 }
      );
    }

    const { contractAddress, contractCode } = await request.json();
    
    if (!contractAddress && !contractCode) {
      return NextResponse.json(
        { success: false, error: 'Contract address or contract code is required' },
        { status: 400 }
      );
    }

    console.log(`Starting threat analysis for contract: ${contractAddress}`);
    
    const analysis = await threatAnalyzer.analyzeContract(contractAddress, contractCode);
    
    console.log(`Analysis completed. Threat level: ${analysis.threatLevel.level}, Security score: ${analysis.securityScore}`);
    
    return NextResponse.json({ 
      success: true, 
      analysis 
    });
  } catch (error) {
    console.error('Error analyzing contract:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze contract' 
      },
      { status: 500 }
    );
  }
}