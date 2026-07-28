import React, { useState, useEffect } from "react";
import { Sparkles, Combine, Shuffle, MessageSquare, Loader2, Bookmark, Check, ArrowRight, Lightbulb, Save, Trash2 } from "lucide-react";
import { Card, IdeaResult } from "../types";
import { getSavedIdeas, saveSavedIdeas } from "../lib/storage";

interface IdeaGeneratorProps {
 cards: Card[];
 selectedCardIds: string[];
}

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({
 cards,
 selectedCardIds,
}) => {
 const [activeMode, setActiveMode] = useState<"combine" | "random" | "custom">("combine");
 const [selectedForCombine, setSelectedForCombine] = useState<string[]>(selectedCardIds.slice(0, 2));
 const [customPrompt, setCustomPrompt] = useState("");
 const [isGenerating, setIsGenerating] = useState(false);
 const [generatedIdeas, setGeneratedIdeas] = useState<IdeaResult[]>([]);
 const [savedIdeas, setSavedIdeas] = useState<IdeaResult[]>(getSavedIdeas());
 const [errorMsg, setErrorMsg] = useState<string | null>(null);

 useEffect(() => {
 if (selectedCardIds.length >= 2) {
 setSelectedForCombine(selectedCardIds.slice(0, 2));
 }
 }, [selectedCardIds]);

 const toggleSelectForCombine = (id: string) => {
 if (selectedForCombine.includes(id)) {
 setSelectedForCombine(selectedForCombine.filter((i) => i !== id));
 } else {
 if (selectedForCombine.length >= 2) {
 setSelectedForCombine([selectedForCombine[1], id]);
 } else {
 setSelectedForCombine([...selectedForCombine, id]);
 }
 }
 };

 const handleGenerateIdeas = async () => {
 if (cards.length === 0) return;
 setIsGenerating(true);
 setErrorMsg(null);

 try {
 const response = await fetch("/api/gemini/ideas", {
 method: "POST",
 headers: { "Content-Type": "application/json", "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || "" },
 body: JSON.stringify({
 mode: activeMode,
 cards,
 selectedCardIds: activeMode === "combine" ? selectedForCombine : selectedCardIds,
 customPrompt: activeMode === "custom" ? customPrompt : "",
 }),
 });

 const data = await response.json();
 if (!response.ok || data.error) {
 throw new Error(data.error || "Fikir üretilemedi.");
 }

 if (Array.isArray(data.ideas)) {
 setGeneratedIdeas(data.ideas);
 }
 } catch (err: any) {
 console.error("Idea generation error", err);
 setErrorMsg(err.message || "Fikir üretilirken bir hata oluştu.");
 } finally {
 setIsGenerating(false);
 }
 };

 const handleSaveIdea = (idea: IdeaResult) => {
 const isAlreadySaved = savedIdeas.some((i) => i.title === idea.title);
 if (!isAlreadySaved) {
 const updated = [idea, ...savedIdeas];
 setSavedIdeas(updated);
 saveSavedIdeas(updated);
 }
 };

 const handleDeleteSavedIdea = (id: string) => {
 const updated = savedIdeas.filter((i) => i.id !== id);
 setSavedIdeas(updated);
 saveSavedIdeas(updated);
 };

 return (
 <div className="space-y-6">
 
 {/* Header Banner */}
 <div className="bg-gradient-to-r from-indigo-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800/50 space-y-3">
 <div className="flex items-center space-x-3">
 <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
 <Sparkles className="w-6 h-6 animate-pulse" />
 </div>
 <div>
 <h2 className="text-xl font-bold font-serif tracking-tight">
 Yaratıcı Fikir Üretici (AI Synthesizer)
 </h2>
 <p className="text-xs text-indigo-200/80">
 Not kütüphanenizdeki bağımsız fikir parçacıklarını Gemini AI ile sentezleyin, sıra dışı konseptler geliştirin.
 </p>
 </div>
 </div>

 {/* Mode Selectors */}
 <div className="pt-2 flex flex-wrap gap-2 border-t border-indigo-800/60">
 <button
 onClick={() => setActiveMode("combine")}
 className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
 activeMode === "combine"
 ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
 : "bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900/80 border border-indigo-800"
 }`}
 >
 <Combine className="w-4 h-4" />
 <span>Bu İkisini Birleştir</span>
 </button>

 <button
 onClick={() => setActiveMode("random")}
 className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
 activeMode === "random"
 ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
 : "bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900/80 border border-indigo-800"
 }`}
 >
 <Shuffle className="w-4 h-4" />
 <span>Bugün Ne Üretsem?</span>
 </button>

 <button
 onClick={() => setActiveMode("custom")}
 className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
 activeMode === "custom"
 ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
 : "bg-indigo-950/60 text-indigo-200 hover:bg-indigo-900/80 border border-indigo-800"
 }`}
 >
 <MessageSquare className="w-4 h-4" />
 <span>Özel Beyin Fırtınası</span>
 </button>
 </div>
 </div>

 {/* Mode Controls & Config */}
 <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
 
 {/* Combine Mode Selector */}
 {activeMode === "combine" && (
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
 <span>Birleştirmek İstediğiniz 2 Kartı Seçin:</span>
 <span className="text-xs font-normal text-slate-500">
 ({selectedForCombine.length}/2 Seçildi)
 </span>
 </h3>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
 {cards.map((card) => {
 const isChecked = selectedForCombine.includes(card.id);
 return (
 <div
 key={card.id}
 onClick={() => toggleSelectForCombine(card.id)}
 className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
 isChecked
 ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/30 font-medium"
 : "bg-slate-50 border-slate-200 hover:border-slate-300"
 }`}
 >
 <div className="flex items-center justify-between mb-1">
 <span className="text-[10px] font-bold text-indigo-700 uppercase">
 {card.platform}
 </span>
 {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600" />}
 </div>
 <p className="font-semibold text-slate-900 line-clamp-1">
 {card.title}
 </p>
 <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-0.5">
 "{card.note}"
 </p>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Random Mode Explanation */}
 {activeMode === "random" && (
 <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
 <p className="font-bold flex items-center space-x-1.5">
 <Lightbulb className="w-4 h-4 text-amber-600" />
 <span>Rastgele Kombinasyon İlhama Açılan Kapıdır</span>
 </p>
 <p>
 AI kütüphanenizdeki farklı kategorilerden rastgele konular seçecek ve bugün üretebileceğiniz yeni içerik, ürün veya proje fikirleri sentezleyecektir.
 </p>
 </div>
 )}

 {/* Custom Prompt */}
 {activeMode === "custom" && (
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-700 ">
 Ne Tür Bir Fikir Arıyorsunuz?
 </label>
 <input
 type="text"
 value={customPrompt}
 onChange={(e) => setCustomPrompt(e.target.value)}
 placeholder="ör: Yazılım notlarımla cold brew kahve rehberini harmanlayarak bir mobil uygulama fikri üret..."
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 )}

 {/* Action Button */}
 <div className="pt-2 flex justify-end">
 <button
 onClick={handleGenerateIdeas}
 disabled={isGenerating || cards.length === 0}
 className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl flex items-center space-x-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
 >
 {isGenerating ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <Sparkles className="w-4 h-4 text-amber-300" />
 )}
 <span>Fikirleri Sentezle ve Üret</span>
 </button>
 </div>

 </div>

 {/* Error state */}
 {errorMsg && (
 <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 ">
 {errorMsg}
 </div>
 )}

 {/* Generated Ideas Result List */}
 {generatedIdeas.length > 0 && (
 <div className="space-y-4">
 <h3 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
 <Sparkles className="w-5 h-5 text-indigo-600" />
 <span>Sentezlenen Yeni Fikirler ({generatedIdeas.length})</span>
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {generatedIdeas.map((idea, idx) => {
 const isSaved = savedIdeas.some((i) => i.title === idea.title);
 return (
 <div
 key={idx}
 className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden"
 >
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
 Sentez Fikir #{idx + 1}
 </span>
 <button
 onClick={() => handleSaveIdea(idea)}
 disabled={isSaved}
 className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
 isSaved
 ? "bg-emerald-100 text-emerald-800 "
 : "hover:bg-slate-100 text-slate-600 :bg-slate-800"
 }`}
 >
 {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
 <span>{isSaved ? "Kaydedildi" : "Kaydet"}</span>
 </button>
 </div>

 <h4 className="font-bold text-slate-900 text-base font-serif leading-snug">
 {idea.title}
 </h4>

 <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border">
 {idea.concept}
 </p>

 {idea.targetAudience && (
 <div className="text-[11px] text-slate-500">
 <b>Hedef Kitle / Platform:</b> {idea.targetAudience}
 </div>
 )}

 {idea.actionSteps && idea.actionSteps.length > 0 && (
 <div className="space-y-1 text-xs">
 <span className="font-bold text-slate-800 ">Aksiyon Adımları:</span>
 <ul className="list-disc list-inside space-y-0.5 text-slate-600 ">
 {idea.actionSteps.map((step, sIdx) => (
 <li key={sIdx}>{step}</li>
 ))}
 </ul>
 </div>
 )}
 </div>

 {idea.scoreReasoning && (
 <div className="pt-2 border-t border-slate-100 text-[11px] text-indigo-700 italic">
 💡 {idea.scoreReasoning}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Saved Ideas Section */}
 {savedIdeas.length > 0 && (
 <div className="pt-6 border-t border-slate-200 space-y-4">
 <h3 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
 <Bookmark className="w-5 h-5 text-amber-500" />
 <span>Kayıtlı Fikirleriniz ({savedIdeas.length})</span>
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {savedIdeas.map((saved) => (
 <div
 key={saved.id || saved.title}
 className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2 text-xs"
 >
 <div className="flex items-center justify-between font-bold">
 <span className="text-slate-900 text-sm font-serif">
 {saved.title}
 </span>
 <button
 onClick={() => handleDeleteSavedIdea(saved.id)}
 className="p-1 text-slate-400 hover:text-rose-600"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 <p className="text-slate-700 italic">{saved.concept}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 </div>
 );
};
