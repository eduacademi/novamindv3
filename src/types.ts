export type Platform = 
 | "youtube" 
 | "tiktok" 
 | "instagram" 
 | "threads" 
 | "pinterest" 
 | "x" 
 | "reddit" 
 | "article" 
 | "poem"
 | "document"
 | "note"
 | "other";

export interface Card {
 id: string;
 url: string;
 platform: Platform;
 title: string | null;
 description: string | null;
 thumbnail_url: string | null;
 author: string | null;
 category: string | null;
 note: string;
 tags: string[];
 metadata_source: "auto" | "manual";
 created_at: number;
 is_favorite?: boolean;
}

export interface ShoppingItem {
 id: string;
 name: string;
 quantity: string | null;
 note: string | null;
 is_checked: boolean;
 source_url: string | null;
 created_at: number;
}

export interface ReminderItem {
 id: string;
 title: string;
 due_date: string; // YYYY-MM-DD
 due_time?: string; // HH:mm
 priority?: "high" | "normal" | "low";
 note?: string;
 card_id?: string;
 card_title?: string;
 is_completed: boolean;
 created_at: number;
}

export interface MindMapNode {
 id: string;
 label: string;
 category?: string;
 summary?: string;
 cardIds: string[];
 children?: MindMapNode[];
 color?: string;
}

export interface MindMapData {
 root: MindMapNode;
 generated_at: number;
 total_cards_analyzed: number;
}

export interface IdeaResult {
 id: string;
 title: string;
 concept: string;
 targetAudience: string;
 sourceCardIds: string[];
 sourceCardTitles?: string[];
 actionSteps: string[];
 potentialTags: string[];
 created_at: number;
}

export interface UrlMetadata {
 title: string | null;
 description: string | null;
 thumbnail_url: string | null;
 author: string | null;
 platform: Platform;
 metadata_source: "auto" | "manual";
}
