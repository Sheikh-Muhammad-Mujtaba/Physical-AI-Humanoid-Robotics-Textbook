import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Check if using Neon (cloud) database - requires SSL
const isNeonDb = process.env.DATABASE_URL?.includes("neon.tech");

let connectionString = process.env.DATABASE_URL;
if (isNeonDb && !connectionString?.includes('sslmode=require')) {
  connectionString = `${connectionString}?sslmode=require`;
}

console.log('DATABASE_URL:', connectionString);
console.log('isNeonDb:', isNeonDb);
console.log('Trusted origins:', process.env.FRONTEND_URL || 'http://localhost:3000 (default)');

// Use the same DATABASE_URL as FastAPI backend (Neon PostgreSQL)
const pool = new Pool({
  connectionString: connectionString,
});

// Parse trusted origins from environment variable or use defaults
const trustedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

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
