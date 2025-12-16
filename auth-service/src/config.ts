import logger from './logging';

interface Config {
  NODE_ENV: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_ISSUER: string;
  BETTER_AUTH_JWKS_URL: string;
  PORT: number;
}

const getConfig = (): Config => {
  const errors: string[] = [];

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const DATABASE_URL = process.env.DATABASE_URL;
  const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
  const BETTER_AUTH_ISSUER = process.env.BETTER_AUTH_ISSUER;
  const BETTER_AUTH_JWKS_URL = process.env.BETTER_AUTH_JWKS_URL;
  const PORT = parseInt(process.env.PORT || '3000', 10);

  if (!DATABASE_URL) {
    errors.push('Missing environment variable: DATABASE_URL');
  }
  if (!BETTER_AUTH_SECRET) {
    errors.push('Missing environment variable: BETTER_AUTH_SECRET');
  }
  if (!BETTER_AUTH_ISSUER) {
    errors.push('Missing environment variable: BETTER_AUTH_ISSUER');
  }
  if (!BETTER_AUTH_JWKS_URL) {
    errors.push('Missing environment variable: BETTER_AUTH_JWKS_URL');
  }

  if (errors.length > 0) {
    errors.forEach(error => logger.error(error));
    throw new Error('Critical environment variables are missing. Please check your .env file or Vercel configuration.');
  }

  logger.info('All critical environment variables are loaded.');

  return {
    NODE_ENV,
    DATABASE_URL,
    BETTER_AUTH_SECRET,
    BETTER_AUTH_ISSUER,
    BETTER_AUTH_JWKS_URL,
    PORT,
  };
};

const config = getConfig();
export default config;
