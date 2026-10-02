import React from "react";
import { Trophy, Flame, Shield, Award } from "lucide-react";

export const Podium = ({ podium = [] }) => {
  if (!podium || podium.length === 0) return null;

  const first = podium[0];
  const second = podium[1];
  const third = podium[2];

  const renderCard = (user, rank, heightClass, bgGradient, borderGlow) => {
    if (!user) return <div className={`flex-1 ${heightClass}`} />;

    const rankEmotes = { 1: "🥇", 2: "🥈", 3: "🥉" };

    return (
      <div className={`flex-1 flex flex-col items-center justify-end ${heightClass} transition-transform hover:-translate-y-1 duration-300`}>
        {/* Avatar & Rank badge */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${bgGradient} p-1 flex items-center justify-center shadow-xl ${borderGlow}`}>
            <div className="w-full h-full bg-slate-900/90 rounded-xl flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl">
                {user.avatar === "wolf" ? "🐺" : user.avatar === "bear" ? "🐻" : user.avatar === "crown" ? "👑" : user.avatar === "fire" ? "🔥" : user.avatar === "ice" ? "🧊" : "❄️"}
              </span>
            </div>
          </div>
          <div className="absolute -top-3 -right-2 text-2xl drop-shadow-md">
            {rankEmotes[rank]}
          </div>
        </div>

        {/* User Stats Box */}
        <div className={`w-full ${bgGradient} p-4 rounded-2xl border border-sky-500/30 text-center shadow-2xl flex flex-col items-center justify-center gap-1.5`}>
          <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-[120px] sm:max-w-[160px]">
            {user.displayName}
          </h3>
          <div className="flex items-center gap-1 text-sky-300 text-xs sm:text-sm font-bold bg-slate-900/60 px-3 py-1 rounded-full border border-sky-400/20">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.totalPoints || user.periodPoints || 0} pts</span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-amber-300 font-medium">{user.level || "Beginner"}</span>
            {user.streak > 0 && (
              <span className="flex items-center gap-0.5 text-orange-400 font-bold">
                <Flame className="w-3 h-3 fill-orange-400" />
                {user.streak}d
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 my-8 max-w-2xl mx-auto px-2">
      {/* 2nd Place */}
      {renderCard(second, 2, "h-64 sm:h-72", "bg-gradient-to-b from-slate-700/60 to-slate-900/80", "shadow-slate-500/20")}
      {/* 1st Place */}
      {renderCard(first, 1, "h-72 sm:h-84", "bg-gradient-to-b from-sky-500/30 via-cyan-600/20 to-slate-900/90", "shadow-sky-500/50 animate-ice-pulse")}
      {/* 3rd Place */}
      {renderCard(third, 3, "h-56 sm:h-64", "bg-gradient-to-b from-amber-900/30 to-slate-900/80", "shadow-amber-700/20")}
    </div>
  );
};
