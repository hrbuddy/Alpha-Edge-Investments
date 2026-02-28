import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import Home from "./Home";
import Navbar from "./Navbar";
import InfoEdgeDashboard from "./dashboards/InfoEdgeDashboard";
import EicherMotorsDashboard from "./dashboards/EicherMotorsDashboard";
import IGILDashboard from "./dashboards/Igildashboard";
import Footer from "./Footer";
import SignUp from "./SignUp";
import AboutUs from "./AboutUs";
import TermsConditions from "./TermsConditions";
import InvestmentPhilosophy from "./InvestmentPhilosophy";
import { AuthProvider } from "./AuthContext";

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
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/info-edge"   element={<InfoEdgeDashboard />} />
            <Route path="/eicher-motors" element={<EicherMotorsDashboard />} />
            <Route path="/igil"        element={<IGILDashboard />} />
            <Route path="/signup"      element={<SignUp />} />
            <Route path="/about"       element={<AboutUs />} />
            <Route path="/terms"       element={<TermsConditions />} />
            <Route path="/philosophy"  element={<InvestmentPhilosophy />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;