import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Landing';
import TestPage from './pages/Test';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage'; 
import Profile from './pages/Profile'; 
import AdminPanel from './pages/AdminPanel.jsx'; 

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/panel" element={<AdminPanel />} />
    </Routes>
  );
};

export default AppRouter;