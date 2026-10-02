import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, TrendingUp, Calendar, Award, Zap } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("/api/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Fetch analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-sm">Analyzing your arc performance...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          <span>Performance Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Arc Analytics & Insights
        </h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Deep-dive breakdown of your task completion rates, category strength, and discipline trends.
        </p>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Completion Rate */}
        <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" /> Completion Rate by Category (%)
          </h3>
          {data?.categoryStats?.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryStats} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#38bdf8", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="rate" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-12 text-center">No category data yet</p>
          )}
        </div>

        {/* Day of Week Performance */}
        <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" /> Execution Rate by Day of Week (%)
          </h3>
          {data?.dayOfWeekStats?.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dayOfWeekStats}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#f59e0b", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="rate" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-12 text-center">No day of week data yet</p>
          )}
        </div>
      </div>

      {/* Points Trend Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-sky-500/20 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Daily Points Earned Trend
        </h3>
        {data?.pointsTrend?.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.pointsTrend}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#10b981", borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="points" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-12 text-center">No points history recorded yet</p>
        )}
      </div>
    </div>
  );
};
