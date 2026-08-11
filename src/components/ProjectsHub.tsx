import React, { useState } from "react";
import { Check, FolderPlus, Sparkles, Telescope, Trash2, X } from "lucide-react";
import { Project, UserFocus } from "../types";

interface ProjectsHubProps {
  projects: Project[];
  cardsCountByProject: Record<string, number>;
  selectedProjectId: string | null;
  defaultFocus: UserFocus | null;
  onCreate: (input: Pick<Project, "title" | "description" | "focus">) => void;
  onSelect: (projectId: string | null) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectsHub: React.FC<ProjectsHubProps> = ({
  projects,
  cardsCountByProject,
  selectedProjectId,
  defaultFocus,
  onCreate,
  onSelect,
  onDelete,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState<UserFocus>(defaultFocus || "creator");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description: description.trim(), focus });
    setTitle("");
    setDescription("");
    setIsCreating(false);
  };

  return (
    <section className="rounded-3xl border border-[#E2D8C3] bg-[#FBF7EC] p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3A2E22] text-[#FBF7EC]"><FolderPlus className="h-4 w-4" /></span>
            <h2 className="font-serif-fraunces text-lg font-bold text-[#3A2E22]">Çalışma Alanların</h2>
          </div>
          <p className="mt-1 text-xs text-[#786958]">Kaynaklarını bir yayın serisi veya araştırma sorusu altında topla.</p>
        </div>
        <button onClick={() => setIsCreating((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D85A30] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#C84A20]">
          {isCreating ? <X className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
          {isCreating ? "Vazgeç" : "Yeni proje"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-[#DCD0B9] bg-white p-4 sm:grid-cols-2">
          <input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus placeholder={focus === "creator" ? "Örn: AI araçları YouTube serisi" : "Örn: LLM cevaplarının güvenilirliği"} className="rounded-xl border border-[#DCD0B9] px-3 py-2 text-sm text-[#3A2E22] outline-none focus:ring-2 focus:ring-[#D85A30]" />
          <select value={focus} onChange={(event) => setFocus(event.target.value as UserFocus)} className="rounded-xl border border-[#DCD0B9] bg-white px-3 py-2 text-sm text-[#3A2E22] outline-none focus:ring-2 focus:ring-[#D85A30]">
            <option value="creator">İçerik üretimi</option>
            <option value="researcher">Araştırma</option>
          </select>
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Bu projede ulaşmak istediğin sonuç..." className="rounded-xl border border-[#DCD0B9] px-3 py-2 text-sm text-[#3A2E22] outline-none focus:ring-2 focus:ring-[#D85A30] sm:col-span-2" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A2E22] px-3 py-2 text-sm font-bold text-white sm:col-span-2"><Check className="h-4 w-4" />Projeyi oluştur</button>
        </form>
      )}

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        <button onClick={() => onSelect(null)} className={`min-w-40 rounded-2xl border p-3 text-left transition-colors ${selectedProjectId === null ? "border-[#D85A30] bg-[#F9E4D9]" : "border-[#E2D8C3] bg-white hover:border-[#B8AA90]"}`}>
          <p className="text-xs font-bold text-[#3A2E22]">Tüm kaynaklar</p>
          <p className="mt-1 text-[11px] text-[#786958]">Proje filtresi kapalı</p>
        </button>
        {projects.map((project) => {
          const isSelected = selectedProjectId === project.id;
          const Icon = project.focus === "creator" ? Sparkles : Telescope;
          return (
            <div key={project.id} className={`group relative min-w-56 rounded-2xl border p-3 transition-colors ${isSelected ? "border-[#D85A30] bg-[#F9E4D9]" : "border-[#E2D8C3] bg-white hover:border-[#B8AA90]"}`}>
              <button onClick={() => onSelect(isSelected ? null : project.id)} className="w-full pr-5 text-left">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#786958]"><Icon className="h-3.5 w-3.5 text-[#D85A30]" />{project.focus === "creator" ? "Üretim" : "Araştırma"}</span>
                <p className="mt-1 truncate text-sm font-bold text-[#3A2E22]">{project.title}</p>
                <p className="mt-1 line-clamp-1 text-[11px] text-[#786958]">{project.description || "Henüz bir açıklama yok"}</p>
                <p className="mt-2 text-[11px] font-semibold text-[#D85A30]">{cardsCountByProject[project.id] || 0} kaynak</p>
              </button>
              <button onClick={() => onDelete(project.id)} className="absolute right-2 top-2 hidden rounded-lg p-1 text-[#A45B45] hover:bg-[#F4D8CA] group-hover:block" title="Projeyi sil"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
