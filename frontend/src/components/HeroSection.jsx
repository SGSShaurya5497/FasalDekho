import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Leaf, Zap, Cpu, Sun, CloudRain } from "lucide-react";
import { translations } from "../utils/i18n";

const FEATURES = [
  { icon: Cpu, label: "TensorFlow 2.x", desc: "96.88% Accuracy" },
  { icon: Zap, label: "OpenCV Engine", desc: "Lesion Severity %" },
  { icon: CloudRain, label: "Open-Meteo", desc: "Spray Telemetry" },
];

const HeroSection = ({ lang }) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="relative overflow-hidden pt-8 pb-6 px-4 text-center">
      {/* Background ambient lighting glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gradient-to-b from-emerald-100/60 via-teal-50/40 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Floating leaf icon subtle decoration */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 left-6 text-emerald-300/40 pointer-events-none hidden sm:block"
      >
        <Leaf className="w-12 h-12" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-8 right-6 text-teal-300/40 pointer-events-none hidden sm:block"
      >
        <Sun className="w-14 h-14" />
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-xs font-extrabold mb-4 shadow-sm backdrop-blur-md"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>FasalDekho AI · Crop Protection Intelligence</span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.12] mb-3 text-slate-900"
      >
        <span className="gradient-shimmer">
          {t.heroTitle}
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6 font-medium"
      >
        {t.heroSubtitle}
      </motion.p>

      {/* Feature chips */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap"
      >
        {FEATURES.map(({ icon: Icon, label, desc }, i) => (
          <div
            key={i}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-sm hover:border-emerald-300 transition-all"
          >
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{label}</div>
              <div className="text-[10px] text-slate-500 font-medium">{desc}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default HeroSection;
