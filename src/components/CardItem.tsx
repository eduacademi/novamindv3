import React, { useState } from "react";
import { ExternalLink, Star, Trash2, Edit3, Check, Youtube, Instagram, Twitter, MessageSquare, Pin, Video, FileText, Globe, AtSign, Eye, Share2, Feather } from "lucide-react";
import { Card, Platform } from "../types";
import { PLATFORMS } from "../lib/platformHelper";
import { decodeHTMLEntities } from "../lib/textHelper";
import { ShareModal } from "./ShareModal";

interface CardItemProps {
  card: Card;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onUpdateCard: (updatedCard: Card) => void;
  onDeleteCard: (id: string) => void;
  onOpenPreview?: (card: Card) => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  isSelected = false,
  onToggleSelect,
  onUpdateCard,
  onDeleteCard,
  onOpenPreview,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState(card.note || "");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const platformInfo = PLATFORMS[card.platform] || PLATFORMS.other;

  const getPlatformIcon = (plat: Platform) => {
    switch (plat) {
      case "youtube": return <Youtube className="w-3.5 h-3.5 text-red-700" />;
      case "tiktok": return <Video className="w-3.5 h-3.5 text-slate-800" />;
      case "instagram": return <Instagram className="w-3.5 h-3.5 text-rose-700" />;
      case "threads": return <AtSign className="w-3.5 h-3.5 text-[#3A2E22]" />;
      case "pinterest": return <Pin className="w-3.5 h-3.5 text-red-800" />;
      case "x": return <Twitter className="w-3.5 h-3.5 text-sky-700" />;
      case "reddit": return <MessageSquare className="w-3.5 h-3.5 text-orange-700" />;
      case "article": return <FileText className="w-3.5 h-3.5 text-emerald-800" />;
      case "poem": return <Feather className="w-3.5 h-3.5 text-amber-900" />;
      default: return <Globe className="w-3.5 h-3.5 text-[#6B5A47]" />;
    }
  };

  const handleSaveNote = () => {
    onUpdateCard({
      ...card,
      note: editedNote.trim(),
    });
    setIsEditingNote(false);
  };

  const handleToggleFavorite = () => {
    onUpdateCard({
      ...card,
      is_favorite: !card.is_favorite,
    });
  };

