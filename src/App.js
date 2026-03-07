import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import Home from "./Home";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SignUp from "./SignUp";
import AboutUs from "./AboutUs";
import TermsConditions from "./TermsConditions";
import InvestmentPhilosophy from "./InvestmentPhilosophy";
import ResearchUniverse from "./ResearchUniverse";
import MacroBoard from "./MacroBoard";
import MomentumDashboard from "./MomentumDashboard";
import FlashCard from "./FlashCard";
import PortfolioSimulator from "./PortfolioSimulator";
import { AuthProvider } from "./AuthContext";
import { AccessProvider } from "./AccessContext";
import { StockModalProvider } from "./StockModal";
import { STOCKS, STOCK_ROUTES } from "./dashboards/stocksDB";
import StockDashboard from "./dashboards/StockDashboard";
import GenericDCFTemplate from "./GenericDCFTemplate";
import UpgradePage from "./UpgradePage";

import QuantPage      from "./QuantPage";
import ValueDashboard from "./ValueDashboard";
import SizeDashboard  from "./SizeDashboard";

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
          <AccessProvider>
            {/* StockModalProvider must be inside Router so it can useNavigate */}
            <StockModalProvider>
            <Navbar />
            <Routes>
              <Route path="/"                  element={<Home />} />
              <Route path="/signup"            element={<SignUp />} />
              <Route path="/about"             element={<AboutUs />} />
              <Route path="/terms"             element={<TermsConditions />} />
              <Route path="/philosophy"        element={<InvestmentPhilosophy />} />
              <Route path="/research-universe" element={<ResearchUniverse />} />
              <Route path="/my-research"        element={<ResearchUniverse />} />
              <Route path="/macro"             element={<MacroBoard />} />
              <Route path="/momentum"          element={<MomentumDashboard />} />
              <Route path="/quant"             element={<QuantPage />} />
              <Route path="/size"              element={<SizeDashboard />} />
              <Route path="/value"             element={<ValueDashboard />} />
              <Route path="/portfolio"         element={<PortfolioSimulator />} />
              <Route path="/discover"          element={<FlashCard />} />
              <Route path="/dcf/:ticker"       element={<GenericDCFTemplate />} />
              <Route path="/upgrade"           element={<UpgradePage />} />

              {/* Auto-generated stock routes */}
              {STOCK_ROUTES.map(({ path, stockId }) => (
                <Route
                  key={stockId}
                  path={path}
                  element={<StockDashboard stock={STOCKS[stockId]} />}
                />
              ))}
            </Routes>
            <Footer />
          </StockModalProvider>
          </AccessProvider>
        </Router>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

export default App;