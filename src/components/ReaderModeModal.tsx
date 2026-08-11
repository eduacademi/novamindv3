import React, { useState } from "react";
import { X, BookOpen, ExternalLink, Tag, Sparkles, Clock, Share2, Copy, Check } from "lucide-react";
import { Card } from "../types";

interface ReaderModeModalProps {
  card: Card | null;
  onClose: () => void;
}

export const ReaderModeModal: React.FC<ReaderModeModalProps> = ({ card, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  if (!card) return null;

  const wordCount = (card.description || card.note || "").split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 100));

  const handleCopyLink = () => {
    if (card.url) {
      navigator.clipboard.writeText(card.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {card.platform || "WEB"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              {card.category || "Genel Kütüphane"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Font Size Selector */}
            <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${fontSize === "sm" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize("base")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${fontSize === "base" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 rounded-lg transition-colors ${fontSize === "lg" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
              >
                A+
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Bağlantıyı Kopyala"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* External Link */}
            {card.url && (
              <a
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                title="Orijinal Bağlantıyı Aç"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Content Body */}
        <div className="p-6 md:p-10 overflow-y-auto space-y-6">
          {/* Header & Meta */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white leading-tight mb-3">
              {card.title || "İsimsiz İçerik"}
            </h1>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tahmini {readingTimeMinutes} dk okuma</span>
              </span>
              <span>•</span>
              <span>{new Date(card.created_at || Date.now()).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>

          {/* Cover Image if available */}
          {card.thumbnail_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl max-h-72">
              <img
                src={card.thumbnail_url}
                alt="Kapak Görseli"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* AI Insights & Summary Block */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>NovaMind AI İçerik Özeti</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
              {card.description || "Bu içerik için henüz ayrıntılı bir açıklama eklenmemiş. Ancak bağlantınızı zihin haritanız üzerinden inceleyebilirsiniz."}
            </p>
          </div>

          {/* User Note */}
          {card.note && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed italic">
              <span className="block font-bold text-[10px] uppercase tracking-wider text-amber-400 not-italic mb-1">
                ✍️ Kişisel Notunuz:
              </span>
              "{card.note}"
            </div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {card.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reader Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Reader Mode • Odaklanmış Temiz Okuma</span>
          </div>
          <span>NovaMind Smart Reader</span>
        </div>
      </div>
    </div>
  );
};
