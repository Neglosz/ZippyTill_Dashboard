import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Calendar, Clock, Package, Bell } from "lucide-react";

const SystemNotificationModal = ({ isOpen, onClose, data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !data || !mounted) return null;

  const { expired = [], expiringSoon = [], lowStock = [] } = data;
  const totalItems = expired.length + expiringSoon.length + lowStock.length;

  if (totalItems === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-gray-900 transition-colors z-10 p-1.5 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="pt-8 pb-6 px-6 text-center bg-gradient-to-b from-gray-50/50 to-transparent">
          <div className="inline-flex p-3 bg-rose-500 rounded-full text-white shadow-lg shadow-rose-200 mb-4 animate-bounce-subtle">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
            แจ้งเตือนระบบ
          </h2>
          <p className="text-[11px] font-black text-inactive uppercase tracking-[0.2em]">
            มี {totalItems} รายการที่ต้องดำเนินการ
          </p>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Expired Items */}
          <NotificationCategory
            title="สินค้าหมดอายุแล้ว"
            count={expired.length}
            icon={Calendar}
            items={expired}
            color="rose"
          />

          {/* Expiring Soon Items */}
          <NotificationCategory
            title="ใกล้หมดอายุ (30 วัน)"
            count={expiringSoon.length}
            icon={Clock}
            items={expiringSoon}
            color="amber"
          />

          {/* Low Stock Items */}
          <NotificationCategory
            title="สต็อกใกล้หมด"
            count={lowStock.length}
            icon={Package}
            items={lowStock}
            color="blue"
          />
        </div>

        {/* Footer/Action */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button
            onClick={onClose}
            className="px-10 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px]"
          >
            รับทราบและดำเนินการ
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const NotificationCategory = ({ title, count, icon: Icon, items, color }) => {
  const colorMap = {
    rose: {
      bg: "bg-rose-50/50",
      border: "border-rose-100/50",
      text: "text-rose-600",
      iconBg: "bg-rose-500",
      tag: "bg-rose-600",
      tagLabel: "หมดอายุแล้ว",
    },
    amber: {
      bg: "bg-amber-50/50",
      border: "border-amber-100/50",
      text: "text-amber-600",
      iconBg: "bg-amber-500",
      tag: "bg-amber-500",
      tagLabel: "อีก",
    },
    blue: {
      bg: "bg-blue-50/50",
      border: "border-blue-100/50",
      text: "text-blue-600",
      iconBg: "bg-blue-500",
      tag: "bg-blue-500",
      tagLabel: "เหลือ",
    },
  };

  const theme = colorMap[color];

  return (
    <div
      className={`${theme.bg} rounded-[24px] p-5 border ${theme.border} flex flex-col h-full overflow-hidden`}
    >
      <div className="flex items-center gap-2.5 mb-4 shrink-0">
        <div className={`${theme.iconBg} text-white p-2 rounded-xl shadow-sm`}>
          <Icon size={16} />
        </div>
        <h3
          className={`text-[13px] font-black ${theme.text} leading-tight tracking-tight`}
        >
          {title} ({count})
        </h3>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100/50"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-[12px] font-bold text-gray-800 leading-tight flex-1">
                  {item.name}
                </p>
                <span
                  className={`${theme.tag} text-[8px] font-black text-white px-2 py-0.5 rounded-lg whitespace-nowrap uppercase tracking-wider flex-shrink-0`}
                >
                  {theme.tagLabel}{" "}
                  {color === "blue"
                    ? `${item.qty} ${item.unit || "ชิ้น"}`
                    : `${item.days} ว.`}
                </span>
              </div>
              {color !== "blue" && (
                <p className="text-[9px] font-bold text-inactive tracking-widest uppercase opacity-70">
                  EXP: {item.expiryDate}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 opacity-30">
            <Bell size={18} className="text-gray-400 mb-1.5" />
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              ไม่มีข้อมูล
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemNotificationModal;
