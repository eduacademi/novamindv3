import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Toaster, toast } from "sonner";
import { Header } from "./components/Header";
import { CardGrid } from "./components/CardGrid";
import { RemindersWidget } from "./components/RemindersWidget";
import { WeeklyDigestWidget } from "./components/WeeklyDigestWidget";
import { ExportCollectionModal } from "./components/ExportCollectionModal";
import { MindMapViewer } from "./components/MindMapViewer";
import { IdeaGenerator } from "./components/IdeaGenerator";
import { AddCardModal } from "./components/AddCardModal";
import { PreviewModal } from "./components/PreviewModal";
import { PwaShareNotice } from "./components/PwaShareNotice";
import { SettingsModal } from "./components/SettingsModal";
import { PricingModal } from "./components/Subscription/PricingModal";
import { CommandPalette } from "./components/CommandPalette";
import { ReaderModeModal } from "./components/ReaderModeModal";
import { DailyDigestWidget } from "./components/DailyDigestWidget";
import { AuthModal } from "./components/AuthModal";
import { UserDashboardModal } from "./components/UserDashboardModal";
import { AdminDashboardModal } from "./components/AdminDashboardModal";
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

  const { subscription, isPricingModalOpen, setIsPricingModalOpen, initiateCheckout, isLoading } = useSubscription();

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

  // Polling Extension Queue
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/extension/pop");
        if (res.ok) {
          const { items } = await res.json();
          if (items && items.length > 0) {
            // Save each item
            items.forEach((item: Card) => {
              handleSaveCard(item);
            });
            toast.success(`Tarayıcı eklentisinden ${items.length} yeni bağlantı başarıyla eklendi!`);
          }
        }
      } catch (err) {
        // Suppress background polling warnings
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [cards, currentUser?.uid]);

  // Handle URL search params on mount for Web Share Target PWA
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get("url") || params.get("text") || "";
    const sharedTitle = params.get("title") || "";

    if (sharedUrl && sharedUrl.startsWith("http")) {
      setInitialShareUrl(sharedUrl);
      setInitialShareTitle(sharedTitle);
      setIsAddModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
    const updated = [...newItems, ...cards];
    setCards(updated);
    saveCards(updated);
    if (currentUser?.uid) {
      newItems.forEach((c) => syncCardToFirestore(currentUser.uid, c));
    }
  };

  const handleUpdateCard = (updatedCard: Card) => {
    const updated = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(updated);
    saveCards(updated);
    if (currentUser?.uid) syncCardToFirestore(currentUser.uid, updatedCard);
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    saveCards(updated);
    if (currentUser?.uid) deleteCardFromFirestore(currentUser.uid, id);
    setSelectedCardIds(selectedCardIds.filter((sId) => sId !== id));
  };

  const handleBulkDeleteCards = (ids: string[]) => {
    if (currentUser?.uid) {
      ids.forEach((id) => deleteCardFromFirestore(currentUser.uid, id));
    }
    const updated = cards.filter((c) => !ids.includes(c.id));
    setCards(updated);
    saveCards(updated);
    setSelectedCardIds([]);
  };

  // Selection Handlers
  const handleToggleSelectCard = (id: string) => {
    if (selectedCardIds.includes(id)) {
      setSelectedCardIds(selectedCardIds.filter((sId) => sId !== id));
    } else {
      setSelectedCardIds([...selectedCardIds, id]);
    }
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      
      {/* Sonner Toast Provider */}
      <Toaster position="bottom-right" theme="dark" richColors />

      {!userFocus && <FocusOnboarding onChoose={handleChooseFocus} />}

      {/* Header Bar */}
      <Header
        cards={cards}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setInitialShareUrl("");
          setInitialShareTitle("");
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

      </main>

      {/* Auth Modal (Google & Email/Password Sign in) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Account & Subscription Dashboard Modal */}
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
      />

      {/* Export / Newsletter Modal */}
      <ExportCollectionModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cards={cards}
        selectedCardIds={selectedCardIds}
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
        onClick={() => setIsChatWidgetOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-full shadow-2xl shadow-indigo-600/50 flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer border border-indigo-400/40"
        title="AI Asistan ile Kütüphanene Sor"
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.012-.862c.16-.838.455-1.637.868-2.366C4.168 16.326 3 14.28 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"></path></svg>
        <span className="hidden sm:inline text-xs font-bold">AI Kütüphane Asistanı</span>
      </button>

      {/* Chat Widget Modal */}
      <ChatWidget
        cards={cards}
        isOpen={isChatWidgetOpen}
        onClose={() => setIsChatWidgetOpen(false)}
      />

      {/* SaaS Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>NovaMind • Kişisel Link & Medya Kasası • PWA • Tüm Verileriniz Kişisel Hesabınızda Saklanır</p>
      </footer>

    </div>
  );
}
