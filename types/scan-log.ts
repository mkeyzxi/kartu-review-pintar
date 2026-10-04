import { Timestamp } from 'firebase/firestore';

export interface ScanLog {
  id: string;
  linkId: string;
  linkSlug: string;
  ipHash: string | null;
  userAgent: string | null;
  deviceType: 'desktop' | 'mobile' | 'tablet' | null;
  browser: string | null;
  referrer: string | null;
  status: 'valid' | 'duplicate';
  createdAt: Timestamp;
}

export interface CreateScanLogInput {
  linkId: string;
  linkSlug: string;
  ipHash?: string | null;
  userAgent?: string | null;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | null;
  browser?: string | null;
  referrer?: string | null;
  status?: 'valid' | 'duplicate';
}

export interface AnalyticsData {
  totalScans: number;
  todayScans: number;
  monthScans: number;
  chartLabels: string[];
  chartData: number[];
  topCards: TopCard[];
  recentScans: RecentScan[];
}

export interface TopCard {
  linkId: string;
  linkSlug: string;
  storeName: string | null;
  totalScan: number;
}

export interface RecentScan {
  id: string;
  linkId: string;
  linkSlug: string;
  storeName: string | null;
  deviceType: string | null;
  browser: string | null;
  status: string;
  createdAt: Timestamp;
}
