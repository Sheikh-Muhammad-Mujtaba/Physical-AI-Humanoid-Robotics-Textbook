import logger from './logging.js';
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions"; // Import attachDatabasePool

// Only load dotenv in development (not needed on Vercel - uses env vars directly)
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {
    // dotenv not available, using environment variables directly
  }
}

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Check if using Neon (cloud) database - requires SSL
const isNeonDb = process.env.DATABASE_URL?.includes("neon.tech");

let connectionString = process.env.DATABASE_URL;
if (isNeonDb && connectionString && !connectionString.includes('sslmode=require')) {
  connectionString = `${connectionString}?sslmode=require`;
}

// Debug logging for environment variables (only log presence of secrets, not values)
function logEnvironmentVariables() {
  logger.info('--- Environment Variables Check (Auth Service) ---');
  logger.info(`DATABASE_URL is set: ${!!process.env.DATABASE_URL}`);
  logger.info(`BETTER_AUTH_SECRET is set: ${!!process.env.BETTER_AUTH_SECRET}, length: ${process.env.BETTER_AUTH_SECRET?.length || 0}`);
  logger.info(`BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL || 'Not set, using http://localhost:3001'}`);
  logger.info(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set, using http://localhost:3000 (default)'}`);
  logger.info(`API_BASE_URL: ${process.env.API_BASE_URL || 'Not set, using http://localhost:8000'}`);
  logger.info(`GOOGLE_CLIENT_ID is set: ${!!process.env.GOOGLE_CLIENT_ID}`);
  logger.info(`GOOGLE_CLIENT_SECRET is set: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
  logger.info(`GITHUB_CLIENT_ID is set: ${!!process.env.GITHUB_CLIENT_ID}`);
  logger.info(`GITHUB_CLIENT_SECRET is set: ${!!process.env.GITHUB_CLIENT_SECRET}`);
  logger.info('--------------------------------------------------');
}

// Call the logging function at startup
logEnvironmentVariables();


// Use the same DATABASE_URL as FastAPI backend (Neon PostgreSQL)
const pool = new Pool({
  connectionString: connectionString,
  idleTimeoutMillis: 5000, // Configure a low idle timeout (5 seconds)
  ssl: isNeonDb && !isProduction ? { rejectUnauthorized: false } : (isNeonDb ? true : false), // Add conditional SSL config
});

// Attach the pool to ensure idle connections close before suspension
attachDatabasePool(pool);

// Explicit PostgreSQL connection test
async function testPgConnection() {
  try {
    const client = await pool.connect();
    client.release();
    logger.info('PostgreSQL connection to DATABASE_URL successful.');
  } catch (error: unknown) { // Explicitly type error as unknown
    if (error instanceof Error) {
        logger.error(`Failed to connect to PostgreSQL at DATABASE_URL: ${error.message}`);
    } else {
        logger.error(`Failed to connect to PostgreSQL at DATABASE_URL: ${String(error)}`);
    }
    // Optionally re-throw or exit process if DB connection is critical for startup
    // process.exit(1); 
  }
}
testPgConnection();

// Parse trusted origins from environment variable
// FRONTEND_URL can be comma-separated for multiple origins
const frontendOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

// Get backend API URL
const backendApiUrl = process.env.API_BASE_URL || "http://localhost:8000";

// Get auth service URL
const authServiceUrl = process.env.BETTER_AUTH_URL || "http://localhost:3001";

// Build list of trusted origins (no hardcoded values)
const trustedOrigins = [
  ...frontendOrigins,
  backendApiUrl,
  authServiceUrl,
].filter((origin, index, self) =>
  // Remove duplicates
  self.indexOf(origin) === index
);

logger.info(`[AUTH] Trusted origins: ${trustedOrigins.join(', ')}`);

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: authServiceUrl,
  trustedOrigins: trustedOrigins,
  log: logger.info, // Integrate custom logger
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  // Social login providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  // Account configuration to handle cross-origin OAuth
  account: {
    // Skip state cookie check for cross-origin OAuth (state cookies are blocked by browsers)
    // This is necessary when frontend and auth service are on different domains
    // WARNING: This has security implications - only enable for cross-origin setups
    skipStateCookieCheck: isProduction, // Only skip in production where domains differ
    accountLinking: {
      enabled: true,
    },
  },
  rateLimit: {
    enabled: false, // Disable rate limiting to avoid 401 errors during token fetching
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  advanced: {
    crossDomain: true,
    useSecureCookies: isProduction,
    cookiePrefix: "better-auth",
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax", // "none" required for cross-origin in production
      secure: isProduction, // Must be secure when sameSite is "none"
      httpOnly: true,
      path: "/",
      partitioned: isProduction, // CRITICAL: Required for Chrome to accept cross-site cookies
    },
  },
  plugins: [
    bearer(),
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519",
        },
      },
      jwt: {
        expirationTime: "15m",
        issuer: process.env.BETTER_AUTH_URL || "http://localhost:3001",
        audience: process.env.API_BASE_URL || "http://localhost:8000",
      },
    }),
  ],
});

logger.info('BetterAuth handler initialized successfully.');
