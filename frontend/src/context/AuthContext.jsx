import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../services/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/auth/me");
          setUser(res.data.user || res.data);
        } catch (err) {
          console.error("Auth error:", err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false); 
    };

    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);