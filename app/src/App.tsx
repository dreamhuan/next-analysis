import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import CustomRouter from "./components/CustomRouter";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div>
            <Link to="/" className="App-link">
              Home
            </Link>
            {" | "}
            <Link to="/about" className="App-link">
              About
            </Link>
          </div>
        </header>
        <CustomRouter />
      </div>
    </Router>
  );
}

export default App;
