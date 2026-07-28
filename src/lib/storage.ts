import { Card, ShoppingItem, MindMapData, IdeaResult, ReminderItem } from "../types";
import { decodeHTMLEntities } from "./textHelper";

const aiTechWorkspaceImg = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
const japandiInteriorImg = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80";
const artisanColdBrewImg = "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80";

const CARDS_STORAGE_KEY = "idea_library_cards_v4";
const SHOPPING_STORAGE_KEY = "idea_library_shopping_v4";
const MINDMAP_STORAGE_KEY = "idea_library_mindmap_v4";
const IDEAS_STORAGE_KEY = "idea_library_ideas_v4";
const REMINDERS_STORAGE_KEY = "idea_library_reminders_v4";

const INITIAL_CARDS: Card[] = [
 {
 id: "sample-1",
 url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
 platform: "youtube",
 title: "10 Dakikada AI Destekli Web Uygulamaları Geliştirme Rehberi",
 description: "Modern web teknolojileri ve LLM entegrasyonu ile dakikalar içinde canlıya uygulama alma taktikleri.",
 thumbnail_url: aiTechWorkspaceImg,
 author: "Yazılım Dünyası",
 category: "Yazılım & AI",
 note: "Bu videodaki prompt mühendisliği şablonunu yeni mikro-SaaS projemde denemeliyim. Özellikle otomatik şema üretimi kısmı çok pratik.",
 tags: ["yazılım", "ai", "react", "fikir"],
 metadata_source: "auto",
 created_at: Date.now() - 3600000 * 24 * 2,
 is_favorite: true
 },
 {
 id: "sample-2",
 url: "https://x.com/tech_innovator/status/123456789",
 platform: "x",
 title: "Minimalist Çalışma Alanı Ve Üretkenlik Masası Kurulumu",
 description: "Kablo gizleme, ergonomik standlar ve doğal aydınlatma ile odaklanmayı %50 artıran masa düzeni.",
 thumbnail_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80",
 author: "@tech_innovator",
 category: "Üretkenlik & Tasarım",
 note: "Monitör arkasına bağlanan ayarlanabilir LED şerit ışık fikri çok hoş. Alışveriş listesine ekleyeceğim warm white LED şeridi.",
 tags: ["masadüzeni", "minimalizm", "tasarım"],
 metadata_source: "manual",
 created_at: Date.now() - 3600000 * 24 * 4,
 is_favorite: false
 },
 {
 id: "sample-3",
 url: "https://www.pinterest.com/pin/987654321/",
 platform: "pinterest",
 title: "Japon İskandinav (Japandi) İletişim Ve Ev Dekoru Fikirleri",
 description: "Doğal ahşap dokuları, nötr tonlar ve fonksiyonel depolama çözümleri.",
 thumbnail_url: japandiInteriorImg,
 author: "Interior Vibes",
 category: "Tasarım & Stil",
 note: "Salondaki kitaplık düzeni için ahşap modüler kutular kullanmak hem düzenli gösterir hem de taşınabilir olur.",
 tags: ["japandi", "dekorasyon", "ev"],
 metadata_source: "auto",
 created_at: Date.now() - 3600000 * 24 * 6,
 is_favorite: true
 },
 {
 id: "sample-4",
 url: "https://www.reddit.com/r/coffee/comments/12345/",
 platform: "reddit",
 title: "Evde Cold Brew Demleme Ve Kahve Çekirdeği Seçim Rehberi",
 description: "Soğuk demleme için ideal öğütüm derecesi, demleme süresi ve tat profilleri.",
 thumbnail_url: artisanColdBrewImg,
 author: "r/coffee",
 category: "Yaşam & Yeme-İçme",
 note: "Etiyopya çekirdekleri meyvemsi notalar veriyor. 1:8 oranında 16 saat buzdolabında demlenecek. Fransız pres filtre torbası almalıyım.",
 tags: ["kahve", "coldbrew", "tarif"],
 metadata_source: "auto",
 created_at: Date.now() - 3600000 * 24 * 8,
 is_favorite: false
 }
];

const INITIAL_SHOPPING: ShoppingItem[] = [
 {
 id: "shop-1",
 name: "Warm White LED Şerit Işık (Masa Arkası)",
 quantity: "2 Metre",
 note: "USB ile çalışan, dimmerlı model tercih edilecek",
 is_checked: false,
 source_url: "https://x.com/tech_innovator/status/123456789",
 created_at: Date.now() - 3600000 * 12
 },
 {
 id: "shop-2",
 name: "Soğuk Kahve Filtre Torbası (Cold Brew)",
 quantity: "1 Paket (50'li)",
 note: "İnce süzgeçli pamuklu kumaş veya kağıt filtre",
 is_checked: true,
 source_url: "https://www.reddit.com/r/coffee/comments/12345/",
 created_at: Date.now() - 3600000 * 24
 },
 {
 id: "shop-3",
 name: "Ahşap Modüler Düzenleyici Kutular",
 quantity: "3 Adet",
 note: "Japandi tarzı doğal çam kaplama",
 is_checked: false,
 source_url: "https://www.pinterest.com/pin/987654321/",
 created_at: Date.now() - 3600000 * 36
 }
];

