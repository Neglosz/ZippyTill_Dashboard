import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import OverduePage from "./pages/OverduePage";
import BranchSelectionPage from "./pages/BranchSelectionPage";
import TaxCalculationPage from "./pages/TaxCalculationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/select-branch" element={<BranchSelectionPage />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="overdue" element={<OverduePage />} />
          {/* Placeholders for other routes if needed later */}
          <Route
            path="stock"
            element={<div className="p-10">Stock Page Placeholder</div>}
          />
          <Route
            path="sales"
            element={<div className="p-10">Sales Page Placeholder</div>}
          />
          <Route
            path="finance"
            element={<div className="p-10">Finance Page Placeholder</div>}
          />
          <Route
            path="tax"
            element={<TaxCalculationPage />}
          />
          <Route
            path="ai-promo"
            element={<div className="p-10">AI Promo Page Placeholder</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
