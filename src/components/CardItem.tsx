import React, { useState } from "react";
import { ExternalLink, ShoppingBag, Star, Trash2, Edit3, Check, Tag, Youtube, Instagram, Twitter, MessageSquare, Pin, Video, FileText, Globe, AtSign, Play, Eye, Share2, Feather } from "lucide-react";
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
      case "youtube": return <Youtube className="w-4 h-4 text-red-600" />;
      case "tiktok": return <Video className="w-4 h-4 text-slate-900" />;
      case "instagram": return <Instagram className="w-4 h-4 text-pink-600" />;
      case "threads": return <AtSign className="w-4 h-4 text-zinc-900" />;
      case "pinterest": return <Pin className="w-4 h-4 text-rose-600" />;
      case "x": return <Twitter className="w-4 h-4 text-sky-500" />;
      case "reddit": return <MessageSquare className="w-4 h-4 text-orange-600" />;
      case "article": return <FileText className="w-4 h-4 text-teal-600" />;
      case "poem": return <Feather className="w-4 h-4 text-purple-600" />;
      case "document": return <FileText className="w-4 h-4 text-rose-600" />;
      case "note": return <Edit3 className="w-4 h-4 text-amber-600" />;
      default: return <Globe className="w-4 h-4 text-slate-600" />;
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
    <div className={`group relative bg-white border transition-all duration-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
      isSelected
        ? "ring-2 ring-indigo-600 border-indigo-500"
        : "border-slate-200/90 hover:border-slate-300"
    }`}>
      
      {/* 1. Distinct Top Accent Color Strip */}
      <div className={`h-[3.5px] w-full ${platformInfo.topBarClass || 'bg-slate-400'}`} />

      {/* Selection Checkbox Overlay */}
      {onToggleSelect && (
        <div className="absolute top-3.5 left-3.5 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(card.id)}
            title="MindMap veya Fikir Üretici için seç"
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm"
          />
        </div>
      )}

      {/* Favorite Button Overlay */}
      <button
        onClick={handleToggleFavorite}
        title={card.is_favorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        className="absolute top-3 right-3 z-20 p-1.5 bg-slate-900/60 hover:bg-slate-900/85 text-white backdrop-blur-md rounded-full transition-transform hover:scale-105 border border-white/20 shadow-xs"
      >
        <Star className={`w-3.5 h-3.5 ${card.is_favorite ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      </button>

      <div>
        {/* 2. Platform Media Header / Thumbnail / Badge */}
        {card.thumbnail_url && !imgFailed ? (
          <div 
            onClick={() => onOpenPreview?.(card)}
            className="relative w-full h-36 bg-slate-950 overflow-hidden cursor-pointer group/thumb"
            title="Detaylar ve Canlı Önizleme"
          >
            <img
              src={card.thumbnail_url}
              alt={card.title || "Görsel"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-90 group-hover/thumb:opacity-100"
              onError={() => setImgFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            
            {/* Minimal Hover Indicator */}
            <div className="absolute top-3 right-10 z-10 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200">
              <div className="p-1 rounded-md bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-xs flex items-center space-x-1 px-2 text-[10px] font-medium">
                <Eye className="w-3 h-3 text-indigo-300" />
                <span>Önizleme</span>
              </div>
            </div>

            {/* Platform Badge Overlay */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-xs font-semibold text-[11px] text-slate-100">
                {getPlatformIcon(card.platform)}
                <span>{platformInfo.name}</span>
              </div>
              {card.author && (
                <span className="truncate max-w-[130px] opacity-90 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-900/70 backdrop-blur-sm border border-white/10">
                  {decodeHTMLEntities(card.author)}
                </span>
              )}
            </div>
          </div>
        ) : card.platform === "threads" ? (
          <div 
            onClick={() => onOpenPreview?.(card)}
            className="relative w-full p-4 bg-zinc-950 text-white cursor-pointer overflow-hidden flex flex-col justify-between border-b border-zinc-800/80 group/threads space-y-2"
            title="Threads Paylaşımını İncele"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 font-semibold text-zinc-100">
                <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px]">@</span>
                <span className="truncate max-w-[140px] text-zinc-200">{decodeHTMLEntities(card.author || "Threads")}</span>
              </div>
              <span className="inline-flex items-center space-x-1 text-[10px] px-2.5 py-0.5 bg-zinc-800/90 text-zinc-200 rounded-full border border-zinc-700 font-semibold">
                <AtSign className="w-3 h-3 text-zinc-300" />
                <span>Threads</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 italic line-clamp-2 leading-relaxed font-serif">
              "{decodeHTMLEntities(card.description || card.title || "Threads gönderisi için açıklama eklenmedi.")}"
            </p>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
              <span className="text-zinc-400 font-sans">Gönderi Detayı</span>
              <span className="flex items-center space-x-1 text-indigo-300 group-hover/threads:translate-x-0.5 transition-transform font-medium">
                <span>İncele</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => onOpenPreview?.(card)}
            className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            title="Detaylı İncele ve Önizle"
          >
            {/* Social Media Platform Badge */}
            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${platformInfo.badgeClass}`}>
              {getPlatformIcon(card.platform)}
              <span>{platformInfo.name}</span>
            </div>

            <div className="flex items-center space-x-2">
              {card.author && (
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
                  {decodeHTMLEntities(card.author)}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 bg-white text-slate-600 rounded-md border border-slate-200 font-medium shadow-2xs">
                İncele
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Card Body */}
      <div className="p-4 space-y-3">
        
        {/* Category Pill & Date */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-slate-100/90 text-slate-700 border border-slate-200/70">
            {card.category || "Genel"}
          </span>
          <time className="text-[11px] font-mono text-slate-400">{formattedDate}</time>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onOpenPreview?.(card)}
          className="font-semibold text-slate-900 text-sm sm:text-[15px] leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {decodeHTMLEntities(card.title) || "İsimsiz İçerik"}
        </h3>

        {/* Core Personal Note Box */}
        <div className={`relative p-3 rounded-xl text-xs text-slate-800 leading-relaxed group/note border-l-2 ${
          card.platform === "poem"
            ? "border-purple-500 bg-purple-50/60 border-y border-r border-purple-100 font-serif"
            : card.platform === "document"
            ? "border-rose-500 bg-rose-50/60 border-y border-r border-rose-100"
            : "border-indigo-500 bg-slate-50/90 border-y border-r border-slate-200/60"
        }`}>
          <div className="flex items-center justify-between font-semibold text-[10px] uppercase tracking-wider mb-1 text-slate-500">
            <span className="flex items-center space-x-1">
              {card.platform === "poem" ? (
                <Feather className="w-3 h-3 text-purple-600" />
              ) : (
                <Edit3 className="w-3 h-3 text-indigo-600" />
              )}
              <span>{card.platform === "poem" ? "Şiir / Edebi Eser Metni" : "Kişisel Fikir Notunuz"}</span>
            </span>
            {!isEditingNote && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="p-1 hover:bg-slate-200/80 rounded text-slate-600 transition-colors"
                title="Notu Düzenle"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div className="space-y-2 mt-1">
              <textarea
                rows={card.platform === "poem" ? 5 : 3}
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
              <div className="flex justify-end space-x-1.5">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="px-2.5 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-3 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold flex items-center space-x-1 shadow-2xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Kaydet</span>
                </button>
              </div>
            </div>
          ) : (
            <p className={`whitespace-pre-wrap ${card.platform === "poem" ? "italic text-purple-950 text-xs leading-relaxed" : "italic text-slate-700"}`}>
              "{decodeHTMLEntities(card.note) || "Henüz özel not eklenmedi."}"
            </p>
          )}
        </div>

        {/* Description if present and no thumbnail */}
        {card.description && !card.thumbnail_url && card.platform !== "threads" && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {decodeHTMLEntities(card.description)}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/50"
              >
                <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* 4. Footer Action Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs">
        
        {/* Source Link */}
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-slate-700 font-medium hover:text-indigo-600 transition-colors"
        >
          {getPlatformIcon(card.platform)}
          <span className="text-[11px]">Kaynak</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>

        <div className="flex items-center space-x-1">
          {/* Share Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            title="Paylaş"
            className="p-1.5 hover:bg-slate-200/80 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>



          {/* Delete Card */}
          {isConfirmingDelete ? (
            <div className="flex items-center space-x-1 bg-rose-50 border border-rose-200 rounded-lg p-0.5 animate-in fade-in">
              <span className="text-[10px] text-rose-700 font-semibold px-1">Silinsin mi?</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCard(card.id);
                }}
                className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-700 transition-colors"
              >
                Evet
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmingDelete(false);
                }}
                className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-semibold text-[10px] rounded hover:bg-slate-300 transition-colors"
              >
                İptal
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(true);
              }}
              title="Kartı Sil"
              className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={card.title || "Bookmark / Not"}
        url={card.url}
        note={card.note}
        author={card.author}
      />
    </div>
  );
};
