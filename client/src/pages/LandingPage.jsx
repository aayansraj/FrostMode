import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Snowflake, Flame, Trophy, Shield, Zap, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Podium } from "../components/Podium";

export const LandingPage = () => {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await axios.get("/api/leaderboard?limit=3");
        setTopUsers(res.data.podium || []);
      } catch (err) {
        console.error("Fetch top error:", err);
      }
    };
    fetchTop();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-300 text-xs font-bold shadow-lg shadow-sky-500/10 backdrop-blur-md animate-bounce">
            <Snowflake className="w-4 h-4 text-sky-400" />
            <span>Winter Arc Routine Tracker • 1000 Task Library</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-sans leading-tight">
            FrostMode – <br className="hidden sm:inline" />
            <span className="text-ice-gradient">Lock In. Level Up.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The ultimate Winter Arc execution platform. Plan your day, conquer 1,000+ discipline tasks, enforce Strict Mode, earn reward points, and compete on the global real-time leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-300 hover:from-sky-300 hover:to-cyan-200 rounded-2xl shadow-xl shadow-sky-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-105"
            >
              <span>Start Your Arc</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/library"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-sky-500/30 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore 1,000 Tasks</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Top 3 Leaderboard Preview */}
      {topUsers.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Trophy className="w-4 h-4" /> Live Leaderboard Leaders
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Top Disciplined Champions
            </h2>
          </div>
          <Podium podium={topUsers} />
        </section>
      )}

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Extreme Winter Arc Discipline
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to eliminate excuses, track habits, and achieve peak physical and mental performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 space-y-3 hover:border-sky-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Snowflake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">1,000 Master Task Library</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              10 categories ranging from Morning 4:30 AM wakeups to Fitness, Study, Mindset, and Digital Detox. Add tasks to any day in 1-click.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-red-500/20 space-y-3 hover:border-red-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-400">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Strict Mode Lock-In</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No changing past days. Missed tasks give point penalties. Missing 3 tasks in a day breaks your arc streak. 1.5x bonus points for execution.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 space-y-3 hover:border-amber-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Points & Rewards Store</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn points on task completion. Rank up from Beginner to Winter King. Spend wallet points on your custom rewards without dropping rank.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-sky-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950/60 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-ice-gradient">
              Ready to Lock In?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
              Your Winter Arc begins now. Choose your 30, 60, or 90 day challenge and dominate every single day.
            </p>
          </div>

          <Link
            to="/auth"
            className="inline-flex items-center gap-3 px-8 py-4 text-base font-extrabold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 rounded-2xl shadow-lg shadow-sky-500/30 transition-transform transform hover:scale-105"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
