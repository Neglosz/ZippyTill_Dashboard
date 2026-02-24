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
        className={`relative p-3 rounded-xl transition-all duration-300 border ${
          showNotifications
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-gray-50 text-inactive hover:text-primary hover:bg-gray-100 hover:border-gray-200"
        }`}
      >
        <Bell size={20} className={showNotifications ? "rotate-0" : ""} />
        {notifications.length > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
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
