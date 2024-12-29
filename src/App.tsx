import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import './input.css';
import Main from './pages/Main';

const App: React.FC = () => {
  return(
    <>
      <Router>
        <Routes>
          <Route path={'/'} element={<Main />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
