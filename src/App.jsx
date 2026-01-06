import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import OverduePage from './pages/OverduePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
           {/* Redirect /dashboard to /dashboard/outstanding by default for now */}
           <Route index element={<Navigate to="dashboard" replace />} />
           
           
           <Route path="dashboard" element={<div className="p-10">Dashboard Page Placeholder</div>} />
           <Route path="overdue" element={<OverduePage />} />
           {/* Placeholders for other routes if needed later */}
           <Route path="stock" element={<div className="p-10">Stock Page Placeholder</div>} />
           <Route path="sales" element={<div className="p-10">Sales Page Placeholder</div>} />
           <Route path="finance" element={<div className="p-10">Finance Page Placeholder</div>} />
           <Route path="tax" element={<div className="p-10">Tax Page Placeholder</div>} />
           <Route path="ai-promo" element={<div className="p-10">AI Promo Page Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
