import { Hono, Context } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { children as childrenTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// Tipagem para o contexto
interface UserVars { id: string; role: string; }
type Ctx = Context<{ Variables: { user: UserVars } }>;

const childSchema = z.object({
  name: z.string().min(2),
  birthdate: z.string(),
});

const router = new Hono();
router.use('*', jwtMiddleware);

// Listar filhos do usuário autenticado
router.get('/me', async (c: Ctx) => {
  const user = c.get('user');
  const result = await db.select().from(childrenTable).where(eq(childrenTable.user_id, user.id));
  return c.json(result);
});

// Criar filho
router.post('/', async (c: Ctx) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = childSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const [child] = await db.insert(childrenTable).values({ ...parsed.data, user_id: user.id }).returning();
  return c.json(child, 201);
});

// Buscar filho por id
router.get('/:id', async (c: Ctx) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const result = await db.select().from(childrenTable).where(and(eq(childrenTable.id, id), eq(childrenTable.user_id, user.id)));
  if (!result[0]) return c.json({ error: 'Filho não encontrado' }, 404);
  return c.json(result[0]);
});

// Atualizar filho
router.put('/:id', async (c: Ctx) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = childSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const updated = await db.update(childrenTable)
    .set(parsed.data)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.user_id, user.id)))
    .returning();
  if (!updated[0]) return c.json({ error: 'Filho não encontrado' }, 404);
  return c.json(updated[0]);
});

// Remover filho
router.delete('/:id', async (c: Ctx) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const deleted = await db.delete(childrenTable)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.user_id, user.id)))
    .returning();
  if (!deleted[0]) return c.json({ error: 'Filho não encontrado' }, 404);
  return c.body(null, 204);
});

export default router;
