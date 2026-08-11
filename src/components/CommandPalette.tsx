import React, { useEffect } from "react";
import { Command } from "cmdk";
import { Search, Plus, Network, Sparkles, CreditCard, Bookmark, X } from "lucide-react";
import { Card } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  onSelectCard: (card: Card) => void;
  onOpenAddModal: () => void;
  onSwitchTab: (tab: "library" | "mindmap" | "ideas") => void;
  onOpenPricingModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  cards,
  onSelectCard,
  onOpenAddModal,
  onSwitchTab,
  onOpenPricingModal,
}) => {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        <Command label="NovaMind Hızlı Komut Paleti" className="w-full">
          <div className="flex items-center px-4 border-b border-slate-800 bg-slate-950/40">
            <Search className="w-4 h-4 text-indigo-400 shrink-0 mr-3" />
            <Command.Input
              autoFocus
              placeholder="Komut veya kütüphanede ara... (ör: Yapay zeka, YouTube, #tag)"
              className="w-full py-4 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-[380px] overflow-y-auto p-2 space-y-2 text-xs">
            <Command.Empty className="py-8 text-center text-slate-500">
              Eşleşen komut veya içerik bulunamadı.
            </Command.Empty>

            <Command.Group heading="HIZLI EYLEMLER" className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
              <Command.Item
                onSelect={() => {
                  onOpenAddModal();
                  onClose();
                }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors aria-selected:bg-indigo-600 aria-selected:text-white"
              >
                <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-sm">Yeni Link & Not Ekle</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSwitchTab("mindmap");
                  onClose();
                }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors aria-selected:bg-indigo-600 aria-selected:text-white"
              >
                <Network className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-sm">Knowledge Graph Zihin Haritasına Git</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSwitchTab("ideas");
                  onClose();
                }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors aria-selected:bg-indigo-600 aria-selected:text-white"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-sm">Yapay Zeka Fikir Üreticiyi Aç</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenPricingModal();
                  onClose();
                }}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors aria-selected:bg-indigo-600 aria-selected:text-white"
              >
                <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-semibold text-sm">Plan Yükselt (Pro / Premium)</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-1 border-t border-slate-800" />

            <Command.Group heading="KÜTÜPHANEDEKİ KARTLAR" className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">
              {cards.slice(0, 10).map((card) => (
                <Command.Item
                  key={card.id}
                  value={`${card.title || ""} ${card.note || ""} ${card.category || ""} ${card.platform || ""}`}
                  onSelect={() => {
                    onSelectCard(card);
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors aria-selected:bg-indigo-600 aria-selected:text-white group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <Bookmark className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-xs block text-slate-200 group-aria-selected:text-white truncate">
                        {card.title || "İsimsiz Kart"}
                      </span>
                      {card.note && (
                        <span className="text-[11px] text-slate-400 group-aria-selected:text-indigo-100 truncate block">
                          {card.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase shrink-0">
                    {card.platform}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Yön tuşlarıyla gezin, Enter ile seçin</span>
            <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px]">
              ESC ile Kapat
            </kbd>
          </div>
        </Command>
      </div>
    </div>
  );
};
