import React, { useState } from "react";
import { X, Copy, Check, Share2, MessageCircle, Send, Twitter, Linkedin, Facebook, Mail, Link2, ExternalLink } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  note?: string;
  author?: string | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  note,
  author,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const shareText = `${title}${author ? ` (${author})` : ""}${note ? `\n\nNot: ${note}` : ""}\n\n${url}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: note ? `${title}\n${note}` : title,
          url: url,
        });
      } catch (err) {
        console.log("Native share cancelled or failed:", err);
      }
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
      bgColor: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800",
      href: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: "Telegram",
      icon: <Send className="w-5 h-5 text-sky-500" />,
      bgColor: "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title + (note ? `\n${note}` : ""))}`,
    },
    {
      name: "X (Twitter)",
      icon: <Twitter className="w-5 h-5 text-zinc-800" />,
      bgColor: "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-900",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5 text-blue-700" />,
      bgColor: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "E-Posta",
      icon: <Mail className="w-5 h-5 text-amber-600" />,
      bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900",
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">İçeriği Paylaş</h3>
              <p className="text-[11px] text-slate-400">Platform veya bağlantı seçin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title & Link preview box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 line-clamp-1">
              <Link2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{title}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate font-mono">{url}</p>
          </div>

          {/* Native Web Share Button (if available) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Sistem Paylaşım Menüsünü Aç (Mobil / Cihaz)</span>
            </button>
          )}

          {/* Share Grid */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Sosyal Platformlarda Paylaş
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-2xl border ${item.bgColor} flex items-center space-x-2.5 text-xs font-semibold transition-transform active:scale-95 shadow-sm`}
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Direct Copy Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Bağlantı & Not Kopyala
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareText.replace(/\n+/g, " ")}
                className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 truncate focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 ${
                  copied
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
