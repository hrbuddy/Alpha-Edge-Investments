import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import Home from "./Home";
import Navbar from "./Navbar";
import InfoEdgeDashboard from "./dashboards/InfoEdgeDashboard";
import EicherMotorsDashboard from "./dashboards/EicherMotorsDashboard";

export const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info-edge" element={<InfoEdgeDashboard />} />
          <Route path="/eicher-motors" element={<EicherMotorsDashboard />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;