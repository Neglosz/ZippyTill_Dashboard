import React from "react";
import { Store } from "lucide-react";

/**
 * Reusable UI component to display the currently active branch.
 * @param {Object} props
 * @param {string} props.branchName - The name of the active branch
 */
const BranchIndicator = ({ branchName }) => {
  if (!branchName) return null;

  return (
    <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-orange-50/50 border border-orange-100/80 rounded-xl shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-inner border border-orange-100/50 text-primary">
        <Store size={16} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-0.5">
          สาขาปัจจุบัน
        </p>
        <p className="text-sm font-black text-gray-800 leading-none">
          {branchName}
        </p>
      </div>
    </div>
  );
};

export default BranchIndicator;
