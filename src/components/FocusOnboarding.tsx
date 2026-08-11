import React from "react";
import { ArrowRight, BookOpenCheck, Sparkles, Telescope } from "lucide-react";
import { UserFocus } from "../types";

interface FocusOnboardingProps {
  onChoose: (focus: UserFocus) => void;
}

const options: Array<{
  focus: UserFocus;
  eyebrow: string;
  title: string;
  description: string;
  outcomes: string[];
  icon: typeof Sparkles;
  accent: string;
}> = [
  {
    focus: "creator",
    eyebrow: "İÇERİK ÜRETİCİSİ",
    title: "Kaynaklarını yayın fikrine dönüştür",
    description: "Video, post ve ilham kaynaklarını tek yerde topla; sonra onları içerik serilerine dönüştür.",
    outcomes: ["İçerik fikri & hook'lar", "Kaynaklı yayın taslakları", "Haftalık üretim odağı"],
    icon: Sparkles,
    accent: "from-orange-500 to-rose-500",
  },
  {
    focus: "researcher",
    eyebrow: "ARAŞTIRMACI",
    title: "Kaynaklarını anlamlı bir bilgi ağına dönüştür",
    description: "Makaleleri, videoları ve notları topla; bağlantıları bulup kaynaklı sentezler üret.",
    outcomes: ["Kaynaklı araştırma notları", "Temalara göre keşif", "Tekrar gözden geçirme"],
    icon: Telescope,
    accent: "from-indigo-500 to-cyan-500",
  },
];

export const FocusOnboarding: React.FC<FocusOnboardingProps> = ({ onChoose }) => (
  <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#10131d]/95 px-4 py-8 text-slate-100 backdrop-blur-xl sm:flex sm:items-center sm:justify-center">
    <section className="mx-auto w-full max-w-5xl">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-bold tracking-wide text-orange-200">
          <BookOpenCheck className="h-4 w-4" />
          NOVAMIND'I KENDİNE GÖRE HAZIRLA
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
          Kaydettiklerin sana ne üretsin?
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
          Bir yol seç; ana ekranını ve sonraki önerileri buna göre kişiselleştirelim. Bunu daha sonra değiştirebilirsin.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.focus}
              onClick={() => onChoose(option.focus)}
              className="group relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 text-left shadow-2xl transition duration-200 hover:-translate-y-1 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:p-8"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.accent}`} />
              <div className={`mb-8 inline-flex rounded-2xl bg-gradient-to-br ${option.accent} p-3 text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-slate-400">{option.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white">{option.title}</h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{option.description}</p>
              <ul className="mt-7 space-y-2.5 text-sm text-slate-200">
                {option.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-300" />
                    {outcome}
                  </li>
                ))}
              </ul>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white">
                Bu yolla başla
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  </div>
);
