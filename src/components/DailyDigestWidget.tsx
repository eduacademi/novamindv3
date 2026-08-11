import React, { useState } from "react";
import { Sparkles, RefreshCw, BookOpen, ChevronRight, ExternalLink } from "lucide-react";
import { Card } from "../types";

interface DailyDigestWidgetProps {
  cards: Card[];
  onOpenReader: (card: Card) => void;
}

export const DailyDigestWidget: React.FC<DailyDigestWidgetProps> = ({ cards, onOpenReader }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!cards || cards.length === 0) return null;

  // Pick 3 cards deterministically based on today's date seed or shuffle
  const todaySeed = new Date().toISOString().slice(0, 10);
  const digestCards = cards.slice(0, 3); // Top 3 cards for digest

  const currentCard = digestCards[activeIndex] || digestCards[0];

  return (
    <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Günlük 3 Akıllı Anımsatıcı</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Spaced Repetition
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-light">
              Zihninizde taze tutmak için kütüphanenizden günün öne çıkan kartları.
            </p>
          </div>
        </div>

        {/* Step Indicator Bullets */}
        <div className="flex items-center space-x-1.5 self-end md:self-auto">
          {digestCards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? "w-6 bg-indigo-500" : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card Content Display */}
      {currentCard && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {currentCard.platform || "WEB"}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {currentCard.category || "Genel"}
              </span>
            </div>

            <h4 className="text-sm md:text-base font-bold text-white leading-snug line-clamp-1">
              {currentCard.title || "İsimsiz İçerik"}
            </h4>

            <p className="text-xs text-slate-300 font-light line-clamp-2 leading-relaxed">
              {currentCard.description || currentCard.note || "Bu içerik için detaylı açıklama eklenmemiş."}
            </p>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
            <button
              onClick={() => onOpenReader(currentCard)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Oku & İncele</span>
            </button>

            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % digestCards.length)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Sonraki Anımsatıcı"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
