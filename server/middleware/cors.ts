import cors from "cors";

const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3000",
  "chrome-extension://" // browser extension support
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin SPA)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith(allowed)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      callback(new Error("CORS politikası gereği bu kökene izin verilmiyor."));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-gemini-api-key"]
});
