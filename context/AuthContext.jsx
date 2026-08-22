import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Sahifa ochilganda saqlangan tokenni tekshirish
  useEffect(() => {
    const saved = localStorage.getItem("as_token");
    if (!saved) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me", saved)
      .then((me) => {
        setToken(saved);
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem("as_token");
      })
      .finally(() => setReady(true));
  }, []);

  async function login(login, password) {
    const data = await api.post("/auth/login", { login, password });
    localStorage.setItem("as_token", data.accessToken);
    setToken(data.accessToken);
    const me = await api.get("/auth/me", data.accessToken);
    setUser(me);
    router.push("/dashboard");
  }

  function logout() {
    localStorage.removeItem("as_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
