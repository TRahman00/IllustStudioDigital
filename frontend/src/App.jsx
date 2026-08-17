import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Pricing from './pages/Pricing.jsx'; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pricing" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Subscription & Payment Module */}
      <Route path="/pricing" element={<Pricing />} />
      
      <Route path="*" element={<Navigate to="/pricing" replace />} />
    </Routes>
  );
}