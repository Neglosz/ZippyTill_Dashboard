import React from "react";
import { Clock, AlertCircle, X, Trash2 } from "lucide-react";

const NotificationDropdown = ({
  isOpen,
  notifications,
  loading,
  onClose,
  onClearAll,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.08)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#1B2559]">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full">
                {notifications.length} New
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-black text-inactive hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-default group relative"
              >
                <div className="flex gap-3 pr-6">
                  <div
                    className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === "alert"
                        ? "bg-red-50 text-red-500"
                        : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    {notif.type === "alert" ? (
                      <AlertCircle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#1B2559] group-hover:text-primary transition-colors truncate">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
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
                  title="Dismiss"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
