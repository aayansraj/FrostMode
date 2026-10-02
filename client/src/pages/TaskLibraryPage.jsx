import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  BookOpen,
  Search,
  Filter,
  Lock,
  Sparkles,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar
} from "lucide-react";
import { AddTaskModal } from "../components/AddTaskModal";

export const TaskLibraryPage = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [strictOnly, setStrictOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [selectedTaskForAdd, setSelectedTaskForAdd] = useState(null);
  const [targetType, setTargetType] = useState("today");
  const [targetDayNum, setTargetDayNum] = useState(1);
  const [adding, setAdding] = useState(false);

  // Custom task creation state
  const [isCustomTaskOpen, setIsCustomTaskOpen] = useState(false);

  const categories = [
    "All", "Morning", "Fitness", "Diet & Health", "Study & Coding",
    "Skills & Career", "Mind & Mindset", "Digital Detox",
    "Productivity", "Finance & Life", "Night & Sleep"
  ];

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/library", {
        params: {
          search,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          strictOnly,
          page,
          limit: 20
        }
      });
      setTasks(res.data.tasks);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Fetch library error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [search, selectedCategory, selectedDifficulty, strictOnly, page]);

  const handleAddToDay = async () => {
    if (!selectedTaskForAdd) return;
    setAdding(true);
    try {
      const res = await axios.post("/api/library/add-to-day", {
        libraryTaskId: selectedTaskForAdd._id,
        targetType,
        targetDayNumber: targetDayNum
      });
      alert(res.data.message);
      setSelectedTaskForAdd(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const handleCreateCustomTask = async (taskData) => {
    try {
      await axios.post("/api/library/custom", taskData);
      alert("Custom task created!");
      fetchLibrary();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create custom task");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Master Task Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            1,000 Winter Arc Tasks
          </h1>
          <p className="text-xs text-slate-300">
            Explore 1,000 pre-built routine tasks across 10 discipline categories. Add them to your daily schedule in one click.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsCustomTaskOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:from-sky-300 hover:to-cyan-300 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Library Task</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title (e.g. Wake up, Cold shower)..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Categories (1000 tasks)" : c}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-400"
            >
              <option value="All">All Difficulties</option>
              <option value="easy">Easy (10 pts)</option>
              <option value="medium">Medium (20 pts)</option>
              <option value="hard">Hard (30+ pts)</option>
            </select>
          </div>
        </div>

        {/* Strict Checkbox & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={strictOnly}
              onChange={(e) => { setStrictOnly(e.target.checked); setPage(1); }}
              className="w-4 h-4 accent-red-500 rounded"
            />
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              Strict tasks only (Must-Do)
            </span>
          </label>

          <span className="text-slate-400 font-mono">
            Showing {tasks.length} of {total} total tasks
          </span>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Searching task library...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl text-slate-400 text-sm">
          No tasks found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="glass-panel p-4 rounded-2xl border border-sky-500/20 hover:border-sky-400/40 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-950/80 border border-sky-500/30 text-sky-300">
                    {task.category}
                  </span>
                  {task.strict && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-950 border border-red-500 text-red-400">
                      <Lock className="w-3 h-3 text-red-400" /> STRICT
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-100 line-clamp-2">
                  {task.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+{task.points} pts</span>
                  <span className="text-[10px] text-slate-500 font-normal uppercase">({task.difficulty})</span>
                </div>

                {user && (
                  <button
                    onClick={() => setSelectedTaskForAdd(task)}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 hover:bg-sky-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Routine</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Add Task Modal for target choice */}
      {selectedTaskForAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-sky-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Add Task to Routine</h3>
            <p className="text-xs text-sky-300 font-semibold">{selectedTaskForAdd.title}</p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Target Destination</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTargetType("today")}
                  className={`py-2 rounded-xl border text-xs font-bold ${
                    targetType === "today" ? "bg-sky-500/20 border-sky-400 text-sky-300" : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTargetType("specific")}
                  className={`py-2 rounded-xl border text-xs font-bold ${
                    targetType === "specific" ? "bg-sky-500/20 border-sky-400 text-sky-300" : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  Day X
                </button>
                <button
                  onClick={() => setTargetType("all")}
                  className={`py-2 rounded-xl border text-xs font-bold ${
                    targetType === "all" ? "bg-sky-500/20 border-sky-400 text-sky-300" : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  All Days
                </button>
              </div>

              {targetType === "specific" && (
                <input
                  type="number"
                  min="1"
                  placeholder="Enter day number (e.g. 5)"
                  value={targetDayNum}
                  onChange={(e) => setTargetDayNum(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-400 mt-2"
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedTaskForAdd(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToDay}
                disabled={adding}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400"
              >
                {adding ? "Adding..." : "Confirm Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Task Creation Modal */}
      <AddTaskModal
        isOpen={isCustomTaskOpen}
        onClose={() => setIsCustomTaskOpen(false)}
        onAdd={handleCreateCustomTask}
      />
    </div>
  );
};
