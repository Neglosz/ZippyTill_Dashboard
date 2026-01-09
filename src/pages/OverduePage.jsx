import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import StatusModal from "../components/StatusModal";
import SummaryStats from "../components/features/outstanding/SummaryStats";
import DebtorCard from "../components/features/outstanding/DebtorCard";
import EditDebtorModal from "../components/features/outstanding/EditDebtorModal";
import ExportModal from "../components/features/outstanding/ExportModal";
import { creditService } from "../services/creditService";
import { initialPaidItems } from "../data/mockData"; // Keep paid items mocked for now

const OverduePage = () => {
  const [activeTab, setActiveTab] = useState("overdue");
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [overdueItems, setOverdueItems] = useState([]);
  const paidItems = initialPaidItems;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await creditService.getOverdueItems();
      setOverdueItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
      // Fallback to empty or specific error handling
      setError("Failed to load data. Please check connection.");
      setError(
        "Failed to load data. Please check Supabase tables (credit_sales, customers)."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Derived State
  const totalOverdueAmount = overdueItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const totalOverdueCount = overdueItems.length;
  // Mock 'Near Due' logic
  const recentOverdueCount = overdueItems.filter(
    (item) => item.overdueDays <= 7
  ).length;

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await creditService.deleteDebtor(deleteTargetId);
      setOverdueItems(
        overdueItems.filter((item) => item.id !== deleteTargetId)
      );
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
      setShowDeleteConfirm(false);
    }
  };

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
      setEditingItem(null);
      setShowEditSuccess(true);
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item");
    }
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF Export logic
    console.log("Exporting PDF...");
    setShowExportModal(false);
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel Export logic
    console.log("Exporting Excel...");
    setShowExportModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <SummaryStats
        totalCount={totalOverdueCount}
        totalAmount={totalOverdueAmount}
        recentCount={recentOverdueCount}
      />

      {/* Tools Bar */}
      {/* Tools Bar */}
      {/* Tools Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาลูกหนี้..."
            className="w-full bg-white border border-gray-100 rounded-[20px] pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 outline-none shadow-sm transition-all hover:shadow-md"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab("overdue")}
              className={`px-6 py-2 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === "overdue"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              ค้างชำระ
            </button>
            <button
              onClick={() => setActiveTab("paid")}
              className={`px-6 py-2 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === "paid"
                  ? "bg-teal-50 text-teal-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              ประวัติการชำระ
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-[20px] border border-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95"
          >
            <Download size={18} className="text-indigo-600" />
            Export
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 border border-red-100">
          {error}
        </div>
      )}

      {/* Main List Area */}
      <div className="bg-white rounded-[24px] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 p-4 min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {activeTab === "overdue"
            ? overdueItems.map((item) => (
                <DebtorCard
                  key={item.id}
                  item={item}
                  type="overdue"
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                />
              ))
            : paidItems.map((item) => (
                <DebtorCard key={item.id} item={item} type="paid" />
              ))}
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      {/* Edit Modal */}
      <EditDebtorModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      {/* Status Modals */}
      <StatusModal
        isOpen={showDeleteConfirm}
        type="delete"
        title="Delete"
        message="ลบข้อมูล"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <StatusModal
        isOpen={showDeleteSuccess}
        type="success"
        title="SUCCESS"
        message="ลบข้อมูลเรียบร้อย"
        confirmText="Continue"
        onConfirm={() => setShowDeleteSuccess(false)}
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
