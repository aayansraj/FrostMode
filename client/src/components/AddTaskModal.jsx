import React, { useState } from "react";
import { Plus, X, Lock, Sparkles } from "lucide-react";

export const AddTaskModal = ({ isOpen, onClose, onAdd, defaultCategory = "Productivity" }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [difficulty, setDifficulty] = useState("medium");
  const [time, setTime] = useState("08:00 AM");
  const [duration, setDuration] = useState(30);
  const [strict, setStrict] = useState(false);

  if (!isOpen) return null;

  const categories = [
    "Morning", "Fitness", "Diet & Health", "Study & Coding",
    "Skills & Career", "Mind & Mindset", "Digital Detox",
    "Productivity", "Finance & Life", "Night & Sleep"
  ];

  const difficultyPoints = { easy: 10, medium: 20, hard: 30 };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      category,
      difficulty,
      points: difficultyPoints[difficulty],
      time,
      duration: Number(duration),
      strict
    });

    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-sky-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
            <Plus className="w-5 h-5" />
            <span>Add Task to Routine</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cold shower & 20 min meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              >
                <option value="easy">Easy (10 pts)</option>
                <option value="medium">Medium (20 pts)</option>
                <option value="hard">Hard (30 pts)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Time</label>
              <input
                type="text"
                placeholder="e.g. 06:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Strict Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/30 border border-red-500/30">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-xs font-bold text-red-300">Must-Do Strict Task</p>
                <p className="text-[10px] text-slate-400">Double penalty on miss in Strict Mode</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={strict}
              onChange={(e) => setStrict(e.target.checked)}
              className="w-4 h-4 accent-red-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 hover:from-sky-400 hover:to-cyan-400 shadow-lg shadow-sky-500/25"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
