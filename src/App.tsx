import React, { useState, useEffect, lazy, Suspense } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { User } from "firebase/auth";
import { Toaster, toast } from "sonner";
import { Header } from "./components/Header";
import { CardGrid } from "./components/CardGrid";
import { RemindersWidget } from "./components/RemindersWidget";
import { WeeklyDigestWidget } from "./components/WeeklyDigestWidget";
import { AddCardModal } from "./components/AddCardModal";
import { PreviewModal } from "./components/PreviewModal";
import { PwaShareNotice } from "./components/PwaShareNotice";
import { SettingsModal } from "./components/SettingsModal";
import { PricingModal } from "./components/Subscription/PricingModal";
import { CommandPalette } from "./components/CommandPalette";
import { ReaderModeModal } from "./components/ReaderModeModal";
import { DailyDigestWidget } from "./components/DailyDigestWidget";
import { AuthModal } from "./components/AuthModal";
import { ChatWidget } from "./components/ChatWidget";
import { FocusOnboarding } from "./components/FocusOnboarding";
import { ProjectsHub } from "./components/ProjectsHub";
import { useSubscription } from "./hooks/useSubscription";
import { Card, Project, ReminderItem, UserFocus } from "./types";
import { getCards, saveCards, getReminders, saveReminders, getProjects, getUserFocus, saveProjects, saveUserFocus } from "./lib/storage";
import {
  initFirebaseAuth,
  loginWithGoogle,
  logoutFirebase,
  subscribeCards,
  subscribeReminders,
  syncCardToFirestore,
  syncAllCardsToFirestore,
  deleteCardFromFirestore,
  syncReminderToFirestore,
  syncAllRemindersToFirestore,
  deleteReminderFromFirestore,
} from "./lib/firebase";

const ExportCollectionModal = lazy(() => import("./components/ExportCollectionModal").then((m) => ({ default: m.ExportCollectionModal })));
const MindMapViewer = lazy(() => import("./components/MindMapViewer").then((m) => ({ default: m.MindMapViewer })));
const IdeaGenerator = lazy(() => import("./components/IdeaGenerator").then((m) => ({ default: m.IdeaGenerator })));
const UserDashboardModal = lazy(() => import("./components/UserDashboardModal").then((m) => ({ default: m.UserDashboardModal })));
const AdminDashboardModal = lazy(() => import("./components/AdminDashboardModal").then((m) => ({ default: m.AdminDashboardModal })));

