import React, { useState } from "react";
import { ShoppingBag, Plus, Trash2, ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { ShoppingItem } from "../types";

interface ShoppingWidgetProps {
  items: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, "id" | "created_at">) => void;
  onToggleCheck: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
}

export const ShoppingWidget: React.FC<ShoppingWidgetProps> = ({
  items,
  onAddItem,
  onToggleCheck,
  onDeleteItem,
  onClearChecked,
}) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "checked">("all");
  const [isExpandedForm, setIsExpandedForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      quantity: quantity.trim() || null,
      note: note.trim() || null,
      is_checked: false,
      source_url: sourceUrl.trim() || null,
    });

    setName("");
    setQuantity("");
    setNote("");
    setSourceUrl("");
    setIsExpandedForm(false);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "pending") return !item.is_checked;
    if (filter === "checked") return item.is_checked;
    return true;
  });

  const checkedCount = items.filter((i) => i.is_checked).length;
  const pendingCount = items.length - checkedCount;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm space-y-3">
      
      {/* Minimal Widget Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Alışveriş Listesi
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full">
              {pendingCount}
            </span>
          </div>
        </div>

        {checkedCount > 0 && (
          <button
            onClick={onClearChecked}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-medium hover:underline"
          >
            Tamamlananları Sil
          </button>
        )}
      </div>

      {/* Minimal Add Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center space-x-1.5">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eklenecek malzeme veya ürün..."
            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Miktar"
            className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg flex items-center transition-colors shadow-sm"
            title="Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {!isExpandedForm ? (
          <button
            type="button"
            onClick={() => setIsExpandedForm(true)}
            className="text-[10px] text-indigo-600 font-medium hover:underline block"
          >
            + Not veya link ekle
          </button>
        ) : (
          <div className="space-y-1.5 pt-1 text-[11px] animate-in fade-in">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not/Detay (ör: dim edilebilir)"
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md"
            />
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Ürün linki (https://...)"
              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>
        )}
      </form>

      {/* Minimal Filter Pills */}
      {items.length > 0 && (
        <div className="flex items-center space-x-1 pt-1 text-[11px]">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tümü ({items.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filter === "pending" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Bekleyen ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("checked")}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filter === "checked" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Alınan ({checkedCount})
          </button>
        </div>
      )}

      {/* Minimal Shopping List Items */}
      {filteredItems.length > 0 ? (
        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden bg-slate-50/40">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className={`px-2.5 py-2 flex items-center justify-between group transition-colors ${
                item.is_checked ? "bg-slate-50/80 opacity-60" : "bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0 pr-2">
                <button
                  onClick={() => onToggleCheck(item.id)}
                  className="text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors shrink-0"
                >
                  {item.is_checked ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-50" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </button>

                <div className="flex-1 min-w-0 flex items-center space-x-1.5">
                  <span className={`text-xs font-medium text-slate-800 truncate ${item.is_checked ? "line-through text-slate-400" : ""}`}>
                    {item.name}
                  </span>
                  {item.quantity && (
                    <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-100/60 shrink-0">
                      {item.quantity}
                    </span>
                  )}
                </div>

                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600 shrink-0"
                    title="Ürün Linki"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <button
                onClick={() => onDeleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 rounded transition-opacity shrink-0"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 text-slate-400 text-[11px] bg-slate-50 rounded-lg border border-dashed border-slate-200">
          Listenizde henüz ürün yok.
        </div>
      )}

    </div>
  );
};
