import React, { useState } from "react";
import { X, Check, Sparkles, Zap, Crown, ShieldCheck, ArrowRight } from "lucide-react";
import { PlanType } from "../../../server/types/subscription";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: PlanType;
  onSelectPlan: (plan: PlanType, billingPeriod: "monthly" | "yearly") => void;
  isLoading?: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlan = "free",
  onSelectPlan,
  isLoading = false,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yapay Zeka Destekli İkinci Beyin</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
            Planınızı Seçin, Üretkenliğinizi Katlayın
          </h2>
          <p className="text-sm text-slate-400">
            Fikirlerinizi otomatik kategorileyin, zihin haritaları çıkartın ve medyalarınızdan yeni projeler sentezleyin.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-slate-800/90 p-1 rounded-2xl border border-slate-700 mt-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                billingPeriod === "yearly"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500 text-slate-950 font-black rounded-md">
                %20 İndirim
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* FREE PLAN */}
          <div className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
            currentPlan === "free"
              ? "bg-slate-800/40 border-slate-700"
              : "bg-slate-800/20 border-slate-800 hover:border-slate-700"
          }`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ücretsiz</span>
                {currentPlan === "free" && (
                  <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-semibold">Mevcut Plan</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-3xl font-black text-white">₺0</span>
                <span className="text-xs text-slate-400">/ sonsuza kadar</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Temel bookmark kaydetme ve kendi Gemini key'iniz ile kullanım.</p>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50 adet Kayıtlı Bookmark</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kendi Gemini Key'iniz (BYOK)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>2D Fizik Tabanlı Mind Map</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PWA & Share Target Desteği</span>
                </li>
              </ul>
            </div>

            <button
              disabled={currentPlan === "free"}
              className="w-full py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {currentPlan === "free" ? "Mevcut Planınız" : "Ücretsiz Başla"}
            </button>
          </div>

          {/* PRO PLAN (POPULAR) */}
          <div className="rounded-2xl p-6 border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 to-slate-900 flex flex-col justify-between relative shadow-xl shadow-indigo-950/50 transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center space-x-1">
              <Zap className="w-3 h-3 fill-current" />
              <span>En Popüler</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4 mt-2">
                <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Pro Paket</span>
                {currentPlan === "pro" && (
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-semibold">Mevcut Plan</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-3xl font-black text-white">
                  ₺{billingPeriod === "yearly" ? "79" : "99"}
                </span>
                <span className="text-xs text-slate-400">/ ay ({billingPeriod === "yearly" ? "yıllık faturalandırılır" : "aylık"})</span>
              </div>
              <p className="text-xs text-slate-300 mb-6">Yoğun içerik tüketicileri ve aktif içerik üreticileri için ideal.</p>

              <ul className="space-y-3 text-xs text-slate-200 mb-8">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span><strong>1.000 adet</strong> Kayıtlı Bookmark</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span><strong>Sunucu Dahili AI Key</strong> (Key gerekmez)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span><strong>30/ay</strong> AI Mind Map & Fikir Üretimi</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Chrome Extension Tam Desteği</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Haftalık Keşif Özeti E-postası</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan("pro", billingPeriod)}
              disabled={isLoading || currentPlan === "pro"}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? "Yönlendiriliyor..." : "Pro Pakete Geç"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
            currentPlan === "premium"
              ? "bg-purple-950/30 border-purple-500/50"
              : "bg-slate-800/20 border-slate-800 hover:border-purple-500/40"
          }`}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Premium</span>
                </span>
                {currentPlan === "premium" && (
                  <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-semibold">Mevcut Plan</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1 mb-4">
                <span className="text-3xl font-black text-white">
                  ₺{billingPeriod === "yearly" ? "199" : "249"}
                </span>
                <span className="text-xs text-slate-400">/ ay</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Profesyonel araştırmacılar, akademisyenler ve girişimciler için sınırsız güç.</p>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Sınırsız</strong> Bookmark Kaydetme</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Sınırsız</strong> AI Mind Map & Fikir Sentezi</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Öncelikli Yüksek Hızlı Gemini Flash</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Öncelikli Destek & Erken Erişim</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan("premium", billingPeriod)}
              disabled={isLoading || currentPlan === "premium"}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <span>{isLoading ? "Yönlendiriliyor..." : "Premium'a Yükselt"}</span>
            </button>
          </div>

        </div>

        {/* Security & Guarantee Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>256-Bit SSL ile Güvenli Ödeme (Shopier / İyzico Güvencesiyle)</span>
          </div>
          <span className="text-slate-500">İstediğiniz zaman tek tıkla iptal edebilirsiniz.</span>
        </div>

      </div>
    </div>
  );
};
