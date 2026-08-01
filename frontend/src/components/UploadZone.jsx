import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Camera, Image as ImageIcon, CheckCircle2, Sparkles, Leaf, Info } from "lucide-react";
import { translations } from "../utils/i18n";
import { pickImageFromCamera, pickImageFromGallery } from "../utils/capacitorPlugins";

const CROPS = [
  { id: "model1", name: "Tomato", labelHi: "टमाटर", emoji: "🍅", color: "from-rose-500 to-amber-500" },
  { id: "model2", name: "Potato", labelHi: "आलू", emoji: "🥔", color: "from-amber-600 to-yellow-600" },
  { id: "model3", name: "Grape", labelHi: "अंगूर", emoji: "🍇", color: "from-purple-600 to-indigo-600" },
  { id: "model4", name: "Corn", labelHi: "मक्का", emoji: "🌽", color: "from-yellow-500 to-amber-600" },
];

const UploadZone = ({ selectedModel, setSelectedModel, onFileSelected, preview, lang }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const t = translations[lang] || translations.en;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  // Native camera via Capacitor (falls back to browser capture on web)
  const triggerCamera = async () => {
    const file = await pickImageFromCamera();
    if (file) onFileSelected(file);
  };

  // Native gallery via Capacitor (falls back to browser file picker on web)
  const handleGallery = async () => {
    const file = await pickImageFromGallery();
    if (file) onFileSelected(file);
  };

  // Helper to generate a realistic sample leaf image using HTML Canvas
  const handleSampleLeaf = (type = "healthy") => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    // Leaf background
    const bgGrad = ctx.createLinearGradient(0, 0, 400, 400);
    bgGrad.addColorStop(0, "#f8fafc");
    bgGrad.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 400, 400);

    // Draw leaf shape
    ctx.beginPath();
    ctx.moveTo(200, 40);
    ctx.bezierCurveTo(340, 100, 360, 280, 200, 360);
    ctx.bezierCurveTo(40, 280, 60, 100, 200, 40);
    
    const leafGrad = ctx.createLinearGradient(100, 50, 300, 350);
    leafGrad.addColorStop(0, "#16a34a");
    leafGrad.addColorStop(0.5, "#22c55e");
    leafGrad.addColorStop(1, "#15803d");
    ctx.fillStyle = leafGrad;
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 15;
    ctx.fill();

    // Leaf main vein
    ctx.beginPath();
    ctx.moveTo(200, 50);
    ctx.lineTo(200, 350);
    ctx.strokeStyle = "#86efac";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Side veins
    for (let y = 100; y <= 300; y += 40) {
      ctx.beginPath();
      ctx.moveTo(200, y);
      ctx.quadraticCurveTo(250, y - 20, 280, y - 30);
      ctx.moveTo(200, y);
      ctx.quadraticCurveTo(150, y - 20, 120, y - 30);
      ctx.strokeStyle = "#a7f3d0";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (type === "diseased") {
      // Add brown necrotic lesions and yellow spots
      ctx.shadowBlur = 0;
      // Lesion 1
      ctx.beginPath();
      ctx.arc(160, 160, 30, 0, Math.PI * 2);
      ctx.fillStyle = "#78350f";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#f59e0b";
      ctx.stroke();

      // Lesion 2
      ctx.beginPath();
      ctx.arc(240, 230, 25, 0, Math.PI * 2);
      ctx.fillStyle = "#92400e";
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#eab308";
      ctx.stroke();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${selectedModel}_sample_leaf.jpg`, { type: "image/jpeg" });
        onFileSelected(file);
      }
    }, "image/jpeg");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Crop Selection Section */}
      <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 flex items-center space-x-1.5">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>{t.selectModel}</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Select plant model</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CROPS.map((crop) => {
            const isSelected = selectedModel === crop.id;
            return (
              <motion.button
                key={crop.id}
                type="button"
                onClick={() => setSelectedModel(crop.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`py-3 px-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-between transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/50"
                    : "bg-slate-50/80 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{crop.emoji}</span>
                  <span>{lang === "hi" ? crop.labelHi : crop.name}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragOver ? "#10b981" : "#cbd5e1",
          scale: isDragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={`relative border-2 border-dashed rounded-3xl text-center cursor-pointer overflow-hidden transition-all duration-300 shadow-sm ${
          isDragOver
            ? "bg-emerald-50/80 border-emerald-500 shadow-lg shadow-emerald-500/10"
            : "bg-white/90 border-slate-300/80 hover:border-emerald-400 hover:bg-slate-50/50 hover:shadow-md"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group overflow-hidden"
            >
              <img
                src={preview}
                alt="Uploaded Leaf Preview"
                className="w-full h-64 object-cover"
              />
              {/* Scan line effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent scan-animation shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
              </div>

              {/* Hover overlay with button */}
              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-xs">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                  className="px-5 py-2.5 bg-white text-emerald-800 rounded-xl text-xs font-black shadow-xl flex items-center space-x-2 border border-emerald-200 hover:scale-105 active:scale-95 transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Choose Another Image</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 px-6 flex flex-col items-center justify-center space-y-5"
            >
              {/* Icon Container with glowing ring */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-md shadow-emerald-500/10">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div className="absolute -inset-2 rounded-3xl border border-emerald-400/30 animate-pulse-ring pointer-events-none" />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  {isDragOver ? "✨ Release to Diagnose Leaf!" : t.dragDropText}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t.browseText}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => { e.stopPropagation(); handleGallery(); }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Browse Device</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={(e) => { e.stopPropagation(); triggerCamera(); }}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 hover:border-emerald-300 shadow-sm flex items-center space-x-2 transition-all"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>{t.cameraText}</span>
                </motion.button>
              </div>

              {/* Instant Sample Leaf Buttons */}
              <div className="pt-3 border-t border-slate-200/60 w-full max-w-md">
                <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Don't have a leaf image? Try instant samples:</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSampleLeaf("diseased"); }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/80 transition-all flex items-center space-x-1"
                  >
                    <span>🍂 Sample Diseased Leaf</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSampleLeaf("healthy"); }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 transition-all flex items-center space-x-1"
                  >
                    <span>🌿 Sample Healthy Leaf</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium pt-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>Supports JPG, PNG, WEBP up to 10MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UploadZone;
