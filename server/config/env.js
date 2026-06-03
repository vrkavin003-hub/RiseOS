import dotenv from 'dotenv';

dotenv.config();

export const env = {
  clientUrl: process.env.CLIENT_URL || 'http://127.0.0.1:5173',
  emailPass: process.env.EMAIL_PASS || '',
  emailUser: process.env.EMAIL_USER || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret-change-me',
  jwtSecret: process.env.JWT_SECRET || 'dev-access-secret-change-me',
  mongoUri: process.env.MONGO_URI || '',
  newsApiKey: process.env.NEWS_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  port: Number(process.env.PORT || 5000),
};
