import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  const verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/verify",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.user.role === "superadmin") {
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        throw new Error("Yetkisiz erişim");
      }
    } catch (error) {
      console.error("Token doğrulama hatası:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (credentials) => {
    try {
      console.log("Login attempt:", credentials);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        credentials
      );
      console.log("Login response:", response.data);

      if (response.data.user.role === "superadmin") {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        setUser(response.data.user);
        return { success: true };
      } else {
        console.log("Invalid role:", response.data.user.role);
        return {
          success: false,
          message: "Sadece süper admin kullanıcıları giriş yapabilir",
        };
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || "Giriş başarısız",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, verifyToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
