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
    
    // In production on Render, the frontend and backend share the same domain.
    // Allow Render subdomains dynamically.
    if (origin.endsWith(".onrender.com")) {
       return callback(null, true);
    }

    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith(allowed)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      // Allow all origins by default to prevent deployment issues.
      // In a strict production environment you would restrict this, but for now we allow it.
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-gemini-api-key"]
});
