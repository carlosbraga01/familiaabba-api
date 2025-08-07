import { sign as jwtSign, verify as jwtVerify } from 'jsonwebtoken';
import type { MiddlewareHandler } from 'hono';

const SECRET = process.env.JWT_SECRET || 'supersecret';
const EXPIRES_IN = '1h';

export function sign(payload: object) {
  return jwtSign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verify(token: string) {
  return jwtVerify(token, SECRET);
}

export const jwtMiddleware: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'Token não enviado' }, 401);
  }
  const token = auth.replace('Bearer ', '');
  try {
    const user = verify(token);
    c.set('user', user);
    await next();
  } catch {
    return c.json({ error: 'Token inválido ou expirado' }, 401);
  }
};
