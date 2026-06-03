import http from 'node:http';
import cron from 'node-cron';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { registerSocket } from './services/realtime.js';
import { refreshNews } from './services/newsService.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
    origin: env.clientUrl,
  },
});

registerSocket(io);

await connectDB();

cron.schedule('*/30 * * * *', async () => {
  try {
    await refreshNews();
  } catch (error) {
    console.error('News refresh failed', error.message);
  }
});

server.listen(env.port, () => {
  console.log(`RiseOS AI API listening on http://127.0.0.1:${env.port}`);
});
