import React from "react";
import { Trophy, Flame } from "lucide-react";

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
        <div className="relative mb-2 sm:mb-3 flex flex-col items-center">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl ${bgGradient} p-0.5 sm:p-1 flex items-center justify-center shadow-xl ${borderGlow}`}>
            <div className="w-full h-full bg-slate-900/90 rounded-lg sm:rounded-xl flex flex-col items-center justify-center">
              <span className="text-xl sm:text-2xl md:text-3xl">
                {user.avatar === "wolf" ? "🐺" : user.avatar === "bear" ? "🐻" : user.avatar === "crown" ? "👑" : user.avatar === "fire" ? "🔥" : user.avatar === "ice" ? "🧊" : "❄️"}
              </span>
            </div>
          </div>
          <div className="absolute -top-2.5 -right-1.5 sm:-top-3 sm:-right-2 text-lg sm:text-2xl drop-shadow-md">
            {rankEmotes[rank]}
          </div>
        </div>

        {/* User Stats Box */}
        <div className={`w-full ${bgGradient} p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-sky-500/30 text-center shadow-2xl flex flex-col items-center justify-center gap-1`}>
          <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-white truncate max-w-[70px] sm:max-w-[120px] md:max-w-[160px]">
            {user.displayName}
          </h3>
          <div className="flex items-center gap-1 text-sky-300 text-[10px] sm:text-xs md:text-sm font-bold bg-slate-900/60 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-sky-400/20">
            <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span>{user.totalPoints || user.periodPoints || 0} <span className="hidden sm:inline">pts</span></span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 mt-0.5 text-[9px] sm:text-[11px] text-slate-300">
            <span className="bg-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded text-amber-300 font-medium truncate max-w-[60px] sm:max-w-none">{user.level || "Beginner"}</span>
            {user.streak > 0 && (
              <span className="hidden sm:flex items-center gap-0.5 text-orange-400 font-bold">
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
    <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 my-4 sm:my-8 max-w-2xl mx-auto px-1 sm:px-2">
      {/* 2nd Place */}
      {renderCard(second, 2, "h-52 sm:h-64 md:h-72", "bg-gradient-to-b from-slate-700/60 to-slate-900/80", "shadow-slate-500/20")}
      {/* 1st Place */}
      {renderCard(first, 1, "h-60 sm:h-72 md:h-84", "bg-gradient-to-b from-sky-500/30 via-cyan-600/20 to-slate-900/90", "shadow-sky-500/50 animate-ice-pulse")}
      {/* 3rd Place */}
      {renderCard(third, 3, "h-44 sm:h-56 md:h-64", "bg-gradient-to-b from-amber-900/30 to-slate-900/80", "shadow-amber-700/20")}
    </div>
  );
};
