import { Hono, Context } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { checkins as checkinsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// Tipagem para o contexto
interface UserVars { id: string; role: string; }
type Ctx = Context<{ Variables: { user: UserVars } }>;

const checkinSchema = z.object({
  child_id: z.string(),
  event_id: z.string(),
});

const router = new Hono();
router.use('*', jwtMiddleware);

// Registrar checkin
router.post('/', async (c: Ctx) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const [checkin] = await db.insert(checkinsTable).values({
    ...parsed.data,
    timestamp: new Date().toISOString(),
    user_id: user.id,
  }).returning();
  return c.json(checkin, 201);
});

// Listar checkins por filho
router.get('/by_child/:child_id', async (c: Ctx) => {
  const user = c.get('user');
  const child_id = c.req.param('child_id');
  const list = await db.select().from(checkinsTable)
    .where(and(eq(checkinsTable.child_id, child_id), eq(checkinsTable.user_id, user.id)));
  return c.json(list);
});

// Listar checkins por evento (apenas admin)
router.get('/by_event/:event_id', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode ver todos os checkins' }, 403);
  const event_id = c.req.param('event_id');
  const list = await db.select().from(checkinsTable).where(eq(checkinsTable.event_id, event_id));
  return c.json(list);
});

export default router;
