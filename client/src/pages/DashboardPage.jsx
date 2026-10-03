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
      if (arcRes && arcRes.data && arcRes.data.arc) {
        setArc(arcRes.data.arc);
        setCurrentDayNum(arcRes.data.currentDayNumber || 1);

        const [dayRes, daysListRes, rankRes] = await Promise.all([
          axios.get(`/api/days/${arcRes.data.currentDayNumber || 1}`).catch(() => null),
          axios.get("/api/days").catch(() => null),
          axios.get("/api/leaderboard/my-rank").catch(() => null)
        ]);

        if (dayRes?.data) setTodayData(dayRes.data);
        if (daysListRes?.data?.days) setAllDays(daysListRes.data.days);
        if (rankRes?.data) setRankInfo(rankRes.data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend dashboard fetch notice, loading local fallback data:", err.message);
    }

    // Client-side Netlify Fallback
    const localArcStr = localStorage.getItem("frostmode_arc");
    const localDaysStr = localStorage.getItem("frostmode_days");
    let currentArc = localArcStr ? JSON.parse(localArcStr) : null;

    if (!currentArc) {
      // Default initial Arc for instant dashboard access
      currentArc = {
        _id: "arc_default",
        totalDays: 60,
        startDate: new Date().toISOString().split("T")[0],
        strictMode: false,
        categories: ["Morning", "Fitness", "Study & Coding", "Mind & Mindset"],
        status: "active"
      };
      localStorage.setItem("frostmode_arc", JSON.stringify(currentArc));
    }

    let currentDays = localDaysStr ? JSON.parse(localDaysStr) : [];
    if (currentDays.length === 0) {
      currentDays = Array.from({ length: currentArc.totalDays }, (_, i) => ({
        _id: `day_${i + 1}`,
        dayNumber: i + 1,
        date: new Date(new Date().getTime() + i * 86400000).toISOString().split("T")[0],
        status: "pending",
        completionRate: 0,
        note: ""
      }));
      localStorage.setItem("frostmode_days", JSON.stringify(currentDays));
    }

    setArc(currentArc);
    setAllDays(currentDays);
    const todayNum = 1;
    setCurrentDayNum(todayNum);

    const localTasksStr = localStorage.getItem(`frostmode_tasks_day_${todayNum}`);
    let tasksList = localTasksStr ? JSON.parse(localTasksStr) : [
      { _id: "t1", title: "Wake up by 5:00 AM & Hydrate", category: "Morning", time: "05:00 AM", duration: 15, difficulty: "easy", points: 10, pointsEarned: 0, status: "pending", strict: true },
      { _id: "t2", title: "45 Min Cold Arc Workout", category: "Fitness", time: "06:00 AM", duration: 45, difficulty: "hard", points: 30, pointsEarned: 0, status: "pending", strict: false },
      { _id: "t3", title: "Read 20 Pages of Mindset Book", category: "Mind & Mindset", time: "09:00 PM", duration: 30, difficulty: "medium", points: 20, pointsEarned: 0, status: "pending", strict: false }
    ];

    if (!localTasksStr) {
      localStorage.setItem(`frostmode_tasks_day_${todayNum}`, JSON.stringify(tasksList));
    }

    const currentDayObj = currentDays.find(d => d.dayNumber === todayNum) || currentDays[0];
    setTodayData({ day: currentDayObj, tasks: tasksList });
    setRankInfo({ myRank: 1, totalUsers: 10, pointsNeededForNextRank: 250 });
    setLoading(false);
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
      if (res && res.data && res.data.task) {
        setTodayData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => (t._id === taskId ? res.data.task : t)),
          day: res.data.day
        }));
        if (res.data.user) updateUser(res.data.user);
        return;
      }
    } catch (err) {
      console.warn("Backend update task status offline, using local fallback:", err.message);
    }

    // Client-side Netlify Fallback Task Update
    const updatedTasks = todayData.tasks.map(t => {
      if (t._id === taskId) {
        const earned = newStatus === "followed" ? (user?.strictMode ? Math.round(t.points * 1.5) : t.points) : 0;
        return { ...t, status: newStatus, pointsEarned: earned };
      }
      return t;
    });

    const completedCount = updatedTasks.filter(t => t.status === "followed").length;
    const rate = Math.round((completedCount / updatedTasks.length) * 100);
    const dayStatus = rate === 100 ? "perfect" : rate > 0 ? "partial" : "pending";

    const updatedDay = { ...todayData.day, completionRate: rate, status: dayStatus };

    setTodayData({ day: updatedDay, tasks: updatedTasks });
    localStorage.setItem(`frostmode_tasks_day_${currentDayNum}`, JSON.stringify(updatedTasks));

    // Calculate added points for user
    const targetTask = todayData.tasks.find(t => t._id === taskId);
    if (targetTask && newStatus === "followed" && targetTask.status !== "followed") {
      const earned = user?.strictMode ? Math.round(targetTask.points * 1.5) : targetTask.points;
      updateUser({
        totalPoints: (user?.totalPoints || 0) + earned,
        walletPoints: (user?.walletPoints || 0) + earned
      });
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!todayData.day) return;
    try {
      const res = await axios.post("/api/tasks", {
        dayId: todayData.day._id,
        ...taskData
      });
      if (res && res.data && res.data.task) {
        setTodayData(prev => ({
          ...prev,
          tasks: [...prev.tasks, res.data.task]
        }));
        return;
      }
    } catch (err) {
      console.warn("Backend add task offline, using local fallback:", err.message);
    }

    // Client-side Netlify Fallback Add Task
    const newTask = {
      _id: `task_${Date.now()}`,
      dayId: todayData.day._id,
      title: taskData.title,
      category: taskData.category || "Productivity",
      difficulty: taskData.difficulty || "medium",
      points: taskData.points || 20,
      pointsEarned: 0,
      time: taskData.time || "08:00 AM",
      duration: taskData.duration || 30,
      strict: !!taskData.strict,
      status: "pending"
    };

    const updatedTasks = [...todayData.tasks, newTask];
    setTodayData(prev => ({ ...prev, tasks: updatedTasks }));
    localStorage.setItem(`frostmode_tasks_day_${currentDayNum}`, JSON.stringify(updatedTasks));
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Arc Progress */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-sky-500/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Arc Execution</span>
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">Day {currentDayNum}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">/ {arc.totalDays}</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${daysPassedPct}%` }}
            />
          </div>
        </div>

        {/* Current & Best Streak */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Streak</span>
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 fill-orange-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-orange-400">{user?.streak || 0}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">Days</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Best: <strong className="text-slate-200">{user?.bestStreak || 0}d</strong></p>
        </div>

        {/* Wallet & Total Points */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-sky-500/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Points & Level</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-sky-300">{user?.totalPoints || 0}</span>
            <span className="text-[10px] sm:text-xs text-amber-300 font-bold">pts</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Level: <strong className="text-amber-400">{user?.level || "Beginner"}</strong></p>
        </div>

        {/* Leaderboard Rank */}
        <div className="glass-panel p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Rank</span>
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-amber-400">#{rankInfo.myRank}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold">of {rankInfo.totalUsers || 10}</span>
          </div>
          {rankInfo.pointsNeededForNextRank > 0 && (
            <p className="text-[10px] sm:text-[11px] text-sky-400 truncate">{rankInfo.pointsNeededForNextRank} pts to next rank</p>
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
