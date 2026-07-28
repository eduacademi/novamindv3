import React, { useState, useEffect } from "react";
import { X, Key, Save } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold font-serif text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Ayarlar
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Kendi Gemini API Anahtarınız
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AI Studio / Gemini API Key"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-2 text-xs text-slate-500">
            Eğer bu alan boş bırakılırsa sistemdeki varsayılan anahtar kullanılır. Kendi anahtarınızı eklerseniz, analiz ve fikir üretimleri bu anahtar üzerinden yapılır.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium text-sm rounded-xl transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};
