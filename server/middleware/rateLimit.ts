import rateLimit from "express-rate-limit";

// General API Rate Limiter: Max 100 requests per minute
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin." }
});

// AI Service Rate Limiter: Max 20 AI requests per minute for non-premium
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI istek limitine ulaşıldı. Lütfen biraz bekleyin." }
});

// Scraping Rate Limiter: Max 30 requests per minute
export const metadataLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Metadata çekme limitine ulaşıldı. Lütfen daha sonra deneyin." }
});
