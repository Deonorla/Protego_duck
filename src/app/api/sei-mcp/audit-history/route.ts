// src/app/api/sei-mcp/audit-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ChainGPTClient } from '../../../../lib/chainGPT';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.CHAINGPT_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ChainGPT API key not configured' 
        },
        { status: 500 }
      );
    }

    const chainGPT = new ChainGPTClient({ apiKey: process.env.CHAINGPT_API_KEY });
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const history = await chainGPT.getChatHistory({
      limit,
      offset,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    
    return NextResponse.json({ 
      success: true, 
      history: history.rows || []
    });
  } catch (error) {
    console.error('Error fetching audit history:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch audit history',
        history: [] 
      },
      { status: 500 }
    );
  }
}