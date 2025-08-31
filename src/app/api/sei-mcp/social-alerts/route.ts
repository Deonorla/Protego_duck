// src/app/api/sei-mcp/social-alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';

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
