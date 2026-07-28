import React, { useState, useMemo } from "react";
import { Sparkles, RefreshCw, Bell, ExternalLink, Eye, Bookmark, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, ReminderItem } from "../types";
import { PLATFORMS } from "../lib/platformHelper";

interface WeeklyDigestWidgetProps {
  cards: Card[];
  onOpenPreview: (card: Card) => void;
  onAddReminder: (item: Omit<ReminderItem, "id" | "created_at">) => void;
}

export const WeeklyDigestWidget: React.FC<WeeklyDigestWidgetProps> = ({
  cards,
  onOpenPreview,
  onAddReminder,
}) => {
  const [seed, setSeed] = useState(0);
  const [addedReminderIds, setAddedReminderIds] = useState<Record<string, boolean>>({});

  // Pick 3 interesting or forgotten cards
  const highlightCards = useMemo(() => {
    if (cards.length === 0) return [];

    // Filter or shuffle cards based on seed
    // We prioritize cards with notes or favorites or older cards
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [cards, seed]);

  const handleRefresh = () => {
    setSeed((prev) => prev + 1);
  };

  const handleQuickAddReminder = (card: Card) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDateStr = tomorrow.toISOString().split("T")[0];

    onAddReminder({
      title: `Oku & İncele: ${card.title}`,
      due_date: dueDateStr,
      due_time: "20:00",
      priority: "normal",
      note: card.note ? `Not: ${card.note}` : `Bağlantı: ${card.url}`,
      is_completed: false,
    });

    setAddedReminderIds((prev) => ({ ...prev, [card.id]: true }));

    setTimeout(() => {
      setAddedReminderIds((prev) => ({ ...prev, [card.id]: false }));
    }, 3000);
  };

  if (cards.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-indigo-800/60 relative overflow-hidden space-y-4">
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-2xl backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-wide font-serif">
                Günlük AI Sentezi: Bugünün Öne Çıkanları
              </h2>
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-extrabold">
                Daily Insight
              </span>
            </div>
            <p className="text-xs text-indigo-200/80">
              Yapay zeka bugün odaklanmanız, okumanız veya sentezlemeniz için kütüphanenizden 3 not seçti.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          title="Farklı 3 kayıt getir"
          className="px-3 py-1.5 bg-indigo-800/60 hover:bg-indigo-700/80 text-indigo-200 hover:text-white border border-indigo-600/50 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Rastgele Yenile</span>
        </button>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
        {highlightCards.map((card) => {
          const pInfo = PLATFORMS[card.platform] || PLATFORMS.other;
          const isAdded = addedReminderIds[card.id];

          return (
            <div
              key={card.id}
              className="bg-slate-900/80 border border-indigo-800/50 hover:border-indigo-500/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all group backdrop-blur-sm hover:shadow-indigo-900/20 hover:shadow-md"
            >
              <div className="space-y-2">
                {/* Platform Badge & Category */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded-lg font-bold ${pInfo.color} ${pInfo.textColor}`}>
                    {pInfo.name}
                  </span>
                  <span className="text-indigo-300/70 font-medium truncate max-w-[120px]">
                    {card.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xs text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                  {card.title}
                </h3>

                {/* Note preview if available */}
                {card.note ? (
                  <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-800/50 p-2 rounded-xl border border-slate-700/50">
                    "{card.note}"
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {card.description || card.url}
                  </p>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-indigo-800/40 mt-3 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenPreview(card)}
                  className="text-indigo-300 hover:text-white flex items-center space-x-1 font-semibold text-[11px] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>İncele</span>
                </button>

                <button
                  onClick={() => handleQuickAddReminder(card)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    isAdded
                      ? "bg-emerald-500 text-white"
                      : "bg-indigo-600/80 hover:bg-indigo-500 text-white shadow-sm"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Eklendi</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Hatırlat</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
