import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import './input.css';
import Main from './pages/Main';
import History from "./pages/History";

const App: React.FC = () => {
  return(
    <>
      <Router>
        <Routes>
          <Route path={'/'} element={<Main />} />
          <Route path={'/history'} element={<History />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
