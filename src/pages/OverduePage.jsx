import React, { useState } from "react";
import { Search } from "lucide-react";
import StatusModal from "../components/StatusModal";
import SummaryStats from "../components/features/outstanding/SummaryStats";
import DebtorCard from "../components/features/outstanding/DebtorCard";
import EditDebtorModal from "../components/features/outstanding/EditDebtorModal";
import { initialOverdueItems, initialPaidItems } from "../data/mockData";

const OverduePage = () => {
  const [activeTab, setActiveTab] = useState("overdue");
  const [editingItem, setEditingItem] = useState(null);

  // Modal States
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showEditSuccess, setShowEditSuccess] = useState(false);

  const [overdueItems, setOverdueItems] = useState(initialOverdueItems);
  const paidItems = initialPaidItems;

  // Derived State
  const totalOverdueAmount = overdueItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalOverdueCount = overdueItems.length;
  // Mock 'Near Due' logic: let's say overdueDays < 7 is 'Near Due'
  const recentOverdueCount = overdueItems.filter(
    (item) => item.overdueDays <= 7
  ).length;

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setOverdueItems(overdueItems.filter((item) => item.id !== deleteTargetId));
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(true);
    setDeleteTargetId(null);
  };

  const handleEditClick = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (updatedItem) => {
    setOverdueItems(
      overdueItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    setEditingItem(null);
    setShowEditSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <SummaryStats
        totalCount={totalOverdueCount}
        totalAmount={totalOverdueAmount}
        recentCount={recentOverdueCount}
      />

      {/* Tools Bar */}
      <div className="bg-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-96 bg-[#F4F7FE] rounded-full overflow-hidden">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500">
            <Search size={20} className="text-[#6d28d9]" />
          </div>
          <input
            type="text"
            placeholder="Search here..."
            className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 outline-none"
          />
        </div>

        <div className="flex bg-[#F4F7FE] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "overdue"
                ? "bg-white text-gray-700 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ค้างชำระ
          </button>
          <button
            onClick={() => setActiveTab("paid")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "paid"
                ? "bg-white text-gray-700 shadow-sm border border-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ชำระแล้ว
          </button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
