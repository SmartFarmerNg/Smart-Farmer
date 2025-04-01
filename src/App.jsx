import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';
import Invest from './pages/Invest';
import Transact from './pages/Transact';
import Withdraw from './pages/Withdraw';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/transact" element={<Transact />} />
        <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 pages */}
      </Routes>
    </Router>
  );
}

export default App;