import { auth } from "./firebase";

export const BYOK_STORAGE_KEY = "x-gemini-api-key";

function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem(BYOK_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/** Waits briefly for Firebase to restore the session so the first requests carry a token. */
async function getIdToken(): Promise<string | null> {
  if (!auth.currentUser) {
    await Promise.race([
      auth.authStateReady(),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
  }
  try {
    return (await auth.currentUser?.getIdToken()) || null;
  } catch {
    return null;
  }
}

/**
 * fetch() for our own /api routes: adds the Firebase ID token and the user's own
 * Gemini key (BYOK) when set.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = await getIdToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const byok = getStoredGeminiKey();
  if (byok) headers.set("x-gemini-api-key", byok);
  else headers.delete("x-gemini-api-key");

  return fetch(input, { ...init, headers });
}

/** Reads `{ error }` from a failed response, with a readable fallback. */
export async function readApiError(res: Response, fallback = "İşlem başarısız oldu."): Promise<string> {
  try {
    const data = await res.clone().json();
    return data?.error || fallback;
  } catch {
    return res.status === 429 ? "Çok fazla istek gönderildi, biraz bekleyip tekrar dene." : fallback;
  }
}
