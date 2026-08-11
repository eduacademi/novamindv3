import React, { useState, useMemo } from "react";
import { Search, Filter, Sparkles, Network, Star, Trash2, CheckSquare, Square, Layers, Share2 } from "lucide-react";
import { Card, Platform } from "../types";
import { CardItem } from "./CardItem";
import { PLATFORMS } from "../lib/platformHelper";

interface CardGridProps {
  cards: Card[];
  selectedCardIds: string[];
  onToggleSelectCard: (id: string) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onUpdateCard: (updatedCard: Card) => void;
  onDeleteCard: (id: string) => void;
  onBulkDeleteCards: (ids: string[]) => void;
  onGenerateMindMapForSelected: () => void;
  onCombineSelectedForIdeas: () => void;
  onOpenAddModal: () => void;
  onOpenPreview?: (card: Card) => void;
  onOpenExportModal?: () => void;
  selectedProjectId?: string | null;
  selectedProjectName?: string | null;
  onClearProjectFilter?: () => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  selectedCardIds,
  onToggleSelectCard,
  onClearSelection,
  onSelectAll,
  onUpdateCard,
  onDeleteCard,
  onBulkDeleteCards,
  onGenerateMindMapForSelected,
  onCombineSelectedForIdeas,
  onOpenAddModal,
  onOpenPreview,
  onOpenExportModal,
  selectedProjectId = null,
  selectedProjectName = null,
  onClearProjectFilter,
}) => {
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedPlatform, setSelectedPlatform] = useState<Platform | "all">("all");
 const [selectedCategory, setSelectedCategory] = useState<string>("all");
 const [onlyFavorites, setOnlyFavorites] = useState(false);
 const [sortBy, setSortBy] = useState<"newest" | "oldest" | "note_length">("newest");
 const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);

 // Unique categories list
 const categories = useMemo(() => {
 const set = new Set<string>();
 cards.forEach((c) => {
 if (c.category) set.add(c.category);
 });
 return Array.from(set);
 }, [cards]);

 // Filtered and Sorted Cards
 const filteredCards = useMemo(() => {
 return cards
 .filter((card) => {
 // Project filter
 if (selectedProjectId && !card.projectIds?.includes(selectedProjectId)) {
 return false;
 }

 // Platform filter
 if (selectedPlatform !== "all" && card.platform !== selectedPlatform) {
 return false;
 }

 // Category filter
 if (selectedCategory !== "all" && card.category !== selectedCategory) {
 return false;
 }

 // Favorite filter
 if (onlyFavorites && !card.is_favorite) {
 return false;
 }

 // Search Query
 if (searchQuery.trim()) {
 const query = searchQuery.toLowerCase();
 const matchTitle = (card.title || "").toLowerCase().includes(query);
 const matchNote = (card.note || "").toLowerCase().includes(query);
 const matchDesc = (card.description || "").toLowerCase().includes(query);
 const matchAuthor = (card.author || "").toLowerCase().includes(query);
 const matchTags = (card.tags || []).some((t) => t.toLowerCase().includes(query));
 const matchCat = (card.category || "").toLowerCase().includes(query);

 if (!matchTitle && !matchNote && !matchDesc && !matchAuthor && !matchTags && !matchCat) {
 return false;
 }
 }

 return true;
 })
 .sort((a, b) => {
 if (sortBy === "newest") return b.created_at - a.created_at;
 if (sortBy === "oldest") return a.created_at - b.created_at;
 if (sortBy === "note_length") return (b.note?.length || 0) - (a.note?.length || 0);
 return 0;
 });
 }, [cards, selectedPlatform, selectedCategory, onlyFavorites, searchQuery, sortBy]);

 const allFilteredSelected = filteredCards.length > 0 && filteredCards.every((c) => selectedCardIds.includes(c.id));

 return (
 <div className="space-y-6">
 {selectedProjectId && selectedProjectName && (
 <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950">
 <div><span className="font-bold">{selectedProjectName}</span> projesinin kaynaklarını görüyorsun.</div>
 <button onClick={onClearProjectFilter} className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-orange-800 shadow-sm hover:bg-orange-100">Tüm kaynaklar</button>
 </div>
 )}
 
 {/* Controls Bar: Search & Filter options */}
 <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
 
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
 
 {/* Search Box */}
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Başlık, not metni, etiket (#ai) veya kategori ara..."
 className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery("")}
 className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
 >
 Temizle
 </button>
 )}
 </div>

 {/* Category Dropdown & Favorites & Sort */}
 <div className="flex items-center flex-wrap gap-2 text-xs">
 
 {/* Category Dropdown */}
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-medium focus:outline-none"
 >
 <option value="all">Tüm Kategoriler ({categories.length})</option>
 {categories.map((cat) => (
 <option key={cat} value={cat}>
 {cat}
 </option>
 ))}
 </select>

 {/* Sort Dropdown */}
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value as any)}
 className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 font-medium focus:outline-none"
 >
 <option value="newest">En Yeni Eklene</option>
 <option value="oldest">En Eski Eklenen</option>
 <option value="note_length">En Detaylı Notlar</option>
 </select>

 {/* Favorite toggle */}
 <button
 onClick={() => setOnlyFavorites(!onlyFavorites)}
 className={`px-3 py-2 rounded-xl border font-medium flex items-center space-x-1 transition-colors ${
 onlyFavorites
 ? "bg-amber-100 text-amber-900 border-amber-300 "
 : "bg-slate-50 text-slate-600 border-slate-300 "
 }`}
 >
 <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-amber-500 text-amber-500" : ""}`} />
 <span>Favoriler</span>
 </button>

 {/* Export / Newsletter Button */}
 {onOpenExportModal && (
 <button
 onClick={onOpenExportModal}
 className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
 >
 <Share2 className="w-3.5 h-3.5 text-indigo-600" />
 <span>Dışa Aktar & Bülten</span>
 </button>
 )}

 </div>

 </div>

 {/* Platform Filter Tabs */}
 <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100 ">
 <button
 onClick={() => setSelectedPlatform("all")}
 className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
 selectedPlatform === "all"
 ? "bg-slate-900 text-white "
 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
 }`}
 >
 Tüm Platformlar ({cards.length})
 </button>

 {(Object.keys(PLATFORMS) as Platform[]).map((platKey) => {
 const pInfo = PLATFORMS[platKey];
 const count = cards.filter((c) => c.platform === platKey).length;
 if (count === 0 && selectedPlatform !== platKey) return null;

 return (
 <button
 key={platKey}
 onClick={() => setSelectedPlatform(platKey)}
 className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
 selectedPlatform === platKey
 ? "bg-indigo-600 text-white"
 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
 }`}
 >
 {pInfo.name} ({count})
 </button>
 );
 })}
 </div>

 </div>

 {/* Multi-selection Action Floating Banner */}
 {selectedCardIds.length > 0 && (
 <div className="sticky top-16 z-20 bg-indigo-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-indigo-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
 <div className="flex items-center space-x-3 text-xs">
 <span className="px-2.5 py-1 bg-indigo-800 rounded-lg font-bold text-indigo-200">
 {selectedCardIds.length} Kart Seçildi
 </span>
 <button
 onClick={allFilteredSelected ? onClearSelection : onSelectAll}
 className="text-indigo-200 hover:text-white underline flex items-center space-x-1"
 >
 {allFilteredSelected ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
 <span>{allFilteredSelected ? "Seçimi Temizle" : "Tümünü Seç"}</span>
 </button>
 </div>

 <div className="flex items-center space-x-2">
 {isConfirmingBulkDelete ? (
 <div className="flex items-center space-x-1.5 p-1 bg-red-950/80 border border-red-500 rounded-xl">
 <span className="text-[11px] text-red-200 font-bold px-1.5">
 {selectedCardIds.length} Kart Silinsin mi?
 </span>
 <button
 onClick={() => {
 onBulkDeleteCards(selectedCardIds);
 setIsConfirmingBulkDelete(false);
 }}
 className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors"
 >
 Evet, Sil
 </button>
 <button
 onClick={() => setIsConfirmingBulkDelete(false)}
 className="px-2 py-1 bg-indigo-800 hover:bg-indigo-700 text-slate-200 text-xs rounded-lg transition-colors"
 >
 İptal
 </button>
 </div>
 ) : (
 <button
 onClick={() => setIsConfirmingBulkDelete(true)}
 className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
 >
 <Trash2 className="w-4 h-4" />
 <span className="hidden sm:inline">Sil</span>
 </button>
 )}

 <button
 onClick={onGenerateMindMapForSelected}
 className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
 >
 <Network className="w-4 h-4" />
 <span>Seçilenlerden Mind Map Üret</span>
 </button>

 <button
 onClick={onCombineSelectedForIdeas}
 className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
 >
 <Sparkles className="w-4 h-4 text-amber-300" />
 <span>Seçilenleri Birleştir</span>
 </button>

 {onOpenExportModal && (
 <button
 onClick={onOpenExportModal}
 className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm"
 >
 <Share2 className="w-4 h-4 text-white" />
 <span>Seçilenleri Dışa Aktar</span>
 </button>
 )}
 </div>
 </div>
 )}

 {/* Cards Grid */}
 {filteredCards.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredCards.map((card) => (
 <CardItem
   key={card.id}
   card={card}
   isSelected={selectedCardIds.includes(card.id)}
   onToggleSelect={onToggleSelectCard}
   onUpdateCard={onUpdateCard}
   onDeleteCard={onDeleteCard}
   onOpenPreview={onOpenPreview}
 />
 ))}
 </div>
 ) : (
 /* Empty State */
 <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl">
 <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
 <Layers className="w-6 h-6" />
 </div>
 <h3 className="text-base font-bold text-slate-800 font-serif">
 Aranan kriterlere uygun kart bulunamadı
 </h3>
 <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
 Arama sorgunuzu değiştirin veya yeni bir sosyal medya linki ve kişisel fikir notu ekleyin.
 </p>
 <button
 onClick={onOpenAddModal}
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl inline-flex items-center space-x-1.5"
 >
 <span>Yeni Link Ekle</span>
 </button>
 </div>
 )}

 </div>
 );
};
