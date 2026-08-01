import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "../components/HeroSection";
import UploadZone from "../components/UploadZone";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ResultCard from "../components/ResultCard";
import { AlertCircle, RefreshCw, WifiOff, History, BookOpen, Clock } from "lucide-react";
import { getStoredToken } from "../utils/auth";
import { getCurrentLocation } from "../utils/capacitorPlugins";
import API_BASE from "../utils/api";

const ADVISORIES = {
  model1: {
    crop: "Tomato",
    cropHi: "टमाटर",
    tips: [
      "Avoid overhead watering to reduce humidity on leaves.",
      "Prune lower leaves to enhance airflow and sunlight penetration.",
      "Apply copper-based fungicides preventatively during warm, humid conditions."
    ],
    tipsHi: [
      "पत्तियों पर नमी कम करने के लिए ऊपर से पानी देने से बचें।",
      "हवा और धूप के लिए नीचे की पत्तियों की छंटाई करें।",
      "गर्म और उमस भरे मौसम में तांबा-आधारित कवकनाशी का छिड़काव करें।"
    ]
  },
  model2: {
    crop: "Potato",
    cropHi: "आलू",
    tips: [
      "Ensure proper soil drainage to avoid late blight infection.",
      "Use certified disease-free seed tubers for planting.",
      "Destroy infected crop residues immediately after harvest."
    ],
    tipsHi: [
      "लेट ब्लाइट संक्रमण से बचने के लिए मिट्टी में उचित जल निकासी सुनिश्चित करें।",
      "रोपण के लिए प्रमाणित रोग मुक्त बीज कंदों का उपयोग करें।",
      "कटाई के तुरंत बाद संक्रमित फसल अवशेषों को नष्ट कर दें।"
    ]
  },
  model3: {
    crop: "Grape",
    cropHi: "अंगूर",
    tips: [
      "Prune vines to open the canopy for rapid leaf drying.",
      "Remove dead mummified berries from the ground and vines.",
      "Apply protective sulfur sprays before rain events."
    ],
    tipsHi: [
      "पत्तियों को जल्दी सुगाने के लिए लताओं की छंटाई करें।",
      "जमीन और लताओं से सूखी हुई सड़ी हुई अंगूर की फलियों को हटा दें।",
      "बारिश से पहले सुरक्षात्मक सल्फर स्प्रे का प्रयोग करें।"
    ]
  },
  model4: {
    crop: "Corn",
    cropHi: "मक्का",
    tips: [
      "Rotate crops with non-grass species to break pathogen cycles.",
      "Choose rust-resistant hybrids suited for your local climate.",
      "Ensure proper nitrogen fertilization to improve plant resilience."
    ],
    tipsHi: [
      "रोग चक्र को तोड़ने के लिए अन्य गैर-घास वाली फसलों के साथ चक्रानुक्रम करें।",
      "अपने स्थानीय जलवायु के अनुकूल जंग-प्रतिरोधी संकर बीज चुनें।",
      "पौधे की प्रतिरोधक क्षमता बढ़ाने के लिए उचित नाइट्रोजन निषेचन सुनिश्चित करें।"
    ]
  }
};

const DiagnoseView = ({ lang }) => {
  const [selectedModel, setSelectedModel] = useState("model1");
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Retrieve geolocation coords
  useEffect(() => {
    getCurrentLocation().then((coords) => {
      if (coords) setLocation({ lat: coords.lat, lon: coords.lon });
    });
  }, []);

  // Fetch scan history helper
  const fetchHistory = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const historyData = await res.json();
        setHistory(historyData);
      }
    } catch (e) {
      console.log("Failed to load scan history:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [data]); // Reload history whenever a new scan is completed

  const handleFileSelected = async (file) => {
    setPreview(URL.createObjectURL(file));
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (location.lat !== null && location.lon !== null) {
        formData.append("lat", location.lat);
        formData.append("lon", location.lon);
      }

      const headers = {};
      const token = getStoredToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/predict/${selectedModel}`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to process leaf image. Please try again.");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setData(null);
    setError(null);
  };

  const currentAdvisory = ADVISORIES[selectedModel];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 space-y-6">
      <HeroSection lang={lang} />

      {/* Offline Mode Banner */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 shadow-sm"
        >
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-950">
              {lang === "hi" ? "ऑफलाइन मोड" : "Offline Mode"}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              {lang === "hi"
                ? "आप अभी इंटरनेट से कनेक्टेड नहीं हैं। आप सैंपल पत्तियां देख सकते हैं, लेकिन नई स्कैनिंग करने के लिए इंटरनेट की आवश्यकता होगी।"
                : "You are currently disconnected. You can browse instant samples, but online diagnostic scanning requires an active internet connection."}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Diagnosis Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scanning Area */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!data && !isLoading && !error && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <UploadZone
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  onFileSelected={handleFileSelected}
                  preview={preview}
                  lang={lang}
                />
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <LoadingSkeleton lang={lang} />
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="bg-rose-50 border border-rose-200/90 rounded-3xl p-6 text-center max-w-md mx-auto space-y-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-rose-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-950 mb-1">Analysis Failed</h3>
                  <p className="text-sm text-rose-700 leading-relaxed font-medium">{error}</p>
                </div>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-rose-600/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </motion.div>
            )}

            {data && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <ResultCard data={data} lang={lang} onClear={handleClear} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Panel: Crop Advisory & Quick Stats/History */}
        <div className="space-y-6">
          {/* Crop Advisory Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                {lang === "hi" ? "फसल सुरक्षा सुझाव" : "Crop Protection Tips"}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-slate-400">Crop Type</span>
                <span className="text-xs font-black text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg">
                  {lang === "hi" ? currentAdvisory.cropHi : currentAdvisory.crop}
                </span>
              </div>
              <ul className="space-y-2.5 pt-1">
                {(lang === "hi" ? currentAdvisory.tipsHi : currentAdvisory.tips).map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Scan History Panel */}
          {getStoredToken() && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-slate-500" />
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                    {lang === "hi" ? "पिछला इतिहास" : "Recent History"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    fetchHistory();
                    setShowHistory(!showHistory);
                  }}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  {showHistory ? (lang === "hi" ? "बंद करें" : "Collapse") : (lang === "hi" ? "देखें" : "Expand")}
                </button>
              </div>

              {showHistory && (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      {lang === "hi" ? "कोई पिछला रिकॉर्ड नहीं मिला" : "No recent scans found"}
                    </p>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-slate-800">{item.crop_type}</span>
                          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">
                          {item.disease_class.replace(/___/g, ": ").replace(/_/g, " ")}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Severity: {Math.round(item.severity_percent)}%</span>
                          <span className="font-bold text-emerald-600">{(item.confidence * 100).toFixed(0)}% Conf</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnoseView;
