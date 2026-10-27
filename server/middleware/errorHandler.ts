import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = Number(err?.status || err?.statusCode) || 500;
  if (statusCode >= 500) console.error("Server Error:", err);

  // 4xx messages are written for users; 5xx details stay in the logs in production
  const message =
    statusCode < 500 || process.env.NODE_ENV !== "production"
      ? err?.message || "İstek işlenemedi."
      : "Sunucuda beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";

  if (res.headersSent) return;
  res.status(statusCode).json({ error: message });
}
