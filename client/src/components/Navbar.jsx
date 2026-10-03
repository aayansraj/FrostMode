import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  Snowflake,
  Flame,
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  Trophy,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  Crown
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Routine", path: "/routine", icon: CalendarCheck },
    { name: "Task Library", shortName: "Library", path: "/library", icon: BookOpen },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Wallet & Store", shortName: "Store", path: "/wallet", icon: Wallet },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-sky-500/15 px-3 sm:px-6 lg:px-8 py-2.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <img
            src={theme === "light" ? "/frostmode-logo-animated-light.svg" : "/frostmode-logo-animated-dark.svg"}
            alt="FrostMode"
            className="h-8 sm:h-10 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]"
          />
        </Link>

        {/* Desktop Navigation Links (XL screens) */}
        {user && (
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-sky-500/20 shadow-inner shadow-sky-950/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500/25 to-cyan-500/20 text-sky-300 border border-sky-400/40 shadow-sm shadow-sky-500/30 font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{item.shortName || item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Medium Screen Compact Nav (Icons + Tooltips) */}
        {user && (
          <nav className="hidden md:flex xl:hidden items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-sky-500/20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-sky-500/25 text-sky-300 border border-sky-400/40 shadow-sm shadow-sky-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section: User Metrics & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 p-1 sm:p-1.5 rounded-2xl border border-slate-800">
              {/* Strict Mode Indicator */}
              {user.strictMode && (
                <div
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-black animate-pulse"
                  title="Strict Mode Active (+50% Bonus / Penalty)"
                >
                  <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>STRICT</span>
                </div>
              )}

              {/* Points Badge */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-extrabold shadow-sm shadow-sky-950">
                <Snowflake className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
                <span>{user.totalPoints || 0} <span className="text-[10px] sm:text-xs">pts</span></span>
              </div>

              {/* Rank Level */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.level || "Beginner"}</span>
              </div>

              {/* User Avatar / Name */}
              <div className="hidden sm:flex items-center gap-1.5 pl-1.5 pr-2 border-l border-slate-800 text-xs text-slate-300 font-medium">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-[10px]">
                  {(user.displayName || user.name || "W")[0].toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate">{user.displayName || user.name}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/auth"
                className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="px-3.5 sm:px-4.5 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 rounded-xl shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02]"
              >
                Start Arc
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-sky-300 transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Logout Button (Desktop/Tablet) */}
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:flex p-2 rounded-xl bg-slate-900/90 hover:bg-red-950/50 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 active:scale-95 transition-transform"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {user && mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800/80 space-y-3 animate-slide-down">
          {/* User Profile Mini Banner on Mobile */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-sky-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-extrabold text-sm">
                {(user.displayName || user.name || "W")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-white max-w-[140px] truncate">
                  {user.displayName || user.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="text-amber-400 font-semibold">{user.level || "Beginner"}</span>
                  {user.streak > 0 && <span className="text-orange-400 font-bold">• 🔥 {user.streak}d</span>}
                </div>
              </div>
            </div>

            {user.strictMode && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-black">
                <Flame className="w-3 h-3 fill-red-500" /> STRICT
              </span>
            )}
          </div>

          {/* Navigation items grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500/25 to-cyan-500/20 text-sky-300 border border-sky-400/40 shadow-sm font-bold"
                      : "bg-slate-900/70 text-slate-300 border border-slate-800/80 hover:bg-slate-800 active:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Sign out button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-950/70 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

