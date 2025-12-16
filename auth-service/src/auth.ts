import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

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
  console.log('--- Environment Variables Check (Auth Service) ---');
  console.log(`DATABASE_URL is set: ${!!process.env.DATABASE_URL}`);
  console.log(`BETTER_AUTH_SECRET is set: ${!!process.env.BETTER_AUTH_SECRET}`);
  console.log(`BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL || 'Not set, using http://localhost:3001'}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set, using http://localhost:3000 (default)'}`);
  console.log(`API_BASE_URL: ${process.env.API_BASE_URL || 'Not set, using http://localhost:8000'}`);
  console.log(`GOOGLE_CLIENT_ID is set: ${!!process.env.GOOGLE_CLIENT_ID}`);
  console.log(`GOOGLE_CLIENT_SECRET is set: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
  console.log(`GITHUB_CLIENT_ID is set: ${!!process.env.GITHUB_CLIENT_ID}`);
  console.log(`GITHUB_CLIENT_SECRET is set: ${!!process.env.GITHUB_CLIENT_SECRET}`);
  console.log('--------------------------------------------------');
}

// Call the logging function at startup
logEnvironmentVariables();


// Use the same DATABASE_URL as FastAPI backend (Neon PostgreSQL)
const pool = new Pool({
  connectionString: connectionString,
});

// Parse trusted origins from environment variable or use defaults
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

// Always include the production frontend and backend API
const PRODUCTION_FRONTEND = "https://ai-spec-driven.vercel.app";
const BACKEND_API_URL = process.env.API_BASE_URL || "http://localhost:8000";

// Build list of trusted origins
const trustedOrigins = [
  ...envOrigins,
  PRODUCTION_FRONTEND,
  BACKEND_API_URL,
  // Also trust the auth service itself for internal calls
  process.env.BETTER_AUTH_URL || "http://localhost:3001"
].filter((origin, index, self) =>
  // Remove duplicates
  self.indexOf(origin) === index
);

console.log('[AUTH] Trusted origins:', trustedOrigins);

// Get the primary frontend URL for OAuth redirects
// Use first FRONTEND_URL or fall back to production
const primaryFrontendUrl = envOrigins[0] || PRODUCTION_FRONTEND;

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  trustedOrigins: trustedOrigins,
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  advanced: {
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
