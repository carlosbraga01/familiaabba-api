import { Hono, Context } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { prayers as prayersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

// Tipagem para o contexto
interface UserVars { id: string; role: string; }
type Ctx = Context<{ Variables: { user: UserVars } }>;

const prayerSchema = z.object({
  content: z.string().min(2),
  anonymous: z.boolean().optional()
});

const statusSchema = z.object({
  status: z.enum(['pending', 'praying', 'answered'])
});

const router = new Hono();
router.use('*', jwtMiddleware);

// Criar pedido de oração
router.post('/', async (c: Ctx) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = prayerSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const [prayer] = await db.insert(prayersTable).values({
    content: parsed.data.content,
    user_id: parsed.data.anonymous ? null : user.id,
    status: 'pending',
    created_at: new Date().toISOString()
  }).returning();
  return c.json(prayer, 201);
});

// Listar pedidos (admin)
router.get('/', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode ver todos os pedidos' }, 403);
  const list = await db.select().from(prayersTable);
  return c.json(list);
});

// Atualizar status do pedido (admin)
router.patch('/:id', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode atualizar status' }, 403);
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Status inválido' }, 400);
  const updated = await db.update(prayersTable).set({ status: parsed.data.status }).where(eq(prayersTable.id, id)).returning();
  if (!updated[0]) return c.json({ error: 'Pedido não encontrado' }, 404);
  return c.json(updated[0]);
});

export default router;
