import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Header } from "./components/Header";
import { CardGrid } from "./components/CardGrid";
import { RemindersWidget } from "./components/RemindersWidget";
import { WeeklyDigestWidget } from "./components/WeeklyDigestWidget";
import { ExportCollectionModal } from "./components/ExportCollectionModal";
import { MindMapViewer } from "./components/MindMapViewer";
import { IdeaGenerator } from "./components/IdeaGenerator";
import { AddCardModal } from "./components/AddCardModal";
import { PreviewModal } from "./components/PreviewModal";
import { ChatWidget } from "./components/ChatWidget";
import { MessageSquare } from "lucide-react";
import { PwaShareNotice } from "./components/PwaShareNotice";
import { SettingsModal } from "./components/SettingsModal";
import { PricingModal } from "./components/Subscription/PricingModal";
import { useSubscription } from "./hooks/useSubscription";
import { Card, ReminderItem } from "./types";
import { getCards, saveCards, getReminders, saveReminders } from "./lib/storage";
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
  const [activeTab, setActiveTab] = useState<"library" | "mindmap" | "ideas">("mindmap");
  
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [isPwaInfoOpen, setIsPwaInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialShareUrl, setInitialShareUrl] = useState("");
  const [initialShareTitle, setInitialShareTitle] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
            setNotification(`Tarayıcı eklentisinden ${items.length} yeni bağlantı başarıyla kaydedildi!`);
            setTimeout(() => setNotification(null), 4000);
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
    } catch (err) {
      alert("Google ile giriş yapılamadı.");
    }
  };

  const handleLogout = async () => {
    await logoutFirebase();
    setCards([]);
    setReminders([]);
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      
      {/* Dynamic Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 font-medium text-sm flex items-center space-x-2 animate-in slide-in-from-top-4 duration-300">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
          </span>
          <span>{notification}</span>
        </div>
      )}

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
        currentUser={currentUser}
        onLoginWithGoogle={handleLoginGoogle}
        onLogout={handleLogout}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Library & Main Dashboard */}
        {activeTab === "library" && (
          <div className="space-y-6">
            
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

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCard}
        existingCards={cards}
        initialUrl={initialShareUrl}
        initialTitle={initialShareTitle}
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

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>NovaMind • Kişisel Link & Medya Kasası • PWA • Tüm Verileriniz Kişisel Hesabınızda Saklanır</p>
      </footer>

      {/* Floating Action Button for AI Chat */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center border border-indigo-400"
        title="Yapay Zeka ile Kütüphanende Sohbet Et"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* AI Chat Widget */}
      <ChatWidget
        cards={cards}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
}
