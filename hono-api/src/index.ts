import { Hono } from 'hono';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import childrenRouter from './routes/children';
import eventsRouter from './routes/events';
import checkinsRouter from './routes/checkins';
import announcementsRouter from './routes/announcements';
import prayersRouter from './routes/prayers';
import donationsRouter from './routes/donations';

const app = new Hono();

app.route('/auth', authRouter);
app.route('/users', usersRouter);
app.route('/children', childrenRouter);
app.route('/events', eventsRouter);
app.route('/checkins', checkinsRouter);
app.route('/announcements', announcementsRouter);
app.route('/prayers', prayersRouter);
app.route('/donations', donationsRouter);

app.get('/', (c) => c.json({ msg: 'API da Igreja - Online' }));

export default app;

// Para rodar localmente (Node.js)
if (require.main === module || process.env.NODE_ENV !== 'production') {
  import('hono/node-server').then(({ serve }) => {
    serve({ fetch: app.fetch, port: 3000 });
    console.log('Servidor rodando em http://localhost:3000');
  });
}
