import { GoogleGenAI } from "@google/genai";
import { Request } from "express";
import dotenv from "dotenv";
import { apiKeyRouter } from "../services/apiKeyRouter";

dotenv.config();

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

  const nextKey = apiKeyRouter.getNextApiKey();
  if (!nextKey) return null;

  try {
    return new GoogleGenAI({
      apiKey: nextKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });
  } catch (err) {
    console.warn("⚠️ Failed to initialize GoogleGenAI with pool key:", err);
    return null;
  }
}

export { apiKeyRouter };
