import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Login from "./components/Login";
import { getAppData } from "./store";
import type { CurrentUser } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("centuryrooms_user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    if (username === "ahsan123" && password === "ahsan123") {
      const user: CurrentUser = {
        id: "admin",
        name: "Ahsan",
        username: "ahsan123",
        role: "admin",
      };
      sessionStorage.setItem("centuryrooms_user", JSON.stringify(user));
      setCurrentUser(user);
      return true;
    }
    const data = getAppData();
    const emp = data.employees.find(
      (e) => e.username === username && e.password === password,
    );
    if (emp) {
      const user: CurrentUser = {
        id: emp.id,
        name: emp.name,
        username: emp.username,
        role: emp.role,
      };
      sessionStorage.setItem("centuryrooms_user", JSON.stringify(user));
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("centuryrooms_user");
    setCurrentUser(null);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;
  return <Layout currentUser={currentUser} onLogout={handleLogout} />;
}
