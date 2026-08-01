import React from "react";
import { Sprout, Info } from "lucide-react";
import { translations } from "../utils/i18n";

const NutrientCard = ({ nutrientDeficiency, lang }) => {
  const t = translations[lang] || translations.en;
  if (!nutrientDeficiency || !nutrientDeficiency.is_deficiency_suspected) return null;

  const { suspected_deficiency, deficiency_confidence, explanation } = nutrientDeficiency;

  return (
    <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-5 text-amber-950 shadow-sm backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700">
          <Sprout className="w-5 h-5 shrink-0" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">{t.nutrientWarningTitle}</h4>
          <span className="text-xs font-bold text-amber-800">
            {suspected_deficiency} ({Math.round(deficiency_confidence * 100)}% Match)
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-start space-x-2.5 text-xs bg-white/90 p-3 rounded-2xl border border-amber-200/70 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-slate-700 font-medium">{explanation}</p>
      </div>
    </div>
  );
};

export default NutrientCard;
