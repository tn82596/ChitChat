import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./components/Routes"; // Import your separate Routes component
import "./App.css"; // Keep this if you still use styles from App.css

function App() {
  return (
    <Router>
      <AppRoutes /> 
    </Router>
  );
}

export default App;