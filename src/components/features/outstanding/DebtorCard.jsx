import React from "react";
import { Phone, Calendar, PenLine } from "lucide-react";

// Helper for date formatting (DD/MM/YYYY)
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const DebtorCard = ({ item, type = "overdue", onEdit, onDelete }) => {
  const isOverdue = type === "overdue";

  // Matching the existing UI theme (Indigo/Amber/Rose + Clean design)
  if (isOverdue) {
    return (
      <div className="group bg-white rounded-[24px] p-5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
        {/* Header: Name & Status */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-[#1B2559] line-clamp-1">
            {item.name}
          </h3>
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
            {item.status}
          </span>
        </div>

        {/* Phone & Date Info */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Phone size={16} />
            </div>
            <span className="text-sm font-semibold text-gray-700 font-mono">
              {item.phone}
            </span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Left: Debt Amount (Amber theme to match summary) */}
          <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/50">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                ยอดค้างชำระ
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#1B2559] tracking-tight">
              ฿
              {parseFloat(item.amount || 0).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Right: Due Date (Indigo theme) */}
          <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={12} className="text-indigo-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                ครบกำหนด
              </span>
            </div>
            <div className="text-base font-extrabold text-[#1B2559] mt-1">
              {formatDate(item.dueDate)}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onEdit && onEdit(item)}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-indigo-100"
        >
          <PenLine size={16} />
          แก้ไข
        </button>
      </div>
    );
  }

  // Fallback for 'paid' type
  return (
    <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-[#1B2559]">{item.name}</h3>
        <span className="text-teal-600 font-semibold text-xs bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          ✓ ชำระแล้ว
        </span>
      </div>
      <div className="text-sm text-gray-600 font-medium">
        ยอดชำระ:{" "}
        <span className="text-[#1B2559] font-bold">
          ฿{(item.totalAmount || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default DebtorCard;
