import { getAdminDb } from "@/lib/firebase/admin";
import { ScanLog, CreateScanLogInput } from "@/types/scan-log";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const COLLECTION_NAME = "scanLogs";

/**
 * Create scan log
 */
export async function adminCreateScanLog(input: CreateScanLogInput): Promise<ScanLog> {
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION_NAME).doc();
  const now = FieldValue.serverTimestamp();
  
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
  
  await docRef.set(logData);
  
  return {
    id: docRef.id,
    ...logData,
  } as unknown as ScanLog;
}

/**
 * Check duplicate scan (dalam 10 detik terakhir)
 */
export async function adminIsDuplicateScan(linkId: string, ipHash: string): Promise<boolean> {
  const db = getAdminDb();
  const tenSecondsAgo = Timestamp.fromDate(new Date(Date.now() - 10 * 1000));
  
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('linkId', '==', linkId)
    .where('ipHash', '==', ipHash)
    .where('createdAt', '>=', tenSecondsAgo)
    .get();
  
  return snapshot.size > 0;
}

/**
 * Get scan logs by link ID
 */
export async function adminGetScanLogsByLinkId(linkId: string, limitCount: number = 100): Promise<ScanLog[]> {
  const db = getAdminDb();
  
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('linkId', '==', linkId)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ScanLog[];
}
