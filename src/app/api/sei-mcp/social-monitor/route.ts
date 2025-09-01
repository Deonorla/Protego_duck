// src/app/api/sei-mcp/social-monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SocialMonitor } from '../../../../services/socialMonitor';

// Get global social monitor instance
let socialMonitor: SocialMonitor;

if (typeof globalThis !== 'undefined') {
  if (!(globalThis as any).socialMonitorInstance) {
    (globalThis as any).socialMonitorInstance = new SocialMonitor();
  }
  socialMonitor = (globalThis as any).socialMonitorInstance;
}

export async function POST(request: NextRequest) {
  try {
    if (!socialMonitor) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Social monitor not initialized' 
        },
        { status: 500 }
      );
    }

    const { platforms, keywords, groupIds } = await request.json();
    
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Platforms array is required' },
        { status: 400 }
      );
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    const monitoring = socialMonitor.startMonitoring(platforms, keywords, groupIds);
    
    console.log(`Started monitoring on platforms: ${platforms.join(', ')} for keywords: ${keywords.join(', ')}`);
    
    return NextResponse.json({ 
      success: true, 
      monitoring 
    });
  } catch (error) {
    console.error('Error starting social monitoring:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start social monitoring' 
      },
      { status: 500 }
    );
  }
}

// Additional endpoint: GET monitoring status
export async function GET(request: NextRequest) {
  try {
    if (!socialMonitor) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Social monitor not initialized',
          monitors: [] 
        },
        { status: 500 }
      );
    }

    const monitors = socialMonitor.getMonitoringStatus();
    
    return NextResponse.json({ 
      success: true, 
      monitors 
    });
  } catch (error) {
    console.error('Error fetching monitoring status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch monitoring status',
        monitors: [] 
      },
      { status: 500 }
    );
  }
}