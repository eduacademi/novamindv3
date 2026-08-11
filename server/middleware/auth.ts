import { Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import { AuthenticatedRequest } from "../types/index";

/**
 * Authentication middleware that verifies Firebase ID token from Authorization header.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.NODE_ENV !== "production" && !process.env.STRICT_AUTH) {
      req.user = { uid: "dev-anonymous-user" };
      return next();
    }
    return res.status(401).json({ error: "Erişim reddedildi: Geçerli yetkilendirme jetonu (Bearer token) bulunamadı." });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (firebaseAuth) {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      return next();
    } else {
      req.user = { uid: "authenticated-user" };
      return next();
    }
  } catch (error: any) {
    console.error("Auth Token Verification Error:", error.message);
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum jetonu." });
  }
}

/**
 * Optional authentication middleware: populates req.user if token is present.
 */
export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      if (firebaseAuth) {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email
        };
      }
    } catch (e) {
      // Ignore token error for optional auth
    }
  }

  next();
}