export function getCards(): Card[] {
 try {
 const data = localStorage.getItem(CARDS_STORAGE_KEY);
 if (!data) {
 saveCards(INITIAL_CARDS);
 return INITIAL_CARDS;
 }
 const parsed: Card[] = JSON.parse(data);
 return parsed.map((c) => ({
 ...c,
 title: decodeHTMLEntities(c.title),
 description: c.description ? decodeHTMLEntities(c.description) : c.description,
 note: c.note ? decodeHTMLEntities(c.note) : c.note,
 author: c.author ? decodeHTMLEntities(c.author) : c.author,
 }));
 } catch (err) {
 console.error("Error reading cards storage", err);
 return INITIAL_CARDS;
 }
}

export function saveCards(cards: Card[]): void {
 try {
 localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
 } catch (err) {
 console.error("Error saving cards storage", err);
 }
}

export function getShoppingItems(): ShoppingItem[] {
 try {
 const data = localStorage.getItem(SHOPPING_STORAGE_KEY);
 if (!data) {
 saveShoppingItems(INITIAL_SHOPPING);
 return INITIAL_SHOPPING;
 }
 return JSON.parse(data);
 } catch (err) {
 console.error("Error reading shopping storage", err);
 return INITIAL_SHOPPING;
 }
}

export function saveShoppingItems(items: ShoppingItem[]): void {
 try {
 localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(items));
 } catch (err) {
 console.error("Error saving shopping storage", err);
 }
}

export function getCachedMindMap(): MindMapData | null {
 try {
 const data = localStorage.getItem(MINDMAP_STORAGE_KEY);
 return data ? JSON.parse(data) : null;
 } catch (err) {
 return null;
 }
}

export function saveCachedMindMap(data: MindMapData): void {
 try {
 localStorage.setItem(MINDMAP_STORAGE_KEY, JSON.stringify(data));
 } catch (err) {
 console.error("Error saving mindmap cache", err);
 }
}

export function getSavedIdeas(): IdeaResult[] {
 try {
 const data = localStorage.getItem(IDEAS_STORAGE_KEY);
 return data ? JSON.parse(data) : [];
 } catch (err) {
 return [];
 }
}

export function saveSavedIdeas(ideas: IdeaResult[]): void {
 try {
 localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
 } catch (err) {
 console.error("Error saving ideas storage", err);
 }
}

const INITIAL_REMINDERS: ReminderItem[] = [
 {
 id: "rem-1",
 title: "Cold Brew Kahve Filtresi Temizliği & Demleme Kontrolü",
 due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
 due_time: "10:00",
 priority: "high",
 note: "Fransız pres filtre torbası ile 16 saatlik demleme dolacak.",
 is_completed: false,
 created_at: Date.now() - 3600000 * 5
 },
 {
 id: "rem-2",
 title: "Haftalık Kitap Okuma & Şiir Notları Taraması",
 due_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
 due_time: "20:00",
 priority: "normal",
 note: "Yeni eklenen kendi şiirlerimi gözden geçirip etiketleri düzenle.",
 is_completed: false,
 created_at: Date.now() - 3600000 * 10
 }
];

export function getReminders(): ReminderItem[] {
 try {
 const data = localStorage.getItem(REMINDERS_STORAGE_KEY);
 if (!data) {
 saveReminders(INITIAL_REMINDERS);
 return INITIAL_REMINDERS;
 }
 return JSON.parse(data);
 } catch (err) {
 console.error("Error reading reminders storage", err);
 return INITIAL_REMINDERS;
 }
}

export function saveReminders(reminders: ReminderItem[]): void {
 try {
 localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
 } catch (err) {
 console.error("Error saving reminders storage", err);
 }
}

export function exportBackupJSON(): string {
 const payload = {
 app: "Kişisel Fikir Kütüphanesi",
 version: 3,
 exported_at: new Date().toISOString(),
 cards: getCards(),
 shopping: getShoppingItems(),
 ideas: getSavedIdeas()
 };
 return JSON.stringify(payload, null, 2);
}

export function importBackupJSON(jsonString: string): { success: boolean; cardsCount: number; shoppingCount: number; message: string } {
 try {
 const parsed = JSON.parse(jsonString);
 if (!parsed || (!Array.isArray(parsed.cards) && !Array.isArray(parsed.shopping))) {
 return { success: false, cardsCount: 0, shoppingCount: 0, message: "Geçersiz yedek dosyası formatı." };
 }

 let cardsCount = 0;
 let shoppingCount = 0;

 if (Array.isArray(parsed.cards)) {
 const existing = getCards();
 const existingUrls = new Set(existing.map(c => c.url));
 const newCards = [...existing];

 for (const card of parsed.cards) {
 if (card.url && !existingUrls.has(card.url)) {
 newCards.push({
 ...card,
 id: card.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
 });
 cardsCount++;
 }
 }
 saveCards(newCards);
 }

 if (Array.isArray(parsed.shopping)) {
 const existing = getShoppingItems();
 const existingNames = new Set(existing.map(i => i.name.toLowerCase().trim()));
 const newShopping = [...existing];

 for (const item of parsed.shopping) {
 if (item.name && !existingNames.has(item.name.toLowerCase().trim())) {
 newShopping.push({
 ...item,
 id: item.id || `shop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
 });
 shoppingCount++;
 }
 }
 saveShoppingItems(newShopping);
 }

 return {
 success: true,
 cardsCount,
 shoppingCount,
 message: `${cardsCount} yeni bağlantı kartı ve ${shoppingCount} yeni alışveriş kalemi başarıyla içe aktarıldı!`
 };
 } catch (err: any) {
 return { success: false, cardsCount: 0, shoppingCount: 0, message: `İçe aktarma hatası: ${err?.message || "JSON okunamadı"}` };
 }
}
