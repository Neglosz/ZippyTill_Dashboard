import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SimpleHeader from "../components/layout/SimpleHeader";
import SummaryCard from "../components/common/SummaryCard";
import BranchCard from "../components/features/branch/BranchCard";
import ConfirmModal from "../components/modals/ConfirmModal";
import { storeService } from "../services/storeService";
import { authService } from "../services/authService";
import { useBranch } from "../contexts/BranchContext";
import {
  Store,
  TrendingUp,
  ShoppingCart,
  Users,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  WifiOff,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const BranchSelectionPage = () => {
  const { selectBranch } = useBranch();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [storeStats, setStoreStats] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [confirmingBranch, setConfirmingBranch] = useState(null);

  const [lastAccessedBranchId, setLastAccessedBranchId] = useState(() => {
    return localStorage.getItem("last_accessed_branch_id");
  });

  useEffect(() => {
    if (location.state?.error === "unauthorized") {
      setShowError(true);
      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Network Status Detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLS, setScrollLS] = useState(0);
  const [dragMoved, setDragMoved] = useState(false);

  const startDragging = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLS(scrollRef.current.scrollLeft);
    setDragMoved(false);
  };

  const stopDragging = (e) => {
    setIsDragging(false);
  };

  const onDragging = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLS - walk;

    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
  };

  const handleSelect = async (branch, force = false) => {
    if (dragMoved) return;

    // Check if branch is offline and needs confirmation
    if (!branch.is_active && !force) {
      setConfirmingBranch(branch);
      return;
    }

    try {
      // Update last accessed in Supabase (cross-device) + localStorage (fast local fallback)
      await storeService.updateLastAccessed(branch.id);
      localStorage.setItem("last_accessed_branch_id", branch.id);
      localStorage.setItem("last_accessed_timestamp", new Date().toISOString());

      selectBranch(branch);
      // Ensure state is updated before navigating
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 0);
    } catch (err) {
      console.error("Error selecting branch:", err);
      // Still select branch even if updateLastAccessed fails
      selectBranch(branch);
      navigate("/dashboard", { replace: true });
    }
  };

  const handleConfirmOffline = () => {
    if (confirmingBranch) {
      const branch = confirmingBranch;
      setConfirmingBranch(null);
      handleSelect(branch, true);
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-bold text-primary uppercase tracking-[0.2em] animate-pulse">
            กำลังโหลดข้อมูล
          </p>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  const fetchStoresData = useCallback(async (isInitial = false) => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const userStores = (await storeService.getUserStores(user.id)) || [];

        // storeService sorts by last_accessed_at already — no manual sort needed
        setStores(userStores);

        // Fetch aggregate summary only to avoid network congestion
        if (userStores && userStores.length > 0) {
          const storeIds = userStores.map((s) => s.id);

          try {
            const aggregateStats = await storeService.getStoresSummary(storeIds);
            if (aggregateStats) setSummary(aggregateStats);
          } catch (err) {
            console.error("Error fetching summary stats:", err);
          }
        }
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const debouncedFetch = async (isInitial = false) => {
      if (!isMounted || isFetching) return;
      isFetching = true;
      await fetchStoresData(isInitial);
      isFetching = false;
    };

    // Initial data fetch with loading state
    debouncedFetch(true);

    // Setup Supabase Realtime Subscription for 'orders' table
    // Instantly refreshes the dashboard sales/orders summary across all stores without refreshing the page
    const ordersSubscription = supabase
      .channel("branch-selection-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (isMounted) {
            console.log("Real-time: Sales updated, refreshing dashboard.");
            debouncedFetch(false);
          }
        },
      )
      .subscribe();

    const storesSubscription = supabase
      .channel("branch-selection-stores")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stores" },
        () => {
          if (isMounted) {
            console.log("Real-time: Store status updated, refreshing dashboard.");
            debouncedFetch(false);
          }
        },
      )
      .subscribe();

    // Reduced polling frequency to once per minute to lower server load
    const intervalId = setInterval(() => {
      if (isMounted) debouncedFetch(false);
    }, 60000);

    // Refresh immediately when tab becomes visible or gains focus
    const handleFocus = () => {
      if (isMounted && !document.hidden) {
        fetchStoresData(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);

      if (ordersSubscription) {
        supabase.removeChannel(ordersSubscription);
      }
      if (storesSubscription) {
        supabase.removeChannel(storesSubscription);
      }
    };
  }, [fetchStoresData]);

  const summaryData = [
    {
      icon: <Store size={24} />,
      title: "สาขาทั้งหมด",
      value: `${stores.length} สาขา`,
    },
    {
      icon: <TrendingUp size={24} />,
      title: "ยอดขายรวมวันนี้",
      value: `฿${summary.totalSales.toLocaleString()}`,
    },
    {
      icon: <ShoppingCart size={24} />,
      title: "คำสั่งซื้อทั้งหมด",
      value: `${summary.totalOrders} รายการ`,
    },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#F9FAFB]">
      <ConfirmModal
        isOpen={!!confirmingBranch}
        onClose={() => setConfirmingBranch(null)}
        onConfirm={handleConfirmOffline}
        title="สาขาออฟไลน์"
        message={`สาขา ${confirmingBranch?.name} กำลังออฟไลน์อยู่ คุณแน่ใจหรือไม่ว่าต้องการเข้าสู่ระบบจัดการสำหรับสาขานี้? ข้อมูลอาจไม่เป็นปัจจุบัน`}
        confirmText="เข้าสู่ระบบจัดการ"
        cancelText="ยกเลิก"
      />

      {/* Background Decorative Blob - Refined */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-50 w-full">
        <SimpleHeader isDark={false} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 lg:px-14 lg:py-8 flex flex-col items-center relative z-10">
        {/* Page Title Section */}
        <div className="text-center mb-8 w-full max-w-2xl">
          {showError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-4 fade-in duration-300 shadow-sm max-w-md mx-auto">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div className="text-left">
                <p className="font-black text-sm">ไม่มีสิทธิ์เข้าถึงสาขา</p>
                <p className="text-xs font-bold opacity-80 mt-0.5">
                  คุณพยายามเข้าถึงสาขาที่ไม่มีสิทธิ์ กรุณาเลือกสาขาใหม่
                </p>
              </div>
            </div>
          )}

          {isOffline && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 text-orange-600 animate-in slide-in-from-top-4 fade-in duration-300 shadow-sm max-w-md mx-auto">
              <WifiOff className="w-6 h-6 shrink-0" />
              <div className="text-left">
                <p className="font-black text-sm">
                  ขาดการเชื่อมต่ออินเทอร์เน็ต
                </p>
                <p className="text-xs font-bold opacity-80 mt-0.5">
                  โปรดตรวจสอบการเชื่อมต่อของคุณ ข้อมูลอาจไม่เป็นปัจจุบัน
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
              เลือกสาขาที่จัดการ
            </h2>
          </div>
          <p className="text-inactive font-black text-[10px] uppercase tracking-[0.4em] leading-relaxed">
            เชื่อมต่อข้อมูลและบริหารจัดการทุกสาขา{" "}
            <br className="hidden sm:block" /> อย่างมีประสิทธิภาพในที่เดียว
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-sm font-bold text-inactive uppercase tracking-widest">
              กำลังโหลดข้อมูลสาขา...
            </p>
          </div>
        ) : stores.length > 0 ? (
          <>
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 max-w-3xl mx-auto">
              {summaryData.map((item, index) => (
                <SummaryCard key={index} {...item} isDark={false} />
              ))}
            </div>

            {/* Branch Cards Slider */}
            <div className="w-full relative px-20">
              {/* Navigation Arrows - Perfectly Symmetric */}
              {stores.length > 3 && (
                <>
                  <button
                    onClick={() => handleScroll("left")}
                    className="absolute left-4 top-[45%] -translate-y-1/2 z-30 w-14 h-14 bg-white/60 backdrop-blur-2xl rounded-[22px] shadow-2xl shadow-primary/5 border border-white/80 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary hover:scale-110 active:scale-95 transition-all duration-500 group/nav"
                  >
                    <ChevronLeft
                      size={28}
                      strokeWidth={3}
                      className="group-hover/nav:-translate-x-1 transition-transform duration-500"
                    />
                  </button>
                  <button
                    onClick={() => handleScroll("right")}
                    className="absolute right-4 top-[45%] -translate-y-1/2 z-30 w-14 h-14 bg-white/60 backdrop-blur-2xl rounded-[22px] shadow-2xl shadow-primary/5 border border-white/80 flex items-center justify-center text-gray-500 hover:text-white hover:bg-primary hover:scale-110 active:scale-95 transition-all duration-500 group/nav"
                  >
                    <ChevronRight
                      size={28}
                      strokeWidth={3}
                      className="group-hover/nav:translate-x-1 transition-transform duration-500"
                    />
                  </button>
                </>
              )}

              <div
                ref={scrollRef}
                onScroll={onScroll}
                onMouseDown={startDragging}
                onMouseLeave={stopDragging}
                onMouseUp={stopDragging}
                onMouseMove={onDragging}
                className={`flex overflow-x-auto gap-10 w-full pb-14 pt-4 px-4 scroll-smooth custom-scrollbar no-scrollbar ${isDragging
                  ? "cursor-grabbing select-none"
                  : "cursor-grab snap-x snap-mandatory"
                  }`}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {stores.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex-shrink-0 w-full md:w-[calc((100%-5rem)/3)] snap-center"
                  >
                    <BranchCard
                      branchName={branch.name}
                      address={branch.address}
                      salesToday={storeStats[branch.id]?.salesToday ?? 0}
                      ordersToday={storeStats[branch.id]?.ordersToday ?? 0}
                      growth={storeStats[branch.id]?.growth ?? 0}
                      imageUrl={
                        branch.image_url ||
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                      }
                      onSelect={() => handleSelect(branch)}
                      isOpen={branch.is_active}
                      isDark={false}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination Dots - Dynamic & Centered */}
              {stores.length > 3 && (
                <div className="flex justify-center gap-3 mt-2">
                  {[...Array(Math.ceil(stores.length / 3))].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-700 ${Math.round(
                        scrollPosition /
                        (scrollRef.current?.scrollWidth /
                          (stores.length / 3)),
                      ) === i
                        ? "w-10 bg-primary shadow-lg shadow-primary/20"
                        : "w-2 bg-gray-200"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[40px] p-12 shadow-premium border border-gray-100 text-center max-w-md w-full">
            <div className="inline-flex p-5 bg-rose-50 text-rose-500 rounded-2xl mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              ไม่พบข้อมูลสาขา
            </h3>
            <p className="text-inactive font-bold text-sm leading-relaxed mb-8">
              คุณยังไม่มีสาขาที่ได้รับสิทธิ์เข้าถึง <br />
              โปรดติดต่อเจ้าของร้านเพื่อขอสิทธิ์เข้าร่วม
            </p>
          </div>
        )}
      </main>

      <footer className="py-6 text-center relative z-10">
        <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-3xl shadow-premium border border-gray-100 text-[10px] font-black uppercase tracking-widest text-inactive">
          <div className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]'}`}></div>
          <span className="text-gray-900">
            {isOffline ? "ออฟไลน์ (Offline)" : (stores.length > 0 ? "พร้อมให้บริการ (Online)" : "กรุณาเพิ่มสาขาใหม่")}
          </span>
          <span className="text-gray-200">|</span>
          <span>
            อัพเดทล่าสุด:{" "}
            {lastUpdated.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}{" "}
            น.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default BranchSelectionPage;
