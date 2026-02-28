import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import InfoEdgeDashboard from "./dashboards/InfoEdgeDashboard";
import EicherMotorsDashboard from "./dashboards/EicherMotorsDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info-edge" element={<InfoEdgeDashboard />} />
        <Route path="/eicher-motors" element={<EicherMotorsDashboard />} />
        {/* Add future stocks here like this:
        <Route path="/zomato" element={<ZomatoDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;