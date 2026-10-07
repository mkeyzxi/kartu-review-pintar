/**
 * Convert Firestore Timestamp or string to Date object
 * Works with both client SDK Timestamp and Admin SDK Timestamp
 */
export function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  // Firestore Timestamp (client or admin SDK)
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  // Serialized Timestamp object (_seconds, _nanoseconds)
  if (typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
    return new Date(value._seconds * 1000 + value._nanoseconds / 1000000);
  }
  // Alternative format (seconds, nanoseconds)
  if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
  }
  return null;
}

/**
 * Convert Firestore Timestamp to ISO string for JSON serialization
 */
export function toISOString(value: any): string | null {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}
