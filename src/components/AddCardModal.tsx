import React, { useState, useEffect } from "react";
import { X as CloseIcon, Link as LinkIcon, Sparkles, AlertCircle, Loader2, Tag, BookOpen, Check, ClipboardPaste, Layers, Trash2, Globe, Youtube, Instagram, Video, MessageSquare, Pin, Twitter, AtSign, FileText } from "lucide-react";
import { Card, Platform, Project, UserFocus } from "../types";
import { detectPlatform, PLATFORMS } from "../lib/platformHelper";
import { decodeHTMLEntities } from "../lib/textHelper";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardOrCards: Card | Card[]) => void;
  existingCards: Card[];
  initialUrl?: string;
  initialTitle?: string;
  userFocus?: UserFocus | null;
  activeProject?: Project | null;
}

export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s<>"'\r\n]+)/gi;
  const matches = text.match(urlRegex) || [];
  const cleaned = matches.map((u) => {
    let clean = u;
    while (/[.,;:\)\]\}"'>]$/.test(clean)) {
      clean = clean.slice(0, -1);
    }
    return clean;
  }).filter((u) => u.startsWith("http://") || u.startsWith("https://"));
  return Array.from(new Set(cleaned));
}

interface BulkItemPreview {
  id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  author: string | null;
  platform: Platform;
  category?: string;
  tags?: string[];
  note: string;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCards,
  initialUrl = "",
  initialTitle = "",
  userFocus = null,
  activeProject = null,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState<Platform>("other");
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isAiCategorizing, setIsAiCategorizing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  // Add modes
  const [addMode, setAddMode] = useState<"link" | "note" | "pdf" | "bulk">("link");
  const [bulkText, setBulkText] = useState("");
  const [bulkItems, setBulkItems] = useState<BulkItemPreview[]>([]);
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);
  const isCreator = userFocus === "creator";
  const focusCopy = isCreator
    ? {
        title: "Bunu sonra ne üretebilmek için saklıyorsun?",
        description: "Kısa bir açı, hook veya içerik fikri yaz. NovaMind bunu sonraki üretim önerilerinde kullanacak.",
        placeholder: "Örn: Bu fikri 'AI araçları' video serisinde karşılaştırmalı bir bölüm olarak kullan.",
      }
    : {
        title: "Bu kaynak araştırman için neden önemli?",
        description: "Bir bulgu, soru veya kontrol etmek istediğin noktayı ekle. NovaMind bunu sonraki sentezlerde kullanacak.",
        placeholder: "Örn: Bu kaynağın iddiasını diğer iki makaleyle karşılaştır; yöntemini ayrıca kontrol et.",
      };

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || "");
      setPlatform(initialUrl ? detectPlatform(initialUrl) : "other");
      setTitle(initialTitle || "");
      setDescription("");
      setThumbnailUrl("");
      setAuthor("");
      setNote("");
      setCategory("");
      setTagInput("");
      setTags([]);
      setDuplicateWarning(null);
      setAddMode("link");
      setBulkText("");
      setBulkItems([]);
      setIsLoadingMetadata(false);
      setIsAiCategorizing(false);
      setIsFetchingBatch(false);
    }
  }, [isOpen, initialUrl, initialTitle]);

  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url);
      setPlatform(detected);

      // Check for duplicate
      const isDuplicate = existingCards.some((c) => c.url.toLowerCase().trim() === url.toLowerCase().trim());
      if (isDuplicate) {
        setDuplicateWarning("Bu bağlantı daha önce kütüphanenize eklenmiş! Yine de yeni bir notla ekleyebilirsiniz.");
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [url, existingCards]);

  if (!isOpen) return null;

  const extractedBulkUrls = extractUrlsFromText(bulkText);

  const handleFetchMetadata = async () => {
    if (!url) return;
    setIsLoadingMetadata(true);
    try {
      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || "" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.title) setTitle(decodeHTMLEntities(data.title));
      if (data.description) setDescription(decodeHTMLEntities(data.description));
      if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url);
      if (data.author) setAuthor(decodeHTMLEntities(data.author));
      if (data.platform) setPlatform(data.platform);
      if (data.category && !category) setCategory(decodeHTMLEntities(data.category));
      if (Array.isArray(data.tags) && data.tags.length > 0 && tags.length === 0) {
        setTags(data.tags);
      }
    } catch (err) {
      console.error("Metadata fetch error:", err);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleBatchExtractAndFetch = async () => {
    const urls = extractUrlsFromText(bulkText);
    if (urls.length === 0) return;

    setIsFetchingBatch(true);
    try {
      const response = await fetch("/api/batch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || "" },
        body: JSON.stringify({ urls }),
      });
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const previews: BulkItemPreview[] = data.items.map((item: any, idx: number) => ({
          id: `bulk-item-${Date.now()}-${idx}`,
          url: item.url,
          title: item.title || PLATFORMS[item.platform as Platform]?.name + " İçeriği" || "Web Bağlantısı",
          description: item.description || null,
          thumbnail_url: item.thumbnail_url || null,
          author: item.author || null,
          platform: (item.platform as Platform) || detectPlatform(item.url),
          category: item.category || "Genel",
          tags: item.tags || ["genel"],
          note: "",
        }));
        setBulkItems(previews);
      }
    } catch (err) {
      console.error("Batch metadata error:", err);
      // Fallback manual construct
      const fallbackItems: BulkItemPreview[] = urls.map((u, idx) => {
        const plat = detectPlatform(u);
        return {
          id: `bulk-item-${Date.now()}-${idx}`,
          url: u,
          title: PLATFORMS[plat].name + " İçeriği",
          description: null,
          thumbnail_url: null,
          author: null,
          platform: plat,
          category: "Genel",
          tags: ["genel"],
          note: "",
        };
      });
      setBulkItems(fallbackItems);
    } finally {
      setIsFetchingBatch(false);
    }
  };

  const handleRemoveBulkItem = (id: string) => {
    setBulkItems(bulkItems.filter(b => b.id !== id));
  };

  const handleUpdateBulkTitle = (id: string, newTitle: string) => {
    setBulkItems(bulkItems.map(b => b.id === id ? { ...b, title: newTitle } : b));
  };

  const handleUpdateBulkCategory = (id: string, newCategory: string) => {
    setBulkItems(bulkItems.map(b => b.id === id ? { ...b, category: newCategory } : b));
  };

  const handleAiCategorize = async () => {
    setIsAiCategorizing(true);
    try {
      if (addMode === "bulk" && bulkItems.length > 0) {
        // Send bulk items to analyze each separately
        const response = await fetch("/api/gemini/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || "" },
          body: JSON.stringify({ items: bulkItems }),
        });
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setBulkItems(data.items.map((it: any, i: number) => ({
            ...bulkItems[i],
            category: it.category || bulkItems[i].category || "Genel",
            tags: it.tags || bulkItems[i].tags || ["genel"]
          })));
        }
      } else {
        const response = await fetch("/api/gemini/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || "" },
          body: JSON.stringify({
            title,
            description,
            note,
            url,
            platform
          }),
        });
        const data = await response.json();
        if (data.category) setCategory(data.category);
        if (Array.isArray(data.tags)) {
          const merged = Array.from(new Set([...tags, ...data.tags]));
          setTags(merged);
        }
      }
    } catch (err) {
      console.error("AI categorize error:", err);
    } finally {
      setIsAiCategorizing(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addMode === "bulk") {
      let finalItemsToSave = bulkItems;

      // If user hasn't pressed extract yet, fetch automatically now
      if (finalItemsToSave.length === 0) {
        const urls = extractUrlsFromText(bulkText);
        if (urls.length === 0) return;

        setIsFetchingBatch(true);
        try {
          const resp = await fetch("/api/batch-metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-gemini-api-key": localStorage.getItem("x-gemini-api-key") || "" },
            body: JSON.stringify({ urls }),
          });
          const data = await resp.json();
          if (data.items && Array.isArray(data.items)) {
            finalItemsToSave = data.items.map((item: any, idx: number) => ({
              id: `bulk-item-${Date.now()}-${idx}`,
              url: item.url,
              title: item.title || PLATFORMS[item.platform as Platform]?.name + " İçeriği" || "Web Bağlantısı",
              description: item.description || null,
              thumbnail_url: item.thumbnail_url || null,
              author: item.author || null,
              platform: (item.platform as Platform) || detectPlatform(item.url),
              category: item.category || "Genel",
              tags: item.tags || ["genel"],
              note: "",
            }));
          }
        } catch (err) {
          finalItemsToSave = urls.map((u, idx) => ({
            id: `bulk-item-${Date.now()}-${idx}`,
            url: u,
            title: PLATFORMS[detectPlatform(u)].name + " İçeriği",
            description: null,
            thumbnail_url: null,
            author: null,
            platform: detectPlatform(u),
            category: "Genel",
            tags: ["genel"],
            note: "",
          }));
        } finally {
          setIsFetchingBatch(false);
        }
      }

      if (finalItemsToSave.length === 0) return;

      const newCards: Card[] = finalItemsToSave.map((item, i) => ({
        id: `card-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        url: item.url,
        platform: item.platform,
        title: item.title,
        description: item.description,
        thumbnail_url: item.thumbnail_url,
        author: item.author,
        category: item.category || category.trim() || "Genel",
        note: item.note.trim() || note.trim(),
        tags: (item.tags && item.tags.length > 0) ? item.tags : (tags.length > 0 ? tags : ["genel"]),
        metadata_source: "auto",
        created_at: Date.now() + i,
        is_favorite: false,
        projectIds: activeProject ? [activeProject.id] : [],
      }));

      onSave(newCards);
      onClose();
      return;
    }

    // Determine platform, category, title defaults per mode
    let targetPlatform = platform;
    let finalCategory = category.trim();

    if (addMode === "note") {
      targetPlatform = platform === "poem" ? "poem" : "note";
      if (!finalCategory) {
        finalCategory = targetPlatform === "poem" ? "Şiir & Edebiyat" : "Notlar";
      }
    } else if (addMode === "pdf") {
      targetPlatform = "document";
      if (!finalCategory) {
        finalCategory = "Dökümanlar";
      }
    } else if (addMode === "link") {
      if (!url.trim()) return; // URL is required for links
      targetPlatform = detectPlatform(url.trim());
      if (!finalCategory) {
        finalCategory = "Genel";
      }
    }

    const generatedUrl = url.trim() || `note://${targetPlatform}-${Date.now()}`;

    // Default titles if empty
    const defaultTitle = 
      addMode === "note" 
        ? (targetPlatform === "poem" ? "Şiir / Edebi Not" : "Kişisel Not")
        : addMode === "pdf"
        ? "PDF / Döküman"
        : (PLATFORMS[targetPlatform]?.name || "Web") + " İçeriği";

    const newCard: Card = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: generatedUrl,
      platform: targetPlatform,
      title: title.trim() || defaultTitle,
      description: description.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      author: author.trim() || null,
      category: finalCategory || "Genel",
      note: note.trim(),
      tags: tags.length > 0 
        ? tags 
        : (targetPlatform === "poem" ? ["şiir", "edebiyat"] : targetPlatform === "document" ? ["pdf", "döküman"] : ["genel"]),
      metadata_source: title ? "auto" : "manual",
      created_at: Date.now(),
      is_favorite: false,
      projectIds: activeProject ? [activeProject.id] : [],
    };

    onSave(newCard);
    onClose();
  };

  const getPlatformIcon = (plat: Platform) => {
    switch (plat) {
      case "youtube": return <Youtube className="w-4 h-4 text-red-600" />;
      case "tiktok": return <Video className="w-4 h-4 text-slate-800" />;
      case "instagram": return <Instagram className="w-4 h-4 text-pink-600" />;
      case "threads": return <AtSign className="w-4 h-4 text-zinc-900" />;
      case "pinterest": return <Pin className="w-4 h-4 text-rose-600" />;
      case "x": return <Twitter className="w-4 h-4 text-sky-500" />;
      case "reddit": return <MessageSquare className="w-4 h-4 text-orange-600" />;
      case "article": return <FileText className="w-4 h-4 text-indigo-600" />;
      default: return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const currentPlatformInfo = PLATFORMS[platform];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              {addMode === "link" && <LinkIcon className="w-5 h-5" />}
              {addMode === "note" && <BookOpen className="w-5 h-5 text-amber-600" />}
              {addMode === "pdf" && <FileText className="w-5 h-5 text-rose-600" />}
              {addMode === "bulk" && <Layers className="w-5 h-5 text-indigo-600" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                {addMode === "link" && "Yeni Bağlantı & Medya Ekle"}
                {addMode === "note" && "Kişisel Not & Şiir Ekle"}
                {addMode === "pdf" && "PDF & Döküman Ekle"}
                {addMode === "bulk" && "Toplu Link Ayıklama"}
              </h2>
              <p className="text-xs text-slate-500">
                {addMode === "link" && "YouTube, Instagram, X, TikTok veya Web makale linki ekleyin."}
                {addMode === "note" && "Kendi fikirlerinizi, kişisel notlarınızı veya şiirlerinizi kaydedin."}
                {addMode === "pdf" && "Çalışma dökümanlarınızı veya PDF özeti notlarınızı kaydedin."}
                {addMode === "bulk" && "Karışık metinden tüm linkleri otomatik ayıklayın ve kaydedin."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setAddMode("link");
                setPlatform("other");
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                addMode === "link" 
                  ? "bg-white text-indigo-700 shadow-sm border border-indigo-100" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>🔗 Link Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAddMode("note");
                setPlatform("note");
                if (!category) setCategory("Notlar");
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                addMode === "note" 
                  ? "bg-white text-amber-800 shadow-sm border border-amber-200" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>📝 Not & Şiir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAddMode("pdf");
                setPlatform("document");
                if (!category) setCategory("Dökümanlar");
                if (!tags.includes("pdf")) setTags([...tags, "pdf"]);
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                addMode === "pdf" 
                  ? "bg-white text-rose-800 shadow-sm border border-rose-200" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>📄 PDF / Döküman</span>
            </button>

            <button
              type="button"
              onClick={() => setAddMode("bulk")}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                addMode === "bulk" 
                  ? "bg-white text-indigo-700 shadow-sm border border-indigo-100" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>📚 Toplu Link</span>
            </button>
          </div>

          {userFocus && addMode !== "bulk" && (
            <div className={`rounded-xl border p-3.5 ${isCreator ? "border-orange-200 bg-orange-50" : "border-cyan-200 bg-cyan-50"}`}>
              <div className="flex items-start gap-2">
                <Sparkles className={`mt-0.5 h-4 w-4 shrink-0 ${isCreator ? "text-orange-600" : "text-cyan-700"}`} />
                <div>
                  <p className={`text-xs font-bold ${isCreator ? "text-orange-950" : "text-cyan-950"}`}>{focusCopy.title}</p>
                  <p className={`mt-1 text-[11px] leading-5 ${isCreator ? "text-orange-800" : "text-cyan-800"}`}>{focusCopy.description}</p>
                </div>
              </div>
            </div>
          )}

          {activeProject && (
            <div className="flex items-center gap-2 rounded-xl border border-[#DCD0B9] bg-[#FBF7EC] px-3 py-2 text-xs text-[#5A4A34]">
              <Layers className="h-4 w-4 text-[#D85A30]" />
              Bu kaynak <strong>{activeProject.title}</strong> projesine eklenecek.
            </div>
          )}

          {/* MODE 1: LINK ADDS */}
          {addMode === "link" && (
            <>
              {/* URL Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Bağlantı (URL) *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setUrl(newUrl);
                      if (newUrl !== url) {
                        setTitle("");
                        setDescription("");
                        setThumbnailUrl("");
                        setAuthor("");
                      }
                    }}
                    placeholder="https://www.youtube.com/watch?v=... veya TikTok, Instagram, X linki"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setUrl(text);
                        setTitle("");
                        setDescription("");
                        setThumbnailUrl("");
                        setAuthor("");
                      } catch (err) {}
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-colors"
                    title="Panodan Yapıştır"
                  >
                    <ClipboardPaste className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={!url || isLoadingMetadata}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    {isLoadingMetadata ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Otomatik Bilgi Çek</span>
                    )}
                  </button>
                </div>

                {/* Duplicate Notice */}
                {duplicateWarning && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                {/* Platform indicator badge */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border font-medium ${currentPlatformInfo.bgColor} ${currentPlatformInfo.borderColor}`}>
                    Algılanan Platform: {currentPlatformInfo.name}
                  </span>
                  {(!currentPlatformInfo.autoMetadataSupported) && (
                    <span className="text-slate-500 italic">
                      💡 {currentPlatformInfo.name} için başlık ve notu manuel girmek önerilir.
                    </span>
                  )}
                </div>
              </div>

              {/* User Note Field */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>{userFocus ? (isCreator ? "İçerik Açınız / Hook'unuz" : "Araştırma Notunuz / Sorunuz") : "Sizin Notunuz & Fikriniz (Opsiyonel)"}</span>
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={userFocus ? focusCopy.placeholder : currentPlatformInfo.notesTip}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    İçerik / Gönderi Başlığı
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ör: 10 Dakikada AI Uygulaması Yapmak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kanal / Yazar
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="@kullanici_adi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description & Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kısa Açıklama / Özet
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="İçeriğin genel konusu..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Görsel / Kapak URL
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* MODE 2: PERSONAL NOTE & POEM */}
          {addMode === "note" && (
            <div className="space-y-3.5">
              {/* Note Subtype Selector */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-600">Not Türü:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPlatform("note");
                    if (!category || category === "Şiir & Edebiyat") setCategory("Notlar");
                  }}
                  className={`px-3 py-1 rounded-lg border font-bold transition-all ${
                    platform === "note" 
                      ? "bg-amber-100 border-amber-300 text-amber-900" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  📝 Kişisel Not & Fikir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlatform("poem");
                    if (!category || category === "Notlar") setCategory("Şiir & Edebiyat");
                    if (!tags.includes("şiir")) setTags([...tags, "şiir"]);
                  }}
                  className={`px-3 py-1 rounded-lg border font-bold transition-all ${
                    platform === "poem" 
                      ? "bg-purple-100 border-purple-300 text-purple-900" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ✍️ Şiir & Edebi Not
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {platform === "poem" ? "Şiir / Edebi Metin Başlığı *" : "Not / Konu Başlığı *"}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={platform === "poem" ? "Ör: Sessiz Gemi" : "Ör: Haftalık Hedefler & Fikirlerim"}
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Main Text Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {platform === "poem" ? "Şiir Metni / Mısralar *" : "Not İçeriği & Düşünceleriniz *"}
                </label>
                <textarea
                  rows={5}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    platform === "poem"
                      ? "Mısralarınızı buraya yazabilirsiniz..."
                      : "Düşüncelerinizi, notlarınızı ve aklınıza gelen fikirleri buraya detaylıca yazın..."
                  }
                  className="w-full px-3.5 py-2.5 bg-amber-50/20 border border-amber-200 rounded-xl text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                />
              </div>

              {/* Author / Poet */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {platform === "poem" ? "Şair / Yazar (Opsiyonel)" : "Yazar / Kaynak (Opsiyonel)"}
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Kendi adınız veya şair ismi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* MODE 3: PDF / DOCUMENT */}
          {addMode === "pdf" && (
            <div className="space-y-3.5">
              {/* Document Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📄 PDF / Döküman Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ör: Yapay Zeka Trendleri Raporu 2026.pdf"
                  className="w-full px-3.5 py-2.5 bg-rose-50/30 border border-rose-200 rounded-xl text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Document Summary / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Döküman Özeti & Çalışma Notlarınız
                </label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Dökümandan çıkardığınız ana başlıklar, önemli kararlar ve çalışma özetiniz..."
                  className="w-full px-3.5 py-2.5 bg-rose-50/20 border border-rose-200 rounded-xl text-sm text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 font-serif"
                />
              </div>

              {/* Optional PDF / Drive Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    PDF Bağlantısı / Drive URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/... veya web linki"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Hazırlayan / Yayınlayan (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ör: McKinsey & Company"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: BULK ADD MODE */}
          {addMode === "bulk" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Metin veya Karmaşık Link Listesi
                  </label>
                  {extractedBulkUrls.length > 0 && (
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      ✨ {extractedBulkUrls.length} adet URL otomatik tespit edildi
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Mesaj, e-posta veya not metni yapıştırın... İçindeki YouTube, TikTok, Instagram, Twitter/X, Reddit, Makale linkleri otomatik bulunacaktır."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setBulkText(text);
                      } catch (err) {}
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs flex items-center space-x-1 shadow-sm"
                    title="Panodan Metin Yapıştır"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Yapıştır</span>
                  </button>
                </div>
              </div>

              {/* Extraction Action Button */}
              {extractedBulkUrls.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                  <div className="text-xs text-indigo-900">
                    <strong>{extractedBulkUrls.length} bağlantı bulundu.</strong> Başlık, açıklama ve kapak görselleri otomatik çekilsin mi?
                  </div>
                  <button
                    type="button"
                    onClick={handleBatchExtractAndFetch}
                    disabled={isFetchingBatch}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isFetchingBatch ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Bilgiler Çekiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bilgileri Otomatik Çek</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Extracted Bulk Items Preview List */}
              {bulkItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Otomatik Ayıklanan Kartlar ({bulkItems.length})</span>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={handleAiCategorize}
                        disabled={isAiCategorizing}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors disabled:opacity-50"
                        title="AI ile her linki bağımsız analiz edip özel kategori ve etiketler atar"
                      >
                        {isAiCategorizing ? (
                          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-600" />
                        )}
                        <span>AI ile Her Linki Ayrı Analiz Et</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkItems([])}
                        className="text-slate-400 hover:text-rose-600 font-normal hover:underline"
                      >
                        Listeyi Temizle
                      </button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {bulkItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white border border-slate-200/90 rounded-lg shadow-sm flex items-start space-x-3 text-xs"
                      >
                        {/* Thumbnail or Platform Icon */}
                        <div className="w-14 h-14 rounded-md bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                          {item.thumbnail_url ? (
                            <img src={item.thumbnail_url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            getPlatformIcon(item.platform)
                          )}
                        </div>

                        {/* Editable Title & Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 border text-slate-700 flex items-center space-x-1">
                              {getPlatformIcon(item.platform)}
                              <span>{PLATFORMS[item.platform]?.name || "Web"}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">{item.url}</span>
                          </div>

                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateBulkTitle(item.id, e.target.value)}
                            placeholder="Kart Başlığı"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                          />

                          <div className="flex items-center space-x-2 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Kategori:</span>
                            <input
                              type="text"
                              value={item.category || "Genel"}
                              onChange={(e) => handleUpdateBulkCategory(item.id, e.target.value)}
                              className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                              placeholder="Kategori"
                            />
                          </div>

                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {item.tags.map((t, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px]">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 pt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBulkItem(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                          title="Bu linki kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Note for Bulk Items */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Ortak Not / Fikir (Tüm Toplu Kartlara Eklenir - İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ör: Bu gruptaki videoları hafta sonu projesinde inceleyeceğim."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Category & Tags section with AI suggestion button */}
          <div className="p-3.5 bg-slate-100/70 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kategorizasyon & Etiketler</span>
              </span>
              <button
                type="button"
                onClick={handleAiCategorize}
                disabled={isAiCategorizing || (!title && !note && bulkItems.length === 0)}
                className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-medium text-xs rounded-lg flex items-center space-x-1 shadow-sm transition-all disabled:opacity-50"
              >
                {isAiCategorizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>AI ile Tahmin Et</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="ör: Yazılım & AI, Tasarım, Üretkenlik"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Etiketler (Virgül veya Enter)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="yazılım, ilham, proje..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Tag Badges */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="ml-1 text-indigo-500 hover:text-indigo-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isFetchingBatch || (addMode === "bulk" && extractedBulkUrls.length === 0 && bulkItems.length === 0)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center space-x-2 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isFetchingBatch ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {addMode === "bulk" 
                  ? `Panoma Kaydet (${bulkItems.length > 0 ? bulkItems.length : extractedBulkUrls.length} Kart)` 
                  : "Panoma Kaydet"}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
