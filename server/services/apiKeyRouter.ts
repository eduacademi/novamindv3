import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { Request } from "express";

export interface ManagedApiKey {
  id: string;
  key: string;
  label: string;
  isFree: boolean;
  isActive: boolean;
  status: "active" | "cooldown" | "exhausted" | "error";
  usageCount: number;
  errorCount: number;
  lastUsedAt?: number;
  cooldownUntil?: number;
  createdAt: number;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "server", "config", "admin_keys.json");

class ApiKeyRouterService {
  private keys: ManagedApiKey[] = [];
  private currentPointer = 0;
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failoverCount: 0,
    rateLimitCount: 0,
  };

  constructor() {
    this.loadKeysFromDisk();
  }

  private loadKeysFromDisk() {
    try {
      if (fs.existsSync(CONFIG_FILE_PATH)) {
        const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.keys)) {
          this.keys = parsed.keys;
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not load admin keys from disk:", e);
    }

    // Include env GEMINI_API_KEY if present and not already in pool
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && !this.keys.some((k) => k.key === envKey)) {
      this.keys.unshift({
        id: "env-default-key",
        key: envKey,
        label: "Sistem Varsayılan API Key (.env)",
        isFree: true,
        isActive: true,
        status: "active",
        usageCount: 0,
        errorCount: 0,
        createdAt: Date.now(),
      });
    }
  }

  private saveKeysToDisk() {
    try {
      const dir = path.dirname(CONFIG_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Save sanitized keys (masking middle characters for security)
      const dataToSave = {
        updatedAt: Date.now(),
        keys: this.keys,
      };
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (e) {
      console.warn("⚠️ Could not save admin keys to disk:", e);
    }
  }

  public getKeysPool(): Omit<ManagedApiKey, "key">[] & { maskedKey: string }[] {
    return this.keys.map((k) => ({
      id: k.id,
      label: k.label,
      isFree: k.isFree,
      isActive: k.isActive,
      status: this.getKeyStatus(k),
      usageCount: k.usageCount,
      errorCount: k.errorCount,
      lastUsedAt: k.lastUsedAt,
      cooldownUntil: k.cooldownUntil,
      createdAt: k.createdAt,
      maskedKey: k.key.length > 8 ? `${k.key.substring(0, 6)}...${k.key.substring(k.key.length - 4)}` : "********",
    }));
  }

  public getMetrics() {
    return {
      ...this.metrics,
      totalKeys: this.keys.length,
      activeKeysCount: this.getAvailableKeys().length,
      cooldownKeysCount: this.keys.filter((k) => this.getKeyStatus(k) === "cooldown").length,
    };
  }

  private getKeyStatus(k: ManagedApiKey): "active" | "cooldown" | "exhausted" | "error" {
    if (!k.isActive) return "exhausted";
    if (k.cooldownUntil && k.cooldownUntil > Date.now()) {
      return "cooldown";
    }
    return k.status === "error" ? "error" : "active";
  }

  public getAvailableKeys(): ManagedApiKey[] {
    const now = Date.now();
    return this.keys.filter((k) => k.isActive && (!k.cooldownUntil || k.cooldownUntil <= now));
  }

  /**
   * Returns a valid API Key from pool using round-robin rotation
   */
  public getNextApiKey(): string | null {
    const available = this.getAvailableKeys();
    if (available.length === 0) {
      return process.env.GEMINI_API_KEY || null;
    }

    this.currentPointer = this.currentPointer % available.length;
    const selectedKey = available[this.currentPointer];
    this.currentPointer = (this.currentPointer + 1) % available.length;

    selectedKey.lastUsedAt = Date.now();
    selectedKey.usageCount++;
    this.metrics.totalRequests++;

    return selectedKey.key;
  }

  /**
   * Marks a key as rate limited (HTTP 429) and puts it in cooldown
   */
  public markKeyRateLimited(rawKey: string, cooldownDurationMs = 5 * 60 * 1000) {
    const target = this.keys.find((k) => k.key === rawKey);
    if (target) {
      target.status = "cooldown";
      target.cooldownUntil = Date.now() + cooldownDurationMs;
      target.errorCount++;
      this.metrics.rateLimitCount++;
      this.metrics.failoverCount++;
      console.warn(`⏳ API Key (${target.label}) 429 Rate Limit'e takıldı. ${cooldownDurationMs / 1000}s soğutmaya alındı.`);
      this.saveKeysToDisk();
    }
  }

  /**
   * Marks a key as errored/invalid
   */
  public markKeyError(rawKey: string) {
    const target = this.keys.find((k) => k.key === rawKey);
    if (target) {
      target.errorCount++;
      if (target.errorCount >= 5) {
        target.status = "error";
      }
      this.saveKeysToDisk();
    }
  }

  /**
   * Add a new API Key into pool
   */
  public addKey(params: { key: string; label: string; isFree?: boolean }): ManagedApiKey {
    const trimmedKey = params.key.trim();
    const existing = this.keys.find((k) => k.key === trimmedKey);
    if (existing) {
      existing.label = params.label || existing.label;
      existing.isActive = true;
      existing.status = "active";
      existing.cooldownUntil = undefined;
      this.saveKeysToDisk();
      return existing;
    }

    const newKey: ManagedApiKey = {
      id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: trimmedKey,
      label: params.label || `Free API Key #${this.keys.length + 1}`,
      isFree: params.isFree ?? true,
      isActive: true,
      status: "active",
      usageCount: 0,
      errorCount: 0,
      createdAt: Date.now(),
    };

    this.keys.push(newKey);
    this.saveKeysToDisk();
    return newKey;
  }

  /**
   * Remove a key by ID
   */
  public removeKey(id: string): boolean {
    const initialLength = this.keys.length;
    this.keys = this.keys.filter((k) => k.id !== id);
    if (this.keys.length !== initialLength) {
      this.saveKeysToDisk();
      return true;
    }
    return false;
  }

  /**
   * Toggle active state of key
   */
  public toggleKeyActive(id: string): boolean {
    const target = this.keys.find((k) => k.id === id);
    if (target) {
      target.isActive = !target.isActive;
      if (target.isActive) {
        target.status = "active";
        target.cooldownUntil = undefined;
      }
      this.saveKeysToDisk();
      return true;
    }
    return false;
  }

  /**
   * Execute an AI operation with automatic failover across key pool
   */
  public async executeWithSmartRotation<T>(
    req: Request | undefined,
    fn: (aiClient: GoogleGenAI) => Promise<T>
  ): Promise<T> {
    // 1. If user provided their custom x-gemini-api-key in header, use it directly
    const userCustomKey = req?.headers?.["x-gemini-api-key"] as string;
    if (userCustomKey) {
      const customClient = new GoogleGenAI({
        apiKey: userCustomKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
      return await fn(customClient);
    }

    // 2. Otherwise rotate through pool keys
    const availableKeys = this.getAvailableKeys();
    if (availableKeys.length === 0) {
      const fallbackKey = process.env.GEMINI_API_KEY;
      if (!fallbackKey) {
        throw new Error("Aktif API Key bulunamadı. Lütfen Admin Paneli üzerinden yeni bir API Key ekleyin.");
      }
      const fallbackClient = new GoogleGenAI({
        apiKey: fallbackKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
      return await fn(fallbackClient);
    }

    let lastError: any = null;

    // Try up to 3 keys in pool
    const attempts = Math.min(availableKeys.length, 3);
    for (let i = 0; i < attempts; i++) {
      const apiKey = this.getNextApiKey();
      if (!apiKey) break;

      try {
        const client = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const result = await fn(client);
        this.metrics.successfulRequests++;
        return result;
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || err);
        const isRateLimit = errMessage.includes("429") || errMessage.includes("Quota") || errMessage.includes("EXHAUSTED");

        if (isRateLimit) {
          this.markKeyRateLimited(apiKey);
        } else {
          this.markKeyError(apiKey);
        }

        console.warn(`⚠️ API Key hatası alındı (${i + 1}/${attempts}), sonraki key deneniyor:`, errMessage);
      }
    }

    throw lastError || new Error("Tüm API Key'ler denendi ancak başarılı yanıt alınamadı.");
  }
}

export const apiKeyRouter = new ApiKeyRouterService();
