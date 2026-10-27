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

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    isAnonymous?: boolean;
  };
}
