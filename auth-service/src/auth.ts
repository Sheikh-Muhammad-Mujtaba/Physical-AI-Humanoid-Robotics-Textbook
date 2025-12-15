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

// Debug logging (only log non-sensitive info)
console.log('Auth service starting...');
console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Database configured:', !!connectionString);
console.log('Trusted origins:', process.env.FRONTEND_URL || 'http://localhost:3000 (default)');

// Use the same DATABASE_URL as FastAPI backend (Neon PostgreSQL)
const pool = new Pool({
  connectionString: connectionString,
});

// Parse trusted origins from environment variable or use defaults
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

// Always include the production frontend
const PRODUCTION_FRONTEND = "https://ai-spec-driven.vercel.app";
const trustedOrigins = envOrigins.includes(PRODUCTION_FRONTEND)
  ? envOrigins
  : [...envOrigins, PRODUCTION_FRONTEND];

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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },
  advanced: {
    useSecureCookies: isProduction,
    cookiePrefix: "better-auth",
    // Cross-origin cookie settings for separate auth domain
    crossSubDomainCookies: {
      enabled: false, // Different domains, not subdomains
    },
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax", // "none" required for cross-origin in production
      secure: isProduction, // Must be secure when sameSite is "none"
      httpOnly: true,
      path: "/",
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
