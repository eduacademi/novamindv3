import { Platform } from "../types";

export interface EmbedInfo {
  type: "youtube" | "tiktok" | "instagram" | "threads" | "spotify" | "x" | "image_preview";
  embedUrl: string | null;
  aspectClass: string;
}

export function getEmbedInfo(url: string, platform: Platform): EmbedInfo {
  if (!url) {
    return { type: "image_preview", embedUrl: null, aspectClass: "aspect-video" };
  }

  const cleanUrl = url.trim();

  // 1. YouTube
  if (platform === "youtube" || cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    let videoId: string | null = null;
    
    // Check watch?v=
    const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) videoId = watchMatch[1];

    // Check youtu.be/
    if (!videoId) {
      const shortMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortMatch) videoId = shortMatch[1];
    }

    // Check shorts/
    if (!videoId) {
      const shortsMatch = cleanUrl.match(/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) videoId = shortsMatch[1];
    }

    // Check embed/
    if (!videoId) {
      const embedMatch = cleanUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) videoId = embedMatch[1];
    }

    if (videoId) {
      return {
        type: "youtube",
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`,
        aspectClass: "aspect-video w-full rounded-2xl overflow-hidden shadow-lg"
      };
    }
  }

  // 2. TikTok
  if (platform === "tiktok" || cleanUrl.includes("tiktok.com")) {
    const videoIdMatch = cleanUrl.match(/\/video\/([0-9]+)/) || cleanUrl.match(/\/v\/([0-9]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return {
        type: "tiktok",
        embedUrl: `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`,
        aspectClass: "w-full max-w-[350px] mx-auto h-[550px] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
      };
    }
  }

  // 3. Instagram
  if (platform === "instagram" || cleanUrl.includes("instagram.com")) {
    const postMatch = cleanUrl.match(/instagram\.com\/(?:p|reel|reels|tv|share\/p|share\/reel)\/([a-zA-Z0-9_-]+)/i);
    if (postMatch && postMatch[1]) {
      return {
        type: "instagram",
        embedUrl: `https://www.instagram.com/p/${postMatch[1]}/embed/captioned/`,
        aspectClass: "w-full max-w-[440px] mx-auto h-[540px] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
      };
    }
  }

  // 4. Threads
  if (platform === "threads" || cleanUrl.includes("threads.net") || cleanUrl.includes("threads.com")) {
    const threadPostMatch = cleanUrl.match(/\/post\/([a-zA-Z0-9_-]+)/i);
    if (threadPostMatch && threadPostMatch[1]) {
      return {
        type: "threads",
        embedUrl: `https://www.threads.net/embed/post/${threadPostMatch[1]}`,
        aspectClass: "w-full max-w-[440px] mx-auto h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
      };
    }
  }

  // 5. Spotify
  if (cleanUrl.includes("open.spotify.com")) {
    const spotMatch = cleanUrl.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (spotMatch) {
      const [, spotType, spotId] = spotMatch;
      return {
        type: "spotify",
        embedUrl: `https://open.spotify.com/embed/${spotType}/${spotId}`,
        aspectClass: "w-full h-[152px] rounded-2xl overflow-hidden shadow-lg"
      };
    }
  }

  // 6. Twitter / X
  if (platform === "x" || cleanUrl.includes("twitter.com") || cleanUrl.includes("x.com")) {
    const tweetMatch = cleanUrl.match(/status\/([0-9]+)/i);
    if (tweetMatch && tweetMatch[1]) {
      return {
        type: "x",
        embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${tweetMatch[1]}`,
        aspectClass: "w-full max-w-[460px] mx-auto h-[480px] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
      };
    }
  }

  return {
    type: "image_preview",
    embedUrl: null,
    aspectClass: "aspect-video w-full rounded-2xl overflow-hidden"
  };
}
