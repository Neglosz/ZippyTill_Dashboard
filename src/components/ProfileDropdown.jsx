import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, Shield } from "lucide-react";

const ProfileDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_6px_10px_-7px_rgba(0,0,0,0.05)] border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Account
          </p>
          <p className="text-sm font-bold text-[#1B2559]">Admin User</p>
          <p className="text-[10px] text-gray-500 truncate">
            admin@zippytill.com
          </p>
        </div>

        <div className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#6d28d9] transition-all group">
            <User
              size={18}
              className="text-gray-400 group-hover:text-[#6d28d9]"
            />
            Profile Info
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#6d28d9] transition-all group">
            <Settings
              size={18}
              className="text-gray-400 group-hover:text-[#6d28d9]"
            />
            Settings
          </button>
        </div>

        <div className="p-2 border-t border-gray-50">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
            onClick={() => {
              console.log("Signing out...");
              navigate("/" ,{replace: true});
              onClose();
            }}
          >
            <LogOut
              size={18}
              className="text-red-400 group-hover:text-red-500"
            />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
