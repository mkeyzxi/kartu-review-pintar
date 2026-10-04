import { Timestamp } from 'firebase/firestore';

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
  expiredAt: Timestamp | string | null;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
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
  expiredAt?: Timestamp | null;
}

export interface UpdateLinkInput {
  storeName?: string | null;
  label?: string | null;
  phoneNumber?: string | null;
  urlGmb?: string | null;
  isClaimed?: boolean;
  pinHash?: string | null;
  isSuspended?: boolean;
  expiredAt?: Timestamp | null;
}

export interface LinkWithStats extends Link {
  totalScans?: number;
  lastScanAt?: Timestamp | null;
}
