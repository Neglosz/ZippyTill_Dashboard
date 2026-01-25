import React from "react";

/**
 * SummaryCard Component
 * Displays a summary statistic with an icon, title, value, and optional subtext.
 * 
 * @param {React.ReactNode} icon - The icon component to display
 * @param {string} title - The title of the card (e.g., "สาขาทั้งหมด")
 * @param {string|number} value - The main statistic value (e.g., "3 สาขา")
 * @param {string} iconBgColor - Background color for the icon container class (e.g. "bg-blue-100")
 * @param {string} iconColor - Text color for the icon class (e.g. "text-blue-600")
 */
const SummaryCard = ({ icon, title, value, subtext, iconBgColor = "bg-gray-100", iconColor = "text-gray-600" }) => {
    return (
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-transparent hover:border-[#7B5CFA]/20 transition-all duration-300 hover:shadow-md cursor-default group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 duration-300 ${iconBgColor} ${iconColor}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-gray-500 text-sm font-medium mb-1 group-hover:text-[#7B5CFA] transition-colors">{title}</span>
                <div className="flex flex-col">
                    <span className="text-[#1B2559] text-xl font-bold leading-tight">{value}</span>
                    {subtext && <span className="text-gray-400 text-xs font-medium mt-1">{subtext}</span>}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
