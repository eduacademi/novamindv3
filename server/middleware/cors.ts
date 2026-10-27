import cors from "cors";

const allowedOrigins = new Set(
  [
    process.env.APP_URL,
    ...(process.env.ALLOWED_ORIGINS || "").split(","),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "http://localhost:3000",
    "http://localhost:5173",
  ]
    .map((o) => (o || "").trim().replace(/\/$/, ""))
    .filter(Boolean)
);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Same-origin requests (the SPA itself) send no Origin header
    if (!origin || allowedOrigins.has(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-gemini-api-key", "x-admin-secret"],
});
