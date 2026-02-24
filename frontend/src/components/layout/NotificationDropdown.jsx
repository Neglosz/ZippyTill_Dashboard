import React from "react";
import {
  Clock,
  AlertCircle,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  ShoppingBag,
  Package,
  Settings,
  Banknote,
  CalendarClock,
} from "lucide-react";

const NotificationDropdown = ({
  isOpen,
  notifications,
  loading,
  onClose,
  onClearAll,
  onDelete,
}) => {
  const getNotificationStyle = (type) => {
    switch (type) {
      case "alert":
        return {
          bgClass: "bg-red-50",
          textClass: "text-red-500",
          icon: <AlertCircle size={16} />,
        };
      case "warning":
        return {
          bgClass: "bg-orange-50",
          textClass: "text-orange-500",
          icon: <AlertTriangle size={16} />,
        };
      case "success":
        return {
          bgClass: "bg-green-50",
          textClass: "text-green-500",
          icon: <CheckCircle size={16} />,
        };
      case "info":
        return {
          bgClass: "bg-blue-50",
          textClass: "text-blue-500",
          icon: <Info size={16} />,
        };
      case "order":
        return {
          bgClass: "bg-purple-50",
          textClass: "text-purple-500",
          icon: <ShoppingBag size={16} />,
        };
      case "stock":
        return {
          bgClass: "bg-amber-50",
          textClass: "text-amber-500",
          icon: <Package size={16} />,
        };
      case "system":
        return {
          bgClass: "bg-gray-100",
          textClass: "text-gray-500",
          icon: <Settings size={16} />,
        };
      case "overdue":
        return {
          bgClass: "bg-red-50",
          textClass: "text-red-600",
          icon: <Banknote size={16} />,
        };
      case "expiring":
        return {
          bgClass: "bg-orange-50",
          textClass: "text-orange-600",
          icon: <CalendarClock size={16} />,
        };
      default:
        return {
          bgClass: "bg-gray-50",
          textClass: "text-gray-400",
          icon: <Clock size={16} />,
        };
    }
  };

  if (!isOpen) return null;

  const getEffectiveType = (notif) => {
    let type = notif.type;
    const lowerTitle = (notif.title || "").toLowerCase();
    const lowerMsg = (notif.message || "").toLowerCase();

    // Smart detection if type is generic
    if (["alert", "warning", "info", "system"].includes(type) || !type) {
      if (
        lowerTitle.includes("overdue") ||
        lowerTitle.includes("ค้างชำระ") ||
        lowerMsg.includes("overdue") ||
        lowerMsg.includes("ค้างชำระ")
      ) {
        return "overdue";
      }
      if (
        lowerTitle.includes("expired") ||
        lowerTitle.includes("expiring") ||
        lowerTitle.includes("หมดอายุ") ||
        lowerTitle.includes("ใกล้หมดอายุ") ||
        lowerMsg.includes("expired") ||
        lowerMsg.includes("expiring") ||
        lowerMsg.includes("หมดอายุ") ||
        lowerMsg.includes("ใกล้หมดอายุ")
      ) {
        return "expiring";
      }
    }
    return type;
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-12 w-[420px] bg-white rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-[#1B2559] tracking-tight">
              การแจ้งเตือน
            </h3>
            {notifications.length > 0 && (
              <span className="text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1 rounded-full shadow-sm shadow-red-200">
                ใหม่ {notifications.length} รายการ
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-black text-inactive hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              กำลังโหลด...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              ไม่มีการแจ้งเตือน
            </div>
          ) : (
            notifications.map((notif) => {
              const effectiveType = getEffectiveType(notif);
              const style = getNotificationStyle(effectiveType);

              return (
                <div
                  key={notif.id}
                  className="p-5 hover:bg-gray-50/50 transition-all duration-300 border-b border-gray-50 last:border-0 cursor-default group relative"
                >
                  <div className="flex gap-3 pr-6">
                    <div
                      className={`mt-1 shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                        style.bgClass
                      } ${style.textClass}`}
                    >
                      {React.cloneElement(style.icon, {
                        size: 20,
                        strokeWidth: 2.5,
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-black text-[#1B2559] group-hover:text-primary transition-colors truncate tracking-tight">
                        {notif.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1.5 whitespace-pre-line leading-relaxed font-medium">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {notif.time ||
                            (notif.created_at &&
                              new Date(notif.created_at).toLocaleTimeString(
                                "th-TH",
                                { hour: "2-digit", minute: "2-digit" },
                              ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notif.id);
                    }}
                    className="absolute right-2 top-4 p-1.5 text-inactive hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="ปิด"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
