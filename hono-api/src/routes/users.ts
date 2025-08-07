import { Hono, Context } from 'hono';
import { jwtMiddleware } from '../utils/jwt';
import { db } from '../db/client';
import { users as usersTable } from '../db/schema';

// Tipagem para o usuário no contexto
interface UserPayload {
  id: string;
  name?: string;
  email?: string;
  role: string;
}

type Ctx = Context<{ Variables: { user: UserPayload } }>;

const router = new Hono();

router.use('*', jwtMiddleware);

router.get('/', async (c: Ctx) => {
  // Apenas admin pode listar todos
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acesso negado' }, 403);
  }
  const all = await db.select().from(usersTable);
  return c.json(all);
});

router.get('/me', (c: Ctx) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Não autenticado' }, 401);
  return c.json(user);
});

export default router;
