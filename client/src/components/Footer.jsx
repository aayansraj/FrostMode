import React from "react";
import { Snowflake, Shield, Zap, Award } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-sky-500/10 bg-slate-950/80 text-slate-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold text-ice-gradient">FrostMode</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The ultimate Winter Arc daily routine tracker. Lock in, execute with iron discipline, earn rewards, and conquer the leaderboard.
          </p>
          <div className="text-xs text-sky-400 font-semibold uppercase tracking-widest">
            "Lock In. Level Up."
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">Core Features</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="hover:text-sky-300">1000 Pre-built Task Library</li>
            <li className="hover:text-sky-300">Strict Mode Lock-In & Penalties</li>
            <li className="hover:text-sky-300">Real-Time Points Leaderboard</li>
            <li className="hover:text-sky-300">Custom Rewards Store</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">Discipline Levels</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>❄️ Beginner (0+ pts)</li>
            <li>⚔️ Warrior (500+ pts)</li>
            <li>🦁 Beast (1500+ pts)</li>
            <li>👑 Legend (3000+ pts)</li>
            <li>🧊⚡ Winter King (5000+ pts)</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider mb-3">System Info</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <p className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-sky-400" /> PWA Ready App</p>
            <p className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Socket.io Realtime Sync</p>
            <p className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> 1.5x Strict Mode Multiplier</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>© 2026 FrostMode. All rights reserved.</p>
        <p className="text-sky-400/70 font-mono">FrostMode v1.0.0 • Lock In. Level Up.</p>
      </div>
    </footer>
  );
};
