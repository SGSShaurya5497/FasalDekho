import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "../components/HeroSection";
import UploadZone from "../components/UploadZone";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ResultCard from "../components/ResultCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getStoredToken } from "../utils/auth";
import { getCurrentLocation } from "../utils/capacitorPlugins";
import API_BASE from "../utils/api";

const DiagnoseView = ({ lang }) => {
  const [selectedModel, setSelectedModel] = useState("model1");
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    // Uses @capacitor/geolocation on Android, falls back to browser API on web
    getCurrentLocation().then((coords) => {
      if (coords) setLocation({ lat: coords.lat, lon: coords.lon });
    });
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <HeroSection lang={lang} />

      <div className="mt-2">
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
    </div>
  );
};

export default DiagnoseView;
