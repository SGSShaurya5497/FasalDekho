import React from "react";
import { CloudRain, Wind, AlertTriangle, CheckCircle2, Thermometer } from "lucide-react";
import { translations } from "../utils/i18n";

const AdvisoryAlert = ({ sprayAdvisory, lang }) => {
  const t = translations[lang] || translations.en;
  if (!sprayAdvisory) return null;

  const { suitable, warning, total_rain_mm, max_wind_speed_kmh, temperature } = sprayAdvisory;

  const cardStyle = suitable
    ? "bg-emerald-50/70 border-emerald-200/90 text-emerald-950"
    : "bg-rose-50/70 border-rose-200/90 text-rose-950";

  const badgeStyle = suitable
    ? "bg-emerald-100 text-emerald-800 border-emerald-300/80"
    : "bg-rose-100 text-rose-800 border-rose-300/80";

  return (
    <div className={`border rounded-3xl p-5 shadow-sm transition-all duration-300 backdrop-blur-md ${cardStyle}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {suitable ? (
            <div className="p-2 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
            </div>
          ) : (
            <div className="p-2 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-slate-900">{t.sprayAdvisoryTitle}</h4>
            <span className={`inline-block mt-0.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
              {suitable ? t.spraySuitable : t.sprayUnsuitable}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-slate-700">
        {warning}
      </p>

      {/* Weather telemetry grid */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-xs pt-3 border-t border-slate-200/60">
        <div className="flex items-center space-x-2 bg-white/90 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
          <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-slate-700 truncate"><strong>Rain:</strong> {total_rain_mm ?? 0}mm</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/90 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
          <Wind className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="text-slate-700 truncate"><strong>Wind:</strong> {max_wind_speed_kmh ?? 0}km/h</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/90 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
          <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-slate-700 truncate"><strong>Temp:</strong> {temperature ?? 24}°C</span>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryAlert;
