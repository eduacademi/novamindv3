import React, { useState, useEffect, useRef } from "react";
import { User } from "firebase/auth";
import { X, User as UserIcon, CreditCard, Database, Download, Upload, Key, Sparkles, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { UserSubscription, PLAN_LIMITS } from "../../server/types/subscription";
import { Card, ReminderItem } from "../types";
import { exportBackupJSON, importBackupJSON } from "../lib/storage";

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  subscription: UserSubscription | null;
  cards: Card[];
  reminders: ReminderItem[];
  onOpenPricingModal: () => void;
  onRefreshData: () => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  subscription,
  cards,
  reminders,
  onOpenPricingModal,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"account" | "sync" | "backup" | "advanced">("account");
  const [apiKey, setApiKey] = useState("");
  const [isSyncingGraph, setIsSyncingGraph] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem("x-gemini-api-key") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlan = subscription?.plan || "free";
  const limits = PLAN_LIMITS[currentPlan];
  const maxCards = limits.maxCards;
  const cardsCount = cards.length;
  const usagePercentage = maxCards === -1 ? 0 : Math.min(100, Math.round((cardsCount / maxCards) * 100));

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("x-gemini-api-key", apiKey.trim());
      toast.success("Özel Gemini API anahtarınız kaydedildi.");
    } else {
      localStorage.removeItem("x-gemini-api-key");
      toast.info("Özel API anahtarı temizlendi. Sunucu dahilindeki varsayılan AI kullanılacak.");
    }
  };

  const handleExportJSON = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NovaMind_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Veri yedeğiniz bilgisayarınıza indirildi.");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupJSON(content);
        if (result.success) {
          toast.success(result.message);
          onRefreshData();
        } else {
          toast.error(result.message);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTriggerGraphSync = async () => {
    setIsSyncingGraph(true);
    try {
      const res = await fetch("/api/graph/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      });
      if (res.ok) {
        toast.success("Tüm kartlarınız Neo4j Graph veritabanına başarıyla aktarıldı!");
      } else {
        toast.error("Graph senkronizasyonu sırasında sunucu uyarısı alındı.");
      }
    } catch (e) {
      toast.error("Neo4j senkronizasyonu gerçekleştirilemedi.");
    } finally {
      setIsSyncingGraph(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Profile Bar */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" className="w-11 h-11 rounded-2xl border-2 border-indigo-500 shadow-md object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300">
                <UserIcon className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  {currentUser?.displayName || (currentUser?.email ? currentUser.email.split("@")[0] : "Misafir Kullanıcı")}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentPlan.toUpperCase()} PLAN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-light">
                {currentUser?.email || "Yerel tarayıcı oturumu • Giriş yapılmadı"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-5 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "account" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Hesabım & Abonelik</span>
          </button>

          <button
            onClick={() => setActiveTab("sync")}
            className={`px-5 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sync" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Senkronizasyon & Graph DB</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`px-5 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "backup" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Yedekleme & Aktarım</span>
          </button>

          <button
            onClick={() => setActiveTab("advanced")}
            className={`px-5 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "advanced" ? "border-indigo-500 text-indigo-300 bg-indigo-500/10" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Gelişmiş & BYOK</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Account & Subscription */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Plan Card Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Aktif Aboneliğiniz</span>
                  <h3 className="text-xl font-bold text-white capitalize">{currentPlan} Paket</h3>
                  <p className="text-xs text-slate-300 font-light mt-1">
                    {currentPlan === "free"
                      ? "Temel arşivleme ve 50 kart kapasitesi aktif."
                      : `Aboneliğiniz aktif. Yenilenme tarihi: ${new Date(subscription?.expiresAt || Date.now() + 30*86400000).toLocaleDateString("tr-TR")}`}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPricingModal();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  {currentPlan === "free" ? "Pro'ya Yükselt" : "Planı Değiştir"}
                </button>
              </div>

              {/* Resource Usage Progress */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-300">Kayıtlı Kart Kotası</span>
                  <span className="text-indigo-400">
                    {cardsCount} / {maxCards === -1 ? "Sınırsız" : maxCards} Kart (%{usagePercentage})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${maxCards === -1 ? 100 : usagePercentage}%` }}
                  />
                </div>
              </div>

              {/* Plan Included Features */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planınıza Dahil Özellikler</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cmd+K Hızlı Komut Paleti</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reader Mode (Odak Okuyucu)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Günlük 3 Akıllı Anımsatıcı</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{limits.supportsNeo4j ? "Neo4j Graph DB Aktif" : "2D Tuval Mind Map"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sync & Graph DB */}
          {activeTab === "sync" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Firestore İzole Bulut Senkronizasyonu</h4>
                    <p className="text-xs text-slate-400 font-light">Tüm notlarınız kişisel hesabınız altında gerçek zamanlı şifrelenerek saklanır.</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-300">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Kişisel Veri İzolasyonu: <b>Aktif</b></span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CANLI</span>
                </div>
              </div>

              {/* Neo4j Graph Sync Control */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Neo4j Graph Database (Topolojik Ağ)</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Cypher Query Active
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 font-light mt-1">
                    Kartlarınız arasındaki anlamsal ilişkiler Neo4j graf veritabanında haritalanır.
                  </p>
                </div>

                <button
                  onClick={handleTriggerGraphSync}
                  disabled={isSyncingGraph}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingGraph ? "animate-spin" : ""}`} />
                  <span>{isSyncingGraph ? "Neo4j Senkronize Ediliyor..." : "Graph DB Senkronizasyonunu Yenile"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Backup & Export */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">JSON Veri Yedeği İndir</h4>
                  <p className="text-xs text-slate-400 font-light">
                    Kütüphanenizdeki tüm kartları, notları ve hatırlatıcıları bilgisayarınıza JSON formatında aktarın.
                  </p>
                </div>

                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Tüm Verilerimi İndir (.JSON)</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">JSON Yedeği Geri Yükle</h4>
                  <p className="text-xs text-slate-400 font-light">
                    Daha önce aldığınız yedeği seçerek kütüphanenizi anında geri yükleyin.
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Yedek Dosyası Seç (.JSON)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Advanced & BYOK */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Kendi Gemini API Anahtarınız (Opsiyonel / BYOK)</h4>
                  <p className="text-xs text-slate-400 font-light">
                    Sunucu kotasından bağımsız olarak kendi Google Gemini API anahtarınız ile işlem yapmak isterseniz buraya tanımlayabilirsiniz.
                  </p>
                </div>

                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AI Studio / Gemini API Key"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  API Anahtarını Kaydet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>NovaMind User Account Dashboard</span>
          <span>Sürüm 3.0 • SaaS Ready</span>
        </div>
      </div>
    </div>
  );
};
