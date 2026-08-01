import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, DollarSign, Globe, Menu, X, LogIn, LogOut, User } from "lucide-react";
import { translations } from "../utils/i18n";
import { getStoredUser, logoutUser } from "../utils/auth";
import AuthModal from "./AuthModal";

const Navbar = ({ lang, setLang }) => {
  const location = useLocation();
  const t = translations[lang] || translations.en;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const toggleLanguage = () => setLang(lang === "en" ? "hi" : "en");

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const navLinks = [
    { to: "/", icon: Leaf, label: t.navHome },
    { to: "/economic", icon: DollarSign, label: t.navEconomic },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-md"
            : "bg-white border-b border-gray-100 shadow-sm"
        }`}
      >
        {/* Thin emerald accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 shadow-md flex items-center justify-center"
            >
              <Leaf className="w-6 h-6 text-white stroke-[2.5]" />
            </motion.div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
                {t.appTitle}
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-emerald-600">
                {t.appSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-emerald-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="ml-2 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition-all duration-200 active:scale-95"
              title="Toggle Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* User Auth Controls */}
            {user ? (
              <div className="ml-2 flex items-center space-x-2 pl-2 border-l border-gray-200">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-800">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[100px] truncate">{user.full_name || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="ml-2 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"
            >
              <Globe className="w-3 h-3 text-emerald-500" />
              <span>{lang === "en" ? "हिन्दी" : "En"}</span>
            </button>
            {user ? (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-16 inset-x-0 z-40 bg-white border-b border-gray-200 shadow-lg"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navLinks.map(({ to, icon: Icon, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
