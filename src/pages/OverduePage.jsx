import React, { useState, useEffect } from "react";
import { Search, Download, Eye, MoreHorizontal, ArrowLeft, Phone, Mail, Calendar, CreditCard, Clock, User } from "lucide-react";
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
  const paidItems = initialPaidItems.map(item => ({ ...item, customerId: `mock-${item.id}` })); // Add mock customerId

  useEffect(() => {
    fetchItems();

    // Setup Realtime Subscription
    const channel = supabase
      .channel('credit_accounts_realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'credit_accounts'
        },
        (payload) => {
          console.log('Database change detected:', payload);
          fetchItems(true); // Background refresh
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime status:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to connect to Realtime. Please check if Realtime is enabled for "credit_accounts" table in Supabase Dashboard.');
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
    items.forEach(item => {
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
          maxOverdueDays: 0
        };
      }
      groups[key].items.push(item);
      groups[key].totalAmount += Number(item.amount);
      groups[key].totalCount += 1;
      groups[key].maxOverdueDays = Math.max(groups[key].maxOverdueDays, item.overdueDays || 0);
    });
    return Object.values(groups);
  };

  // Derived State
  const currentList = activeTab === "overdue" ? overdueItems : paidItems;
  const groupedCustomers = getGroupedItems(currentList);

  const totalOverdueAmount = overdueItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalOverdueCount = overdueItems.length;
  const recentOverdueCount = overdueItems.filter(
    (item) => item.overdueDays > 7
  ).length;

  const handleEditClick = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      const result = await creditService.updateDebtor(
        updatedItem.id,
        updatedItem
      );
      setOverdueItems(
        overdueItems.map((item) => (item.id === result.id ? result : item))
      );

      // Also update selected customer view if active
      if (selectedCustomer && selectedCustomer.items.some(i => i.id === updatedItem.id)) {
        // We need to re-fetch or carefully update the local state. 
        // Simplest is to just update the item in the list and let the grouping logic handle it on re-render,
        // BUT 'selectedCustomer' is a separate state snapshot. 
        // Let's rely on the main 'overdueItems' update and re-compute `selectedCustomer`?
        // Actually, let's just update the `selectedCustomer` items locally for immediate feedback
        setSelectedCustomer(prev => ({
          ...prev,
          items: prev.items.map(i => i.id === updatedItem.id ? result : i),
          // Re-calc totals if amount changed
          totalAmount: prev.items.map(i => i.id === updatedItem.id ? result : i).reduce((sum, x) => sum + Number(x.amount), 0)
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
    <div className="space-y-6">
      <SummaryStats
        totalCount={totalOverdueCount}
        totalAmount={totalOverdueAmount}
        recentCount={recentOverdueCount}
      />

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาลูกค้า (ชื่อ, เบอร์โทร, อีเมล)..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            {/* Tabs? */}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 pt-2 font-semibold text-gray-500 text-sm pl-4">ลูกค้า</th>
                  <th className="pb-4 pt-2 font-semibold text-gray-500 text-sm">ติดต่อ</th>
                  <th className="pb-4 pt-2 font-semibold text-gray-500 text-sm text-center">รายการค้าง</th>
                  <th className="pb-4 pt-2 font-semibold text-gray-500 text-sm text-right">ยอดรวม</th>
                  <th className="pb-4 pt-2 font-semibold text-gray-500 text-sm text-right pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groupedCustomers.map((customer, index) => (
                  <tr
                    key={customer.customerId || index}
                    className="hover:bg-gray-50/80 transition-all cursor-pointer group"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-indigo-100 transition-all">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt={customer.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{customer.name}</p>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 mt-0.5">
                            <User size={10} />
                            {customer.items.length} รายการ
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[30px] h-[30px] rounded-full text-sm font-bold ${customer.maxOverdueDays > 15 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {customer.totalCount}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-extrabold text-gray-900 text-lg">
                        ฿{customer.totalAmount.toLocaleString()}
                      </span>
                      {customer.maxOverdueDays > 15 && (
                        <div className="text-xs text-red-500 font-medium mt-0.5">เกินกำหนด {customer.maxOverdueDays} วัน</div>
                      )}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                        <Eye size={20} />
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
        title="SUCCESS"
        message="แก้ไขข้อมูลเรียบร้อย"
        confirmText="Continue"
        onConfirm={() => setShowEditSuccess(false)}
      />
    </div>
  );
};

export default OverduePage;
