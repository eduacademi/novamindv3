import React, { useState, useMemo } from "react";
import { X, Copy, Check, Download, Share2, FileText, Code, Sparkles, Layers, BookOpen, Send } from "lucide-react";
import { Card } from "../types";
import { PLATFORMS } from "../lib/platformHelper";

interface ExportCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  selectedCardIds?: string[];
}

export const ExportCollectionModal: React.FC<ExportCollectionModalProps> = ({
  isOpen,
  onClose,
  cards,
  selectedCardIds = [],
}) => {
  const [exportScope, setExportScope] = useState<"all" | "selected">(() => 
    selectedCardIds.length > 0 ? "selected" : "all"
  );
  const [format, setFormat] = useState<"markdown" | "plaintext" | "html" | "json">("markdown");
  const [isCopied, setIsCopied] = useState(false);

  // Target cards to export
  const targetCards = useMemo(() => {
    if (exportScope === "selected" && selectedCardIds.length > 0) {
      return cards.filter((c) => selectedCardIds.includes(c.id));
    }
    return cards;
  }, [cards, exportScope, selectedCardIds]);

  // Format generated content
  const generatedContent = useMemo(() => {
    if (targetCards.length === 0) return "Dışa aktarılacak kart bulunamadı.";

    if (format === "markdown") {
      let md = `# 📌 NovaMind Koleksiyon & Link Seçkisi\n`;
      md += `*Toplam ${targetCards.length} Bağlantı & Not • Oluşturulma: ${new Date().toLocaleDateString("tr-TR")}*\n\n`;

      // Group by category
      const categories: Record<string, Card[]> = {};
      targetCards.forEach((c) => {
        const cat = c.category || "Genel";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(c);
      });

      Object.entries(categories).forEach(([catName, catCards]) => {
        md += `## 📂 ${catName}\n\n`;
        catCards.forEach((c, idx) => {
          const platformName = PLATFORMS[c.platform]?.name || "Web";
          md += `### ${idx + 1}. [${c.title}](${c.url})\n`;
          md += `- **Platform:** ${platformName}\n`;
          if (c.author) md += `- **Yazar:** ${c.author}\n`;
          if (c.note) md += `- **Not / Düşünce:** *"${c.note.replace(/\n/g, " ")} "*\n`;
          if (c.tags && c.tags.length > 0) md += `- **Etiketler:** ${c.tags.map((t) => `#${t}`).join(" ")}\n`;
          md += `\n`;
        });
      });

      return md;
    }

    if (format === "plaintext") {
      let text = `NovaMind Bağlantı & Link Listesi (${targetCards.length} Kart)\n`;
      text += `--------------------------------------------------\n\n`;

      targetCards.forEach((c, idx) => {
        text += `${idx + 1}. ${c.title}\n`;
        text += `   Link: ${c.url}\n`;
        if (c.note) text += `   Not: ${c.note}\n`;
        text += `\n`;
      });

      return text;
    }

    if (format === "html") {
      let html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">\n`;
      html += `  <h2 style="color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 8px;">📌 NovaMind Link bülteni</h2>\n`;
      html += `  <p style="font-size: 13px; color: #64748b;">Toplam ${targetCards.length} bağlantı derlendi.</p>\n  <ul style="padding-left: 20px;">\n`;

      targetCards.forEach((c) => {
        html += `    <li style="margin-bottom: 12px;">\n`;
        html += `      <a href="${c.url}" style="font-weight: bold; color: #4f46e5; text-decoration: none;" target="_blank">${c.title}</a>\n`;
        if (c.note) html += `      <p style="margin: 4px 0 0 0; font-size: 13px; color: #475569; font-style: italic;">"${c.note}"</p>\n`;
        html += `    </li>\n`;
      });

      html += `  </ul>\n</div>`;
      return html;
    }

    if (format === "json") {
      return JSON.stringify(targetCards, null, 2);
    }

    return "";
  }, [targetCards, format]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const ext = format === "markdown" ? "md" : format === "json" ? "json" : format === "html" ? "html" : "txt";
    const mime = format === "json" ? "application/json" : "text/plain";
    
    const blob = new Blob([generatedContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NovaMind-Koleksiyon-${new Date().toISOString().split("T")[0]}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareWhatsApp = () => {
    let summaryText = `📌 NovaMind Öne Çıkan Link Seçkisi (${targetCards.length} Bağlantı):\n\n`;
    targetCards.slice(0, 5).forEach((c, i) => {
      summaryText += `${i + 1}. ${c.title}\n🔗 ${c.url}\n\n`;
    });
    if (targetCards.length > 5) {
      summaryText += `...ve ${targetCards.length - 5} daha fazla bağlantı.`;
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Koleksiyonu Dışa Aktar & Bülten Paylaş
              </h2>
              <p className="text-xs text-slate-500">
                Seçili veya tüm bağlantılarınızı tek tıkla şık bir bültener ya da listeye dönüştürün.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Scope selection */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-700">
            <span className="text-slate-500 font-medium pl-1">Kapsam:</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setExportScope("all")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  exportScope === "all"
                    ? "bg-white text-indigo-700 shadow-sm border border-indigo-100 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tüm Panom ({cards.length} Kart)
              </button>
              {selectedCardIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExportScope("selected")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    exportScope === "selected"
                      ? "bg-white text-indigo-700 shadow-sm border border-indigo-100 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Seçili Kartlar ({selectedCardIds.length} Kart)
                </button>
              )}
            </div>
          </div>

          {/* Format Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Format Seçin:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFormat("markdown")}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  format === "markdown"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Markdown Bülten</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("plaintext")}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  format === "plaintext"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>Düz Metin</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("html")}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  format === "html"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Code className="w-4 h-4 text-amber-600" />
                <span>HTML Kod</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("json")}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  format === "json"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>JSON Yedeği</span>
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="font-bold text-slate-600">Önizleme & Hazır Metin</span>
              <span className="text-slate-400 font-mono text-[11px]">{targetCards.length} içerik hazır</span>
            </div>
            <textarea
              readOnly
              rows={8}
              value={generatedContent}
              className="w-full p-3.5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs leading-relaxed focus:outline-none border border-slate-800 select-all"
            />
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp / Mesaj Paylaş</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDownloadFile}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Dosya İndir</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
                isCopied
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kopyalandı! ✨</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Tek Tıkla Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
