import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">Bir Arayüz Hatası Oluştu</h1>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            NovaMind çalışırken beklenmeyen bir aksaklık yaşandı. Verileriniz güvendedir, sayfayı yenileyerek devam edebilirsiniz.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-rose-300 font-mono mb-6 max-w-lg overflow-x-auto">
            {this.state.error?.message || "Bilinmeyen Hata"}
          </div>
          <button
            onClick={this.handleReload}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl flex items-center space-x-2 transition-all shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sayfayı Yenile</span>
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
