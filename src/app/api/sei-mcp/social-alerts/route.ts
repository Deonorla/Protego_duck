// src/app/api/sei-mcp/social-alerts/route.ts
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

export async function GET(request: NextRequest) {
  try {
    if (!socialMonitor) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Social monitor not initialized',
          alerts: [] 
        },
        { status: 500 }
      );
    }

    const alerts = socialMonitor.getAlerts();
    
    return NextResponse.json({ 
      success: true, 
      alerts 
    });
  } catch (error) {
    console.error('Error fetching social alerts:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch social alerts',
        alerts: [] 
      },
      { status: 500 }
    );
  }
}