  const formattedDate = new Date(card.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div className={`group relative bg-[#FBF7EC] border transition-all duration-300 rounded-xl p-4 flex flex-col justify-between paper-card-shadow transform hover:-translate-y-1 hover:rotate-0 transition-transform ${
      isSelected
        ? "ring-2 ring-[#D85A30] border-[#D85A30]"
        : "border-[#DCD0B9] hover:border-[#B8AA90]"
    }`}>

      {/* 3D Pushpin Pin Accent at Top Center */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 w-3 h-3 rounded-full bg-radial from-[#F0997B] via-[#D85A30] to-[#993C1D] shadow-md border border-white/40" />

      {/* Selection Checkbox */}
      {onToggleSelect && (
        <div className="absolute top-3 left-3 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(card.id)}
            title="Seç"
            className="w-4 h-4 rounded border-[#C4B5A0] text-[#D85A30] focus:ring-[#D85A30] cursor-pointer shadow-2xs"
          />
        </div>
      )}

      {/* Favorite Star Button */}
      <button
        onClick={handleToggleFavorite}
        title={card.is_favorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        className="absolute top-3 right-3 z-20 p-1.5 bg-[#EBE2D0]/90 hover:bg-[#E2D6C0] text-[#3A2E22] rounded-full transition-transform hover:scale-105 border border-[#DCD0B9]"
      >
        <Star className={`w-3.5 h-3.5 ${card.is_favorite ? "fill-amber-500 text-amber-600" : "text-[#8A7B5E]"}`} />
      </button>

      {/* Card Content Top Container */}
      <div className="pt-2 space-y-3">

        {/* Thumbnail Polaroid Photo Wrapper */}
        {card.thumbnail_url && !imgFailed ? (
          <div 
            onClick={() => onOpenPreview?.(card)}
            className="relative w-full h-40 bg-[#C9BFA8] rounded-md overflow-hidden cursor-pointer border-3 border-[#FBF7EC] shadow-sm group/thumb"
          >
            <img
              src={card.thumbnail_url}
              alt={card.title || "Görsel"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
              onError={() => setImgFailed(true)}
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#FBF7EC]/90 backdrop-blur-sm border border-[#DCD0B9] text-[10px] font-bold text-[#3A2E22] flex items-center space-x-1">
              {getPlatformIcon(card.platform)}
              <span>{platformInfo.name}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-[#6B5A47]">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#EBE2D0] border border-[#DCD0B9] text-[11px] font-bold text-[#3A2E22]">
              {getPlatformIcon(card.platform)}
              <span>{platformInfo.name}</span>
            </div>
            <time className="text-[11px] font-mono text-[#8A7B5E]">{formattedDate}</time>
          </div>
        )}

        {/* Washi-Tape Category Tag & Date */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block bg-[#D85A30] text-[#FBF7EC] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs transform -rotate-1 shadow-2xs">
            {card.category || "Genel Not"}
          </span>
          {card.thumbnail_url && (
            <time className="text-[11px] font-mono text-[#8A7B5E]">{formattedDate}</time>
          )}
        </div>

        {/* Title in Editorial Serif */}
        <h3 
          onClick={() => onOpenPreview?.(card)}
          className="font-serif-fraunces font-bold text-[#3A2E22] text-base leading-snug line-clamp-2 hover:text-[#D85A30] transition-colors cursor-pointer"
        >
          {decodeHTMLEntities(card.title) || "İsimsiz Not"}
        </h3>

        {/* Handwritten Personal Note Snippet (Caveat Cursive Font) */}
        <div className="bg-[#F5EFE0] border border-dashed border-[#C4B5A0] p-3 rounded-lg space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8A7B5E]">
            <span>Kişisel Notunuz</span>
            {!isEditingNote && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="p-1 hover:bg-[#EBE2D0] rounded text-[#6B5A47] transition-colors cursor-pointer"
                title="Notu Düzenle"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-2 mt-1">
              <textarea
                rows={3}
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="w-full p-2 bg-[#FBF7EC] border border-[#C4B5A0] rounded text-xs text-[#2C221E] focus:outline-none focus:border-[#D85A30]"
              />
              <div className="flex justify-end space-x-1">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-2 py-1 text-[10px] text-[#6B5A47] hover:bg-[#EBE2D0] rounded"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-2.5 py-1 text-[10px] bg-[#D85A30] text-[#FBF7EC] font-bold rounded shadow-2xs"
                >
                  Kaydet
                </button>
              </div>
            </div>
          ) : (
            <p className="font-handwriting text-lg text-[#5A4A34] leading-relaxed line-clamp-3">
              "{decodeHTMLEntities(card.note) || "Henüz özel not eklenmedi."}"
            </p>
          )}
        </div>

      </div>

      {/* Card Footer Action Row */}
      <div className="pt-3 mt-3 border-t border-dashed border-[#DCD0B9] flex items-center justify-between text-xs text-[#5A4A34]">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onOpenPreview?.(card)}
            className="px-2.5 py-1 bg-[#EBE2D0] hover:bg-[#E2D6C0] text-[#3A2E22] text-[11px] font-bold rounded-md flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#D85A30]" />
            <span>İncele</span>
          </button>
          
          <button
            onClick={() => setIsShareOpen(true)}
            className="p-1 hover:bg-[#EBE2D0] rounded text-[#786958] transition-colors cursor-pointer"
            title="Paylaş"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {card.url ? (
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-[#D85A30] hover:underline flex items-center space-x-1"
          >
            <span>Bağlantı</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : isConfirmingDelete ? (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onDeleteCard(card.id)}
              className="px-2 py-0.5 bg-rose-700 text-white font-bold text-[10px] rounded"
            >
              Sil
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="px-1.5 py-0.5 text-[10px] text-[#786958]"
            >
              İptal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsConfirmingDelete(true)}
            className="p-1 text-[#8A7B5E] hover:text-rose-700 transition-colors cursor-pointer"
            title="Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <ShareModal
        card={card}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

    </div>
  );
};
