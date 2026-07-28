import { Platform } from "../types";

export interface PlatformConfig {
 id: Platform;
 name: string;
 color: string;
 bgColor: string;
 borderColor: string;
 topBarClass: string;
 badgeClass: string;
 iconName: string;
 autoMetadataSupported: boolean;
 notesTip: string;
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
 youtube: {
 id: "youtube",
 name: "YouTube",
 color: "#EF4444",
 bgColor: "bg-red-50 text-red-700",
 borderColor: "border-red-200",
 topBarClass: "bg-red-500",
 badgeClass: "bg-red-50 text-red-700 border-red-200/80",
 iconName: "Youtube",
 autoMetadataSupported: true,
 notesTip: "Videodaki önemli zaman damgalarını veya ana fikirleri kaydedin."
 },
 tiktok: {
 id: "tiktok",
 name: "TikTok",
 color: "#0F172A",
 bgColor: "bg-slate-100 text-slate-800",
 borderColor: "border-slate-300",
 topBarClass: "bg-slate-900",
 badgeClass: "bg-slate-900 text-white border-slate-700",
 iconName: "Video",
 autoMetadataSupported: true,
 notesTip: "Trend audio veya içerik formatı hakkındaki düşüncelerinizi yazın."
 },
 instagram: {
 id: "instagram",
 name: "Instagram",
 color: "#E1306C",
 bgColor: "bg-pink-50 text-pink-700",
 borderColor: "border-pink-200",
 topBarClass: "bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600",
 badgeClass: "bg-pink-50 text-pink-700 border-pink-200/80",
 iconName: "Instagram",
 autoMetadataSupported: true,
 notesTip: "Görsel estetik, reels kurgusu veya ürün ilhamını not edin."
 },
 threads: {
 id: "threads",
 name: "Threads",
 color: "#18181B",
 bgColor: "bg-zinc-100 text-zinc-900",
 borderColor: "border-zinc-300",
 topBarClass: "bg-zinc-900",
 badgeClass: "bg-zinc-900 text-white border-zinc-700",
 iconName: "AtSign",
 autoMetadataSupported: false,
 notesTip: "Thread konusunu ve kendi fikrinizi manuel olarak ekleyin."
 },
 pinterest: {
 id: "pinterest",
 name: "Pinterest",
 color: "#E60023",
 bgColor: "bg-rose-50 text-rose-700",
 borderColor: "border-rose-200",
 topBarClass: "bg-rose-600",
 badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
 iconName: "Pin",
 autoMetadataSupported: true,
 notesTip: "Tasarım, DIY projesi veya görsel konsept detayını girin."
 },
 x: {
 id: "x",
 name: "X (Twitter)",
 color: "#0284C7",
 bgColor: "bg-sky-50 text-sky-700",
 borderColor: "border-sky-200",
 topBarClass: "bg-sky-500",
 badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80",
 iconName: "Twitter",
 autoMetadataSupported: false,
 notesTip: "Tweet metnini veya öne çıkan anahtar düşünceyi hızlıca ekleyin."
 },
 reddit: {
 id: "reddit",
 name: "Reddit",
 color: "#EA580C",
 bgColor: "bg-orange-50 text-orange-700",
 borderColor: "border-orange-200",
 topBarClass: "bg-orange-500",
 badgeClass: "bg-orange-50 text-orange-700 border-orange-200/80",
 iconName: "MessageSquare",
 autoMetadataSupported: true,
 notesTip: "Topluluk tartışması veya çözüm tavsiyesini not alın."
 },
 article: {
 id: "article",
 name: "Makale / Blog",
 color: "#0D9488",
 bgColor: "bg-teal-50 text-teal-700",
 borderColor: "border-teal-200",
 topBarClass: "bg-teal-600",
 badgeClass: "bg-teal-50 text-teal-700 border-teal-200/80",
 iconName: "FileText",
 autoMetadataSupported: true,
 notesTip: "Makaleden aldığınız en alıntı ve çıkarımlarınızı kaydedin."
 },
 poem: {
 id: "poem",
 name: "Şiir / Edebi Eser",
 color: "#7C3AED",
 bgColor: "bg-purple-50 text-purple-700",
 borderColor: "border-purple-200",
 topBarClass: "bg-purple-600",
 badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
 iconName: "Feather",
 autoMetadataSupported: false,
 notesTip: "Kendi yazdığınız şiiri, dizeleri veya kıtaları doğrudan buraya kaydedin."
 },
 document: {
 id: "document",
 name: "PDF / Döküman",
 color: "#E11D48",
 bgColor: "bg-rose-50 text-rose-700",
 borderColor: "border-rose-200",
 topBarClass: "bg-rose-600",
 badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
 iconName: "FileText",
 autoMetadataSupported: false,
 notesTip: "PDF dökümanı bağlantısı, özeti veya içindeki önemli detaylar."
 },
 note: {
 id: "note",
 name: "Kişisel Not / Taslak",
 color: "#D97706",
 bgColor: "bg-amber-50 text-amber-700",
 borderColor: "border-amber-200",
 topBarClass: "bg-amber-500",
 badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
 iconName: "FileText",
 autoMetadataSupported: false,
 notesTip: "Aklınıza gelen fikirleri, günlük notlarını veya hatırlatmaları girin."
 },
 other: {
 id: "other",
 name: "Diğer Link",
 color: "#475569",
 bgColor: "bg-slate-100 text-slate-700",
 borderColor: "border-slate-200",
 topBarClass: "bg-slate-600",
 badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80",
 iconName: "Globe",
 autoMetadataSupported: true,
 notesTip: "Bu web bağlantısı hakkındaki kişisel fikir ve düşünceleriniz."
 }
};

export function detectPlatform(url: string): Platform {
 if (!url) return "other";
 const cleanUrl = url.toLowerCase().trim();

 if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
 return "youtube";
 }
 if (cleanUrl.includes("tiktok.com")) {
 return "tiktok";
 }
 if (cleanUrl.includes("instagram.com")) {
 return "instagram";
 }
 if (cleanUrl.includes("threads.net")) {
 return "threads";
 }
 if (cleanUrl.includes("pinterest.com") || cleanUrl.includes("pin.it")) {
 return "pinterest";
 }
 if (cleanUrl.includes("x.com") || cleanUrl.includes("twitter.com")) {
 return "x";
 }
 if (cleanUrl.includes("reddit.com") || cleanUrl.includes("redd.it")) {
 return "reddit";
 }
 
 return "article";
}
