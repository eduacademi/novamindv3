import { Request } from "express";

export interface ScrapedMetadata {
  url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  author: string | null;
  platform: string;
  metadata_source: "auto" | "manual";
}

export interface InferredCategory {
  category: string;
  tags: string[];
}

export interface ExtensionQueueItem {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  author: string | null;
  platform: string;
  note: string;
  tags: string[];
  category: string | null;
  metadata_source: string;
  created_at: number;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}
