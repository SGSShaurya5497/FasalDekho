import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import DiagnoseView from "./views/DiagnoseView";
import EconomicCalculator from "./components/EconomicCalculator";

function App() {
  const [lang, setLang] = useState("en");

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar lang={lang} setLang={setLang} />
        <main>
          <Routes>
            <Route path="/" element={<DiagnoseView lang={lang} />} />
            <Route path="/economic" element={<EconomicCalculator lang={lang} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
