import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import Home from "./Home";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SignUp from "./SignUp";
import AboutUs from "./AboutUs";
import TermsConditions from "./TermsConditions";
import InvestmentPhilosophy from "./InvestmentPhilosophy";
import { AuthProvider } from "./AuthContext";

// ── New scalable dashboard system ──
import { STOCKS, STOCK_ROUTES } from "./dashboards/stocksDB";
import StockDashboard from "./dashboards/StockDashboard";

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
            <Route path="/"           element={<Home />} />
            <Route path="/signup"     element={<SignUp />} />
            <Route path="/about"      element={<AboutUs />} />
            <Route path="/terms"      element={<TermsConditions />} />
            <Route path="/philosophy" element={<InvestmentPhilosophy />} />

            {/* Auto-generated stock routes — add new stocks in stocksDB.js only */}
            {STOCK_ROUTES.map(({ path, stockId }) => (
              <Route
                key={stockId}
                path={path}
                element={<StockDashboard stock={STOCKS[stockId]} />}
              />
            ))}
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;