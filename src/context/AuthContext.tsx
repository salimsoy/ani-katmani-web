import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiFetch } from "../api/client";
import type { AuthResponse } from "../types";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  firstName: string | null;
  role: string | null;
  isAdmin: boolean;
  isSeller: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = role === "SuperAdmin";
  const isSeller = role === "Seller";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedFirstName = localStorage.getItem("firstName");
    const storedRole = localStorage.getItem("role");
    const storedIsGuest = localStorage.getItem("isGuest");

    if (storedToken) {
      setToken(storedToken);
      setUserId(storedUserId ? Number(storedUserId) : null);
      setFirstName(storedFirstName);
      setRole(storedRole);
    } else if (storedIsGuest === "true") {
      setIsGuest(true);
    }
    setIsLoading(false);
  }, []);

  function persistAuth(data: AuthResponse) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", String(data.id));
    localStorage.setItem("firstName", data.firstName);
    localStorage.setItem("role", data.role);
    localStorage.removeItem("isGuest");

    setToken(data.token);
    setUserId(data.id);
    setFirstName(data.firstName);
    setRole(data.role);
    setIsGuest(false);
  }

  async function login(email: string, password: string): Promise<string> {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persistAuth(data);
    return data.token;
  }

  async function register(firstName: string, lastName: string, email: string, password: string) {
    await apiFetch<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await apiFetch("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Backend'e ulaşılamasa bile local oturumu temizlemeye devam ediyoruz
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("role");
    localStorage.removeItem("isGuest");
    setToken(null);
    setUserId(null);
    setFirstName(null);
    setRole(null);
    setIsGuest(false);
  }

  function continueAsGuest() {
    localStorage.setItem("isGuest", "true");
    setIsGuest(true);
  }

  return (
    <AuthContext.Provider
      value={{ token, userId, firstName, role, isAdmin, isSeller, isGuest, isLoading, login, register, logout, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return context;
}