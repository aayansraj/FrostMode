import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  Snowflake,
  Flame,
  Trophy,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Quote,
  Lock
} from "lucide-react";
import { TaskCard } from "../components/TaskCard";
import { Heatmap } from "../components/Heatmap";
import { AddTaskModal } from "../components/AddTaskModal";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export const DashboardPage = () => {
  const { user, updateUser, socket } = useContext(AuthContext);
  const [arc, setArc] = useState(null);
  const [currentDayNum, setCurrentDayNum] = useState(1);
  const [todayData, setTodayData] = useState({ day: null, tasks: [] });
  const [allDays, setAllDays] = useState([]);
  const [rankInfo, setRankInfo] = useState({ myRank: 1, pointsNeededForNextRank: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const quotes = [
    "Winter is not a season, it's a test of mental iron.",
    "Small daily disciplines repeated consistently lead to legendary results.",
    "While others sleep in, the Winter King works in silence.",
    "Do what is hard now so your future self lives in victory.",
    "Strict mode is not punishment; it is the price of freedom."
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const fetchData = async () => {
    try {
      setLoading(true);
      const arcRes = await axios.get("/api/arc/current");
      if (arcRes.data.arc) {
        setArc(arcRes.data.arc);
        setCurrentDayNum(arcRes.data.currentDayNumber);

        const [dayRes, daysListRes, rankRes] = await Promise.all([
          axios.get(`/api/days/${arcRes.data.currentDayNumber}`),
          axios.get("/api/days"),
          axios.get("/api/leaderboard/my-rank")
        ]);

        setTodayData(dayRes.data);
        setAllDays(daysListRes.data.days);
        setRankInfo(rankRes.data);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on("leaderboard_update", () => {
        axios.get("/api/leaderboard/my-rank").then(res => setRankInfo(res.data)).catch(() => {});
      });
    }
    return () => {
      if (socket) socket.off("leaderboard_update");
    };
  }, [socket]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      setTodayData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => (t._id === taskId ? res.data.task : t)),
        day: res.data.day
      }));

      if (res.data.user) {
        updateUser(res.data.user);
      }

      if (res.data.arcBrokenWarning) {
        alert("⚠️ WARNING: Strict Mode Arc Broken! You missed 3 tasks today. Your streak has reset to 0!");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update task status");
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!todayData.day) return;
    try {
      const res = await axios.post("/api/tasks", {
        dayId: todayData.day._id,
        ...taskData
      });
      setTodayData(prev => ({
        ...prev,
        tasks: [...prev.tasks, res.data.task]
      }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add task");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Snowflake className="w-10 h-10 text-sky-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading FrostMode Dashboard...</p>
      </div>
    );
  }

  if (!arc) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-sky-500/20 border border-sky-400/30 mx-auto flex items-center justify-center text-sky-400">
          <Snowflake className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">No Active Arc Found</h2>
        <p className="text-slate-300 text-sm">
          You haven't initialized your Winter Arc yet. Start your protocol to unlock your routine dashboard!
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-sky-500/25"
        >
          <span>Configure Your Arc Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const daysPassedPct = Math.round((currentDayNum / arc.totalDays) * 100);

  // Prepare chart data for weekly trend
  const chartData = allDays.slice(Math.max(0, currentDayNum - 7), currentDayNum).map(d => ({
    day: `D${d.dayNumber}`,
    rate: d.completionRate || 0
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Arc Progress */}
        <div className="glass-panel p-5 rounded-3xl border border-sky-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Arc Execution</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">Day {currentDayNum}</span>
            <span className="text-xs text-slate-400 font-bold">/ {arc.totalDays} Days</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${daysPassedPct}%` }}
            />
          </div>
        </div>

        {/* Current & Best Streak */}
        <div className="glass-panel p-5 rounded-3xl border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Streak Discipline</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-orange-400">{user?.streak || 0}</span>
            <span className="text-xs text-slate-400 font-bold">Days Active</span>
          </div>
          <p className="text-[11px] text-slate-400">Personal Best: <strong className="text-slate-200">{user?.bestStreak || 0} days</strong></p>
        </div>

        {/* Wallet & Total Points */}
        <div className="glass-panel p-5 rounded-3xl border border-sky-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Points & Level</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-300">{user?.totalPoints || 0}</span>
            <span className="text-xs text-amber-300 font-bold">pts</span>
          </div>
          <p className="text-[11px] text-slate-400">Level: <strong className="text-amber-400">{user?.level || "Beginner"}</strong></p>
        </div>

        {/* Leaderboard Rank */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Leaderboard Rank</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">#{rankInfo.myRank}</span>
            <span className="text-xs text-slate-400 font-bold">of {rankInfo.totalUsers || 10}</span>
          </div>
          {rankInfo.pointsNeededForNextRank > 0 && (
            <p className="text-[11px] text-sky-400">{rankInfo.pointsNeededForNextRank} pts to next rank</p>
          )}
        </div>
      </div>

      {/* Quote of the day banner */}
      <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 bg-slate-950/60 flex items-center gap-3">
        <Quote className="w-5 h-5 text-sky-400 shrink-0" />
        <p className="text-xs sm:text-sm text-slate-300 italic">
          "{randomQuote}"
        </p>
      </div>

      {/* Today's Tasks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Today's Protocol (Day {currentDayNum})
              </h2>
              {todayData.day && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  todayData.day.status === "perfect" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                  todayData.day.status === "partial" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                  todayData.day.status === "missed" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                  "bg-slate-800 text-slate-400"
                }`}>
                  {todayData.day.status} ({todayData.day.completionRate || 0}%)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute each task with maximum discipline. Earn 1.5x points under Strict Mode.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task</span>
            </button>
            <Link
              to={`/routine?day=${currentDayNum}`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 border border-slate-700"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tasks List */}
        {todayData.tasks.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-3xl space-y-3">
            <p className="text-sm text-slate-400">No tasks scheduled for today.</p>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="px-4 py-2 text-xs font-bold text-sky-300 bg-sky-500/20 border border-sky-400/30 rounded-xl"
            >
              + Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayData.tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                isStrictMode={user?.strictMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Heatmap & Weekly Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Heatmap
            days={allDays}
            totalDays={arc.totalDays}
            onSelectDay={(num) => window.location.href = `/routine?day=${num}`}
          />
        </div>

        {/* Weekly Trend Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-sky-500/20 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Completion Trend
          </h3>
          {chartData.length > 0 ? (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#38bdf8", borderRadius: "12px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="rate" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">Complete days to see your trend</p>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleCreateTask}
      />
    </div>
  );
};
