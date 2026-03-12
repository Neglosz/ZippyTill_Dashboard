import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  TrendingDown,
  TrendingUp,
  History,
  ShoppingBasket,
} from "lucide-react";
import { useBranch } from "./../../../contexts/BranchContext";
import { productService } from "../../../services/productService";
import { supabase } from "../../../lib/supabase";

const StockReportPage = () => {
  const { activeBranchId } = useBranch();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL"); // ALL, IN, OUT, ADJUST
  const [summary, setSummary] = useState({
    totalOut: 0,
    totalIn: 0,
    lowStockCount: 0,
  });

  const fetchStockMovements = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);

      // Fetch movements and notifications in parallel
      const [response, notifications] = await Promise.all([
        productService.getStockMovements(activeBranchId),
        productService.getDashboardNotifications(activeBranchId),
      ]);

      // Use pre-calculated movements and summary from backend
      setTransactions(response.movements || []);

      setSummary({
        totalOut: response.summary?.totalOut || 0,
        totalIn: response.summary?.totalIn || 0,
        lowStockCount: notifications.lowStock?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stock report:", err);
      setError("ไม่สามารถโหลดข้อมูลรายงานสต็อกได้");
    } finally {
      setIsLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (activeBranchId) {
      setTransactions([]); // reset ก่อนเสมอ
      setSummary({ totalOut: 0, totalIn: 0, lowStockCount: 0 });
      fetchStockMovements(true); // Initial load with spinner

      // TC007: Real-time synchronization for Stock Movements
      const movementsChannel = supabase
        .channel(`stock_movements_${activeBranchId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "inventory_transactions",
            filter: `store_id=eq.${activeBranchId}`,
          },
          () => {
            fetchStockMovements(false); // Silent update for realtime
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `store_id=eq.${activeBranchId}`,
          },
          () => {
            fetchStockMovements(false); // Silent update for realtime
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(movementsChannel);
      };
    }
  }, [activeBranchId, fetchStockMovements]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .map((tx) => ({
        ...tx,
        displayType: tx.type,
      }))
      .filter((tx) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          (tx.product && tx.product.toLowerCase().includes(searchLower)) ||
          (tx.note && tx.note.toLowerCase().includes(searchLower));
        const matchesType =
          selectedType === "ALL" || tx.displayType === selectedType;
        return matchesSearch && matchesType;
      });
  }, [transactions, searchQuery, selectedType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-black text-inactive uppercase tracking-widest animate-pulse">
            กำลังเตรียมข้อมูลรายงาน...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Out Items */}
        <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float transition-all duration-500 h-full">
          <div className="bg-rose-50 p-4 rounded-[22px] text-rose-500 shadow-sm group-hover:rotate-6 transition-transform border border-rose-100 shrink-0">
            <TrendingDown size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
              สินค้าขายออก (ทั้งหมด)
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {summary.totalOut.toLocaleString()}{" "}
              <span className="text-lg font-black text-inactive">รายการ</span>
            </h3>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-rose-100/50 transition-colors" />
        </div>

        {/* Total In Items */}
        <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float transition-all duration-500 h-full">
          <div className="bg-emerald-50 p-4 rounded-[22px] text-emerald-500 shadow-sm group-hover:rotate-6 transition-transform border border-emerald-100 shrink-0">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
              สินค้านำเข้า (ทั้งหมด)
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {summary.totalIn.toLocaleString()}{" "}
              <span className="text-lg font-black text-inactive">รายการ</span>
            </h3>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-100/50 transition-colors" />
        </div>

        {/* Low Stock Counter */}
        <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float transition-all duration-500 h-full">
          <div className="bg-amber-50 p-4 rounded-[22px] text-amber-500 shadow-sm group-hover:rotate-6 transition-transform border border-amber-100 shrink-0">
            <AlertCircle size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
              สินค้าใกล้หมดสต็อก
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-amber-600 leading-none">
              {summary.lowStockCount.toLocaleString()}{" "}
              <span className="text-lg font-black text-inactive">รายการ</span>
            </h3>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-amber-100/50 transition-colors" />
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="bg-white rounded-[24px] p-4 shadow-premium flex flex-col lg:flex-row gap-4 justify-between items-center border border-gray-100">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-[320px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-inactive"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาตามสินค้าหรือหมายเหตุ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-inactive"
            />
          </div>
        </div>

        <div className="flex gap-2 bg-gray-50/50 p-1 rounded-2xl border border-gray-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {["ALL", "IN", "OUT"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === type
                ? "bg-white text-primary shadow-sm border border-primary/10"
                : "text-inactive hover:text-gray-900"
                }`}
            >
              {type === "ALL"
                ? "ทั้งหมด"
                : type === "IN"
                  ? "นำเข้า"
                  : "นำออก"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[40px] p-8 shadow-premium border border-gray-100 relative overflow-hidden min-h-[500px]">
        <div className="mb-10">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shrink-0">
              <History size={24} strokeWidth={2.5} />
            </div>
            รายการเคลื่อนไหวสต็อก
          </h2>
        </div>

        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full text-left border-separate border-spacing-y-4 table-fixed min-w-[900px]">
            <thead>
              <tr className="text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                <th className="pb-4 px-4 font-black w-[140px] text-center">วัน/เวลา</th>
                <th className="pb-4 px-4 font-black w-[110px] text-center">รูป</th>
                <th className="pb-4 pl-24 pr-4 font-black w-[300px] text-left">สินค้า</th>
                <th className="pb-4 px-4 font-black text-center w-[120px]">ประเภท</th>
                <th className="pb-4 px-4 font-black text-center w-[140px]">จำนวน</th>
                <th className="pb-4 px-4 font-black text-center w-[200px]">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="text-[#1B2559]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group border-b border-gray-50 hover:bg-gray-50 transition-all duration-300"
                  >
                    <td className="py-4 px-4 first-of-type:rounded-l-[20px] align-middle text-center">
                      <div className="flex flex-col items-center">
                        <div className="font-black text-[#1B2559] whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          น.
                        </div>
                        <div className="text-[10px] text-inactive font-bold mt-1 uppercase tracking-tight whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle text-center">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-md flex items-center justify-center">
                          {tx.imageUrl ? (
                            <img
                              src={tx.imageUrl}
                              alt={tx.product}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`items-center justify-center w-full h-full text-gray-300 ${tx.imageUrl ? "hidden" : "flex"
                              }`}
                          >
                            <Package size={32} strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pl-24 pr-4 align-middle">
                      <div className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-1" title={tx.product}>
                        {tx.product}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center align-middle">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap
                        ${tx.displayType === "IN"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                      >
                        {tx.displayType === "IN" ? "นำเข้า" : "นำออก"}
                      </span>
                    </td>
                    <td
                      className={`py-4 px-4 text-center font-black text-2xl tracking-tighter align-middle whitespace-nowrap ${tx.displayType === "OUT"
                        ? "text-rose-500"
                        : "text-emerald-500"
                        }`}
                    >
                      {tx.displayType === "OUT" ? "-" : ""}
                      {tx.qty.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center text-inactive font-medium text-sm group-hover:text-gray-600 transition-colors last-of-type:rounded-r-[20px] align-middle">
                      <div className="line-clamp-1" title={tx.note}>
                        {tx.note}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Package size={64} strokeWidth={1} />
                      <p className="text-xl font-black uppercase tracking-widest">
                        ไม่พบข้อมูลความเคลื่อนไหว
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockReportPage;
