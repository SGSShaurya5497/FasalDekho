import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { translations } from "../utils/i18n";

const SeverityBar = ({ severityPercent, lang }) => {
  const t = translations[lang] || translations.en;
  const percent = Math.min(Math.max(severityPercent || 0, 0), 100);

  let severityLabel = t.severityLow;
  let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200/80";

  if (percent > 35) {
    severityLabel = t.severityHigh;
    badgeColor = "bg-rose-50 text-rose-800 border-rose-200/80";
  } else if (percent > 15) {
    severityLabel = t.severityMed;
    badgeColor = "bg-amber-50 text-amber-800 border-amber-200/80";
  }

  return (
    <div className="bg-white/95 border border-slate-200/80 rounded-3xl p-5 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-extrabold text-slate-800">{t.severityTitle}</span>
        </div>
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${badgeColor}`}>
          {percent}% — {severityLabel}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 shadow-sm"
        />
      </div>

      {/* Range Markers */}
      <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2 px-0.5">
        <span>0% (Healthy)</span>
        <span>20% (Mild Spread)</span>
        <span>50%+ (Severe Infection)</span>
      </div>
    </div>
  );
};

export default SeverityBar;
