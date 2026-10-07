import { getAdminDb } from "@/lib/firebase/admin";
import { AnalyticsData, TopCard, RecentScan } from "@/types/scan-log";
import { Timestamp } from "firebase-admin/firestore";

const COLLECTION_NAME = "scanLogs";

// Cache untuk analytics data
const analyticsCache = new Map<string, { data: AnalyticsData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

/**
 * Retry mechanism untuk Firestore operations.
 * Index error (FAILED_PRECONDITION) tidak di-retry karena tidak akan sembuh sendiri.
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
    } catch (error: any) {
      lastError = error as Error;
      // Jangan retry untuk index/permission error — langsung lempar agar pesan jelas
      const msg = String(error?.message || "");
      const code = error?.code;
      if (code === 9 || code === "FAILED_PRECONDITION" || msg.includes("requires an index")) {
        throw error;
      }
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
 * Convert Firestore Timestamp (Admin SDK) / string / Date ke Date.
 * Index-free: semua filter tanggal dilakukan di memory.
 */
function toDateSafe(value: any): Date | null {
  if (!value) return null;
  try {
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === "object") {
      if (typeof value.toDate === "function") return value.toDate();
      if ("_seconds" in value) {
        return new Date(
          Number(value._seconds) * 1000 + Math.floor(Number(value._nanoseconds || 0) / 1000000)
        );
      }
      if ("seconds" in value) {
        return new Date(
          Number(value.seconds) * 1000 + Math.floor(Number(value.nanoseconds || 0) / 1000000)
        );
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** Convert ke ISO string untuk response JSON (hindari class instance di JSON). */
function toISOStringSafe(value: any): string | null {
  const d = toDateSafe(value);
  return d ? d.toISOString() : null;
}

/**
 * Get analytics data dengan caching dan retry mechanism
 */
export async function adminGetAnalyticsData(options: {
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
 * Internal function untuk fetch analytics data dari Firestore.
 *
 * SENGAJA tanpa composite index query:
 * - Hanya 1 query single-field `where('status','==','valid')` (tidak butuh index komposit).
 * - Semua filter tanggal, sort, top-cards, dan recent dihitung di memory.
 * Ini mencegah error 500 "The query requires an index" yang terjadi saat
 * menggabungkan `where(status)` + `where(createdAt range)` + `orderBy(createdAt)`.
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

  const db = getAdminDb();
  const collection = db.collection(COLLECTION_NAME);

  // Satu query single-field — tidak butuh composite index
  let allValid: Array<{ id: string; linkId: string; linkSlug: string; createdAt: any; deviceType: any; browser: any; status: any }> = [];
  try {
    const snapshot = await collection.where("status", "==", "valid").get();
    allValid = snapshot.docs.map((doc) => {
      const d: any = doc.data();
      return {
        id: doc.id,
        linkId: d.linkId ?? "",
        linkSlug: d.linkSlug ?? "",
        createdAt: d.createdAt ?? null,
        deviceType: d.deviceType ?? null,
        browser: d.browser ?? null,
        status: d.status ?? "valid",
      };
    });
  } catch (e: any) {
    console.error("[Analytics] Firestore fetch failed:", e?.message || e);
    throw new Error(
      "Gagal membaca data scan dari Firestore: " + (e?.message || "unknown error")
    );
  }

  const withDates = allValid
    .map((s) => ({ ...s, _date: toDateSafe(s.createdAt) }))
    .filter((s) => s._date !== null) as Array<(typeof allValid)[number] & { _date: Date }>;

  // Filter sesuai year/month/day di memory
  const inFilter = (d: Date): boolean => {
    if (year && d.getFullYear() !== year) return false;
    if (year && month && d.getMonth() + 1 !== month) return false;
    if (year && month && day && d.getDate() !== day) return false;
    // Jika user memilih bulan/tanggal tanpa tahun, abaikan filter longgar itu
    // (UI selalu mengirim year saat month/day dipilih — lihat analytics/page.tsx)
    return true;
  };
  const filtered = withDates.filter((s) => inFilter(s._date));

  const totalScans = filtered.length;

  // Today scans (dari full set, bukan dari filtered — konsisten dengan card "HARI INI")
  const todayStart = new Date(currentYear, currentMonth - 1, now.getDate());
  const todayEnd = new Date(currentYear, currentMonth - 1, now.getDate() + 1);
  const todayScans = withDates.filter(
    (s) => s._date >= todayStart && s._date < todayEnd
  ).length;

  // Month scans
  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 1);
  const monthScans = withDates.filter(
    (s) => s._date >= monthStart && s._date < monthEnd
  ).length;

  // Chart data (dari filtered set)
  const chartLabels: string[] = [];
  const chartData: number[] = [];

  if (year && month && day) {
    // Hourly chart untuk 1 hari
    for (let i = 0; i < 24; i++) {
      chartLabels.push(`${i.toString().padStart(2, "0")}:00`);
      chartData.push(0);
    }
    filtered.forEach((s) => {
      const h = s._date.getHours();
      if (h >= 0 && h < 24) chartData[h]++;
    });
  } else if (year && month) {
    // Daily chart untuk 1 bulan
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      chartLabels.push(i.toString());
      chartData.push(0);
    }
    filtered.forEach((s) => {
      const dom = s._date.getDate();
      if (dom >= 1 && dom <= daysInMonth) chartData[dom - 1]++;
    });
  } else if (year) {
    // Monthly chart untuk 1 tahun
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    for (let i = 0; i < 12; i++) {
      chartLabels.push(monthNames[i]);
      chartData.push(0);
    }
    filtered.forEach((s) => {
      chartData[s._date.getMonth()]++;
    });
  } else {
    // Default: 7 hari terakhir
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      chartLabels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));
      chartData.push(0);
    }
    filtered.forEach((s) => {
      const diffTime = now.getTime() - s._date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        chartData[6 - diffDays]++;
      }
    });
  }

  // Top cards — hitung dari filtered set, sort di memory (tanpa orderBy query)
  const linkScanCounts: Record<string, number> = {};
  const linkSlugById: Record<string, string> = {};
  filtered.forEach((s) => {
    if (!s.linkId) return;
    linkScanCounts[s.linkId] = (linkScanCounts[s.linkId] || 0) + 1;
    if (s.linkSlug) linkSlugById[s.linkId] = s.linkSlug;
  });

  const topCardIds = Object.entries(linkScanCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id]) => id);

  const topCards: TopCard[] = [];
  for (const linkId of topCardIds) {
    try {
      const linkDoc = await db.collection("links").doc(linkId).get();
      if (linkDoc.exists) {
        const linkData: any = linkDoc.data() || {};
        topCards.push({
          linkId,
          linkSlug: linkData.slug ?? linkSlugById[linkId] ?? linkId,
          storeName: linkData.storeName ?? null,
          totalScan: linkScanCounts[linkId] ?? 0,
        });
      } else {
        topCards.push({
          linkId,
          linkSlug: linkSlugById[linkId] ?? linkId,
          storeName: null,
          totalScan: linkScanCounts[linkId] ?? 0,
        });
      }
    } catch (e) {
      console.warn("[Analytics] Failed to resolve link", linkId, e);
    }
  }

  // Recent scans — sort di memory (tanpa orderBy query)
  const sorted = [...withDates].sort((a, b) => b._date.getTime() - a._date.getTime()).slice(0, 10);

  const recentScans: RecentScan[] = [];
  for (const s of sorted) {
    let storeName: string | null = null;
    try {
      if (s.linkId) {
        const linkDoc = await db.collection("links").doc(s.linkId).get();
        if (linkDoc.exists) {
          const linkData: any = linkDoc.data() || {};
          storeName = linkData.storeName ?? null;
        }
      }
    } catch (e) {
      console.warn("[Analytics] Failed to resolve recent link", s.linkId, e);
    }

    recentScans.push({
      id: s.id,
      linkId: s.linkId,
      linkSlug: s.linkSlug,
      storeName,
      deviceType: s.deviceType ?? null,
      browser: s.browser ?? null,
      status: s.status ?? "valid",
      // Kirim ISO string agar aman di JSON (bukan class Timestamp)
      createdAt: (toISOStringSafe(s.createdAt) ?? s._date.toISOString()) as any,
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
