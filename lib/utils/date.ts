import { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore Timestamp or string to Date object
 */
export function toDate(value: string | Timestamp | null | undefined): Date | null {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value instanceof Timestamp) return value.toDate();
  return null;
}

/**
 * Convert Firestore Timestamp to ISO string for JSON serialization
 */
export function toISOString(value: string | Timestamp | null | undefined): string | null {
  const date = toDate(value);
  return date ? date.toISOString() : null;
}
