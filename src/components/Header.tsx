import React, { useRef } from "react";
import { Plus, Download, Upload, Sparkles, Network, Bookmark, Lightbulb, Share2, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { User } from "firebase/auth";
import { Card } from "../types";
import { exportBackupJSON, importBackupJSON } from "../lib/storage";

interface HeaderProps {
  cards: Card[];
  activeTab: "library" | "mindmap" | "ideas";
  setActiveTab: (tab: "library" | "mindmap" | "ideas") => void;
  onOpenAddModal: () => void;
  onRefreshData: () => void;
  onOpenPwaInfo: () => void;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  currentUser: User | null;
  onLoginWithGoogle: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cards,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onRefreshData,
  onOpenPwaInfo,
  onOpenSettings,
  onOpenPricing,
  currentUser,
  onLoginWithGoogle,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Fikir_Kutuphanesi_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupJSON(content);
        alert(result.message);
        if (result.success) {
          onRefreshData();
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalNotesLength = cards.reduce((acc, c) => acc + (c.note ? c.note.length : 0), 0);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md text-slate-100 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-indigo-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">NovaMind</span>
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1" title="Kişiye Özel İzole Bulut Veritabanı">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{currentUser && !currentUser.isAnonymous ? "Kişisel Bulut" : "Misafir Modu"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Akıllı Link & Medya Kasası • AI Knowledge Graph • Fikir Üretici
              </p>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* User Auth Info / Login button */}
            {currentUser && !currentUser.isAnonymous ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-indigo-400" />
                ) : (
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-xs text-slate-200 font-medium max-w-[120px] truncate">{currentUser.displayName || currentUser.email}</span>
                <button
                  onClick={onLogout}
                  title="Çıkış Yap"
                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginWithGoogle}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-medium rounded-xl flex items-center space-x-1.5 border border-amber-500/30 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Google ile Giriş Yap</span>
              </button>
            )}

            {/* Upgrade to Pro Button */}
            <button
              onClick={onOpenPricing}
              id="header-upgrade-btn"
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.03]"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Pro'ya Yükselt</span>
            </button>

            {/* Add Link Primary Button */}
            <button
              onClick={onOpenAddModal}
              id="header-add-link-btn"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Link & Not Ekle</span>
            </button>

            {/* PWA Share info */}
            <button
              onClick={onOpenPwaInfo}
              id="header-pwa-info-btn"
              title="Mobil Paylaşım & PWA İpuçları"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl flex items-center space-x-1 border border-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">PWA / Paylaşım</span>
            </button>

            {/* Backup Export/Import */}
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={onOpenSettings}
                title="Ayarlar"
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors border border-transparent hover:border-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
              <button
                onClick={handleExport}
                id="header-export-btn"
                title="Verileri JSON Yedekle"
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                id="header-import-btn"
                title="JSON Yedeği Yükle"
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
            </div>

          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            
            <button
              onClick={() => setActiveTab("mindmap")}
              id="tab-mindmap-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                activeTab === "mindmap"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Network className="w-4 h-4 text-amber-400" />
              <span>AI Knowledge Graph (Ana Ekran)</span>
            </button>

            <button
              onClick={() => setActiveTab("library")}
              id="tab-library-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                activeTab === "library"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Kişisel Link Panosu ({cards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ideas")}
              id="tab-ideas-btn"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                activeTab === "ideas"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Fikir Üretici (AI)</span>
            </button>

          </div>

          <div className="hidden lg:flex items-center space-x-4 text-xs text-slate-400 pl-4 border-l border-slate-800">
            <span><b>{cards.length}</b> Kayıtlı Bağlantı</span>
            <span><b>{totalNotesLength}</b> Karakter Not</span>
          </div>

        </div>

      </div>
    </header>
  );
};
