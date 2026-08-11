import React, { useState } from "react";
import { X, LogIn, Mail, Lock, Sparkles, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { loginWithGoogle, loginWithEmail, registerWithEmail } from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      toast.success("Google hesabınızla başarıyla giriş yapıldı!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Google ile giriş başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    try {
      setIsLoading(true);
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Hesabınıza başarıyla giriş yapıldı!");
      } else {
        await registerWithEmail(email, password);
        toast.success("Hesabınız oluşturuldu ve oturum açıldı!");
      }
      onClose();
    } catch (err: any) {
      if (err?.code === "auth/operation-not-allowed") {
        toast.error("Firebase Console'da E-posta/Şifre girişi henüz etkinleştirilmemiş. Lütfen Google ile Giriş yapın veya Firebase Console -> Authentication -> Sign-in method sayfasından Email/Password özelliğini açın.", { duration: 6000 });
      } else if (err?.code === "auth/email-already-in-use") {
        toast.error("Bu e-posta adresi zaten kullanımda.");
      } else if (err?.code === "auth/wrong-password" || err?.code === "auth/user-not-found" || err?.code === "auth/invalid-credential") {
        toast.error("E-posta veya şifre hatalı.");
      } else {
        toast.error(err?.message || "Giriş işlemi başarısız.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold">
              ⚡
            </div>
            <h2 className="text-base font-bold text-white">
              NovaMind Hesabı {mode === "login" ? "Girişi" : "Oluştur"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === "login" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === "register" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google ile Devam Et</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">veya E-posta ile</span>
            <div className="flex-1 border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ornek@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Şifre</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isLoading ? "İşleniyor..." : mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}</span>
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 text-[10px] text-slate-400 text-center">
          Verileriniz Firebase 256-bit şifreleme ve kişisel bulut hesabınız altında izole edilir.
        </div>
      </div>
    </div>
  );
};
