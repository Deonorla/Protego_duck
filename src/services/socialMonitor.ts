// src/services/socialMonitor.ts
import { SocialAlert, MonitoringStatus, ThreatLevel } from '../types/threat';
import { v4 as uuidv4 } from 'uuid';

export class SocialMonitor {
  private activeMonitors: Map<string, MonitoringStatus> = new Map();
  private alerts: SocialAlert[] = [];

  startMonitoring(platforms: string[], keywords: string[], groupIds?: string[]): MonitoringStatus {
    const monitorId = uuidv4();
    const status: MonitoringStatus = {
      id: monitorId,
      platforms,
      keywords,
      groupIds,
      isActive: true,
      startedAt: new Date().toISOString(),
      alertsGenerated: 0
    };

    this.activeMonitors.set(monitorId, status);
    
    // Simulate monitoring (in real implementation, this would connect to social media APIs)
    this.simulateMonitoring(monitorId);
    
    return status;
  }

  getAlerts(): SocialAlert[] {
    return this.alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getMonitoringStatus(): MonitoringStatus[] {
    return Array.from(this.activeMonitors.values());
  }

  stopMonitoring(monitorId: string): boolean {
    const monitor = this.activeMonitors.get(monitorId);
    if (monitor) {
      monitor.isActive = false;
      return true;
    }
    return false;
  }

  private simulateMonitoring(monitorId: string): void {
    const monitor = this.activeMonitors.get(monitorId);
    if (!monitor || !monitor.isActive) return;

    // Simulate finding suspicious social media activity
    const suspiciousPatterns = [
      'pump and dump detected',
      'suspicious wallet activity mentioned',
      'coordinated shilling campaign',
      'fake project promotion',
      'rug pull warning signals'
    ];

    setInterval(() => {
      if (!monitor.isActive) return;

      // Random chance of finding something suspicious
      if (Math.random() < 0.3) {
        const pattern = suspiciousPatterns[Math.floor(Math.random() * suspiciousPatterns.length)];
        const alert: SocialAlert = {
          id: uuidv4(),
          platform: monitor.platforms[Math.floor(Math.random() * monitor.platforms.length)],
          content: `Detected: ${pattern}. Keywords: ${monitor.keywords.join(', ')}`,
          timestamp: new Date().toISOString(),
          threatLevel: this.generateRandomThreatLevel(),
          keywords: monitor.keywords,
          confidence: Math.floor(Math.random() * 40) + 60,
          source: `@suspicious_user_${Math.floor(Math.random() * 1000)}`
        };

        this.alerts.push(alert);
        monitor.alertsGenerated++;
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
          this.alerts = this.alerts.slice(-100);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private generateRandomThreatLevel(): ThreatLevel {
    const levels: ThreatLevel['level'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    
    const scoreRanges = {
      LOW: [10, 30],
      MEDIUM: [31, 60],
      HIGH: [61, 85],
      CRITICAL: [86, 100]
    };
    
    const range = scoreRanges[level];
    const score = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    
    return {
      level,
      score,
      confidence: Math.floor(Math.random() * 30) + 70
    };
  }
}