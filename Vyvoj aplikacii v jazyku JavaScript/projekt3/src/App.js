import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Measurements from "./components/Measurements";
import Admin from "./components/Admin";
import Methods from "./components/Methods";
import Graph from "./components/Graph";
import Advertising from "./components/Advertising";
function App() {
  return (
      <div>
          <Advertising />
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/user" element={<Measurements />} />
                  <Route path="/methods" element={<Methods />} />
                  <Route path="/graph" element={<Graph />} />
              </Routes>
          </BrowserRouter>
      </div>
  );
}

export default App;