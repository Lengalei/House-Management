import React from "react"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <Router>
      <div>
        <div className="app">
          <Routes>
            <Route path="login" element={<Login/>} />
            <Route path="dashboard" element={<Dashboard/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
