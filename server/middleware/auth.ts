import { Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import { AuthenticatedRequest } from "../types/index";

const isProd = process.env.NODE_ENV === "production";

function getBearer(req: AuthenticatedRequest): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

/**
 * Verifies the Firebase ID token. In local development (no STRICT_AUTH) a missing
 * token falls back to a single dev user so the app works without Firebase setup.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getBearer(req);

  if (!token) {
    if (!isProd && !process.env.STRICT_AUTH) {
      req.user = { uid: "dev-anonymous-user", isAnonymous: true };
      return next();
    }
    return res.status(401).json({ error: "Oturum bulunamadı. Lütfen sayfayı yenileyin veya giriş yapın." });
  }

  if (!firebaseAuth) {
    return res.status(503).json({ error: "Kimlik doğrulama servisi yapılandırılmamış." });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      isAnonymous: decoded.firebase?.sign_in_provider === "anonymous",
    };
    return next();
  } catch (error: any) {
    console.warn("Auth token verification failed:", error?.code || error?.message);
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum. Lütfen sayfayı yenileyin." });
  }
}
