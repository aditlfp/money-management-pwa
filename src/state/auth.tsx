import { createContext, useContext, useState } from "react";
import { authApi } from "../api.ts";

interface AuthContextType {
  user: { token: string | null; _id: string | null } | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error?: { token?: string } }>;
  register: (email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<{
    token: string | null;
    _id: string | null;
  } | null>(() => {
    const t = localStorage.getItem("token");
    return t ? { token: t, _id: null } : null;
  });

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.status === 200 && res.body?.token) {
      localStorage.setItem("token", res.body.token);
      localStorage.setItem("_id", res.body._id);
      setUser({ token: res.body.token, _id: res.body._id || null });
      return { ok: true };
    }
    return { ok: false, error: res.body };
  };

  const register = async (email: string, password: string) =>
    authApi.register(email, password);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("_id");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
