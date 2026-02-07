import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { useBranch } from "./../../../contexts/BranchContext";
import { productService } from "../../../services/productService";

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

  useEffect(() => {
    if (activeBranchId) {
      fetchStockMovements();
    }
  }, [activeBranchId]);

  const fetchStockMovements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch movements and notifications in parallel
      const [movements, notifications] = await Promise.all([
        productService.getStockMovements(activeBranchId),
        productService.getDashboardNotifications(activeBranchId),
      ]);

      setTransactions(movements);

      // Calculate simple summary from movements
      const out = movements
        .filter((m) => m.type === "OUT")
        .reduce((sum, m) => sum + m.qty, 0);
      const in_move = movements
        .filter((m) => m.type === "IN")
        .reduce((sum, m) => sum + m.qty, 0);

      setSummary({
        totalOut: out,
        totalIn: in_move,
        lowStockCount: notifications.lowStock?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stock report:", err);
      setError("ไม่สามารถโหลดข้อมูลรายงานสต็อกได้");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.note.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "ALL" || tx.type === selectedType;
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
        <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float transition-all duration-500">
          <div className="bg-rose-50 p-4 rounded-[22px] text-rose-500 shadow-sm group-hover:rotate-6 transition-transform border border-rose-100 shrink-0">
            <TrendingDown size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
              สินค้าขายออก (ทั้งหมด)
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {summary.totalOut}{" "}
              <span className="text-lg font-black text-inactive">รายการ</span>
            </h3>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-rose-100/50 transition-colors" />
        </div>

        {/* Total In Items (Placeholder for future) */}
        <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float transition-all duration-500">
          <div className="bg-emerald-50 p-4 rounded-[22px] text-emerald-500 shadow-sm group-hover:rotate-6 transition-transform border border-emerald-100 shrink-0">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
              สินค้านำเข้า (ทั้งหมด)
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
              {summary.totalIn}{" "}
              <span className="text-lg font-black text-inactive">รายการ</span>
            </h3>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/30 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-100/50 transition-colors" />
        </div>

        {/* Low Stock Counter */}
        <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float transition-all duration-500">
          <div className="bg-amber-50 p-4 rounded-[22px] text-amber-500 shadow-sm group-hover:rotate-6 transition-transform border border-amber-100 shrink-0">
            <AlertCircle size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
              สินค้าใกล้หมดสต็อก
            </p>
            <h3 className="text-3xl font-black tracking-tighter text-amber-600 leading-none">
              {summary.lowStockCount}{" "}
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
          {["ALL", "IN", "OUT", "ADJUST"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedType === type
                  ? "bg-white text-primary shadow-sm border border-primary/10"
                  : "text-inactive hover:text-gray-900"
              }`}
            >
              {type === "ALL" ? "ทั้งหมด" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-[40px] p-8 shadow-premium border border-gray-100 relative overflow-hidden min-h-[500px]">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 shrink-0">
              <History size={24} strokeWidth={2.5} />
            </div>
            ความเคลื่อนไหวล่าสุด
          </h2>
          <button
            onClick={fetchStockMovements}
            className="p-3 text-inactive hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-gray-50"
          >
            <History size={20} className="rotate-180" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-inactive font-black text-[10px] uppercase tracking-[0.2em]">
                <th className="pb-4 font-black">วัน/เวลา</th>
                <th className="pb-4 font-black">สินค้า</th>
                <th className="pb-4 font-black text-center">ประเภท</th>
                <th className="pb-4 font-black text-right">จำนวน</th>
                <th className="pb-4 font-black pl-8">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="text-[#1B2559]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group border-b border-gray-50 hover:bg-gray-50 transition-all duration-300"
                  >
                    <td className="py-4 px-1 first-of-type:rounded-l-[20px]">
                      <div className="font-black text-[#1B2559]">
                        {new Date(tx.created_at).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        น.
                      </div>
                      <div className="text-[10px] text-inactive font-bold mt-1 uppercase tracking-tight">
                        {new Date(tx.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                      {tx.product}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                        ${
                          tx.type === "IN"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : tx.type === "OUT"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-4 text-right font-black text-2xl tracking-tighter ${
                        tx.type === "OUT" ||
                        (tx.type === "ADJUST" && tx.qty < 0)
                          ? "text-rose-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {tx.type === "OUT" || (tx.type === "ADJUST" && tx.qty < 0)
                        ? "-"
                        : "+"}
                      {Math.abs(tx.qty).toLocaleString()}
                    </td>
                    <td className="py-4 pl-8 text-inactive font-medium text-sm italic group-hover:text-gray-600 transition-colors last-of-type:rounded-r-[20px]">
                      {tx.note}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
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
