import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import RepositoryTree from "./pages/RepositoryTree";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tree" element={<RepositoryTree />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
