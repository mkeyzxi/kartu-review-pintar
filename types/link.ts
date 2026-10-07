// Using generic Timestamp type to avoid client SDK dependency in shared types
export type TimestampLike = {
  toDate?: () => Date;
  _seconds?: number;
  _nanoseconds?: number;
  seconds?: number;
  nanoseconds?: number;
} | string | Date | null;

export interface Link {
  id: string;
  slug: string;
  storeName: string | null;
  label: string | null;
  phoneNumber: string | null;
  urlGmb: string | null;
  isClaimed: boolean;
  pinHash: string | null;
  isSuspended: boolean;
  expiredAt: TimestampLike;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface CreateLinkInput {
  slug: string;
  storeName?: string | null;
  label?: string | null;
  phoneNumber?: string | null;
  urlGmb?: string | null;
  isClaimed?: boolean;
  pinHash?: string | null;
  isSuspended?: boolean;
  expiredAt?: TimestampLike;
}

export interface UpdateLinkInput {
  storeName?: string | null;
  label?: string | null;
  phoneNumber?: string | null;
  urlGmb?: string | null;
  isClaimed?: boolean;
  pinHash?: string | null;
  isSuspended?: boolean;
  expiredAt?: TimestampLike;
}

export interface LinkWithStats extends Link {
  totalScans?: number;
  lastScanAt?: TimestampLike;
}
