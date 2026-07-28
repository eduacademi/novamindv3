import { GoogleGenAI } from "@google/genai";
import { Request } from "express";
import dotenv from "dotenv";

dotenv.config();

export const defaultAiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export function getAiClient(req: Request): GoogleGenAI {
  const customKey = req.headers["x-gemini-api-key"] as string;
  if (customKey) {
    return new GoogleGenAI({
      apiKey: customKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });
  }
  return defaultAiClient;
}
