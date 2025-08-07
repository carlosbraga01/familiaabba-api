import { Hono } from 'hono';
import { z } from 'zod';
import { sign } from '../utils/jwt';
import { createUser, findUserByEmail, verifyPassword } from '../services/userService';

const router = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4)
});

router.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos.' }, 400);
  }
  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password)) {
    return c.json({ error: 'Credenciais inválidas.' }, 401);
  }
  const token = sign({ sub: user.id, role: user.role });
  return c.json({ access_token: token, token_type: 'bearer' });
});

router.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos.' }, 400);
  }
  const { name, email, password } = parsed.data;
  const exists = await findUserByEmail(email);
  if (exists) {
    return c.json({ error: 'Email já cadastrado.' }, 400);
  }
  const user = await createUser({ name, email, password });
  return c.json(user, 201);
});

export default router;
