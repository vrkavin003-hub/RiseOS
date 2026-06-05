import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultClientUrl = nodeEnv === 'production' ? '' : 'http://127.0.0.1:5173';

function toUrl(value) {
  const url = value?.trim();
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function normalizeOrigin(value) {
  const url = toUrl(value);
  if (!url) return '';

  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}

function inferVercelProductionOrigin(value) {
  const origin = normalizeOrigin(value);
  if (!origin) return '';

  const hostname = new URL(origin).hostname;
  if (!hostname.endsWith('.vercel.app')) return '';

  const deploymentSlug = hostname.replace(/\.vercel\.app$/, '');
  const projectSlug = deploymentSlug.includes('-git-') ? deploymentSlug.split('-git-')[0] : deploymentSlug;
  if (!projectSlug) return '';

  return `https://${projectSlug}.vercel.app`;
}

const configuredClientUrls = (process.env.CLIENT_URL || defaultClientUrl)
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const vercelClientUrls = [
  normalizeOrigin(process.env.VERCEL_URL),
  normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  inferVercelProductionOrigin(process.env.VERCEL_URL),
].filter(Boolean);

const clientUrls = Array.from(new Set([...configuredClientUrls, ...vercelClientUrls]));
const jwtSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-refresh-secret-change-me';
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || '';

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

  if (!mongoUri) {
    issues.push('MONGO_URI, MONGODB_URI, or DATABASE_URL is required in production.');
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
  mongoUri,
  newsApiKey: process.env.NEWS_API_KEY || '',
  nodeEnv,
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  port: Number(process.env.PORT || 5000),
  productionConfigIssues,
};
