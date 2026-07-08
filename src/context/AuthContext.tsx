import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiFetch } from "../api/client";
import type { AuthResponse } from "../types";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  firstName: string | null;
  isAdmin: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>; // token'ı geri döndürüyor (cart merge için lazım olacak)
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedFirstName = localStorage.getItem("firstName");
    const storedIsAdmin = localStorage.getItem("isAdmin");
    const storedIsGuest = localStorage.getItem("isGuest");

    if (storedToken) {
      setToken(storedToken);
      setUserId(storedUserId ? Number(storedUserId) : null);
      setFirstName(storedFirstName);
      setIsAdmin(storedIsAdmin === "true");
    } else if (storedIsGuest === "true") {
      setIsGuest(true);
    }
    setIsLoading(false);
  }, []);

  function persistAuth(data: AuthResponse) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", String(data.id));
    localStorage.setItem("firstName", data.firstName);
    localStorage.setItem("isAdmin", String(data.isAdmin));
    localStorage.removeItem("isGuest");

    setToken(data.token);
    setUserId(data.id);
    setFirstName(data.firstName);
    setIsAdmin(data.isAdmin);
    setIsGuest(false);
  }

  async function login(email: string, password: string): Promise<string> {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persistAuth(data);
    return data.token; // login sayfası bunu cart merge için kullanacak
  }

  async function register(firstName: string, lastName: string, email: string, password: string) {
    // Mobildeki gibi: register sadece başarı/hata döndürüyor, otomatik login yok
    await apiFetch<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isGuest");
    setToken(null);
    setUserId(null);
    setFirstName(null);
    setIsAdmin(false);
    setIsGuest(false);
  }

  function continueAsGuest() {
    localStorage.setItem("isGuest", "true");
    setIsGuest(true);
  }

  return (
    <AuthContext.Provider
      value={{ token, userId, firstName, isAdmin, isGuest, isLoading, login, register, logout, continueAsGuest }}
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