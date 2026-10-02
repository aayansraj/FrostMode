import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Trophy, Flame, Search, Shield, Snowflake, Filter, Award } from "lucide-react";
import { Podium } from "../components/Podium";

export const LeaderboardPage = () => {
  const { user, socket } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [podium, setPodium] = useState([]);
  const [timeframe, setTimeframe] = useState("all");
  const [strictOnly, setStrictOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [myRankInfo, setMyRankInfo] = useState({ myRank: 0, pointsNeededForNextRank: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leaderboard", {
        params: { timeframe, strictOnly, search }
      });
      setLeaderboard(res.data.leaderboard || []);
      setPodium(res.data.podium || []);

      if (user) {
        const rankRes = await axios.get("/api/leaderboard/my-rank");
        setMyRankInfo(rankRes.data);
      }
    } catch (err) {
      console.error("Fetch leaderboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, strictOnly, search]);

  useEffect(() => {
    if (socket) {
      socket.on("leaderboard_update", () => {
        fetchLeaderboard();
      });
    }
    return () => {
      if (socket) socket.off("leaderboard_update");
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Real-Time Discipline Standings</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          FrostMode Leaderboard
        </h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Ranked by total earned points. Strict Mode execution rewards 1.5x multiplier.
        </p>
      </div>

      {/* Top 3 Podium */}
      {podium.length > 0 && <Podium podium={podium} />}

      {/* Current User Rank Card */}
      {user && (
        <div className="glass-panel p-5 rounded-3xl border border-sky-400/40 bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-2xl font-black text-sky-300">
              #{myRankInfo.myRank || "-"}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{user.displayName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-sky-300 border border-sky-500/30 font-semibold">YOUR RANK</span>
              </h3>
              <p className="text-xs text-slate-300">
                Total Points: <strong className="text-amber-400">{user.totalPoints || 0} pts</strong> • Level: <strong className="text-amber-300">{user.level || "Beginner"}</strong>
              </p>
            </div>
          </div>

          {myRankInfo.pointsNeededForNextRank > 0 && (
            <div className="text-center sm:text-right bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
              <p className="text-slate-400">Points to reach next rank</p>
              <p className="text-base font-extrabold text-sky-400">+{myRankInfo.pointsNeededForNextRank} pts</p>
            </div>
          )}
        </div>
      )}

      {/* Filter & Timeframe Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Timeframe Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 w-full md:w-auto">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === tab.id
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Search & Strict Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={strictOnly}
              onChange={(e) => setStrictOnly(e.target.checked)}
              className="w-4 h-4 accent-red-500 rounded"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Strict Mode Users
            </span>
          </label>

          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Ranked Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Updating leaderboard...</div>
      ) : (
        <div className="glass-panel rounded-3xl border border-sky-500/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Warrior</th>
                  <th className="py-3.5 px-4">Points</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Streak</th>
                  <th className="py-3.5 px-4">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80">
                {leaderboard.map((item) => {
                  const isCurrentUser = user && user.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isCurrentUser ? "bg-sky-500/10 font-bold text-sky-200" : "hover:bg-slate-900/40"
                      }`}
                    >
                      <td className="py-3.5 px-4 font-black text-sm text-slate-200">
                        {item.rank === 1 ? "🥇 #1" : item.rank === 2 ? "🥈 #2" : item.rank === 3 ? "🥉 #3" : `#${item.rank}`}
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-base border border-slate-700">
                          {item.avatar === "wolf" ? "🐺" : item.avatar === "bear" ? "🐻" : item.avatar === "crown" ? "👑" : item.avatar === "fire" ? "🔥" : item.avatar === "ice" ? "🧊" : "❄️"}
                        </div>
                        <span className="font-extrabold text-white text-sm">
                          {item.displayName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-400 text-sm">
                        {item.periodPoints !== undefined ? item.periodPoints : item.totalPoints} pts
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                          {item.level || "Beginner"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-orange-400">
                        {item.streak > 0 ? `🔥 ${item.streak}d` : "0d"}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.strictMode ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-950 text-red-400 border border-red-500">STRICT</span>
                        ) : (
                          <span className="text-slate-500 font-mono">Standard</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
