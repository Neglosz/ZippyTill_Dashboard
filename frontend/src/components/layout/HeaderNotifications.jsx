import React, { useState } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

/**
 * Header Notifications button and dropdown wrapper
 */
const HeaderNotifications = ({
  notifications,
  loading,
  onClearAll,
  onDelete,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-3 rounded-2xl transition-all duration-500 shadow-sm border overflow-hidden group/notif ${
          showNotifications
            ? "bg-primary/10 text-primary border-primary/20 shadow-inner"
            : "bg-white hover:bg-primary/5 border-gray-100 hover:border-primary/20 hover:shadow-md active:scale-95 cursor-pointer"
        }`}
      >
        {/* Subtle glow effect on hover */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover/notif:opacity-100 transition-opacity duration-500 ${showNotifications ? "opacity-100" : ""}`} />
        
        <Bell 
          size={18} 
          strokeWidth={2.5} 
          className={`relative z-10 transition-all duration-500 ${
            showNotifications ? "text-primary scale-110" : "text-gray-500 group-hover/notif:text-primary"
          }`} 
        />
        
        {notifications.length > 0 && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white z-20 shadow-[0_0_8px_rgba(237,113,23,0.5)] animate-pulse" />
        )}
      </button>
      <NotificationDropdown
        isOpen={showNotifications}
        notifications={notifications}
        loading={loading}
        onClose={() => setShowNotifications(false)}
        onClearAll={onClearAll}
        onDelete={onDelete}
      />
    </div>
  );
};

export default HeaderNotifications;
