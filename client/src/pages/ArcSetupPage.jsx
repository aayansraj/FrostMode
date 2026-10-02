import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snowflake, Flame, Calendar, Check, ShieldAlert, ArrowRight } from "lucide-react";

export const ArcSetupPage = () => {
  const [totalDays, setTotalDays] = useState(60);
  const [customDays, setCustomDays] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [strictMode, setStrictMode] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([
    "Morning", "Fitness", "Study & Coding", "Mind & Mindset", "Night & Sleep"
  ]);
  const [goals, setGoals] = useState([
    "Wake up by 5:00 AM daily",
    "Complete 60-day Winter Arc",
    "Reach Legend Discipline Rank"
  ]);
  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const categoriesList = [
    "Morning", "Fitness", "Diet & Health", "Study & Coding",
    "Skills & Career", "Mind & Mindset", "Digital Detox",
    "Productivity", "Finance & Life", "Night & Sleep"
  ];

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const addGoal = () => {
    if (goalInput.trim() && !goals.includes(goalInput.trim())) {
      setGoals([...goals, goalInput.trim()]);
      setGoalInput("");
    }
  };

  const removeGoal = (idx) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  const handleStartArc = async () => {
    setLoading(true);
    try {
      const daysCount = totalDays === "custom" ? Number(customDays) || 30 : Number(totalDays);
      await axios.post("/api/arc/create", {
        totalDays: daysCount,
        startDate,
        strictMode,
        categories: selectedCategories,
        goals
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Start Arc error:", err);
      alert("Failed to start Arc. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 mx-auto flex items-center justify-center shadow-xl shadow-sky-500/30">
          <Snowflake className="w-8 h-8 text-slate-950 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Configure Your Winter Arc</h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Design your custom protocol. Select your challenge length, strictness level, and target discipline categories.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/30 shadow-2xl space-y-6">
        {/* Step 1: Arc Length */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Select Arc Length
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[30, 60, 90, "custom"].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setTotalDays(days)}
                className={`py-3.5 px-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                  totalDays === days
                    ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20"
                    : "bg-slate-900/70 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {days === "custom" ? "Custom" : `${days} Days`}
              </button>
            ))}
          </div>

          {totalDays === "custom" && (
            <input
              type="number"
              min="7"
              max="365"
              placeholder="Enter number of days (e.g. 45)"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 mt-2"
            />
          )}
        </div>

        {/* Step 2: Start Date */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Start Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Step 3: Strict Mode Toggle */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">
            3. Discipline Mode
          </label>
          <div
            onClick={() => setStrictMode(!strictMode)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              strictMode
                ? "bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20"
                : "bg-slate-900/60 border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${strictMode ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"}`}>
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                    <span>Strict Mode Lock-In</span>
                    {strictMode && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500 text-slate-950 font-bold">RECOMMENDED</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    1.5x Bonus Points • Locked Past Days • 3 Missed Tasks = Arc Broken
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={strictMode}
                onChange={() => {}}
                className="w-5 h-5 accent-red-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Categories */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">
            4. Routine Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categoriesList.map((cat) => {
              const isSel = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSel
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isSel && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 5: Goals */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-200 uppercase tracking-wider">
            5. Arc Goals
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Read 20 pages every night"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGoal())}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
            <button
              type="button"
              onClick={addGoal}
              className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400"
            >
              Add Goal
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {goals.map((g, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                <span>🎯 {g}</span>
                <button onClick={() => removeGoal(idx)} className="text-slate-500 hover:text-red-400 font-bold">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleStartArc}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-extrabold text-base shadow-xl shadow-sky-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
        >
          {loading ? (
            <span>Generating Arc Routine...</span>
          ) : (
            <>
              <span>Lock In & Launch Arc</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
