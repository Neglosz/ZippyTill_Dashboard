import React from 'react';
import { Users, Bell, ChevronDown } from 'lucide-react';

const Header = ({ title = "รายการค้างชำระ" }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
       <h2 className="text-2xl font-bold text-[#1B2559]">{title}</h2>
       
       <div className="flex items-center gap-6">
          <button className="relative p-2 bg-[#F4F7FE] rounded-full text-gray-400 hover:text-[#6d28d9] transition-colors">
             <Bell size={20} />
             <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 bg-white p-1 pr-2 rounded-full">
             <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <Users size={20} />
             </div>
             <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-[#1B2559] leading-tight">Admin</p>
                <p className="text-xs text-gray-400">Admin</p>
             </div>
             <ChevronDown size={16} className="text-gray-400" />
          </div>
       </div>
    </header>
  );
};

export default Header;
