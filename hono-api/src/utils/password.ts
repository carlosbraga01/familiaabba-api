import { createHash, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hashed: string): boolean {
  const hash = hashPassword(password);
  return timingSafeEqual(Buffer.from(hash), Buffer.from(hashed));
}
