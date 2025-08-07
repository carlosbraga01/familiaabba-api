import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users as usersTable } from '../db/schema';
import { hashPassword, verifyPassword as verifyPass } from '../utils/password';

export type User = typeof usersTable.$inferSelect;

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
  return result[0];
}

export async function createUser({ name, email, password }: { name: string; email: string; password: string }): Promise<User> {
  const hashed = hashPassword(password);
  const result = await db.insert(usersTable).values({ name, email, password: hashed, role: 'member' }).returning();
  return result[0];
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return verifyPass(plain, hashed);
}
