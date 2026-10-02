import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Save,
  Lock
} from "lucide-react";
import { TaskCard } from "../components/TaskCard";
import { AddTaskModal } from "../components/AddTaskModal";

export const RoutinePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDay = parseInt(searchParams.get("day") || "1", 10);

  const [currentDayNumber, setCurrentDayNumber] = useState(initialDay);
  const [dayObj, setDayObj] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allDays, setAllDays] = useState([]);
  const [arc, setArc] = useState(null);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyTargetDays, setCopyTargetDays] = useState("");

  const fetchArcAndDays = async () => {
    try {
      const arcRes = await axios.get("/api/arc/current");
      if (arcRes.data.arc) {
        setArc(arcRes.data.arc);
        const daysRes = await axios.get("/api/days");
        setAllDays(daysRes.data.days);
      }
    } catch (err) {
      console.error("Fetch arc error:", err);
    }
  };

  const fetchDayDetails = async (dayNum) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/days/${dayNum}`);
      setDayObj(res.data.day);
      setTasks(res.data.tasks || []);
      setNote(res.data.day?.note || "");
    } catch (err) {
      console.error("Fetch day error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArcAndDays();
  }, []);

  useEffect(() => {
    fetchDayDetails(currentDayNumber);
    setSearchParams({ day: currentDayNumber.toString() });
  }, [currentDayNumber]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => (t._id === taskId ? res.data.task : t)));
      setDayObj(res.data.day);
      if (res.data.user) updateUser(res.data.user);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update task");
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      const res = await axios.put(`/api/days/${currentDayNumber}/note`, { note });
      setDayObj(res.data.day);
      alert("Daily reflection saved!");
    } catch (err) {
      alert("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!dayObj) return;
    try {
      const res = await axios.post("/api/tasks", {
        dayId: dayObj._id,
        ...taskData
      });
      setTasks(prev => [...prev, res.data.task]);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add task");
    }
  };

  const handleCopyRoutine = async () => {
    if (!copyTargetDays) return;
    try {
      let targets = [];
      if (copyTargetDays === "remaining") {
        targets = allDays.filter(d => d.dayNumber > currentDayNumber).map(d => d.dayNumber);
      } else if (copyTargetDays === "all") {
        targets = allDays.map(d => d.dayNumber);
      } else {
        targets = copyTargetDays.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      }

      const res = await axios.post("/api/days/copy-routine", {
        sourceDayNumber: currentDayNumber,
        targetDayNumbers: targets
      });

      alert(res.data.message);
      setIsCopyModalOpen(false);
      fetchArcAndDays();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to copy routine");
    }
  };

  if (!arc) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-400 text-sm">Please start an Arc first to manage your day-by-day routine.</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const isPastLocked = user?.strictMode && dayObj && dayObj.date <= todayStr;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Day Selector Header */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDayNumber(prev => Math.max(1, prev - 1))}
            disabled={currentDayNumber <= 1}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center md:text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Day {currentDayNumber} Routine</h1>
              {dayObj && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  dayObj.status === "perfect" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                  dayObj.status === "partial" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                  dayObj.status === "missed" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                  "bg-slate-800 text-slate-400"
                }`}>
                  {dayObj.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{dayObj?.date || ""}</p>
          </div>

          <button
            onClick={() => setCurrentDayNumber(prev => Math.min(arc.totalDays, prev + 1))}
            disabled={currentDayNumber >= arc.totalDays}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddTaskOpen(true)}
            disabled={isPastLocked}
            className={`px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-colors ${
              isPastLocked ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setIsCopyModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Routine</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {dayObj && (
        <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Day Completion Execution</span>
              <span>{dayObj.completionRate || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${dayObj.completionRate || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Day Tasks List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading day routine...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-3xl space-y-3">
          <p className="text-slate-400 text-sm">No tasks added to Day {currentDayNumber} yet.</p>
          <button
            onClick={() => setIsAddTaskOpen(true)}
            disabled={isPastLocked}
            className="px-4 py-2 text-xs font-bold text-sky-300 bg-sky-500/20 border border-sky-400/30 rounded-xl"
          >
            + Add First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              isStrictMode={user?.strictMode}
              isLocked={isPastLocked}
            />
          ))}
        </div>
      )}

      {/* Reflection Journal Section */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" /> Daily Reflection & Notes (Day {currentDayNumber})
        </h3>
        <textarea
          rows={3}
          placeholder="Reflect on today's discipline, mental state, setbacks, and victories..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveNote}
            disabled={savingNote}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{savingNote ? "Saving..." : "Save Reflection"}</span>
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleCreateTask}
      />

      {/* Copy Routine Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-sky-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Copy Routine to Other Days</h3>
            <p className="text-xs text-slate-300">
              Copy all tasks from Day {currentDayNumber} to other days in your Arc.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setCopyTargetDays("remaining")}
                className={`w-full p-3 rounded-xl border text-left text-xs font-bold ${
                  copyTargetDays === "remaining" ? "bg-sky-500/20 border-sky-400 text-sky-300" : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                Copy to All Remaining Days (Days {currentDayNumber + 1} to {arc.totalDays})
              </button>
              <button
                onClick={() => setCopyTargetDays("all")}
                className={`w-full p-3 rounded-xl border text-left text-xs font-bold ${
                  copyTargetDays === "all" ? "bg-sky-500/20 border-sky-400 text-sky-300" : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                Copy to ALL Days in Arc (Days 1 to {arc.totalDays})
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyRoutine}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400"
              >
                Confirm Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
