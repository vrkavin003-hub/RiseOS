import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const clientUrls = (process.env.CLIENT_URL || 'http://127.0.0.1:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const jwtSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret-change-me';

if (nodeEnv === 'production') {
  const weakSecrets = [jwtSecret, jwtRefreshSecret].some((secret) => secret.includes('change-me') || secret.length < 32);
  if (weakSecrets) {
    throw new Error('Production JWT secrets must be set and at least 32 characters long.');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production.');
  }

  if (!process.env.CLIENT_URL) {
    throw new Error('CLIENT_URL is required in production.');
  }
}

export const env = {
  clientUrl: clientUrls[0],
  clientUrls,
  emailPass: process.env.EMAIL_PASS || '',
  emailUser: process.env.EMAIL_USER || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  isProduction: nodeEnv === 'production',
  jwtRefreshSecret,
  jwtSecret,
  mongoUri: process.env.MONGO_URI || '',
  newsApiKey: process.env.NEWS_API_KEY || '',
  nodeEnv,
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  port: Number(process.env.PORT || 5000),
};
