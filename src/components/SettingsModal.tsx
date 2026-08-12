import React, { useState, useEffect } from "react";
import { X, Key, Save, ShieldCheck } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminDashboard?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenAdminDashboard }) => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiKey(localStorage.getItem("x-gemini-api-key") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("x-gemini-api-key", apiKey.trim());
    } else {
      localStorage.removeItem("x-gemini-api-key");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#FAF6EE] border border-[#DCD0B9] text-[#2C221E] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E2D8C3] flex items-center justify-between bg-[#F4EFE6]">
          <h2 className="text-lg font-bold font-serif-fraunces text-[#3A2E22] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#D85A30]" />
            Kullanıcı Ayarları & API Key
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#786958] hover:text-[#3A2E22] hover:bg-[#EBE2D0] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5A47] mb-2">
              Kişisel Gemini API Anahtarınız (İsteğe Bağlı)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI Studio / Gemini API Key (AIzaSy...)"
              className="w-full px-4 py-2.5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-xl focus:outline-none focus:border-[#D85A30] text-xs font-mono text-[#3A2E22]"
            />
            <p className="mt-2 text-xs text-[#786958] leading-relaxed">
              Kendi anahtarınızı eklerseniz, analiz ve fikir üretimleri doğrudan sizin kotanızdan harcanır.
            </p>
          </div>

          {/* Admin Panel Callout */}
          <div className="p-4 bg-[#EBE2D0]/60 border border-[#DCD0B9] rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 font-bold text-xs text-[#3A2E22]">
              <ShieldCheck className="w-4 h-4 text-[#D85A30]" />
              <span>SaaS Merkezi API Key Rotasyon Havuzu</span>
            </div>
            <p className="text-xs text-[#786958] leading-relaxed">
              Tüm rotasyonlu API key havuzu, kotaya giren key yönetimi ve SaaS metrikleri **SaaS Admin Paneli** üzerinden yönetilmektedir.
            </p>
            {onOpenAdminDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminDashboard();
                }}
                className="w-full mt-1 py-2 bg-[#D85A30] hover:bg-[#C84A20] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>SaaS Admin Paneline Git (`maviadam123`)</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#F4EFE6] border-t border-[#E2D8C3] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#786958] hover:bg-[#EBE2D0] font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#D85A30] hover:bg-[#C84A20] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
