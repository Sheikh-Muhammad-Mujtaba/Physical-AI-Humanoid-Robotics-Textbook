import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many authentication attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalAuthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to specific auth routes
app.use("/api/auth/sign-in", authLimiter);
app.use("/api/auth/sign-up", authLimiter);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount BetterAuth handler using app.use() which handles sub-routes properly
// This catches all routes under /api/auth/
const authHandler = toNodeHandler(auth);
app.use("/api/auth", generalAuthLimiter, (req, res, next) => {
  // BetterAuth handler
  authHandler(req, res);
});

// Mount express json middleware after BetterAuth
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

const server = app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
  console.log(`JWKS endpoint: http://localhost:${PORT}/api/auth/jwks`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});

// Handle server errors
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port and try again.`);
    // Don't exit immediately to prevent tsx watch restart loop
    setTimeout(() => process.exit(1), 5000);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  server.close(() => {
    process.exit(0);
  });
});
