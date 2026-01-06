import React from "react";
import {
  FileText,
  Banknote,
  Phone,
  Calendar,
  PenLine,
  Trash2,
  DollarSign,
  CheckCircle,
} from "lucide-react";

const DebtorCard = ({ item, type = "overdue", onEdit, onDelete }) => {
  const isOverdue = type === "overdue";

  return (
    <div
      className={`bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col justify-between h-full group relative overflow-hidden ${
        !isOverdue ? "opacity-80 hover:opacity-100" : ""
      }`}
    >
      {/* Decorative top accent */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          isOverdue
            ? "bg-gradient-to-r from-red-400 to-red-500"
            : "bg-gradient-to-r from-teal-400 to-teal-500"
        }`}
      ></div>

      <div>
        {/* Header: Name & Status */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3
              className={`text-lg font-bold text-[#1B2559] mb-1.5 transition-colors ${
                isOverdue
                  ? "group-hover:text-[#6d28d9]"
                  : "group-hover:text-teal-600"
              }`}
            >
              {item.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-500">
              <div className="p-1.5 rounded-full bg-gray-50 text-gray-400">
                <Phone size={12} />
              </div>
              <span className="text-sm font-semibold tracking-wide text-gray-600 font-mono">
                {item.phone}
              </span>
            </div>
          </div>
          {isOverdue ? (
            <div className="rounded-full bg-red-50 pr-3 pl-2 py-1 border border-red-100 flex items-center gap-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                {item.status}
              </span>
            </div>
          ) : (
            <div className="rounded-full bg-teal-50 px-3 py-1 border border-teal-100 flex items-center gap-1.5 shadow-sm">
              <CheckCircle size={12} className="text-teal-500" />
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                ชำระแล้ว
              </span>
            </div>
          )}
        </div>

        {/* Content: Amounts */}
        <div
          className={`${
            isOverdue
              ? "bg-gradient-to-br from-gray-50 to-white border-gray-100"
              : "bg-teal-50/30 border-teal-50"
          } rounded-2xl p-5 mb-5 border shadow-inner`}
        >
          <div
            className={`flex justify-between items-end mb-4 pb-4 border-b border-dashed ${
              isOverdue ? "border-gray-200" : "border-teal-100/50"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                {isOverdue ? "ยอดคงเหลือ" : "ยอดที่ชำระ"}
              </span>
              <span
                className={`text-2xl font-black tracking-tight ${
                  isOverdue ? "text-[#1B2559]" : "text-teal-700"
                }`}
              >
                <span className="text-lg mr-1 opacity-60">฿</span>
                {Math.floor(parseFloat(item.amount)).toLocaleString()}
                {isOverdue && (
                  <span className="text-lg text-gray-400 font-medium">
                    .{(item.amount % 1).toFixed(2).substring(2)}
                  </span>
                )}
              </span>
            </div>
            <div
              className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 ${
                isOverdue ? "text-[#6d28d9]" : "text-teal-500"
              }`}
            >
              {isOverdue ? <DollarSign size={20} /> : <Banknote size={20} />}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">
                {isOverdue
                  ? `ครบกำหนด ${item.dueDate}`
                  : `วันที่ชำระ ${item.paidDate}`}
              </span>
            </div>
            {isOverdue && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100/50">
                เกิน {item.overdueDays} วัน
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-3 mt-auto">
        {isOverdue ? (
          <button
            onClick={() => onEdit && onEdit(item)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-semibold shadow-sm"
          >
            <PenLine size={16} />
            แก้ไข
          </button>
        ) : (
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all text-sm font-semibold border border-teal-100">
            <FileText size={16} />
            ดูใบเสร็จ
          </button>
        )}
      </div>
    </div>
  );
};

export default DebtorCard;
