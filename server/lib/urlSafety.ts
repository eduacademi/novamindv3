import dns from "dns/promises";
import net from "net";

/**
 * Guards the server-side scraper against SSRF: only public http(s) hosts may be fetched.
 */
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const lower = ip.toLowerCase();
  if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7));
  return (
    lower === "::" ||
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80") ||
    lower.startsWith("ff")
  );
}

export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw Object.assign(new Error("Geçersiz URL."), { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw Object.assign(new Error("Yalnızca http/https bağlantıları desteklenir."), { status: 400 });
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    throw Object.assign(new Error("Bu adrese erişim engellendi."), { status: 400 });
  }
  const addresses = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw Object.assign(new Error("Bu adrese erişim engellendi."), { status: 400 });
  }
  return parsed;
}

/**
 * fetch() that re-validates every redirect hop and caps the body size.
 */
export async function safeFetchText(
  url: string,
  init: RequestInit & { timeoutMs?: number; maxBytes?: number } = {}
): Promise<{ ok: boolean; status: number; text: string }> {
  const { timeoutMs = 6000, maxBytes = 1_500_000, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let current = url;
    for (let hop = 0; hop < 4; hop++) {
      await assertPublicUrl(current);
      const res = await fetch(current, { ...rest, redirect: "manual", signal: controller.signal });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        current = new URL(location, current).toString();
        continue;
      }
      if (!res.body) return { ok: res.ok, status: res.status, text: "" };
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        chunks.push(value);
        if (size >= maxBytes) {
          await reader.cancel().catch(() => {});
          break;
        }
      }
      return { ok: res.ok, status: res.status, text: Buffer.concat(chunks).toString("utf-8") };
    }
    return { ok: false, status: 310, text: "" };
  } finally {
    clearTimeout(timer);
  }
}
