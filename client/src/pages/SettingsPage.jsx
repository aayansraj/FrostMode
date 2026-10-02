import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Settings, Shield, User, Flame, Download, RefreshCw, Save, Lock } from "lucide-react";
import { ConfirmModal } from "../components/ConfirmModal";

export const SettingsPage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "snowflake");
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user?.showOnLeaderboard ?? true);
  const [strictMode, setStrictMode] = useState(user?.strictMode ?? false);
  const [saving, setSaving] = useState(false);

  // Confirm modal state
  const [isDisableStrictModalOpen, setIsDisableStrictModalOpen] = useState(false);
  const [isResetArcModalOpen, setIsResetArcModalOpen] = useState(false);

  const avatars = [
    { id: "snowflake", icon: "❄️", label: "Snowflake" },
    { id: "wolf", icon: "🐺", label: "Lone Wolf" },
    { id: "bear", icon: "🐻", label: "Grizzly" },
    { id: "crown", icon: "👑", label: "King" },
    { id: "fire", icon: "🔥", label: "Fire Arc" },
    { id: "ice", icon: "🧊", label: "Ice Cube" }
  ];

  const handleSaveSettings = async (overridingStrictMode) => {
    setSaving(true);
    try {
      const modeToSave = overridingStrictMode !== undefined ? overridingStrictMode : strictMode;
      const res = await axios.post("/api/settings", {
        displayName,
        avatar,
        showOnLeaderboard,
        strictMode: modeToSave
      });

      updateUser(res.data.user);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleStrictModeToggle = () => {
    if (strictMode) {
      // Turning off -> confirm 100 pt penalty!
      setIsDisableStrictModalOpen(true);
    } else {
      // Turning ON -> save directly
      setStrictMode(true);
      handleSaveSettings(true);
    }
  };

  const handleResetArc = async () => {
    try {
      await axios.post("/api/arc/reset");
      alert("Arc reset successfully. You can now configure a fresh Winter Arc!");
      window.location.href = "/onboarding";
    } catch (err) {
      alert("Failed to reset Arc.");
    }
  };

  const handleExportCSV = () => {
    window.open("/api/settings/export", "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold">
          <Settings className="w-4 h-4 text-sky-400" />
          <span>Account Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Settings & Privacy
        </h1>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/30 space-y-8 shadow-2xl">
        {/* Profile Settings */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" /> Leaderboard Profile
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Avatar Icon</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {avatars.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.id)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    avatar === av.id
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <span className="text-2xl">{av.icon}</span>
                  <span className="text-[10px] font-semibold">{av.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" /> Leaderboard Privacy
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <p className="text-sm font-bold text-slate-200">Show Name on Leaderboard</p>
              <p className="text-xs text-slate-400">
                If disabled, you will appear as "Anonymous" on the public standings.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showOnLeaderboard}
              onChange={(e) => setShowOnLeaderboard(e.target.checked)}
              className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Strict Mode Controls */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" /> Discipline Strict Mode
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-950/30 border border-red-500/30">
            <div>
              <p className="text-sm font-bold text-red-300 flex items-center gap-2">
                <span>Strict Mode</span>
                {strictMode ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-slate-950 font-bold">ACTIVE (1.5x Multiplier)</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold">OFF</span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Enforces locked past days, double penalties for strict tasks, and 1.5x points multiplier. Turning off incurs a 100 pt penalty.
              </p>
            </div>

            <button
              onClick={handleStrictModeToggle}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                strictMode
                  ? "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/40"
                  : "bg-sky-500 text-slate-950 hover:bg-sky-400"
              }`}
            >
              {strictMode ? "Disable Strict Mode" : "Enable Strict Mode"}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={() => handleSaveSettings()}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-sky-500/25 hover:from-sky-300 hover:to-cyan-300 flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Account Settings"}</span>
          </button>
        </div>

        {/* Danger Zone / Data Management */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-base font-bold text-red-400 uppercase tracking-wider">
            Data Management & Danger Zone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportCSV}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-left space-y-1 transition-all"
            >
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Download className="w-4 h-4" />
                <span>Export Routine Data (CSV)</span>
              </div>
              <p className="text-xs text-slate-400">
                Download your full task history, daily execution rates, and points log as a CSV file.
              </p>
            </button>

            <button
              onClick={() => setIsResetArcModalOpen(true)}
              className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 hover:border-red-400 text-left space-y-1 transition-all"
            >
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Reset / Restart Arc</span>
              </div>
              <p className="text-xs text-slate-400">
                Clear current Arc data and days to start fresh from Day 1.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Disable Strict Mode Warning Modal */}
      <ConfirmModal
        isOpen={isDisableStrictModalOpen}
        onClose={() => setIsDisableStrictModalOpen(false)}
        onConfirm={() => {
          setStrictMode(false);
          handleSaveSettings(false);
        }}
        title="Warning: Strict Mode Penalty"
        message="Disabling Strict Mode will deduct 100 points from your total points and wallet balance! Are you sure you want to disable Strict Mode?"
        confirmText="Deduct 100 Pts & Disable"
        isDanger={true}
      />

      {/* Reset Arc Warning Modal */}
      <ConfirmModal
        isOpen={isResetArcModalOpen}
        onClose={() => setIsResetArcModalOpen(false)}
        onConfirm={handleResetArc}
        title="Confirm Reset Arc"
        message="Are you sure you want to reset your Winter Arc? This will clear all your active daily tasks and reset your streak. This action cannot be undone."
        confirmText="Reset Arc"
        isDanger={true}
      />
    </div>
  );
};
