import { Hono, Context } from 'hono';
import { z } from 'zod';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { announcements as announcementsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

// Tipagem para o contexto
interface UserVars { id: string; role: string; }
type Ctx = Context<{ Variables: { user: UserVars } }>;

const announcementSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2)
});

const router = new Hono();
router.use('*', jwtMiddleware);

// Listar avisos (ordem decrescente)
router.get('/', async (c: Ctx) => {
  const list = await db.select().from(announcementsTable).orderBy(announcementsTable.created_at.desc());
  return c.json(list);
});

// Criar aviso (apenas admin)
router.post('/', async (c: Ctx) => {
  const user = c.get('user');
  if (user.role !== 'admin') return c.json({ error: 'Apenas admin pode criar aviso' }, 403);
  const body = await c.req.json();
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Dados inválidos' }, 400);
  const [announcement] = await db.insert(announcementsTable).values({
    ...parsed.data,
    created_at: new Date().toISOString()
  }).returning();
  return c.json(announcement, 201);
});

// Buscar aviso por id
router.get('/:id', async (c: Ctx) => {
  const id = c.req.param('id');
  const result = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
  if (!result[0]) return c.json({ error: 'Aviso não encontrado' }, 404);
  return c.json(result[0]);
});

export default router;
