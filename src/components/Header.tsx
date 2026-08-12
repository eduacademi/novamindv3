import React, { useState, useRef } from "react";
import { Plus, Sparkles, Network, Bookmark, Lightbulb, Share2, LogIn, LogOut, User as UserIcon, Search, MoreHorizontal, Settings, Download, Upload, ShieldCheck, Pin } from "lucide-react";
import { User } from "firebase/auth";
import { toast } from "sonner";
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
  onOpenCommandPalette: () => void;
  onOpenAuthModal: () => void;
  onOpenUserDashboard: () => void;
  onOpenAdminDashboard: () => void;
  currentUser: User | null;
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
  onOpenCommandPalette,
  onOpenAuthModal,
  onOpenUserDashboard,
  onOpenAdminDashboard,
  currentUser,
  onLogout,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NovaMind_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Veri yedeğiniz başarıyla indirildi.");
    setIsMoreMenuOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsMoreMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#E2D8C3] text-[#2C221E] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Clean Warm Moleskine Branding */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#D85A30] flex items-center justify-center text-[#FBF7EC] shadow-sm transform -rotate-1">
            <Pin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold font-serif-fraunces tracking-tight text-[#3A2E22]">
                NovaMind
              </span>
              <button
                onClick={currentUser && !currentUser.isAnonymous ? onOpenUserDashboard : onOpenAuthModal}
                className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#EBE2D0] text-[#6B5A47] border border-[#DCD0B9] flex items-center space-x-1.5 hover:bg-[#E2D6C0] transition-colors cursor-pointer"
                title="Hesap & Senkronizasyon"
              >
                <span className="w-2 h-2 rounded-full bg-[#D85A30]"></span>
                <span>{currentUser && !currentUser.isAnonymous ? "Bulut Aktif" : "Giriş Yap"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Analog Paper Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-[#EBE2D0]/80 border border-[#DCD0B9] p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab("mindmap")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "mindmap"
                ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm font-bold"
                : "text-[#786958] hover:text-[#3A2E22] hover:bg-[#F4EBE0]/60"
            }`}
          >
            <Network className="w-4 h-4 text-[#D85A30]" />
            <span>Detektif Panosu (Graph)</span>
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "library"
                ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm font-bold"
                : "text-[#786958] hover:text-[#3A2E22] hover:bg-[#F4EBE0]/60"
            }`}
          >
            <Bookmark className="w-4 h-4 text-[#6B5A47]" />
            <span>Fikir Kartları ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ideas")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "ideas"
                ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm font-bold"
                : "text-[#786958] hover:text-[#3A2E22] hover:bg-[#F4EBE0]/60"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D85A30]" />
            <span>Fikir Üretici</span>
          </button>
        </nav>

        {/* Right: Tactile Action Controls */}
        <div className="flex items-center space-x-2.5">
          
          {/* Cmd+K Search Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="px-3.5 py-1.5 bg-[#FBF7EC] hover:bg-white text-[#5A4A34] text-xs font-medium rounded-xl flex items-center space-x-2 border border-[#DCD0B9] transition-all cursor-pointer shadow-2xs"
            title="Arama Paleti (Cmd+K)"
          >
            <Search className="w-4 h-4 text-[#8A7B5E]" />
            <span className="hidden lg:inline">Ara...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#EBE2D0] border border-[#DCD0B9] text-[#786958] rounded">
              ⌘K
            </kbd>
          </button>

          {/* Primary CTA: Add Link Button (Terracotta Red) */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-1.5 bg-[#D85A30] hover:bg-[#C84A20] active:bg-[#B83A10] text-[#FBF7EC] text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Kart Ekle</span>
          </button>

          {/* User Profile / Login */}
          {currentUser && !currentUser.isAnonymous ? (
            <button
              onClick={onOpenUserDashboard}
              className="p-1 rounded-xl bg-[#FBF7EC] border border-[#DCD0B9] hover:border-[#B8AA90] transition-all cursor-pointer"
              title="Hesabım & Profil"
            >
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#EBE2D0] flex items-center justify-center text-[#6B5A47]">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 bg-[#FBF7EC] hover:bg-white text-[#3A2E22] text-xs font-semibold rounded-xl border border-[#DCD0B9] transition-all cursor-pointer"
            >
              Giriş Yap
            </button>
          )}

          {/* More Options Dropdown (...) */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(prev => !prev)}
              className="p-2 bg-[#FBF7EC] hover:bg-white text-[#5A4A34] rounded-xl border border-[#DCD0B9] transition-colors cursor-pointer"
              title="Diğer Seçenekler"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-xl py-1.5 text-xs text-[#3A2E22] z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenPricing();
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center space-x-2 hover:bg-[#EBE2D0] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D85A30]" />
                  <span>Pro Plan Detayları</span>
                </button>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenPwaInfo();
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center space-x-2 hover:bg-[#EBE2D0] cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#6B5A47]" />
                  <span>PWA & Paylaşım Rehberi</span>
                </button>

                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2.5 text-left flex items-center space-x-2 hover:bg-[#EBE2D0] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#3B7A57]" />
                  <span>JSON Yedeği İndir</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2.5 text-left flex items-center space-x-2 hover:bg-[#EBE2D0] cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#786958]" />
                  <span>JSON Yedeği Yükle</span>
                </button>

                <div className="my-1 border-t border-[#DCD0B9]"></div>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    onOpenAdminDashboard();
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center space-x-2 hover:bg-[#EBE2D0] cursor-pointer font-bold text-[#D85A30]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D85A30]" />
                  <span>SaaS Admin Paneli</span>
                </button>

                {currentUser && !currentUser.isAnonymous && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-2 hover:bg-rose-100 hover:text-rose-900 cursor-pointer text-rose-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

        </div>

      </div>
    </header>
  );
};
