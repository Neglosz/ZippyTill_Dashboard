import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import OverduePage from "./pages/OverduePage";
import BranchSelectionPage from "./pages/BranchSelectionPage";
import TaxCalculationPage from "./pages/TaxCalculationPage";
import FinancePage from "./pages/FinancePage";
import AIPromotionPage from "./pages/AIPromotionPage";
import SalesPage from "./pages/SalesPage";

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
          <Route path="stock" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="tax" element={<TaxCalculationPage />} />
          <Route path="ai-promo" element={<AIPromotionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
