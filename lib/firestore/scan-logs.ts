import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ScanLog, CreateScanLogInput, AnalyticsData, TopCard, RecentScan } from '@/types/scan-log';

const COLLECTION_NAME = 'scanLogs';

// Cache untuk analytics data
const analyticsCache = new Map<string, { data: AnalyticsData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

/**
 * Retry mechanism untuk Firestore operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[withRetry] Attempt ${i + 1}/${maxRetries} failed:`, error);
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Create scan log
 */
export async function createScanLog(input: CreateScanLogInput): Promise<ScanLog> {
  const now = Timestamp.now();
  const docRef = doc(collection(db, COLLECTION_NAME));
  
  const logData = {
    linkId: input.linkId,
    linkSlug: input.linkSlug,
    ipHash: input.ipHash || null,
    userAgent: input.userAgent || null,
    deviceType: input.deviceType || null,
    browser: input.browser || null,
    referrer: input.referrer || null,
    status: input.status || 'valid',
    createdAt: now,
  };
  
  await setDoc(docRef, logData);
  
  return {
    id: docRef.id,
    ...logData,
  } as ScanLog;
}

/**
 * Check duplicate scan (dalam 10 detik terakhir)
 */
export async function isDuplicateScan(linkId: string, ipHash: string): Promise<boolean> {
  const tenSecondsAgo = Timestamp.fromDate(new Date(Date.now() - 10 * 1000));
  
  const constraints: QueryConstraint[] = [
    where('linkId', '==', linkId),
    where('ipHash', '==', ipHash),
    where('createdAt', '>=', tenSecondsAgo),
  ];
  
  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.size > 0;
}

/**
 * Get scan logs by link ID
 */
export async function getScanLogsByLinkId(linkId: string, limitCount: number = 100): Promise<ScanLog[]> {
  const constraints: QueryConstraint[] = [
    where('linkId', '==', linkId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  
  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ScanLog[];
}

/**
 * Get analytics data dengan caching dan retry mechanism
 */
export async function getAnalyticsData(options: {
  year?: number;
  month?: number;
  day?: number;
}): Promise<AnalyticsData> {
  const cacheKey = JSON.stringify(options);
  const cached = analyticsCache.get(cacheKey);
  
  // Return cached data jika masih valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Analytics] Returning cached data');
    return cached.data;
  }
  
  // Fetch fresh data dengan retry
  const data = await withRetry(async () => {
    return await fetchAnalyticsData(options);
  });
  
  // Simpan ke cache
  analyticsCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

/**
 * Clear analytics cache (dipanggil saat ada data baru)
 */
export function clearAnalyticsCache(): void {
  analyticsCache.clear();
  console.log('[Analytics] Cache cleared');
}

/**
 * Internal function untuk fetch analytics data dari Firestore
 */
async function fetchAnalyticsData(options: {
  year?: number;
  month?: number;
  day?: number;
}): Promise<AnalyticsData> {
  const { year, month, day } = options;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Base query untuk valid scans
  const baseConstraints: QueryConstraint[] = [where('status', '==', 'valid')];
  
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    baseConstraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    baseConstraints.push(where('createdAt', '<', Timestamp.fromDate(endDate)));
  }
  
  if (year && month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    baseConstraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    baseConstraints.push(where('createdAt', '<', Timestamp.fromDate(endDate)));
  }
  
  if (year && month && day) {
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(year, month - 1, day + 1);
    baseConstraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    baseConstraints.push(where('createdAt', '<', Timestamp.fromDate(endDate)));
  }
  
  const baseQuery = query(collection(db, COLLECTION_NAME), ...baseConstraints);
  const baseSnapshot = await getDocs(baseQuery);
  
  // Total scans
  const totalScans = baseSnapshot.size;
  
  // Today scans
  const todayStart = new Date(currentYear, currentMonth - 1, now.getDate());
  const todayEnd = new Date(currentYear, currentMonth - 1, now.getDate() + 1);
  const todayQuery = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'valid'),
    where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    where('createdAt', '<', Timestamp.fromDate(todayEnd))
  );
  const todaySnapshot = await getDocs(todayQuery);
  const todayScans = todaySnapshot.size;
  
  // Month scans
  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 1);
  const monthQuery = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'valid'),
    where('createdAt', '>=', Timestamp.fromDate(monthStart)),
    where('createdAt', '<', Timestamp.fromDate(monthEnd))
  );
  const monthSnapshot = await getDocs(monthQuery);
  const monthScans = monthSnapshot.size;
  
  // Chart data
  const chartLabels: string[] = [];
  const chartData: number[] = [];
  
  if (year && month && day) {
    // Hourly chart untuk 1 hari
    for (let i = 0; i < 24; i++) {
      chartLabels.push(`${i.toString().padStart(2, '0')}:00`);
      chartData.push(0);
    }
    
    baseSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const hour = data.createdAt.toDate().getHours();
      chartData[hour]++;
    });
  } else if (year && month) {
    // Daily chart untuk 1 bulan
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      chartLabels.push(i.toString());
      chartData.push(0);
    }
    
    baseSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const dayOfMonth = data.createdAt.toDate().getDate();
      chartData[dayOfMonth - 1]++;
    });
  } else if (year) {
    // Monthly chart untuk 1 tahun
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 0; i < 12; i++) {
      chartLabels.push(monthNames[i]);
      chartData.push(0);
    }
    
    baseSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const monthIndex = data.createdAt.toDate().getMonth();
      chartData[monthIndex]++;
    });
  } else {
    // Default: 7 hari terakhir
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      chartLabels.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));
      chartData.push(0);
    }
    
    baseSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const scanDate = data.createdAt.toDate();
      const diffTime = now.getTime() - scanDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        chartData[6 - diffDays]++;
      }
    });
  }
  
  // Top cards
  const topCardsQuery = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'valid'),
    orderBy('createdAt', 'desc'),
    limit(1000)
  );
  const topCardsSnapshot = await getDocs(topCardsQuery);
  
  const linkScanCounts: Record<string, number> = {};
  topCardsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    linkScanCounts[data.linkId] = (linkScanCounts[data.linkId] || 0) + 1;
  });
  
  const topCardIds = Object.entries(linkScanCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id]) => id);
  
  const topCards: TopCard[] = [];
  for (const linkId of topCardIds) {
    const linkDoc = await getDoc(doc(db, 'links', linkId));
    if (linkDoc.exists()) {
      const linkData = linkDoc.data();
      topCards.push({
        linkId,
        linkSlug: linkData.slug,
        storeName: linkData.storeName,
        totalScan: linkScanCounts[linkId],
      });
    }
  }
  
  // Recent scans
  const recentScansQuery = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'valid'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  const recentScansSnapshot = await getDocs(recentScansQuery);
  
  const recentScans: RecentScan[] = [];
  for (const scanDoc of recentScansSnapshot.docs) {
    const scanData = scanDoc.data();
    const linkDoc = await getDoc(doc(db, 'links', scanData.linkId));
    const linkData = linkDoc.exists() ? linkDoc.data() : {};
    
    recentScans.push({
      id: scanDoc.id,
      linkId: scanData.linkId,
      linkSlug: scanData.linkSlug,
      storeName: linkData.storeName || null,
      deviceType: scanData.deviceType,
      browser: scanData.browser,
      status: scanData.status,
      createdAt: scanData.createdAt,
    });
  }
  
  return {
    totalScans,
    todayScans,
    monthScans,
    chartLabels,
    chartData,
    topCards,
    recentScans,
  };
}
