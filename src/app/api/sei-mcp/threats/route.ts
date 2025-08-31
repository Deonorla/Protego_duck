// src/app/api/sei-mcp/threats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SocialMonitor } from '../../../../services/socialMonitor';

// Global instance to maintain state across requests
let socialMonitor: SocialMonitor;

if (typeof globalThis !== 'undefined') {
  if (!globalThis.socialMonitorInstance) {
    globalThis.socialMonitorInstance = new SocialMonitor();
  }
  socialMonitor = globalThis.socialMonitorInstance;
}

export async function GET(request: NextRequest) {
  try {
    if (!socialMonitor) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Social monitor not initialized',
          threats: [] 
        },
        { status: 500 }
      );
    }

    const alerts = socialMonitor.getAlerts();
    
    // Transform alerts to match threat format
    const threats = alerts.map(alert => ({
      id: alert.id,
      type: 'SOCIAL_MEDIA',
      severity: alert.threatLevel.level,
      description: alert.content,
      timestamp: alert.timestamp,
      source: alert.platform,
      confidence: alert.confidence,
      metadata: {
        keywords: alert.keywords,
        platform: alert.platform,
        user: alert.source
      }
    }));
    
    return NextResponse.json({ 
      success: true, 
      threats 
    });
  } catch (error) {
    console.error('Error fetching threats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch threats',
        threats: [] 
      },
      { status: 500 }
    );
  }
}
