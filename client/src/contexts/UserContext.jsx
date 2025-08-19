import { createContext, useState, useEffect, useCallback } from "react";
import api from "../api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const tokenInStorage = !!localStorage.getItem("token_check");
    if (tokenInStorage) {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user); // Simplified user object
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      setUser(data.user); // Simplified login
      localStorage.setItem("token_check", "true");
      return data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("token_check");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};