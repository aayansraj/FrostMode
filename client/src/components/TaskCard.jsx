import React from "react";
import { Check, X, Clock, Lock, Sparkles, AlertTriangle, Trash2, Edit2 } from "lucide-react";

export const TaskCard = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isStrictMode = false,
  isLocked = false
}) => {
  const difficultyColors = {
    easy: "bg-emerald-950/80 border-emerald-500/40 text-emerald-400",
    medium: "bg-amber-950/80 border-amber-500/40 text-amber-400",
    hard: "bg-rose-950/80 border-rose-500/40 text-rose-400"
  };

  const statusCardStyles = {
    followed: "bg-emerald-950/30 border-emerald-500/40 shadow-emerald-950/20",
    not_followed: "bg-rose-950/30 border-rose-500/40 shadow-rose-950/20",
    pending: "bg-slate-900/70 border-sky-500/20"
  };

  return (
    <div
      className={`glass-panel p-4 rounded-2xl border transition-all duration-200 ${
        statusCardStyles[task.status] || statusCardStyles.pending
      } hover:border-sky-400/40`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category tag */}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-950/80 border border-sky-500/30 text-sky-300">
              {task.category || "General"}
            </span>

            {/* Time Slot */}
            <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
              <Clock className="w-3 h-3 text-sky-400" />
              {task.time || "08:00 AM"} ({task.duration || 30}m)
            </span>

            {/* Difficulty Badge */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${difficultyColors[task.difficulty] || difficultyColors.medium}`}>
              {task.difficulty || "medium"}
            </span>

            {/* Strict Task Badge */}
            {task.strict && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-950 border border-red-500 text-red-400" title="Must-Do Strict Task (Double Penalty on Miss!)">
                <Lock className="w-3 h-3 text-red-400" />
                STRICT
              </span>
            )}
          </div>

          <h4 className={`text-base font-bold transition-all ${task.status === "followed" ? "line-through text-slate-400" : "text-slate-100"}`}>
            {task.title}
          </h4>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:self-center pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/80">
          {/* Points Pill */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-950 border border-sky-500/30 text-sky-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {task.status === "followed"
                ? `+${task.pointsEarned}`
                : task.status === "not_followed"
                ? `${task.pointsEarned}`
                : `+${isStrictMode ? Math.round(task.points * 1.5) : task.points} pts`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Status Buttons */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {/* Followed (Completed) */}
              <button
                onClick={() => onStatusChange(task._id, "followed")}
                disabled={isLocked && task.status !== "pending"}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  task.status === "followed"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                    : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40"
                } ${isLocked && task.status !== "pending" ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Mark as Followed"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Followed</span>
              </button>

              {/* Not Followed (Skipped) */}
              <button
                onClick={() => onStatusChange(task._id, "not_followed")}
                disabled={isLocked && task.status !== "pending"}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  task.status === "not_followed"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                    : "text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                } ${isLocked && task.status !== "pending" ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Mark as Missed"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Missed</span>
              </button>
            </div>

            {/* Edit / Delete (Disabled in Strict Mode) */}
            {!isLocked && (onEdit || onDelete) && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    onClick={() => onEdit(task)}
                    className="p-1.5 text-slate-400 hover:text-sky-300 rounded-lg hover:bg-slate-800"
                    title="Edit Task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(task._id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-950/40"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
