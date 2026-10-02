import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Wallet, Sparkles, Trophy, Gift, History, Plus, Award, CheckCircle2, ShoppingBag } from "lucide-react";
import { AddRewardModal } from "../components/AddRewardModal";

export const WalletPage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [pointsSummary, setPointsSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [badges, setBadges] = useState([]);
  const [activeTab, setActiveTab] = useState("rewards"); // 'rewards', 'history', 'badges'
  const [loading, setLoading] = useState(true);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, logRes, rewardRes, badgeRes] = await Promise.all([
        axios.get("/api/points/summary"),
        axios.get("/api/points/history"),
        axios.get("/api/rewards"),
        axios.get("/api/analytics")
      ]);
      setPointsSummary(sumRes.data);
      setLogs(logRes.data.logs || []);
      setRewards(rewardRes.data.rewards || []);
      setBadges(badgeRes.data.badges || []);
    } catch (err) {
      console.error("Fetch wallet data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReward = async (rewardData) => {
    try {
      const res = await axios.post("/api/rewards", rewardData);
      setRewards(prev => [...prev, res.data.reward]);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create reward");
    }
  };

  const handleRedeemReward = async (rewardId) => {
    try {
      const res = await axios.post(`/api/rewards/${rewardId}/redeem`);
      alert(res.data.message);
      setRewards(prev => prev.map(r => (r._id === rewardId ? res.data.reward : r)));
      if (user) {
        updateUser({ walletPoints: res.data.walletPoints });
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to redeem reward");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-sm">Loading points wallet...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Wallet Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spendable Wallet Points */}
        <div className="glass-panel p-6 rounded-3xl border border-sky-400/40 bg-gradient-to-br from-sky-950/40 to-slate-900 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-sky-300 font-bold uppercase tracking-wider">
            <span>Spendable Wallet Balance</span>
            <Wallet className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-4xl font-black text-white">
            {user?.walletPoints || 0} <span className="text-sm text-sky-300 font-normal">pts</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Use these points to redeem your custom rewards in the store!
          </p>
        </div>

        {/* Total Leaderboard Points */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-slate-900 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider">
            <span>Leaderboard Total Points</span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-4xl font-black text-amber-400">
            {user?.totalPoints || 0} <span className="text-sm text-amber-200 font-normal">pts</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Redeeming rewards spends wallet points but NEVER decreases leaderboard points!
          </p>
        </div>

        {/* Level & Next Tier */}
        <div className="glass-panel p-6 rounded-3xl border border-sky-500/30 bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Level Progression</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {pointsSummary?.level || "Beginner"}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Next: {pointsSummary?.nextLevel || "Max"}</span>
              <span>{pointsSummary?.progressPct || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                style={{ width: `${pointsSummary?.progressPct || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("rewards")}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "rewards" ? "bg-sky-500/20 text-sky-300 border border-sky-400/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Rewards Store</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "history" ? "bg-sky-500/20 text-sky-300 border border-sky-400/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Points Logs</span>
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "badges" ? "bg-sky-500/20 text-sky-300 border border-sky-400/30" : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Badges ({badges.length})</span>
          </button>
        </div>

        {activeTab === "rewards" && (
          <button
            onClick={() => setIsAddRewardOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Reward</span>
          </button>
        )}
      </div>

      {/* Tab Content: Rewards Store */}
      {activeTab === "rewards" && (
        <div className="space-y-4">
          {rewards.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl space-y-3">
              <Gift className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300 font-bold">No custom rewards created yet!</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create custom rewards like "Watch a movie = 200 points" or "Cheat meal = 300 points" to treat yourself after grinding.
              </p>
              <button
                onClick={() => setIsAddRewardOpen(true)}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-xl"
              >
                + Create First Reward
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <div
                  key={reward._id}
                  className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                    reward.redeemed
                      ? "border-emerald-500/30 bg-emerald-950/20"
                      : "border-sky-500/20 hover:border-amber-400/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                        🎁 {reward.cost} Wallet Points
                      </span>
                      {reward.redeemed && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> REDEEMED
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{reward.title}</h3>
                  </div>

                  <button
                    onClick={() => handleRedeemReward(reward._id)}
                    disabled={reward.redeemed || (user?.walletPoints < reward.cost)}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      reward.redeemed
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : user?.walletPoints >= reward.cost
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-md shadow-amber-500/20"
                        : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>
                      {reward.redeemed
                        ? "Redeemed"
                        : user?.walletPoints >= reward.cost
                        ? "Redeem Reward"
                        : `Need ${reward.cost - (user?.walletPoints || 0)} More Points`}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: History Logs */}
      {activeTab === "history" && (
        <div className="glass-panel rounded-3xl border border-sky-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Reason / Activity</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{log.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.type === "earned" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-rose-950 text-rose-400 border border-rose-500/30"
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-extrabold ${log.points > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {log.points > 0 ? `+${log.points}` : log.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Badges */}
      {activeTab === "badges" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "First Day", desc: "Completed your first task on your FrostMode Arc!", icon: "❄️" },
            { name: "7-Day Streak", desc: "Maintained a 7-day arc streak!", icon: "🔥" },
            { name: "Early Bird", desc: "Conquered a Morning task like a champion!", icon: "🌅" },
            { name: "Perfect Week", desc: "Completed 7 Perfect Days with 100% execution!", icon: "💎" },
            { name: "Iron Discipline", desc: "Earned 500+ points with Strict Mode enabled!", icon: "🛡️" }
          ].map((badgeDef) => {
            const isEarned = badges.some(b => b.name === badgeDef.name);
            return (
              <div
                key={badgeDef.name}
                className={`glass-panel p-5 rounded-2xl border flex items-center gap-4 ${
                  isEarned ? "border-amber-400/40 bg-amber-950/10" : "border-slate-800 opacity-50 grayscale"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-700">
                  {badgeDef.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <span>{badgeDef.name}</span>
                    {isEarned && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{badgeDef.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reward Modal */}
      <AddRewardModal
        isOpen={isAddRewardOpen}
        onClose={() => setIsAddRewardOpen(false)}
        onAdd={handleCreateReward}
      />
    </div>
  );
};
