import { Hono, Context } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { events as eventsTable } from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';

// Tipagem para o contexto
interface UserVars { id: string; role: string; }
type Ctx = Context<{ Variables: { user: UserVars } }>;

const eventSchema = z.object({
  title: z.string().min(2),
  date: z.string(),
  category: z.string(),
  description: z.string()
});

const router = new Hono();
router.use('*', jwtMiddleware);

// Listar eventos (pode filtrar por data ou categoria via query)
router.get('/', async (c: Ctx) => {
  const { date, category } = c.req.query();
  let query = db.select().from(eventsTable);
  if (date && category) {
    query = query.where(and(gte(eventsTable.date, date), eq(eventsTable.category, category)));
  } else if (date) {
    query = query.where(gte(eventsTable.date, date));
  } else if (category) {
    query = query.where(eq(eventsTable.category, category));
  }
  const filtered = await query;
  return c.json(filtered);
});

// Criar evento (apenas admin)
router.post('/', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode criar evento' }, 403);
  const body = await c.req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const [event] = await db.insert(eventsTable).values(parsed.data).returning();
  return c.json(event, 201);
});

// Buscar evento por id
router.get('/:id', async (c: Ctx) => {
  const id = c.req.param('id');
  const result = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
  if (!result[0]) return c.json({ error: 'Evento não encontrado' }, 404);
  return c.json(result[0]);
});

// Atualizar evento (apenas admin)
router.put('/:id', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode editar evento' }, 403);
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const updated = await db.update(eventsTable).set(parsed.data).where(eq(eventsTable.id, id)).returning();
  if (!updated[0]) return c.json({ error: 'Evento não encontrado' }, 404);
  return c.json(updated[0]);
});

// Remover evento (apenas admin)
router.delete('/:id', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode remover evento' }, 403);
  const id = c.req.param('id');
  const deleted = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning();
  if (!deleted[0]) return c.json({ error: 'Evento não encontrado' }, 404);
  return c.body(null, 204);
});

export default router;
