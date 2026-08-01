import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, ShieldAlert, Award, RefreshCw, CheckCircle2, Microscope, Download } from "lucide-react";
import { translations, translateDisease } from "../utils/i18n";
import { speakText, stopSpeech } from "../utils/speech";
import SeverityBar from "./SeverityBar";
import AdvisoryAlert from "./AdvisoryAlert";
import NutrientCard from "./NutrientCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1] } },
};

const ResultCard = ({ data, lang, onClear }) => {
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const t = translations[lang] || translations.en;

  if (!data) return null;

  const diseaseName = translateDisease(data.class, lang);
  const confidencePct = (parseFloat(data.confidence) * 100).toFixed(1);
  const isHealthy = data.class && data.class.toLowerCase().includes("healthy");

  const handleSpeak = () => {
    if (isPlayingSpeech) {
      stopSpeech();
      setIsPlayingSpeech(false);
    } else {
      setIsPlayingSpeech(true);
      const textToRead =
        lang === "hi"
          ? `निदान परिणाम: ${diseaseName}। विश्वसनीयता: ${confidencePct} प्रतिशत। पत्तों में बीमारी की गंभीरता: ${data.severity_percent || 0} प्रतिशत। ${data.spray_advisory ? data.spray_advisory.warning : ""}`
          : `Diagnosis result: ${diseaseName}. Confidence score: ${confidencePct} percent. Leaf severity: ${data.severity_percent || 0} percent. ${data.spray_advisory ? data.spray_advisory.warning : ""}`;

      speakText(textToRead, lang);
      setTimeout(() => setIsPlayingSpeech(false), 8000);
    }
  };

  const handleDownloadReport = () => {
    const reportText = `=== AGRI-SHIELD AI DIAGNOSIS REPORT ===
Date: ${new Date().toLocaleString()}
Crop Type: ${data.crop_type || "N/A"}
Diagnosis: ${diseaseName} (${data.class})
Confidence Score: ${confidencePct}%
Leaf Severity: ${data.severity_percent}%
Nutrient Deficiency: ${data.nutrient_deficiency?.suspected_deficiency || "None"}
Weather Advisory: ${data.spray_advisory?.warning || "Normal"}
Escalation Status: ${data.needs_review ? "Flagged for Review" : "Normal"}
==========================================`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Diagnosis_Report_${data.crop_type}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-5 max-w-2xl mx-auto"
    >
      {/* Main Diagnosis Card */}
      <motion.div
        variants={itemVariants}
        className="relative bg-white/95 border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 backdrop-blur-md overflow-hidden"
      >
        {/* Top gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isHealthy ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-amber-500 to-rose-500"}`} />

        {/* Header Row */}
        <div className="relative flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-2xl ${isHealthy ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80" : "bg-amber-50 text-amber-600 border border-amber-200/80"}`}>
              {isHealthy ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Microscope className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[11px] uppercase font-black tracking-widest text-emerald-700 block">
                {t.diagnosisTitle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {diseaseName}
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSpeak}
              title={isPlayingSpeech ? "Stop Speech" : t.listenButton}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 ${
                isPlayingSpeech
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80"
              }`}
            >
              {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">{isPlayingSpeech ? "Stop" : t.listenButton}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              title="Download Report"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="relative grid grid-cols-2 gap-3.5 mb-5">
          <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">{t.confidenceLabel}</div>
              <div className="text-2xl font-black text-slate-900 leading-tight">{confidencePct}%</div>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 border border-teal-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">Leaf Affected</div>
              <div className="text-2xl font-black text-slate-900 leading-tight">
                {data.severity_percent != null ? data.severity_percent : "—"}%
              </div>
            </div>
          </div>
        </div>

        {/* Low confidence review flag */}
        {data.needs_review && (
          <div className="relative bg-amber-50 border border-amber-200/90 p-4 rounded-2xl text-amber-950 text-xs font-medium flex items-start space-x-3 shadow-sm mb-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold text-amber-950 block mb-0.5">{t.escalationWarning}</strong>
              <span className="opacity-90 text-amber-850 leading-relaxed">{data.escalation_reason}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Severity Bar */}
      <motion.div variants={itemVariants}>
        <SeverityBar severityPercent={data.severity_percent} lang={lang} />
      </motion.div>

      {/* Weather Spray Advisory */}
      {data.spray_advisory && (
        <motion.div variants={itemVariants}>
          <AdvisoryAlert sprayAdvisory={data.spray_advisory} lang={lang} />
        </motion.div>
      )}

      {/* Nutrient Deficiency Warning */}
      {data.nutrient_deficiency && (
        <motion.div variants={itemVariants}>
          <NutrientCard nutrientDeficiency={data.nutrient_deficiency} lang={lang} />
        </motion.div>
      )}

      {/* Re-analyze / Clear Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={onClear}
          className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold border border-slate-200 flex items-center justify-center space-x-2 shadow-sm transition-all active:scale-[0.99]"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>{t.clearBtn}</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ResultCard;
