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
  ShieldAlert
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
    { name: "Task Library", path: "/library", icon: BookOpen },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Wallet & Store", path: "/wallet", icon: Wallet },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-sky-500/20 px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <img
            src={theme === "light" ? "/frostmode-logo-animated-light.svg" : "/frostmode-logo-animated-dark.svg"}
            alt="FrostMode"
            className="h-10 sm:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-sky-500/15">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm shadow-sky-500/20 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : ""}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User Status Pills */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Strict Mode Badge */}
              {user.strictMode && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse shadow-md shadow-red-900/40" title="Strict Mode Active">
                  <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>STRICT</span>
                </div>
              )}

              {/* Points Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs font-bold shadow-md shadow-sky-950">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                <span>{user.totalPoints || 0} pts</span>
              </div>

              {/* User Level */}
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                <span className="text-amber-400">👑</span>
                <span>{user.level || "Beginner"}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 rounded-xl shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02]"
              >
                Start Arc
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-sky-300 transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
          </button>

          {/* Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:flex p-2 rounded-xl bg-slate-800/80 hover:bg-red-950/50 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30" : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 text-sky-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
