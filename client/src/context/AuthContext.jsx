import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("frostmode_token") || "");
  const [loading, setLoading] = useState(true);
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const backendUrl = import.meta.env.VITE_API_URL || (isLocal ? "http://localhost:5050" : "https://tiny-doodles-watch.loca.lt");
  
  axios.defaults.baseURL = backendUrl;
  axios.defaults.headers.common["bypass-tunnel-reminder"] = "true";

  // Set default axios header
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  useEffect(() => {
    // Socket initialization directly to backend URL
    const newSocket = io(backendUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      extraHeaders: {
        "bypass-tunnel-reminder": "true"
      }
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [backendUrl]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("frostmode_token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (formData) => {
    const res = await axios.post("/api/auth/signup", formData);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("frostmode_token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const googleLogin = async (googleData) => {
    const payload = typeof googleData === "string" ? { credential: googleData } : googleData;
    const res = await axios.post("/api/auth/google", payload);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem("frostmode_token", newToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("frostmode_token");
    delete axios.defaults.headers.common["Authorization"];
    setToken("");
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        socket,
        login,
        signup,
        googleLogin,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
