import React, { useState } from "react";
import { X, ExternalLink, ShoppingBag, Star, Trash2, Edit3, Check, Tag, Youtube, Instagram, Twitter, MessageSquare, Pin, Video, FileText, Globe, AtSign, Play, Sparkles, Share2 } from "lucide-react";
import { Card, Platform } from "../types";
import { PLATFORMS } from "../lib/platformHelper";
import { getEmbedInfo } from "../lib/embedHelper";
import { decodeHTMLEntities } from "../lib/textHelper";
import { ShareModal } from "./ShareModal";

interface PreviewModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (updatedCard: Card) => void;
  onDeleteCard: (id: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
  onDeleteCard,
}) => {
  if (!isOpen || !card) return null;

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState(card.note || "");

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [showThreadsEmbed, setShowThreadsEmbed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const platformInfo = PLATFORMS[card.platform] || PLATFORMS.other;
  const embedInfo = getEmbedInfo(card.url, card.platform);

  const getPlatformIcon = (plat: Platform) => {
    switch (plat) {
      case "youtube": return <Youtube className="w-5 h-5 text-red-600" />;
      case "tiktok": return <Video className="w-5 h-5 text-slate-800" />;
      case "instagram": return <Instagram className="w-5 h-5 text-pink-600" />;
      case "threads": return <AtSign className="w-5 h-5 text-zinc-900" />;
      case "pinterest": return <Pin className="w-5 h-5 text-rose-600" />;
      case "x": return <Twitter className="w-5 h-5 text-sky-500" />;
      case "reddit": return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case "article": return <FileText className="w-5 h-5 text-indigo-600" />;
      default: return <Globe className="w-5 h-5 text-gray-600" />;
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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card Box */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Accent Line */}
        <div className={`h-[3.5px] w-full ${platformInfo.topBarClass || 'bg-slate-400'}`} />

        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
              {getPlatformIcon(card.platform)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide text-white">{platformInfo.name} İçeriği</span>
                {card.author && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                    {card.author}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Canlı Önizleme & Detay Kartı</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsShareOpen(true)}
              title="İçeriği Paylaş (WhatsApp, X, Telegram, vb.)"
              className="p-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-xl transition-colors flex items-center space-x-1.5 px-3 text-xs font-semibold border border-indigo-500/30"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Paylaş</span>
            </button>

            <button
              onClick={handleToggleFavorite}
              title={card.is_favorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <Star className={`w-4 h-4 ${card.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Split View (Embed Video/Media on left, Card details on right) */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Embed / Media Player / Threads Post Card */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/5 rounded-2xl p-2 border border-slate-200/80">
            {card.platform === "threads" ? (
              !showThreadsEmbed ? (
                <div className="w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between space-y-4 my-auto">
                  {/* Threads Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-base">
                        @
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-zinc-100">{card.author || "Threads Kullanıcısı"}</span>
                          <span className="px-2 py-0.5 text-[10px] bg-zinc-800 text-zinc-300 rounded border border-zinc-700 font-semibold">
                            Threads
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">Orijinal Paylaşım Metni</p>
                      </div>
                    </div>

                    {embedInfo.embedUrl && (
                      <button
                        onClick={() => setShowThreadsEmbed(true)}
                        className="px-2.5 py-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors font-medium flex items-center space-x-1"
                        title="İçeriği gömülü iframe olarak göster"
                      >
                        <Video className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Embed Görünümü</span>
                      </button>
                    )}
                  </div>

                  {/* Threads Post Content / Description */}
                  <div className="space-y-3 py-1">
                    <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 leading-relaxed font-serif whitespace-pre-wrap">
                      "{decodeHTMLEntities(card.description || card.title || "Threads paylaşımının açıklama metni çekilemedi.")}"
                    </div>

                    {card.thumbnail_url && !imgFailed && (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-800 max-h-60 bg-black">
                        <img
                          src={card.thumbnail_url}
                          alt={card.title || "Threads Görseli"}
                          referrerPolicy="no-referrer"
                          onError={() => setImgFailed(true)}
                          className="w-full h-auto max-h-60 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Threads Footer */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-medium">Threads Post Detayı</span>
                    <a
                      href={card.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-transform hover:scale-105"
                    >
                      <span>Threads'te Orijinalini Aç</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center space-y-2">
                  <div className={`relative ${embedInfo.aspectClass}`}>
                    <iframe
                      src={embedInfo.embedUrl!}
                      title={card.title || "Threads Embed"}
                      className="w-full h-full border-0 rounded-2xl shadow-inner"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <button
                    onClick={() => setShowThreadsEmbed(false)}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg font-medium transition-colors"
                  >
                    Metin Kartı Görünümüne Dön
                  </button>
                </div>
              )
            ) : embedInfo.embedUrl ? (
              <div className={`relative ${embedInfo.aspectClass}`}>
                <iframe
                  src={embedInfo.embedUrl}
                  title={card.title || "Sosyal Medya Embed"}
                  className="w-full h-full border-0 rounded-2xl shadow-inner"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : card.thumbnail_url && !imgFailed ? (
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                <img
                  src={card.thumbnail_url}
                  alt={card.title || "Görsel Önizleme"}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-auto max-h-[480px] object-contain mx-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <a
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                  >
                    <span>Orijinal Bağlantıyı Aç</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-slate-100/80 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                  {getPlatformIcon(card.platform)}
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{platformInfo.name} Sayfası</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs">
                  Bu içerik doğrudan gömülü video sunmuyor. Aşağıdaki butona tıklayarak orijinal web sayfasını ziyaret edebilirsiniz.
                </p>
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Sayfayı Yeni Sekmede Aç</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Information & Notes */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Category & Date */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                {card.category || "Genel"}
              </span>
              <time className="text-[11px] font-medium text-slate-400">{formattedDate}</time>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {decodeHTMLEntities(card.title) || "İsimsiz İçerik"}
            </h2>

            {/* Core Personal Note Box (editable) */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-800 leading-relaxed shadow-sm">
              <div className="flex items-center justify-between font-bold text-[10px] uppercase tracking-wider text-amber-800 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Kişisel Notunuz & Fikriniz</span>
                </span>
                {!isEditingNote && (
                  <button
                    onClick={() => setIsEditingNote(true)}
                    className="p-1 hover:bg-amber-200/60 rounded text-amber-800 transition-colors"
                    title="Notu Düzenle"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="space-y-2 mt-1">
                  <textarea
                    rows={4}
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingNote(false)}
                      className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap italic font-sans text-slate-800">
                  "{decodeHTMLEntities(card.note) || "Henüz özel not yazılmadı."}"
                </p>
              )}
            </div>

            {/* Description */}
            {card.description && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">İçerik Özeti / Açıklama</p>
                <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {decodeHTMLEntities(card.description)}
                </p>
              </div>
            )}

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Etiketler</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      <Tag className="w-3 h-3 mr-1 text-slate-400" />
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <span>Kaynağa Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsShareOpen(true)}
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Paylaş</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">


                {isConfirmingDelete ? (
                  <div className="flex items-center space-x-1.5 p-1 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in">
                    <span className="text-[11px] text-rose-800 font-bold px-1.5">Emin misiniz?</span>
                    <button
                      onClick={() => {
                        onDeleteCard(card.id);
                        setIsConfirmingDelete(false);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      Evet, Sil
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-colors"
                    title="Kartı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Share Modal */}
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
