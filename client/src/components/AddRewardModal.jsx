import React, { useState } from "react";
import { Gift, X, Sparkles } from "lucide-react";

export const AddRewardModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(200);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || Number(cost) <= 0) return;

    onAdd({
      title: title.trim(),
      cost: Number(cost)
    });

    setTitle("");
    setCost(200);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-sky-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <Gift className="w-5 h-5" />
            <span>Create Custom Reward</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reward Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Watch a movie / Cheat meal / Buy a game"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cost (Wallet Points) *</label>
            <input
              type="number"
              min="10"
              step="10"
              required
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Redeeming uses your wallet points, but does NOT lower your leaderboard total points!
            </p>
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
              className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/25"
            >
              Create Reward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
