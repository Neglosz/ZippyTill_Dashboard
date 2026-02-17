import React from "react";
import { X, AlertTriangle, Calendar, Clock, Package, Bell } from "lucide-react";

const SystemNotificationModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const { expired = [], expiringSoon = [], lowStock = [] } = data;
  const totalItems = expired.length + expiringSoon.length + lowStock.length;

  if (totalItems === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-900 transition-colors z-10 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Header Section */}
        <div className="pt-12 pb-8 px-8 text-center bg-gradient-to-b from-gray-50/50 to-transparent">
          <div className="inline-flex p-4 bg-rose-500 rounded-full text-white shadow-lg shadow-rose-200 mb-6 animate-bounce-subtle">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            แจ้งเตือนระบบ
          </h2>
          <p className="text-sm font-bold text-inactive uppercase tracking-widest">
            มี {totalItems} รายการที่ต้องดำเนินการ
          </p>
        </div>

        {/* Content Section */}
        <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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
            title="ใกล้หมดอายุภายใน 7 วัน"
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
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-widest text-[11px]"
          >
            รับทราบและดำเนินการ
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationCategory = ({ title, count, icon: Icon, items, color }) => {
  const colorMap = {
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-600",
      iconBg: "bg-rose-500",
      tag: "bg-rose-600",
      tagLabel: "หมดอายุไปแล้ว",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-600",
      iconBg: "bg-amber-500",
      tag: "bg-amber-500",
      tagLabel: "เหลืออีก",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
      iconBg: "bg-blue-500",
      tag: "bg-blue-500",
      tagLabel: "เหลืออีก",
    },
  };

  const theme = colorMap[color];

  return (
    <div
      className={`${theme.bg} rounded-[32px] p-6 border ${theme.border} flex flex-col h-full overflow-hidden`}
    >
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div
          className={`${theme.iconBg} text-white p-2.5 rounded-2xl shadow-sm`}
        >
          <Icon size={20} />
        </div>
        <h3
          className={`text-sm font-black ${theme.text} leading-tight break-words`}
        >
          {title} ({count} รายการ)
        </h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/50"
            >
              <div className="flex justify-between items-center gap-4 mb-3">
                <p className="text-sm font-bold text-gray-800 leading-relaxed flex-1">
                  {item.name}
                </p>
                <span
                  className={`${theme.tag} text-[9px] font-black text-white px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wide flex-shrink-0`}
                >
                  {theme.tagLabel} {item.days}{" "}
                  {item.days !== undefined ? "วัน" : ""}
                </span>
              </div>
              <p className="text-[11px] font-bold text-inactive tracking-wide">
                วันหมดอายุ : {item.expiryDate}
              </p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Bell size={24} className="text-gray-400 mb-2" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              ไม่มีข้อมูล
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemNotificationModal;
