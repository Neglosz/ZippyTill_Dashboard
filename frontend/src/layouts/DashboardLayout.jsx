import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AIChatBot from "../components/features/ai/AIChatBot";
import { useBranch } from "../contexts/BranchContext";
import { storeService } from "../services/storeService";
import { authService } from "../services/authService";
import { Loader2 } from "lucide-react";

const DashboardLayout = () => {
  const { activeBranchId, clearBranch } = useBranch();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!activeBranchId) {
        navigate("/select-branch", { replace: true });
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          navigate("/", { replace: true });
          return;
        }

        const stores = await storeService.getUserStores(user.id);
        const hasAccess = stores.some((store) => store.id === activeBranchId);

        if (!hasAccess) {
          clearBranch();
          navigate("/select-branch", {
            replace: true,
            state: { error: "unauthorized" },
          });
        }
      } catch (error) {
        console.error("Error verifying branch access:", error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [activeBranchId, navigate, clearBranch]);

  if (isVerifying) {
    return (
      <div className="flex h-screen bg-[#F9FAFB] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto pl-6 pt-4 pr-6 bg-[#F9FAFB]"
          style={{ scrollbarGutter: "stable" }}
        >
          <Outlet />
        </main>
      </div>

      {/* Global AI Chatbot */}
      <AIChatBot />
    </div>
  );
};

export default DashboardLayout;
