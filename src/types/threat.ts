// src/types/threat.ts
export interface ThreatLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  confidence: number;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  line?: number;
  function?: string;
  recommendation: string;
  cwe?: string; // Common Weakness Enumeration
}

export interface ContractAnalysis {
  contractAddress: string;
  auditId: string;
  timestamp: string;
  threatLevel: ThreatLevel;
  vulnerabilities: Vulnerability[];
  summary: string;
  gasOptimizations: string[];
  securityScore: number;
  recommendations: string[];
}

export interface SocialAlert {
  id: string;
  platform: string;
  content: string;
  timestamp: string;
  threatLevel: ThreatLevel;
  keywords: string[];
  confidence: number;
  source: string;
}

export interface MonitoringStatus {
  id: string;
  platforms: string[];
  keywords: string[];
  groupIds?: string[];
  isActive: boolean;
  startedAt: string;
  alertsGenerated: number;
}