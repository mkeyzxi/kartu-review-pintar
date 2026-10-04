import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash PIN menggunakan bcrypt
 * @param pin - PIN plain text (4-6 digit)
 * @returns Hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify PIN terhadap hash
 * @param pin - PIN plain text
 * @param hash - Hashed PIN
 * @returns boolean
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
