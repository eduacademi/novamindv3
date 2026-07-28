import { Request, Response, NextFunction } from "express";

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Global Server Error:", err);

  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" 
    ? "Sunucuda beklenmeyen bir hata oluştu." 
    : (err.message || "İç Sunucu Hatası");

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
}
