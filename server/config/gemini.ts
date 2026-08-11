import { GoogleGenAI } from "@google/genai";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

let defaultAiClient: GoogleGenAI | null = null;

export function getDefaultAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!defaultAiClient) {
    try {
      defaultAiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("⚠️ Failed to initialize default GoogleGenAI client:", err);
      defaultAiClient = null;
    }
  }
  return defaultAiClient;
}

export function getAiClient(req?: Request): GoogleGenAI | null {
  const customKey = req?.headers?.["x-gemini-api-key"] as string;
  if (customKey) {
    try {
      return new GoogleGenAI({
        apiKey: customKey,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" },
        },
      });
    } catch (e) {
      console.warn("⚠️ Failed to initialize GoogleGenAI with custom key:", e);
    }
  }
  return getDefaultAiClient();
}
