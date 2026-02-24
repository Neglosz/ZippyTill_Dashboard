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
import SalesPage from "./pages/salesPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { BranchProvider } from "./contexts/BranchContext";

function App() {
  return (
    <BrowserRouter>
      <BranchProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          <Route
            path="/select-branch"
            element={
              <ProtectedRoute>
                <BranchSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="overdue" element={<OverduePage />} />
            {/* Placeholders for other routes if needed later */}
            <Route path="stock" element={<InventoryPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="tax" element={<TaxCalculationPage />} />
            <Route path="ai-promo" element={<AIPromotionPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingPage />} />
          </Route>
        </Routes>
      </BranchProvider>
    </BrowserRouter>
  );
}

export default App;
