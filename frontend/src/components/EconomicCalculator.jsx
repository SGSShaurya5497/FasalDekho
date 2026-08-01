import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { translations } from "../utils/i18n";
import API_BASE from "../utils/api";

const EconomicCalculator = ({ lang }) => {
  const t = translations[lang] || translations.en;

  const [cropType, setCropType] = useState("Tomato");
  const [growthStage, setGrowthStage] = useState("fruiting");
  const [severityPercent, setSeverityPercent] = useState(20);
  const [treatmentCost, setTreatmentCost] = useState(3500);
  const [marketPrice, setMarketPrice] = useState(20);
  const [expectedYield, setExpectedYield] = useState(1000);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/economic-threshold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop_type: cropType,
          growth_stage: growthStage,
          severity_percent: parseFloat(severityPercent),
          treatment_cost_per_acre: parseFloat(treatmentCost),
          expected_market_price_per_unit: parseFloat(marketPrice),
          expected_yield_per_acre: parseFloat(expectedYield),
        }),
      });

      if (!res.ok) throw new Error("Calculation failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      // Fallback calculation logic if backend offline
      const stageMultipliers = { seedling: 1.2, vegetative: 1.0, flowering: 1.3, fruiting: 1.4, harvest: 0.4 };
      const mult = stageMultipliers[growthStage] || 1.0;
      const yieldLossPct = Math.min(severityPercent * 0.45 * mult, 95.0);
      const expectedLossUnits = expectedYield * (yieldLossPct / 100.0);
      const expectedLossVal = expectedLossUnits * marketPrice;
      const netBenefit = expectedLossVal - treatmentCost;

      let rec = "not worth treating";
      if (expectedLossVal > treatmentCost * 1.25) rec = "treat";
      else if (expectedLossVal >= treatmentCost * 0.75) rec = "monitor";

      setResult({
        recommendation: rec,
        estimated_yield_loss_percent: Math.round(yieldLossPct * 10) / 10,
        expected_loss_value_per_acre: Math.round(expectedLossVal * 100) / 100,
        net_benefit_per_acre: Math.round(netBenefit * 100) / 100,
        rationale: `Estimated potential crop loss value (₹${Math.round(expectedLossVal)}) vs treatment cost (₹${treatmentCost}). Net benefit: ₹${Math.round(netBenefit)} per acre.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-5"
      >
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 p-2 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
            <DollarSign className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.economicTitle}</h2>
            <p className="text-xs text-gray-500">Determine cost-effective treatment feasibility before spraying.</p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.selectModel}</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="Tomato">Tomato (टमाटर)</option>
              <option value="Potato">Potato (आलू)</option>
              <option value="Grape">Grape (अंगूर)</option>
              <option value="Corn">Corn (मक्का)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.cropStageLabel}</label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="seedling">Seedling (पौधा अवस्था)</option>
              <option value="vegetative">Vegetative (वनस्पतिक वृद्धि)</option>
              <option value="flowering">Flowering (फूल आने की अवस्था)</option>
              <option value="fruiting">Fruiting / Tubering (फल/कंद बनने की अवस्था)</option>
              <option value="harvest">Near Harvest (कटाई के करीब)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Leaf Severity (%)</label>
            <input
              type="number"
              value={severityPercent}
              onChange={(e) => setSeverityPercent(e.target.value)}
              min="1"
              max="100"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.treatmentCostLabel}</label>
            <input
              type="number"
              value={treatmentCost}
              onChange={(e) => setTreatmentCost(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.marketPriceLabel}</label>
            <input
              type="number"
              step="0.1"
              value={marketPrice}
              onChange={(e) => setMarketPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t.yieldLabel}</label>
            <input
              type="number"
              value={expectedYield}
              onChange={(e) => setExpectedYield(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              <span>{t.calculateBtn}</span>
            </button>
          </div>
        </form>

        {/* Results display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border mt-4 space-y-3 ${
              result.recommendation === "treat"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : result.recommendation === "monitor"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-700">Recommendation</span>
              <span className="text-sm font-extrabold uppercase px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
                {result.recommendation === "treat"
                  ? t.recommendationTreat
                  : result.recommendation === "monitor"
                  ? t.recommendationMonitor
                  : t.recommendationSkip}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium opacity-95 text-gray-800">{result.rationale}</p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200">
              <div>Est. Yield Loss: <strong>{result.estimated_yield_loss_percent}%</strong></div>
              <div>Net Protection: <strong>₹{result.net_benefit_per_acre} / Acre</strong></div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EconomicCalculator;
