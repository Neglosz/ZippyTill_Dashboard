import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { useBranch } from "../../contexts/BranchContext";

/**
 * Header Profile button and dropdown wrapper
 */
const HeaderProfile = ({ currentUser }) => {
  const [showProfile, setShowProfile] = useState(false);
  const { activeBranchImage } = useBranch();

  const getUserDisplayName = () => {
    if (!currentUser) return "User";
    return (
      currentUser.user_metadata?.full_name || currentUser.email.split("@")[0]
    );
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className={`flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-300 border ${
          showProfile
            ? "bg-primary text-white border-primary"
            : "bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-200"
        }`}
      >
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors duration-300 overflow-hidden ${
            showProfile
              ? "bg-white/20 text-white"
              : "bg-primary/10 text-primary"
          }`}
        >
          {activeBranchImage ? (
            <img src={activeBranchImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            getUserInitials()
          )}
        </div>
        <div className="text-left hidden md:block">
          <p
            className={`text-xs font-bold leading-none ${
              showProfile ? "text-white" : "text-gray-900"
            }`}
          >
            {getUserDisplayName()}
          </p>
          <p
            className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
              showProfile ? "text-white/70" : "text-inactive"
            }`}
          >
            {currentUser?.user_metadata?.role || "ผู้ใช้งาน"}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${
            showProfile ? "rotate-180" : ""
          }`}
        />
      </button>
      <ProfileDropdown
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={currentUser}
      />
    </div>
  );
};

export default HeaderProfile;
