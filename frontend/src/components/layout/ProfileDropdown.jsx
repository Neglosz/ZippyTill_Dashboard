import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, Shield, LayoutGrid } from "lucide-react";
import { authService } from "../../services/authService";
import ConfirmModal from "../modals/ConfirmModal";
import { useState } from "react";

const ProfileDropdown = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/", { replace: true });
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/", { replace: true });
      onClose();
    }
  };

  const handleSwitchStore = () => {
    navigate("/select-branch");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_6px_10px_-7px_rgba(0,0,0,0.05)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Account
          </p>
          <p className="text-sm font-bold text-[#1B2559] truncate">
            {displayName}
          </p>
          <p className="text-[10px] text-gray-500 truncate">
            {user?.email || "No email available"}
          </p>
        </div>

        <div className="p-2">
          <button
            onClick={() => {
              navigate("/dashboard/profile");
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all group"
          >
            <User
              size={18}
              className="text-gray-400 group-hover:text-primary"
            />
            Profile Info
          </button>
          <button
            onClick={handleSwitchStore}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all group"
          >
            <LayoutGrid
              size={18}
              className="text-gray-400 group-hover:text-primary"
            />
            สลับสาขา
          </button>
          <button
            onClick={() => {
              navigate("/dashboard/settings");
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary transition-all group"
          >
            <Settings
              size={18}
              className="text-gray-400 group-hover:text-primary"
            />
            Settings
          </button>
        </div>

        <div className="p-2 border-t border-gray-50">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut
              size={18}
              className="text-red-400 group-hover:text-red-500"
            />
            Sign Out
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="ออกจากระบบ"
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmText="ออกจากระบบ"
        isDestructive={true}
      />
    </>
  );
};

export default ProfileDropdown;
