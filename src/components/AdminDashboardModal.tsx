import React, { useState, useEffect } from "react";
import { 
  X, ShieldCheck, Key, Cpu, Users, Settings, RefreshCw, Plus, Trash2, 
  CheckCircle2, AlertTriangle, Clock, Activity, Zap, Play, Lock, Database, CreditCard
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ManagedKeyUI {
  id: string;
  label: string;
  isFree: boolean;
  isActive: boolean;
  status: "active" | "cooldown" | "exhausted" | "error";
  usageCount: number;
  errorCount: number;
  lastUsedAt?: number;
  cooldownUntil?: number;
  createdAt: number;
  maskedKey: string;
}

interface RouterMetrics {
  totalRequests: number;
  successfulRequests: number;
  failoverCount: number;
  rateLimitCount: number;
  totalKeys: number;
  activeKeysCount: number;
  cooldownKeysCount: number;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [adminSecret, setAdminSecret] = useState<string>(() => localStorage.getItem("admin_secret_key") || "");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"analytics" | "keys" | "users" | "settings">("keys");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Router & Keys Data
  const [keysList, setKeysList] = useState<ManagedKeyUI[]>([]);
  const [metrics, setMetrics] = useState<RouterMetrics | null>(null);
  const [neo4jStatus, setNeo4jStatus] = useState<{ active: boolean; uri: string } | null>(null);

  // New Key Form
  const [newKeyInput, setNewKeyInput] = useState("");
  const [newLabelInput, setNewLabelInput] = useState("");
  const [newIsFree, setNewIsFree] = useState(true);
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);

  // Verify stored secret on mount or login
  useEffect(() => {
    if (adminSecret && isOpen) {
      verifySecret(adminSecret);
    }
  }, [isOpen]);

  const verifySecret = async (secretToTest: string) => {
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretToTest }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { error: "Sunucu yanıt vermedi." };
      }
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("admin_secret_key", secretToTest);
        setAdminSecret(secretToTest);
        fetchAdminData(secretToTest);
      } else {
        setIsAuthenticated(false);
        if (secretToTest === adminSecret) {
          localStorage.removeItem("admin_secret_key");
          setAdminSecret("");
        }
        toast.error(data.error || "Geçersiz Admin Şifresi!");
      }
    } catch (e: any) {
      toast.error(e?.message || "Admin giriş doğrulama hatası.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    verifySecret(passwordInput.trim());
  };

  const fetchAdminData = async (secret = adminSecret) => {
    if (!secret) return;
    setIsLoading(true);
    try {
      // Fetch Metrics & Keys
      const [metricsRes, keysRes] = await Promise.all([
        fetch("/api/admin/metrics", { headers: { "x-admin-secret": secret } }),
        fetch("/api/admin/keys", { headers: { "x-admin-secret": secret } }),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.router);
        setNeo4jStatus(metricsData.neo4j);
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setKeysList(keysData.keys || []);
        if (keysData.metrics) setMetrics(keysData.metrics);
      }
    } catch (err) {
      toast.error("Admin verileri alınamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInput.trim()) {
      toast.error("Lütfen bir API Key girin.");
      return;
    }

    setIsSubmittingKey(true);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          key: newKeyInput.trim(),
          label: newLabelInput.trim() || `API Key #${keysList.length + 1}`,
          isFree: newIsFree,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Yeni API Key başarıyla havuza eklendi!");
        setNewKeyInput("");
        setNewLabelInput("");
        fetchAdminData();
      } else {
        toast.error(data.error || "API Key eklenemedi.");
      }
    } catch (e) {
      toast.error("Bağlantı hatası.");
    } finally {
      setIsSubmittingKey(false);
    }
  };

  const handleToggleKey = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/keys/${id}/toggle`, {
        method: "POST",
        headers: { "x-admin-secret": adminSecret },
      });
      if (res.ok) {
        toast.success("API Key durumu güncellendi.");
        fetchAdminData();
      }
    } catch (e) {
      toast.error("İşlem başarısız.");
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!window.confirm("Bu API Key'i havuzdan silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": adminSecret },
      });
      if (res.ok) {
        toast.success("API Key silindi.");
        fetchAdminData();
      }
    } catch (e) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  const handleTestKey = async (keyToTest?: string) => {
    toast.info("API Key doğrulanıyor...");
    try {
      const res = await fetch("/api/admin/keys/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ key: keyToTest }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Key Doğrulandı! Yanıt: "${data.response}"`);
      } else {
        toast.error(`Key Testi Başarısız: ${data.error}`);
      }
    } catch (e) {
      toast.error("Test bağlantı hatası.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF6EE] border border-[#DCD0B9] text-[#2C221E] w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2D8C3] bg-[#F4EFE6] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D85A30] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-fraunces text-[#3A2E22] flex items-center gap-2">
                <span>NovaMind SaaS Admin Paneli</span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono font-bold bg-[#D85A30]/10 text-[#D85A30] border border-[#D85A30]/20 rounded-full">
                  v3.0 Core
                </span>
              </h2>
              <p className="text-xs text-[#786958]">Smart API Key Rotatör & Sistem Yönetim Merkezi</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#786958] hover:text-[#3A2E22] hover:bg-[#EBE2D0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Password Prompt Screen */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#EBE2D0] border border-[#DCD0B9] flex items-center justify-center text-[#D85A30] mb-5 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif-fraunces text-[#3A2E22] mb-2">
              Yönetici Girişi Yapın
            </h3>
            <p className="text-xs text-[#786958] mb-6 leading-relaxed">
              API key havuzunu ve sistem parametrelerini yönetmek için Admin Gizli Şifrenizi girin.
              *(Varsayılan şifre: <code className="font-mono text-[#D85A30] bg-[#EBE2D0] px-1.5 py-0.5 rounded">admin123</code>)*
            </p>

            <form onSubmit={handleLoginSubmit} className="w-full space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Admin Secret Password..."
                className="w-full px-4 py-3 bg-[#FBF7EC] border border-[#DCD0B9] focus:border-[#D85A30] rounded-xl text-sm font-mono text-[#3A2E22] outline-none shadow-sm transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#D85A30] hover:bg-[#C84A20] active:bg-[#B83A10] text-[#FBF7EC] font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Paneli Aç</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Control Panel */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Tabs */}
            <div className="px-6 bg-[#F4EFE6] border-b border-[#E2D8C3] flex items-center justify-between">
              <div className="flex space-x-1 py-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("keys")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                    activeTab === "keys"
                      ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm border border-[#DCD0B9]"
                      : "text-[#786958] hover:bg-[#EBE2D0]/60"
                  }`}
                >
                  <Key className="w-4 h-4 text-[#D85A30]" />
                  <span>API Key Havuzu & Router</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                    activeTab === "analytics"
                      ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm border border-[#DCD0B9]"
                      : "text-[#786958] hover:bg-[#EBE2D0]/60"
                  }`}
                >
                  <Activity className="w-4 h-4 text-[#3B7A57]" />
                  <span>Sistem Metrikleri</span>
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                    activeTab === "users"
                      ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm border border-[#DCD0B9]"
                      : "text-[#786958] hover:bg-[#EBE2D0]/60"
                  }`}
                >
                  <Users className="w-4 h-4 text-[#6B5A47]" />
                  <span>Abonelik Paketleri</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-[#FBF7EC] text-[#3A2E22] shadow-sm border border-[#DCD0B9]"
                      : "text-[#786958] hover:bg-[#EBE2D0]/60"
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#786958]" />
                  <span>Ödeme & Entegrasyonlar</span>
                </button>
              </div>

              <button
                onClick={() => fetchAdminData()}
                disabled={isLoading}
                className="p-2 text-[#786958] hover:text-[#3A2E22] hover:bg-[#EBE2D0] rounded-xl transition-all cursor-pointer"
                title="Yenile"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D85A30]" : ""}`} />
              </button>
            </div>

            {/* Tab Contents Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: API KEY POOL & SMART ROTATION ROUTER */}
              {activeTab === "keys" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  
                  {/* Banner / Info */}
                  <div className="p-4 rounded-2xl bg-[#EBE2D0]/60 border border-[#DCD0B9] flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-[#D85A30] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#5A4A34] space-y-1">
                      <p className="font-bold text-[#3A2E22]">Akıllı Rotasyonlu API Key Havuzu (Smart Failover)</p>
                      <p className="leading-relaxed">
                        Eklediğiniz **ücretsiz (Free) veya Pro** Gemini API key'leri havuzda toplanır. Bir key kotaya girdiğinde (HTTP 429 Rate Limit), sistem key'i otomatik olarak **5 dakika soğutmaya** alır ve isteği **kesintisiz olarak sıradaki aktif key ile tamamlar**.
                      </p>
                    </div>
                  </div>

                  {/* Add Key Form */}
                  <form onSubmit={handleAddKey} className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B5A47] flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-[#D85A30]" />
                      <span>Havuza Yeni API Key Ekle</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <input
                          type="text"
                          value={newKeyInput}
                          onChange={(e) => setNewKeyInput(e.target.value)}
                          placeholder="Gemini API Key (AIzaSy...)"
                          className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#DCD0B9] focus:border-[#D85A30] rounded-xl text-xs font-mono outline-none"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={newLabelInput}
                          onChange={(e) => setNewLabelInput(e.target.value)}
                          placeholder="Etiket (Ör: Free Key #1, Pro Account...)"
                          className="w-full px-3.5 py-2.5 bg-[#FAF6EE] border border-[#DCD0B9] focus:border-[#D85A30] rounded-xl text-xs outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-end space-x-2">
                        <button
                          type="submit"
                          disabled={isSubmittingKey}
                          className="w-full py-2.5 bg-[#D85A30] hover:bg-[#C84A20] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>Ekle</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Keys Table */}
                  <div className="bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-[#E2D8C3] bg-[#F4EFE6] flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#3A2E22] flex items-center space-x-2">
                        <Key className="w-4 h-4 text-[#D85A30]" />
                        <span>Aktif Havuzdaki API Key'ler ({keysList.length})</span>
                      </h4>
                      <button
                        onClick={() => handleTestKey()}
                        className="px-3 py-1 bg-[#EBE2D0] hover:bg-[#DCD0B9] text-[#3A2E22] text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-[#3B7A57]" />
                        <span>Rastgele Key Test Et</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#EBE2D0]/50 text-[#6B5A47] font-semibold border-b border-[#DCD0B9]">
                          <tr>
                            <th className="px-4 py-3">Durum</th>
                            <th className="px-4 py-3">Etiket</th>
                            <th className="px-4 py-3 font-mono">API Key</th>
                            <th className="px-4 py-3">İstek Sayısı</th>
                            <th className="px-4 py-3">Hata/429</th>
                            <th className="px-4 py-3 text-right">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2D8C3]">
                          {keysList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-[#786958]">
                                Havuzda kayıtlı API Key bulunamadı. Yukarıdaki formdan ekleyebilirsiniz.
                              </td>
                            </tr>
                          ) : (
                            keysList.map((k) => {
                              const isCooldown = k.status === "cooldown" || (k.cooldownUntil && k.cooldownUntil > Date.now());
                              return (
                                <tr key={k.id} className="hover:bg-[#F4EFE6]/50 transition-colors">
                                  <td className="px-4 py-3">
                                    {!k.isActive ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700 flex items-center space-x-1 w-fit">
                                        <AlertTriangle className="w-3 h-3 text-slate-500" />
                                        <span>Devre Dışı</span>
                                      </span>
                                    ) : isCooldown ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 w-fit">
                                        <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                        <span>Soğutmada (429)</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1 w-fit">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>🟢 Aktif</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-[#3A2E22]">{k.label}</td>
                                  <td className="px-4 py-3 font-mono text-[#5A4A34]">{k.maskedKey}</td>
                                  <td className="px-4 py-3 font-mono font-bold text-[#3B7A57]">{k.usageCount}</td>
                                  <td className="px-4 py-3 font-mono text-rose-600 font-bold">{k.errorCount}</td>
                                  <td className="px-4 py-3 text-right space-x-1">
                                    <button
                                      onClick={() => handleTestKey(k.id)}
                                      className="px-2 py-1 bg-[#EBE2D0] hover:bg-[#DCD0B9] text-[#3A2E22] rounded-lg transition-colors cursor-pointer"
                                      title="Key'i Test Et"
                                    >
                                      Test
                                    </button>
                                    <button
                                      onClick={() => handleToggleKey(k.id)}
                                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                        k.isActive ? "bg-amber-100 text-amber-900 hover:bg-amber-200" : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                                      }`}
                                    >
                                      {k.isActive ? "Durdur" : "Aktif Et"}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteKey(k.id)}
                                      className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition-colors cursor-pointer"
                                      title="Sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ANALYTICS & METRICS */}
              {activeTab === "analytics" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-[#D85A30]/10 text-[#D85A30] rounded-xl">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#786958] font-medium">Toplam AI İsteği</p>
                        <h3 className="text-xl font-bold font-mono text-[#3A2E22]">{metrics?.totalRequests || 0}</h3>
                      </div>
                    </div>

                    <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#786958] font-medium">Başarılı Yanıtlar</p>
                        <h3 className="text-xl font-bold font-mono text-emerald-700">{metrics?.successfulRequests || 0}</h3>
                      </div>
                    </div>

                    <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#786958] font-medium">Otomatik Failover Sayısı</p>
                        <h3 className="text-xl font-bold font-mono text-amber-700">{metrics?.failoverCount || 0}</h3>
                      </div>
                    </div>

                    <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm flex items-center space-x-4">
                      <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#786958] font-medium">429 Rate Limit Yakalanma</p>
                        <h3 className="text-xl font-bold font-mono text-rose-700">{metrics?.rateLimitCount || 0}</h3>
                      </div>
                    </div>

                  </div>

                  {/* Neo4j Database Info */}
                  <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-[#3A2E22] flex items-center space-x-2">
                      <Database className="w-4 h-4 text-[#D85A30]" />
                      <span>Neo4j Graph Veritabanı Durumu</span>
                    </h4>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${neo4jStatus?.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                        {neo4jStatus?.active ? "🟢 Bağlı & Aktif" : "⚪ Yerel Mod (Neo4j Bağlantısı Yok)"}
                      </span>
                      <span className="font-mono text-[#786958]">URI: {neo4jStatus?.uri}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: USERS & SUBSCRIPTION MANAGEMENTS */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-[#3A2E22] flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#D85A30]" />
                      <span>Kullanıcı Abonelik Paket Tanımları</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 bg-[#FAF6EE] border border-[#DCD0B9] rounded-xl space-y-2">
                        <span className="font-bold text-[#6B5A47]">Free Plan</span>
                        <p className="text-[#786958]">10 Otomatik Kategori, 5 Zihin Haritası, 5 Fikir Üretici</p>
                      </div>

                      <div className="p-4 bg-[#FAF6EE] border border-[#D85A30]/30 rounded-xl space-y-2">
                        <span className="font-bold text-[#D85A30]">Pro Plan (₺99/ay)</span>
                        <p className="text-[#786958]">Sınırsız AI kategorileştirme, Zihin Haritaları, öncelikli AI router</p>
                      </div>

                      <div className="p-4 bg-[#FAF6EE] border border-[#3B7A57]/30 rounded-xl space-y-2">
                        <span className="font-bold text-[#3B7A57]">Premium Plan (₺249/ay)</span>
                        <p className="text-[#786958]">Tüm Pro özellikler + Neo4j Graph dışa aktarma & Özel API Desteği</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS & GATEWAYS */}
              {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-5 bg-[#FBF7EC] border border-[#DCD0B9] rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-[#3A2E22] flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-[#D85A30]" />
                      <span>Shopier Ödeme Entegrasyonu Durumu</span>
                    </h4>
                    
                    <div className="p-4 bg-[#FAF6EE] border border-[#DCD0B9] rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3A2E22]">Shopier API Durumu:</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          Aktif / Test Modu Destekli
                        </span>
                      </div>
                      <p className="text-[#786958]">
                        Shopier API anahtarları `.env` dosyasından veya Vercel Environment Variables kısmından yönetilebilir (`SHOPIER_API_KEY`, `SHOPIER_API_SECRET`).
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
