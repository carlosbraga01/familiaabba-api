import { Hono, Context } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { donations as donationsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

// Tipagem para o contexto
interface UserVars { id: string; role: string; }
type Ctx = Context<{ Variables: { user: UserVars } }>;

const donationSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(2)
});

const router = new Hono();
router.use('*', jwtMiddleware);

// Listar doações do usuário
router.get('/me', async (c: Ctx) => {
  const user = c.get('user');
  const list = await db.select().from(donationsTable).where(eq(donationsTable.user_id, user.id));
  return c.json(list);
});

// Listar todas as doações (admin)
router.get('/', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode ver todas as doações' }, 403);
  const list = await db.select().from(donationsTable);
  return c.json(list);
});

// Criar doação
router.post('/', async (c: Ctx) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = donationSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const [donation] = await db.insert(donationsTable).values({
    user_id: user.id,
    amount: parsed.data.amount,
    category: parsed.data.category,
    created_at: new Date().toISOString()
  }).returning();
  return c.json(donation, 201);
});

export default router;
