// src/services/threatAnalyzer.ts
import { ChainGPTClient } from '../lib/chainGPT';
import { ContractAnalysis, Vulnerability, ThreatLevel } from '../types/threat';
import { v4 as uuidv4 } from 'uuid';

export class ThreatAnalyzer {
  private chainGPT: ChainGPTClient;
  
  constructor(apiKey: string) {
    this.chainGPT = new ChainGPTClient({ apiKey });
  }

  async analyzeContract(contractAddress: string, contractCode?: string): Promise<ContractAnalysis> {
    try {
      const auditResponse = await this.chainGPT.auditContract({
        contractAddress,
        contractCode,
        chatHistory: 'on',
        sdkUniqueId: `audit-${contractAddress}-${Date.now()}`
      });

      return this.parseAuditResponse(contractAddress, auditResponse);
    } catch (error) {
      throw new Error(`Contract analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAuditResponse(contractAddress: string, auditText: string): ContractAnalysis {
    // Parse the ChainGPT audit response and extract structured data
    const vulnerabilities = this.extractVulnerabilities(auditText);
    const threatLevel = this.calculateThreatLevel(vulnerabilities);
    const gasOptimizations = this.extractGasOptimizations(auditText);
    const recommendations = this.extractRecommendations(auditText);
    
    return {
      contractAddress,
      auditId: uuidv4(),
      timestamp: new Date().toISOString(),
      threatLevel,
      vulnerabilities,
      summary: this.extractSummary(auditText),
      gasOptimizations,
      securityScore: this.calculateSecurityScore(vulnerabilities),
      recommendations
    };
  }

  private extractVulnerabilities(auditText: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    
    // Pattern matching for common vulnerability indicators
    const patterns = [
      { keyword: 'reentrancy', severity: 'HIGH' as const, cwe: 'CWE-841' },
      { keyword: 'overflow', severity: 'MEDIUM' as const, cwe: 'CWE-190' },
      { keyword: 'underflow', severity: 'MEDIUM' as const, cwe: 'CWE-191' },
      { keyword: 'access control', severity: 'HIGH' as const, cwe: 'CWE-284' },
      { keyword: 'unchecked call', severity: 'MEDIUM' as const, cwe: 'CWE-252' },
      { keyword: 'denial of service', severity: 'HIGH' as const, cwe: 'CWE-400' },
      { keyword: 'front-running', severity: 'MEDIUM' as const, cwe: 'CWE-362' },
      { keyword: 'timestamp manipulation', severity: 'LOW' as const, cwe: 'CWE-829' }
    ];

    patterns.forEach(pattern => {
      if (auditText.toLowerCase().includes(pattern.keyword)) {
        vulnerabilities.push({
          id: uuidv4(),
          title: `${pattern.keyword.toUpperCase()} Vulnerability`,
          description: `Potential ${pattern.keyword} vulnerability detected in contract`,
          severity: pattern.severity,
          recommendation: `Review and mitigate ${pattern.keyword} risks`,
          cwe: pattern.cwe
        });
      }
    });

    return vulnerabilities;
  }

  private calculateThreatLevel(vulnerabilities: Vulnerability[]): ThreatLevel {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;

    let level: ThreatLevel['level'];
    let score: number;

    if (criticalCount > 0) {
      level = 'CRITICAL';
      score = Math.min(100, 80 + (criticalCount * 5));
    } else if (highCount > 0) {
      level = 'HIGH';
      score = Math.min(79, 60 + (highCount * 5));
    } else if (mediumCount > 0) {
      level = 'MEDIUM';
      score = Math.min(59, 30 + (mediumCount * 3));
    } else {
      level = 'LOW';
      score = Math.max(0, 30 - vulnerabilities.length);
    }

    return {
      level,
      score,
      confidence: Math.min(100, 70 + (vulnerabilities.length * 2))
    };
  }

  private extractGasOptimizations(auditText: string): string[] {
    const optimizations: string[] = [];
    const gasKeywords = [
      'gas optimization',
      'gas efficiency',
      'reduce gas',
      'optimize storage',
      'pack variables'
    ];

    gasKeywords.forEach(keyword => {
      if (auditText.toLowerCase().includes(keyword)) {
        optimizations.push(`Consider ${keyword} improvements`);
      }
    });

    return optimizations;
  }

  private extractRecommendations(auditText: string): string[] {
    const recommendations: string[] = [];
    
    // Extract recommendations from audit text
    const lines = auditText.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('should') ||
          line.toLowerCase().includes('consider')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private extractSummary(auditText: string): string {
    // Extract first few sentences as summary
    const sentences = auditText.split(/[.!?]+/);
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }

  private calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
    const weights = {
      CRITICAL: -25,
      HIGH: -15,
      MEDIUM: -8,
      LOW: -3,
      INFO: -1
    };

    let score = 100;
    vulnerabilities.forEach(vuln => {
      score += weights[vuln.severity] || 0;
    });

    return Math.max(0, Math.min(100, score));
  }
}