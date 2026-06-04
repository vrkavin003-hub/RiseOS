import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const vercelClientUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const defaultClientUrl = nodeEnv === 'production' ? '' : 'http://127.0.0.1:5173';
const clientUrls = (process.env.CLIENT_URL || vercelClientUrl || defaultClientUrl)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const jwtSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret-change-me';

function buildProductionConfigIssues() {
  if (nodeEnv !== 'production') return [];

  const issues = [];
  const weakJwtSecret = jwtSecret.includes('change-me') || jwtSecret.length < 32;
  const weakRefreshSecret = jwtRefreshSecret.includes('change-me') || jwtRefreshSecret.length < 32;

  if (weakJwtSecret) {
    issues.push('JWT_SECRET must be set to a random value with at least 32 characters.');
  }

  if (weakRefreshSecret) {
    issues.push('JWT_REFRESH_SECRET must be set to a random value with at least 32 characters.');
  }

  if (!process.env.MONGO_URI) {
    issues.push('MONGO_URI is required in production.');
  }

  if (clientUrls.length === 0) {
    issues.push('CLIENT_URL is required in production, or VERCEL_URL must be provided by Vercel.');
  }

  return issues;
}

const productionConfigIssues = buildProductionConfigIssues();

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
  productionConfigIssues,
};
