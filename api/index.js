import app from '../server/app.js';
import { connectDB } from '../server/config/db.js';

let connectionPromise = null;

function shouldSkipDatabase(req) {
  return req.method === 'GET' && req.url?.startsWith('/api/health');
}

function ensureDatabase() {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

export default async function handler(req, res) {
  try {
    if (!shouldSkipDatabase(req)) {
      await ensureDatabase();
    }

    return app(req, res);
  } catch (error) {
    console.error('Vercel API bootstrap failed', error);
    return res.status(500).json({
      message: 'RiseOS API startup failed. Check MongoDB and production environment variables.',
    });
  }
}
