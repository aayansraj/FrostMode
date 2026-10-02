import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Snowflake, Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName) {
          setError("Display Name is required for the Leaderboard");
          setLoading(false);
          return;
        }
        await signup({ name, displayName, email, password });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      await googleLogin({ credential: credentialResponse.credential });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign In failed or was cancelled.");
  };

  const handleGoogleSimulated = async () => {
    setError("");
    setLoading(true);
    try {
      await googleLogin({
        email: "demo.winter@frostmode.app",
        name: "Winter Warrior",
        googleId: `google_${Date.now()}`
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-sky-500/30 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-600 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Snowflake className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isLogin ? "Welcome Back to FrostMode" : "Join the Winter Arc"}
          </h2>
          <p className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
            "Lock In. Level Up."
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isLogin ? "bg-sky-500/20 text-sky-300 border border-sky-400/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isLogin ? "bg-sky-500/20 text-sky-300 border border-sky-400/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Leaderboard Display Name *</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ColdValkyrie"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="warrior@frostmode.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-sky-500/25 hover:from-sky-300 hover:to-cyan-400 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{isLogin ? "Sign In to FrostMode" : "Create Account & Lock In"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 absolute">or</span>
        </div>

        {/* Google OAuth Option */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-full flex justify-center min-h-[40px]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              size="medium"
              width="100%"
            />
          </div>

          {/* Dev Demo Fallback option */}
          <button
            type="button"
            onClick={handleGoogleSimulated}
            disabled={loading}
            className="text-[11px] text-slate-500 hover:text-sky-400 font-semibold underline underline-offset-2 transition-colors"
          >
            Or click here to Test Demo Google Login (Offline)
          </button>
        </div>
      </div>
    </div>
  );
};
