import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import AIChatBot from "../components/features/ai/AIChatBot";
import SystemNotificationModal from "../components/modals/SystemNotificationModal";
import { supabase } from "../lib/supabase";
import { useBranch } from "../contexts/BranchContext";
import { storeService } from "../services/storeService";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { Loader2 } from "lucide-react";

const DashboardLayout = () => {
  const { activeBranchId, clearBranch } = useBranch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Notification Modal States
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const checkInProgress = React.useRef(false);

  useEffect(() => {
    const currentBranchId = activeBranchId || sessionStorage.getItem("selected_branch_id");
    
    if (!currentBranchId) {
      console.warn("Dashboard: No active branch ID found, redirecting to selection.");
      navigate("/select-branch", { replace: true });
      return;
    }

    // 1. INSTANT TRIGGER: Use pre-fetched data from location state if available
    const checkInitialData = () => {
      const initialData = location.state?.initialNotifications;
      if (initialData) {
        const hiddenNotifs = JSON.parse(sessionStorage.getItem(`hiddenNotifs_${currentBranchId}`) || "[]");
        const hasUnread = [
          ...(initialData.expired || []), 
          ...(initialData.expiringSoon || []), 
          ...(initialData.lowStock || [])
        ].some(i => 
          !hiddenNotifs.includes(`expired-${i.batchId || i.id || i.name}`) && 
          !hiddenNotifs.includes(`expiring-${i.batchId || i.id || i.name}`) && 
          !hiddenNotifs.includes(`lowstock-${i.id || i.productId || i.name}`)
        );

        if (hasUnread) {
          setNotificationData(initialData);
          setIsNotificationOpen(true);
          sessionStorage.setItem(`hasShownDashboardNotification_${currentBranchId}`, "true");
        }
      }
    };

    // 2. FASTEST TRIGGER: Check notifications if not pre-fetched
    const triggerNotifications = async () => {
      const hasShown = sessionStorage.getItem(`hasShownDashboardNotification_${currentBranchId}`);
      if (hasShown || checkInProgress.current) return;

      checkInProgress.current = true;
      try {
        const data = await productService.getDashboardNotifications(currentBranchId);
        
        // Final guard against race conditions
        if (sessionStorage.getItem(`hasShownDashboardNotification_${currentBranchId}`)) return;

        const hiddenNotifs = JSON.parse(sessionStorage.getItem(`hiddenNotifs_${currentBranchId}`) || "[]");
        const hasUnread = [
          ...(data?.expired || []), 
          ...(data?.expiringSoon || []), 
          ...(data?.lowStock || [])
        ].some(i => 
          !hiddenNotifs.includes(`expired-${i.batchId || i.id || i.name}`) && 
          !hiddenNotifs.includes(`expiring-${i.batchId || i.id || i.name}`) && 
          !hiddenNotifs.includes(`lowstock-${i.id || i.productId || i.name}`)
        );

        if (hasUnread) {
          setNotificationData(data);
          setIsNotificationOpen(true);
        }
        // Always mark as checked for this session/branch
        sessionStorage.setItem(`hasShownDashboardNotification_${currentBranchId}`, "true");
      } catch (err) {
        console.error("DashboardLayout: Fast check failed:", err);
      } finally {
        checkInProgress.current = false;
      }
    };

    // 3. Security: Verify access (runs in parallel)
    const verifyAccess = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user) {
          navigate("/", { replace: true });
          return;
        }

        const stores = await storeService.getUserStores(user.id);
        const storesList = Array.isArray(stores) ? stores : [];
        const hasAccess = storesList.some((store) => store.id === currentBranchId);

        if (!hasAccess) {
          clearBranch();
          navigate("/select-branch", { replace: true, state: { error: "unauthorized" } });
          return;
        }
      } catch (error) {
        if (error.status === 401 || error.status === 403) navigate("/", { replace: true });
      } finally {
        setIsVerifying(false);
      }
    };

    checkInitialData();
    triggerNotifications();
    verifyAccess();

    // Set up real-time sync for notification data
    const channel = supabase.channel(`dashboard_modal_sync_${currentBranchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products", filter: `store_id=eq.${currentBranchId}` }, 
        async () => {
          if (isNotificationOpen) {
            const data = await productService.getDashboardNotifications(currentBranchId);
            setNotificationData(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeBranchId, navigate, clearBranch, location.state]);

  // Modal Component to be shared between states
  const NotificationModal = (
    <SystemNotificationModal
      isOpen={isNotificationOpen}
      onClose={() => setIsNotificationOpen(false)}
      data={notificationData}
    />
  );

  if (isVerifying) {
    return (
      <div className="flex h-screen bg-[#F9FAFB] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        {NotificationModal}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pl-6 pt-4 pr-6 bg-[#F9FAFB]" style={{ scrollbarGutter: "stable" }}>
          <Outlet />
        </main>
      </div>
      <AIChatBot />
      {NotificationModal}
    </div>
  );
};

export default DashboardLayout;
