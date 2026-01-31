import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  MoreHorizontal,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Clock,
  User,
} from "lucide-react";
import StatusModal from "../components/common/StatusModal";
import SummaryStats from "../components/features/outstanding/SummaryStats";
import EditDebtorModal from "../components/features/outstanding/EditDebtorModal";
import DebtorDetailModal from "../components/features/outstanding/DebtorDetailModal";
import ExportModal from "../components/features/outstanding/ExportModal";
import { creditService } from "../services/creditService";
import { initialPaidItems } from "../data/mockData";
import { supabase } from "../lib/supabase";

const OverduePage = () => {
  const [activeTab, setActiveTab] = useState("overdue");
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New State for Drill-down
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Modal States
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [overdueItems, setOverdueItems] = useState([]);
  const paidItems = initialPaidItems.map((item) => ({
    ...item,
    customerId: `mock-${item.id}`,
  })); // Add mock customerId

  useEffect(() => {
    fetchItems();

    // Setup Realtime Subscription
    const channel = supabase
      .channel("credit_accounts_realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, and DELETE
          schema: "public",
          table: "credit_accounts",
        },
        (payload) => {
          console.log("Database change detected:", payload);
          fetchItems(true); // Background refresh
        },
      )
      .subscribe((status) => {
        console.log("Supabase Realtime status:", status);
        if (status === "CHANNEL_ERROR") {
          console.error(
            'Failed to connect to Realtime. Please check if Realtime is enabled for "credit_accounts" table in Supabase Dashboard.',
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const data = await creditService.getOverdueItems();
      setOverdueItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
      if (!isBackground) setError("Failed to load data.");
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  // Group items by customer
  const getGroupedItems = (items) => {
    const groups = {};
    items.forEach((item) => {
      // Use customerId if available, otherwise fallback to name or a unique key
      const key = item.customerId || item.name;
      if (!groups[key]) {
        groups[key] = {
          customerId: item.customerId,
          name: item.name,
          phone: item.phone,
          items: [],
          totalAmount: 0,
          totalCount: 0,
          maxOverdueDays: 0,
        };
      }
      groups[key].items.push(item);
      groups[key].totalAmount += Number(item.amount);
      groups[key].totalCount += 1;
      groups[key].maxOverdueDays = Math.max(
        groups[key].maxOverdueDays,
        item.overdueDays || 0,
      );
    });
    return Object.values(groups);
  };

  // Derived State
  const currentList = activeTab === "overdue" ? overdueItems : paidItems;
  const groupedCustomers = getGroupedItems(currentList);

  const totalOverdueAmount = overdueItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );
  const totalOverdueCount = overdueItems.length;
  const recentOverdueCount = overdueItems.filter(
    (item) => item.overdueDays > 7,
  ).length;

  const handleEditClick = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      const result = await creditService.updateDebtor(
        updatedItem.id,
        updatedItem,
      );
      setOverdueItems(
        overdueItems.map((item) => (item.id === result.id ? result : item)),
      );

      // Also update selected customer view if active
      if (
        selectedCustomer &&
        selectedCustomer.items.some((i) => i.id === updatedItem.id)
      ) {
        // We need to re-fetch or carefully update the local state.
        // Simplest is to just update the item in the list and let the grouping logic handle it on re-render,
        // BUT 'selectedCustomer' is a separate state snapshot.
        // Let's rely on the main 'overdueItems' update and re-compute `selectedCustomer`?
        // Actually, let's just update the `selectedCustomer` items locally for immediate feedback
        setSelectedCustomer((prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === updatedItem.id ? result : i)),
          // Re-calc totals if amount changed
          totalAmount: prev.items
            .map((i) => (i.id === updatedItem.id ? result : i))
            .reduce((sum, x) => sum + Number(x.amount), 0),
        }));
      }

      setEditingItem(null);
      setShowEditSuccess(true);
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item");
    }
  };

  const getStatusBadge = (status, days) => {
    if (days > 15 || status === "เกินกำหนด") {
      return (
        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1 w-max">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          เกินกำหนด
        </span>
      );
    }
    return (
      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1 w-max">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        ค้างชำระ
      </span>
    );
  };

  // --- MAIN VIEW ---
  return (
    <div className="relative space-y-6 pb-10 min-h-screen bg-[#F3F4F6]">
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <SummaryStats
        totalCount={totalOverdueCount}
        totalAmount={totalOverdueAmount}
        recentCount={recentOverdueCount}
      />

      <div className="bg-white rounded-[40px] p-8 shadow-premium border border-gray-100 relative overflow-hidden group/container">
        {/* Edge lighting effect */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10 relative z-10">
          <div className="relative w-full lg:w-[450px] group/search">
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-inactive group-focus-within/search:text-primary transition-colors duration-300">
              <Search size={22} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาลูกค้า (ชื่อ, เบอร์โทร, อีเมล)..."
              className="w-full bg-gray-50/50 border border-gray-100 rounded-[22px] pl-14 pr-6 py-4 text-sm font-black text-gray-900 placeholder-inactive/60 focus:bg-white focus:ring-8 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all duration-300 shadow-inner-light"
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border border-gray-100 text-gray-900 rounded-[22px] font-black hover:border-primary/30 hover:shadow-premium transition-all duration-300 active:scale-95 group/export"
            >
              <Download
                size={20}
                className="text-primary group-hover:bounce transition-transform"
                strokeWidth={2.5}
              />
              <span className="text-sm tracking-tight">Export Data</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <p className="text-inactive mt-4 font-bold uppercase tracking-widest text-[10px]">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : error ? (
          <div className="text-rose-500 text-center py-20 font-bold">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-6 pt-2 font-black text-inactive text-[10px] uppercase tracking-[0.2em] pl-4">
                    ลูกค้า
                  </th>
                  <th className="pb-6 pt-2 font-black text-inactive text-[10px] uppercase tracking-[0.2em]">
                    ติดต่อ
                  </th>
                  <th className="pb-6 pt-2 font-black text-inactive text-[10px] uppercase tracking-[0.2em] text-center">
                    จำนวนบิล
                  </th>
                  <th className="pb-6 pt-2 font-black text-inactive text-[10px] uppercase tracking-[0.2em] text-right">
                    ยอดค้างชำระ
                  </th>
                  <th className="pb-6 pt-2 font-black text-inactive text-[10px] uppercase tracking-[0.2em] text-right pr-4">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groupedCustomers.map((customer, index) => (
                  <tr
                    key={customer.customerId || index}
                    className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="py-5 pl-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm group-hover:scale-105 transition-all">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}&backgroundColor=F9FAFB`}
                            alt={customer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-base tracking-tight group-hover:text-primary transition-colors">
                            {customer.name}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-inactive uppercase tracking-widest mt-1 border border-gray-200/50">
                            <User size={10} strokeWidth={3} />
                            {customer.items.length} รายการ
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2 text-inactive">
                        <Phone
                          size={14}
                          strokeWidth={2.5}
                          className="text-primary/60"
                        />
                        <span className="text-sm font-bold tracking-tight">
                          {customer.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-center">
                      <span
                        className={`inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-xl text-xs font-black border ${customer.maxOverdueDays > 15 ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-blue-50 text-blue-500 border-blue-100"}`}
                      >
                        {customer.totalCount}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <div className="font-black text-gray-900 text-xl tracking-tighter">
                        ฿{customer.totalAmount.toLocaleString()}
                      </div>
                      {customer.maxOverdueDays > 15 && (
                        <div className="text-[10px] text-rose-500 font-black uppercase tracking-wider mt-1">
                          เกินกำหนด {customer.maxOverdueDays} วัน
                        </div>
                      )}
                    </td>
                    <td className="py-5 text-right pr-4">
                      <button className="p-3 bg-white border border-gray-100 hover:border-primary/30 hover:bg-primary/5 rounded-2xl text-inactive hover:text-primary transition-all shadow-sm active:scale-95">
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={() => setShowExportModal(false)}
        onExportExcel={() => setShowExportModal(false)}
      />

      <DebtorDetailModal
        item={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={(item) => {
          setSelectedCustomer(null);
          handleEditClick(item);
        }}
      />

      <EditDebtorModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      <StatusModal
        isOpen={showEditSuccess}
        type="success"
        title="สำเร็จ"
        message="แก้ไขข้อมูลเรียบร้อย"
        confirmText="ตกลง"
        onConfirm={() => setShowEditSuccess(false)}
      />
    </div>
  );
};

export default OverduePage;
