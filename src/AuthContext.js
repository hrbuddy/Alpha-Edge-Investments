import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ae_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch(e) { /* ignore */ }
    }
  }, []);

  function signUp(name, email) {
    const u = { name, email, joinedAt: new Date().toISOString() };
    setUser(u);
    localStorage.setItem("ae_user", JSON.stringify(u));
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("ae_user");
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}