import React, { useState } from "react";
import { Bell, Calendar, Plus, Check, Trash2, Clock, CalendarDays, ExternalLink, Download, AlertCircle, ChevronDown, ChevronUp, Sparkles, Filter } from "lucide-react";
import { ReminderItem } from "../types";

interface RemindersWidgetProps {
  reminders: ReminderItem[];
  onAddReminder: (item: Omit<ReminderItem, "id" | "created_at">) => void;
  onToggleCheck: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onClearCompleted?: () => void;
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({
  reminders,
  onAddReminder,
  onToggleCheck,
  onDeleteReminder,
  onClearCompleted,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<"upcoming" | "today" | "completed" | "all">("upcoming");
  
  // Form fields
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [dueTime, setDueTime] = useState("12:00");
  const [priority, setPriority] = useState<"high" | "normal" | "low">("normal");
  const [note, setNote] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title: title.trim(),
      due_date: dueDate,
      due_time: dueTime,
      priority,
      note: note.trim() || undefined,
      is_completed: false,
    });

    setTitle("");
    setNote("");
    setIsFormOpen(false);
  };

  // Generate .ics string for a reminder
  const downloadIcsFile = (reminder: ReminderItem) => {
    const cleanTitle = reminder.title.replace(/[\r\n]+/g, " ");
    const dateFormatted = reminder.due_date.replace(/-/g, "");
    const timeFormatted = (reminder.due_time || "09:00").replace(":", "") + "00";
    
    // Start date time in UTC / Local representation
    const dtStart = `${dateFormatted}T${timeFormatted}`;
    const dtEnd = `${dateFormatted}T${(parseInt(timeFormatted.substring(0, 2)) + 1).toString().padStart(2, "0")}${timeFormatted.substring(2)}`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NovaMind Reminders//TR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${reminder.note ? reminder.note.replace(/[\r\n]+/g, "\\n") : "NovaMind Hatırlatma"}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Hatırlatma-${reminder.title.substring(0, 20)}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Google Calendar template URL
  const openGoogleCalendar = (reminder: ReminderItem) => {
    const cleanTitle = encodeURIComponent(reminder.title);
    const cleanDetails = encodeURIComponent(reminder.note || "NovaMind Uygulaması Hatırlatması");
    const dateFormatted = reminder.due_date.replace(/-/g, "");
    const timeFormatted = (reminder.due_time || "09:00").replace(":", "") + "00";
    
    const dtStart = `${dateFormatted}T${timeFormatted}`;
    const dtEnd = `${dateFormatted}T${(parseInt(timeFormatted.substring(0, 2)) + 1).toString().padStart(2, "0")}${timeFormatted.substring(2)}`;

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${cleanTitle}&details=${cleanDetails}&dates=${dtStart}/${dtEnd}`;
    window.open(googleUrl, "_blank");
  };

  // Filter reminders
  const filteredReminders = reminders.filter((item) => {
    if (filter === "completed") return item.is_completed;
    if (filter === "today") return !item.is_completed && item.due_date === todayStr;
    if (filter === "upcoming") return !item.is_completed && item.due_date >= todayStr;
    return true;
  });

  const activeCount = reminders.filter((r) => !r.is_completed).length;
  const todayCount = reminders.filter((r) => !r.is_completed && r.due_date === todayStr).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm">Önemli Hatırlatmalar</h3>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold">
                  {activeCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Takvim senkronizasyonlu görev ve planlayıcı</p>
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni</span>
        </button>
      </div>

      {/* Add Reminder Form Collapsible */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center space-x-1">
              <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
              <span>Yeni Hatırlatma Ekle</span>
            </span>
            <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          <div>
            <input
              type="text"
              required
              placeholder="Hatırlatma başlığı (ör. Fatura ödeme, Kitap teslimi...)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Tarih</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Saat</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-slate-500">Öncelik:</span>
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                  priority === "low" ? "bg-slate-200 border-slate-400 text-slate-800" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Düşük
              </button>
              <button
                type="button"
                onClick={() => setPriority("normal")}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                  priority === "normal" ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority("high")}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                  priority === "high" ? "bg-rose-100 border-rose-300 text-rose-800" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                Yüksek
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-[11px] border-b border-slate-100 pb-2 overflow-x-auto">
        <div className="flex items-center space-x-1 font-semibold text-slate-500">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === "upcoming" ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            Gelecek
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
              filter === "today" ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <span>Bugün</span>
            {todayCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === "completed" ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            Tamamlanan
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filter === "all" ? "bg-slate-900 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            Tümü
          </button>
        </div>

        {filter === "completed" && onClearCompleted && (
          <button
            onClick={onClearCompleted}
            className="text-[10px] text-slate-400 hover:text-rose-600 font-medium"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Reminders List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredReminders.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs space-y-1">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-medium text-slate-500">Bu görünümde hatırlatma bulunmuyor</p>
            <p className="text-[11px] text-slate-400">Yeni bir hatırlatma ekleyerek takviminizle senkronize edin.</p>
          </div>
        ) : (
          filteredReminders.map((item) => {
            const isToday = item.due_date === todayStr;
            const isPast = !item.is_completed && item.due_date < todayStr;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-start justify-between group ${
                  item.is_completed
                    ? "bg-slate-50 border-slate-200 opacity-60"
                    : isPast
                    ? "bg-rose-50/50 border-rose-200"
                    : isToday
                    ? "bg-amber-50/60 border-amber-200"
                    : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-start space-x-2.5 flex-1 min-w-0 pr-2">
                  <button
                    onClick={() => onToggleCheck(item.id)}
                    className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      item.is_completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 hover:border-slate-500 bg-white"
                    }`}
                  >
                    {item.is_completed && <Check className="w-3 h-3" />}
                  </button>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p
                      className={`text-xs font-bold text-slate-800 leading-snug line-clamp-2 ${
                        item.is_completed ? "line-through text-slate-400 font-normal" : ""
                      }`}
                    >
                      {item.title}
                    </p>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 flex-wrap gap-y-1">
                      <span className={`flex items-center space-x-1 font-semibold ${isPast ? "text-rose-600" : isToday ? "text-amber-700" : "text-slate-500"}`}>
                        <Calendar className="w-3 h-3" />
                        <span>{item.due_date}</span>
                        {item.due_time && <span>• {item.due_time}</span>}
                      </span>

                      {item.priority === "high" && (
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 font-extrabold rounded text-[9px]">
                          Yüksek
                        </span>
                      )}

                      {isPast && !item.is_completed && (
                        <span className="px-1.5 py-0.2 bg-rose-200 text-rose-900 font-extrabold rounded text-[9px]">
                          Günü Geçti
                        </span>
                      )}
                    </div>

                    {item.note && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic pt-0.5">
                        "{item.note}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Calendar Sync Actions */}
                <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadIcsFile(item)}
                    title="Takvim Dosyası (.ics) İndir (Apple/Outlook/Telefon)"
                    className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openGoogleCalendar(item)}
                    title="Google Takvim'e Doğrudan Ekle"
                    className="p-1 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteReminder(item.id)}
                    title="Sil"
                    className="p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info banner */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Takviminiz ile senkronize edilebilir .ics formatını destekler.</span>
        </span>
      </div>
    </div>
  );
};
