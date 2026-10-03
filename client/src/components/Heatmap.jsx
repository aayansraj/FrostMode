import React from "react";

export const Heatmap = ({ days = [], totalDays = 60, onSelectDay }) => {
  const dayMap = {};
  days.forEach((d) => {
    dayMap[d.dayNumber] = d;
  });

  const allDayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1);

  const getStatusColor = (d) => {
    if (!d) return "bg-slate-800/40 border-slate-800 text-slate-500";
    if (d.status === "perfect") return "bg-emerald-500/30 border-emerald-500/60 text-emerald-300 shadow-sm shadow-emerald-500/20";
    if (d.status === "partial") return "bg-amber-500/30 border-amber-500/60 text-amber-300";
    if (d.status === "missed") return "bg-rose-500/30 border-rose-500/60 text-rose-300";
    return "bg-slate-800/60 border-slate-700 text-slate-400";
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-sky-500/20 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>📅</span> Arc Execution Heatmap ({days.length}/{totalDays} Days)
        </h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Perfect</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Partial</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Missed</span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1.5 sm:gap-2">
        {allDayNumbers.map((num) => {
          const d = dayMap[num];
          const colorClass = getStatusColor(d);
          return (
            <button
              key={num}
              onClick={() => onSelectDay && onSelectDay(num)}
              className={`h-7 sm:h-9 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center font-bold text-[10px] sm:text-xs transition-all hover:scale-110 active:scale-95 ${colorClass}`}
              title={`Day ${num}${d ? `: ${d.status.toUpperCase()} (${d.completionRate}%)` : ""}`}
            >
              <span>D{num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
