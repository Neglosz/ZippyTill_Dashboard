import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  Wallet, 
  Percent, 
  Sparkles, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'หน้าหลัก', path: '/dashboard' },
    { id: 'overdue', icon: Users, label: 'ค้างชำระ', path: '/dashboard/overdue' },
    { id: 'stock', icon: Package, label: 'คลัง', path: '/dashboard/stock' },
    { id: 'sales', icon: TrendingUp, label: 'ยอดขาย', path: '/dashboard/sales' },
    { id: 'finance', icon: Wallet, label: 'การเงิน', path: '/dashboard/finance' },
    { id: 'tax', icon: Percent, label: 'ภาษี', path: '/dashboard/tax' },
    { id: 'promo', icon: Sparkles, label: 'AI โปรโมชั่น', path: '/dashboard/ai-promo' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 h-screen">
      <div>
        <div className="p-8 pb-4">
          <h1 className="text-2xl font-bold text-[#2A2D3E]">Zippy Till</h1>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-[#6d28d9]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-white bg-[#FF5F5F] hover:bg-[#ff4f4f] rounded-xl text-sm font-medium transition-colors">
           <LogOut size={20} />
           Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
