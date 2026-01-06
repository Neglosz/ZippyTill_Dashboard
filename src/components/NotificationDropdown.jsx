import React from "react";
import { Bell, Clock, AlertCircle } from "lucide-react";

const NotificationDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: "เกินกำหนดชำระ 7 วัน",
      message: "คุณ วินัย มานะสมชื่อ ค้างชำระ ฿250.00",
      time: "2 ชม. ที่แล้ว",
      type: "alert",
    },
    {
      id: 2,
      title: "ใกล้ถึงกำหนดชำระ",
      message: "คุณ มานี มีแชร์ ครบกำหนดวันที่ 15/11/2026",
      time: "5 ชม. ที่แล้ว",
      type: "warning",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.08)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-[#1B2559]">Notifications</h3>
          <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
            2 New
          </span>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group"
            >
              <div className="flex gap-3">
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
                <div>
                  <h4 className="text-sm font-bold text-[#1B2559] group-hover:text-[#6d28d9] transition-colors">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {notif.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 text-center border-t border-gray-50 bg-gray-50/50">
          <button className="text-xs font-bold text-[#6d28d9] hover:text-[#5b21b6]">
            View All
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
