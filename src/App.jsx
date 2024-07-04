import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./components/Login/Login";

function App() {
  return (
    <Router>
      <div>
        <div className="app">
          <Routes>
            <Route path="login" element={<Login/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
