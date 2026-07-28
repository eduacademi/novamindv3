import React from "react";
import { X as CloseIcon, Share2, Smartphone, Download, Check, Sparkles } from "lucide-react";

interface PwaShareNoticeProps {
 isOpen: boolean;
 onClose: () => void;
 onTestShareLink: (url: string) => void;
}

export const PwaShareNotice: React.FC<PwaShareNoticeProps> = ({
 isOpen,
 onClose,
 onTestShareLink,
}) => {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
 
 {/* Header */}
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div className="flex items-center space-x-2">
 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
 <Share2 className="w-5 h-5" />
 </div>
 <h3 className="text-base font-bold text-slate-900 font-serif">
 Mobil Paylaşım & PWA İpuçları
 </h3>
 </div>
 <button
 onClick={onClose}
 className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
 >
 <CloseIcon className="w-5 h-5" />
 </button>
 </div>

 {/* Steps */}
 <div className="space-y-3 text-xs text-slate-600 ">
 
 <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
 <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
 <Smartphone className="w-4 h-4 text-indigo-600" />
 <span>Android Web Share Target Desteği</span>
 </h4>
 <p className="text-slate-500">
 Uygulamayı telefonunuza <b>"Ana Ekrana Ekle" (Add to Home Screen)</b> yaptığınızda, Instagram, TikTok, Pinterest veya YouTube'da "Paylaş" butonuna bastığınızda NovaMind Link Panosu paylaşım menünüzde çıkar. Link otomatik forma düşer.
 </p>
 </div>

 <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
 <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
 <Download className="w-4 h-4 text-emerald-600" />
 <span>%100 Client-Side & Sıfır Setup</span>
 </h4>
 <p className="text-slate-500">
 Hiçbir sunucu veritabanı veya üyelik gerekmez. Verileriniz doğrudan cihazınızda (IndexedDB / localStorage) güvenle saklanır.
 </p>
 </div>

 <div className="pt-2 flex flex-col space-y-2">
 <span className="font-semibold text-slate-800 ">
 Test Etmek İçin Örnek Bir Link Deneyin:
 </span>
 <div className="flex gap-2">
 <button
 onClick={() => {
 onTestShareLink("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
 onClose();
 }}
 className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100"
 >
 + YouTube Test Linki
 </button>
 <button
 onClick={() => {
 onTestShareLink("https://x.com/tech/status/123");
 onClose();
 }}
 className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg font-medium hover:bg-sky-100"
 >
 + X (Twitter) Test Linki
 </button>
 </div>
 </div>

 </div>

 <div className="pt-2 flex justify-end">
 <button
 onClick={onClose}
 className="px-4 py-2 bg-slate-800 text-white font-medium text-xs rounded-xl"
 >
 Anladım
 </button>
 </div>

 </div>
 </div>
 );
};
