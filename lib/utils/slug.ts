import { randomBytes } from 'crypto';

/**
 * Generate random slug untuk kartu baru
 * @param length - Panjang slug (default: 8)
 * @returns Random slug string
 */
export function generateSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let slug = '';
  
  for (let i = 0; i < length; i++) {
    slug += chars[bytes[i] % chars.length];
  }
  
  return slug;
}

/**
 * Generate multiple unique slugs
 * @param count - Jumlah slug yang diperlukan
 * @param existingSlugs - Array slug yang sudah ada
 * @returns Array unique slugs
 */
export function generateUniqueSlugs(count: number, existingSlugs: string[] = []): string[] {
  const slugs: string[] = [];
  const attempts = count * 5;
  let attempt = 0;
  
  while (slugs.length < count && attempt < attempts) {
    const slug = generateSlug(8);
    attempt++;
    
    if (!slugs.includes(slug) && !existingSlugs.includes(slug)) {
      slugs.push(slug);
    }
  }
  
  return slugs;
}