const TabFallback = () => (
  <div className="flex items-center justify-center py-24 text-slate-500">
    <Loader2 className="w-6 h-6 animate-spin" />
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[]>(getCards());
  const [reminders, setReminders] = useState<ReminderItem[]>(getReminders());
  const [activeTab, setActiveTab] = useState<"library" | "mindmap" | "ideas">("library");
  const [userFocus, setUserFocus] = useState<UserFocus | null>(getUserFocus());
  const [projects, setProjects] = useState<Project[]>(getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [readerCard, setReaderCard] = useState<Card | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isPwaInfoOpen, setIsPwaInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialShareUrl, setInitialShareUrl] = useState("");
  const [initialShareTitle, setInitialShareTitle] = useState("");
  const [initialShareNote, setInitialShareNote] = useState("");

  const { subscription, usage, limits, isPricingModalOpen, setIsPricingModalOpen, initiateCheckout, isLoading, refreshSubscription } =
    useSubscription(currentUser?.uid || null, () => setIsAuthModalOpen(true));

  // Cmd+K / Ctrl+K Command Palette Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Firebase Init Auth Listener
  useEffect(() => {
    const unsubAuth = initFirebaseAuth((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubAuth();
    };
  }, []);

  // Real-time Cloud Firestore Listeners scoped by User ID
  useEffect(() => {
    if (!currentUser?.uid) return;

    const uid = currentUser.uid;

    // Sync Cards from Firestore
    const unsubCards = subscribeCards(uid, (remoteCards) => {
      if (remoteCards.length > 0) {
        setCards(remoteCards);
        saveCards(remoteCards);
      } else {
        const local = getCards();
        if (local.length > 0) {
          syncAllCardsToFirestore(uid, local);
        }
      }
    });

    // Sync Reminders from Firestore
    const unsubReminders = subscribeReminders(uid, (remoteReminders) => {
      if (remoteReminders.length > 0) {
        setReminders(remoteReminders);
        saveReminders(remoteReminders);
      } else {
        const local = getReminders();
        if (local.length > 0) {
          syncAllRemindersToFirestore(uid, local);
        }
      }
    });

    return () => {
      unsubCards();
      unsubReminders();
    };
  }, [currentUser?.uid]);

  // Handle URL search params on mount for Web Share Target PWA
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Share targets (PWA, browser extension) may put the link in "text" together with other words
    const rawText = params.get("text") || "";
    const urlFromText = rawText.match(/https?:\/\/\S+/)?.[0] || "";
    const sharedUrl = params.get("url") || urlFromText;
    const sharedTitle = params.get("title") || "";
    let shouldClean = false;

    if (sharedUrl && /^https?:\/\//.test(sharedUrl)) {
      setInitialShareUrl(sharedUrl);
      setInitialShareTitle(sharedTitle);
      setInitialShareNote(params.get("note") || "");
      setIsAddModalOpen(true);
      shouldClean = true;
    }

    if (params.get("payment") === "success") {
      toast.success("Ödemen alındı, paketin aktif edildi. Teşekkürler!");
      shouldClean = true;
    }

    if (params.has("admin")) {
      setIsAdminDashboardOpen(true);
      shouldClean = true;
    }

    if (shouldClean) window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const refreshData = () => {
    setCards(getCards());
    setReminders(getReminders());
  };

  const handleLoginGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success("Google hesabınızla başarıyla giriş yapıldı.");
    } catch (err) {
      toast.error("Google ile giriş yapılamadı. Lütfen tekrar deneyin.");
    }
  };

  const handleLogout = async () => {
    await logoutFirebase();
    setCards([]);
    setReminders([]);
    toast.info("Oturum kapatıldı.");
  };

  // Reminder Handlers
  const handleAddReminder = (item: Omit<ReminderItem, "id" | "created_at">) => {
    const newItem: ReminderItem = {
      ...item,
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: Date.now(),
    };
    const updated = [newItem, ...reminders];
    setReminders(updated);
    saveReminders(updated);
    if (currentUser?.uid) syncReminderToFirestore(currentUser.uid, newItem);
  };

  const handleToggleReminderCheck = (id: string) => {
    const updated = reminders.map((item) =>
      item.id === id ? { ...item, is_completed: !item.is_completed } : item
    );
    setReminders(updated);
    saveReminders(updated);
    const target = updated.find((i) => i.id === id);
    if (target && currentUser?.uid) syncReminderToFirestore(currentUser.uid, target);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((item) => item.id !== id);
    setReminders(updated);
    saveReminders(updated);
    if (currentUser?.uid) deleteReminderFromFirestore(currentUser.uid, id);
  };

  const handleClearCompletedReminders = () => {
    const completed = reminders.filter((item) => item.is_completed);
    if (currentUser?.uid) {
      completed.forEach((c) => deleteReminderFromFirestore(currentUser.uid, c.id));
    }
    const updated = reminders.filter((item) => !item.is_completed);
    setReminders(updated);
    saveReminders(updated);
  };

  // Card CRUD Handlers
  const handleSaveCard = (newCard: Card | Card[]) => {
    const newItems = Array.isArray(newCard) ? newCard : [newCard];
    const maxCards = limits.maxSavedCards;
    if (maxCards !== -1 && cards.length + newItems.length > maxCards) {
      toast.error(`Paketindeki ${maxCards} kart sınırına ulaştın. Daha fazla kayıt için paketini yükselt.`);
      setIsPricingModalOpen(true);
      return;
    }
    setCards((prev) => {
      const updated = [...newItems, ...prev];
      saveCards(updated);
      return updated;
    });
    if (currentUser?.uid) {
      newItems.forEach((c) => syncCardToFirestore(currentUser.uid, c));
    }
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCards((prev) => {
      const updated = prev.map((c) => (c.id === updatedCard.id ? updatedCard : c));
      saveCards(updated);
      return updated;
    });
    if (currentUser?.uid) syncCardToFirestore(currentUser.uid, updatedCard);
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCards(updated);
      return updated;
    });
    if (currentUser?.uid) deleteCardFromFirestore(currentUser.uid, id);
    setSelectedCardIds((prev) => prev.filter((sId) => sId !== id));
  };

  const handleBulkDeleteCards = (ids: string[]) => {
    if (currentUser?.uid) {
      ids.forEach((id) => deleteCardFromFirestore(currentUser.uid, id));
    }
    const idSet = new Set(ids);
    setCards((prev) => {
      const updated = prev.filter((c) => !idSet.has(c.id));
      saveCards(updated);
      return updated;
    });
    setSelectedCardIds([]);
  };

  // Selection Handlers
  const handleToggleSelectCard = (id: string) => {
    setSelectedCardIds((prev) => (prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]));
  };

  const handleSelectAllCards = () => {
    setSelectedCardIds(cards.map((c) => c.id));
  };

  const handleClearSelectedCards = () => {
    setSelectedCardIds([]);
  };

  const handleTestShareLink = (url: string) => {
    setInitialShareUrl(url);
    setInitialShareTitle("");
    setIsAddModalOpen(true);
  };

  const handleOpenPreview = (card: Card) => {
    setPreviewCard(card);
    setIsPreviewOpen(true);
  };

  const handleChooseFocus = (focus: UserFocus) => {
    saveUserFocus(focus);
    setUserFocus(focus);
    setActiveTab("library");
    toast.success(focus === "creator" ? "Üretici çalışma alanın hazır." : "Araştırma çalışma alanın hazır.");
  };

  const handleCreateProject = (input: Pick<Project, "title" | "description" | "focus">) => {
    const project: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...input,
      created_at: Date.now(),
    };
    const updated = [project, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setSelectedProjectId(project.id);
    toast.success(`“${project.title}” projesi oluşturuldu.`);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    const updated = projects.filter((item) => item.id !== projectId);
    setProjects(updated);
    saveProjects(updated);
    if (selectedProjectId === projectId) setSelectedProjectId(null);
    toast.info(`“${project?.title || "Proje"}” silindi. Kaynakların kütüphanende kalır.`);
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const cardsCountByProject = cards.reduce<Record<string, number>>((counts, card) => {
    card.projectIds?.forEach((projectId) => {
      counts[projectId] = (counts[projectId] || 0) + 1;
    });
    return counts;
  }, {});

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col overflow-x-clip selection:bg-indigo-500/30">
      
      {/* Sonner Toast Provider */}
      <Toaster position="bottom-center" theme="light" richColors closeButton />

      {!userFocus && <FocusOnboarding onChoose={handleChooseFocus} />}

      {/* Header Bar */}
      <Header
        cards={cards}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setInitialShareUrl("");
          setInitialShareTitle("");
          setInitialShareNote("");
          setIsAddModalOpen(true);
        }}
        onRefreshData={refreshData}
        onOpenPwaInfo={() => setIsPwaInfoOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUserDashboard={() => setIsUserDashboardOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Library & Main Dashboard */}
        {activeTab === "library" && (
          <div className="space-y-6">
            <ProjectsHub
              projects={projects}
              cardsCountByProject={cardsCountByProject}
              selectedProjectId={selectedProjectId}
              defaultFocus={userFocus}
              onCreate={handleCreateProject}
              onSelect={setSelectedProjectId}
              onDelete={handleDeleteProject}
            />
            
            {/* Daily Digest Spaced Repetition Widget */}
            <DailyDigestWidget
              cards={cards}
              onOpenReader={(card) => setReaderCard(card)}
            />

            {/* Weekly Rediscovery Digest Banner */}
            <WeeklyDigestWidget
              cards={cards}
              onOpenPreview={handleOpenPreview}
              onAddReminder={handleAddReminder}
            />

            {/* Main Library Cards Area */}
            <div>
              <CardGrid
                cards={cards}
                selectedCardIds={selectedCardIds}
                onToggleSelectCard={handleToggleSelectCard}
                onClearSelection={handleClearSelectedCards}
                onSelectAll={handleSelectAllCards}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                onBulkDeleteCards={handleBulkDeleteCards}
                onGenerateMindMapForSelected={() => setActiveTab("mindmap")}
                onCombineSelectedForIdeas={() => setActiveTab("ideas")}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenPreview={handleOpenPreview}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                selectedProjectId={selectedProjectId}
                selectedProjectName={selectedProject?.title || null}
                onClearProjectFilter={() => setSelectedProjectId(null)}
              />
            </div>

            {/* Bottom Widgets Row */}
            <div className="pt-6 border-t border-slate-200/80 max-w-4xl">
              <RemindersWidget
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onToggleCheck={handleToggleReminderCheck}
                onDeleteReminder={handleDeleteReminder}
                onClearCompleted={handleClearCompletedReminders}
              />
            </div>

          </div>
        )}

        {/* TAB 2: MindMap / Knowledge Graph */}
        <Suspense fallback={<TabFallback />}>
        {activeTab === "mindmap" && (
          <MindMapViewer
            cards={cards}
            selectedCardIds={selectedCardIds}
            onClearSelectedCards={handleClearSelectedCards}
            onOpenPreview={handleOpenPreview}
            onOpenReader={(card) => setReaderCard(card)}
          />
        )}

        {/* TAB 3: AI Idea Generator */}
        {activeTab === "ideas" && (
          <IdeaGenerator
            cards={cards}
            selectedCardIds={selectedCardIds}
          />
        )}
        </Suspense>

      </main>

      {/* Auth Modal (Google & Email/Password Sign in) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Account & Subscription Dashboard Modal */}
      <Suspense fallback={null}>
      {isUserDashboardOpen && (
      <UserDashboardModal
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        currentUser={currentUser}
        subscription={subscription}
        cards={cards}
        reminders={reminders}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onRefreshData={refreshData}
      />
      )}
      {isExportModalOpen && (
        <ExportCollectionModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          cards={cards}
          selectedCardIds={selectedCardIds}
        />
      )}
      {isAdminDashboardOpen && (
        <AdminDashboardModal isOpen={isAdminDashboardOpen} onClose={() => setIsAdminDashboardOpen(false)} />
      )}
      </Suspense>

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        cards={cards}
        onSelectCard={(card) => setReaderCard(card)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onSwitchTab={(tab) => setActiveTab(tab)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
      />

      {/* Reader Mode Modal */}
      <ReaderModeModal
        card={readerCard}
        onClose={() => setReaderCard(null)}
      />

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCard}
        existingCards={cards}
        initialUrl={initialShareUrl}
        initialTitle={initialShareTitle}
        initialNote={initialShareNote}
        userFocus={userFocus}
        activeProject={selectedProject}
      />

      {/* PWA Share Information Dialog */}
      <PwaShareNotice
        isOpen={isPwaInfoOpen}
        onClose={() => setIsPwaInfoOpen(false)}
        onTestShareLink={handleTestShareLink}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
      />

      {/* Live Embed Preview Modal */}
      <PreviewModal
        card={previewCard}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewCard(null);
        }}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
      />

      {/* Subscription Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentPlan={subscription?.plan || "free"}
        onSelectPlan={initiateCheckout}
        isLoading={isLoading}
      />

      {/* Floating AI Chat Assistant Trigger Button */}
      <button
        onClick={() => setIsChatWidgetOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-40 pl-3.5 pr-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-50 rounded-full shadow-xl shadow-slate-900/25 flex items-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        aria-label="AI asistanına kütüphaneni sor"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-semibold">Asistana sor</span>
      </button>

      {/* Chat Widget Modal */}
      <ChatWidget
        cards={cards}
        isOpen={isChatWidgetOpen}
        onClose={() => setIsChatWidgetOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>NovaMind · Kaydettiklerini fikre dönüştür · <a href="/landing" className="underline hover:text-slate-700">Hakkında</a></p>
      </footer>

    </div>
  );
}
