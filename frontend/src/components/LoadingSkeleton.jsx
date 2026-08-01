import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Cpu, Activity } from "lucide-react";
import { translations } from "../utils/i18n";

const LoadingSkeleton = ({ lang }) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="relative overflow-hidden bg-white/95 border border-emerald-200/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto space-y-5 backdrop-blur-md">
      {/* Laser Scanning Line Animation */}
      <motion.div
        animate={{ y: [0, 260, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_20px_#10b981] z-10 pointer-events-none"
      />

      <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-600 animate-pulse">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-slate-200/80 rounded-md w-1/4 animate-pulse" />
          <div className="h-5 bg-slate-200/80 rounded-lg w-2/3 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="h-20 bg-slate-100/80 border border-slate-200/60 rounded-2xl animate-pulse" />
        <div className="h-20 bg-slate-100/80 border border-slate-200/60 rounded-2xl animate-pulse" />
      </div>

      <div className="h-14 bg-slate-100/80 border border-slate-200/60 rounded-2xl animate-pulse" />
      <div className="h-28 bg-slate-100/80 border border-slate-200/60 rounded-2xl animate-pulse" />

      <div className="flex items-center justify-center space-x-2 pt-2 text-emerald-700 text-xs font-extrabold">
        <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
        <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
        <span>{t.analyzing}</span>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
