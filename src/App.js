import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import Home from "./Home";
import Navbar from "./Navbar";
import InfoEdgeDashboard from "./dashboards/InfoEdgeDashboard";
import EicherMotorsDashboard from "./dashboards/EicherMotorsDashboard";
// import EicherMotorsDashboard from "./dashboards/Igildashboard";
import IGILDashboard from "./dashboards/Igildashboard";
import Footer from "./Footer";     

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
          <Route path="/igil" element={<IGILDashboard />} />
        </Routes>
        <Footer />          {/* ← Footer appears on EVERY page */}
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;