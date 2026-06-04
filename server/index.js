import http from 'node:http';
import cron from 'node-cron';
import mongoose from 'mongoose';
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
    origin: env.clientUrls,
  },
});

registerSocket(io);

await connectDB();

const newsJob = cron.schedule('*/30 * * * *', async () => {
  try {
    await refreshNews();
  } catch (error) {
    console.error('News refresh failed', error.message);
  }
});

server.listen(env.port, () => {
  console.log(`RiseOS AI API listening on port ${env.port}`);
});

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Closing RiseOS AI API.`);
  newsJob.stop();
  io.close();

  server.close(async (error) => {
    if (error) {
      console.error('HTTP server shutdown failed', error);
      process.exit(1);
    }

    try {
      await mongoose.disconnect();
      process.exit(0);
    } catch (disconnectError) {
      console.error('MongoDB shutdown failed', disconnectError);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
