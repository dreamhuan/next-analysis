import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import Lang from "./Lang";
import About from "./About";

export default function CustomRouter() {
  return (
    <div style={{ marginTop: 40 }}>
      <Switch>
        <Route path="/i18n">
          <Lang />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  );
}
