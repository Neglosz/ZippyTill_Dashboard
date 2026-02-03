import React from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Store,
  MoreVertical,
  BarChart3,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

// Mock Data for the Dashboard
const SALES_METRICS = [
  {
    label: "ยอดขายทั้งหมด",
    value: "฿1,000",
    change: "+8%",
    color: "text-rose-500",
    bg: "bg-rose-50",
    icon: FileText,
  },
  {
    label: "ออเดอร์ทั้งหมด",
    value: "300",
    change: "+5%",
    color: "text-amber-500",
    bg: "bg-amber-50",
    icon: ShoppingCart,
  },
  {
    label: "สินค้าขายออก",
    value: "5",
    change: "+1.2%",
    color: "text-green-500",
    bg: "bg-green-50",
    icon: Package,
  },
];

const BEST_SELLERS = [
  { name: "เลย์", popularity: 80, sales: 45 },
  { name: "มาม่า", popularity: 60, sales: 29 },
  { name: "สบู่", popularity: 40, sales: 18 },
  { name: "ข้าวสาร", popularity: 50, sales: 25 },
];

const RECENT_SALES = [
  {
    id: "12345",
    time: "12-09-2025 13.23 น.",
    type: "เงินสด",
    total: "฿ 320",
    status: "ได้รับแล้ว",
    statusColor: "bg-green-500",
  },
  {
    id: "12344",
    time: "12-09-2025 13.23 น.",
    type: "PromptPay",
    total: "฿ 590",
    status: "รอ",
    statusColor: "bg-amber-500",
  },
  {
    id: "12343",
    time: "12-09-2025 13.23 น.",
    type: "ค้างชำระ",
    total: "฿ 799",
    status: "ยกเลิก",
    statusColor: "bg-rose-500",
  },
];

const EXPIRING_PRODUCTS = [
  {
    name: "เลย์",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/lays_pack_1768246959348.png",
  },
  {
    name: "เบียร์",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/beer_bottle_1768246984098.png",
  },
  {
    name: "น้ำมัน",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/oil_bottle_1768247002269.png",
  },
  {
    name: "ข้าวสาร",
    expiry: "EXP 12-12-2025",
    time: "18:30:10",
    image: "/rice_bag_1768247025415.png",
  },
  {
    name: "น้ำปลา",
    expiry: "EXP 15-12-2025",
    time: "12:00:00",
    image:
      "https://api.dicebear.com/7.x/icons/svg?seed=fishsauce&backgroundColor=ffdfbf",
  },
  {
    name: "ซอสหอย",
    expiry: "EXP 20-12-2025",
    time: "09:45:00",
    image:
      "https://api.dicebear.com/7.x/icons/svg?seed=oyster&backgroundColor=c0cbdc",
  },
  {
    name: "วุ้นเส้น",
    expiry: "EXP 25-12-2025",
    time: "16:20:30",
    image:
      "https://api.dicebear.com/7.x/icons/svg?seed=noodle&backgroundColor=d1d4f9",
  },
  {
    name: "ปลากระป๋อง",
    expiry: "EXP 30-12-2025",
    time: "10:15:45",
    image:
      "https://api.dicebear.com/7.x/icons/svg?seed=cannedfish&backgroundColor=ffd5dc",
  },
  {
    name: "กาแฟ",
    expiry: "EXP 01-01-2026",
    time: "08:00:00",
    image:
      "https://api.dicebear.com/7.x/icons/svg?seed=coffee&backgroundColor=c0aede",
  },
];

const DashboardPage = () => {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex flex-col xl:flex-row gap-8 pb-8 min-h-screen">
      {/* Background - Minimalist clean background already set in layout */}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <LayoutDashboard
                className="w-10 h-10 text-primary"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                แดชบอร์ด
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                ภาพรวมธุรกิจและข้อมูลสำคัญทั้งหมดในที่เดียว
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Sales Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {SALES_METRICS.map((item, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-3xl p-6 border border-gray-100/50 shadow-elevation transition-all duration-300 group cursor-default hover:shadow-elevation-hover hover:-translate-y-0.5`}
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    idx === 0
                      ? "bg-rose-50 text-rose-500"
                      : idx === 1
                        ? "bg-amber-50 text-amber-500"
                        : "bg-emerald-50 text-emerald-500"
                  }`}
                >
                  <item.icon size={24} strokeWidth={2} />
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                    idx === 0
                      ? "bg-rose-50/50 text-rose-500 border-rose-100"
                      : idx === 1
                        ? "bg-amber-50/50 text-amber-500 border-amber-100"
                        : "bg-emerald-50/50 text-emerald-500 border-emerald-100"
                  }`}
                >
                  <TrendingUp size={12} strokeWidth={2} /> {item.change}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {item.value}
                </p>
                <p className="text-[10px] font-semibold text-inactive uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Best Sellers & Recent Sales */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 bg-white rounded-3xl p-8 border border-gray-100/50 shadow-elevation relative group/card hover:shadow-elevation-hover hover:-translate-y-0.5 transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-8 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Package size={20} strokeWidth={2} />
              </div>
              Best Sellers
            </h3>
            <div className="space-y-6">
              {BEST_SELLERS.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 group/item cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-gray-300 w-5">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1.5">
                      <p className="text-sm font-bold text-gray-800 transition-colors tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-semibold text-inactive uppercase tracking-wide">
                        {item.sales} sold
                      </p>
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden border border-gray-100/50 shadow-inner relative">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          idx === 0
                            ? "bg-primary"
                            : idx === 1
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                        style={{ width: `${item.popularity}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-7 bg-white rounded-3xl p-8 border border-gray-100/50 shadow-elevation relative group/table hover:shadow-elevation-hover hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                  <ShoppingCart size={20} strokeWidth={2} />
                </div>
                Recent Sales
              </h3>
              <button className="px-4 py-1.5 rounded-xl bg-gray-50 text-[10px] font-semibold text-inactive uppercase tracking-wide hover:bg-gray-100 transition-colors">
                View All
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <tbody>
                  {RECENT_SALES.map((sale, idx) => (
                    <tr key={idx} className="group/row cursor-pointer">
                      <td className="py-2 pr-4 pl-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 group-hover/row:text-primary transition-colors">
                            #{sale.id}
                          </span>
                          <span className="text-[10px] font-semibold text-inactive uppercase tracking-wide opacity-80">
                            {sale.time.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <span className="px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-gray-50 text-gray-500 border border-transparent group-hover/row:border-gray-200 transition-all">
                          {sale.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-base font-bold text-gray-900 tracking-tight">
                          {sale.total}
                        </span>
                      </td>
                      <td className="py-2 pl-4 text-right">
                        <div className="flex items-center justify-end">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${sale.statusColor}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expiring Products section with High Dimension */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100/50 shadow-elevation relative group/section hover:shadow-elevation-hover hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500 flex items-center justify-center">
                <Package size={20} strokeWidth={2} />
              </div>
              Expiring Soon
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 bg-gray-50 rounded-xl text-inactive hover:text-primary hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 bg-gray-50 rounded-xl text-inactive hover:text-primary hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1"
          >
            {EXPIRING_PRODUCTS.map((prod, idx) => (
              <div
                key={idx}
                className="flex-none w-[180px] bg-white rounded-2xl p-5 border border-gray-100/50 shadow-soft hover:shadow-elevation hover:-translate-y-0.5 transition-all duration-300 cursor-pointer snap-start flex flex-col items-center text-center group/card"
              >
                <div className="relative mb-4 h-28 w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100/50 overflow-hidden shadow-inner">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="h-20 w-auto object-contain transition-transform duration-500 ease-out z-10"
                  />
                  <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-2 truncate w-full">
                  {prod.name}
                </h4>
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 uppercase tracking-wider">
                    {prod.expiry.split(" ")[1]}
                  </p>
                  <p className="text-[10px] font-semibold text-inactive uppercase tracking-wide opacity-80">
                    {prod.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Optimized Width */}
      <div className="xl:w-[280px] w-full space-y-4 shrink-0">
        {/* Branch Summary Section */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100/50 shadow-elevation text-center relative group/branch hover:shadow-elevation-hover hover:-translate-y-0.5 transition-all duration-300">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 relative overflow-hidden">
              <div className="w-full h-full rounded-xl bg-primary/5 flex items-center justify-center text-primary relative z-10">
                <Store size={40} strokeWidth={1.5} />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 px-3 bg-emerald-500 border-2 border-white rounded-lg flex items-center justify-center z-20 shadow-soft">
              <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
            สาขาปากช่อง
          </h2>
          <p className="text-[10px] font-bold text-inactive mb-4 uppercase tracking-widest opacity-80">
            Manager: Khun Somchai
          </p>

          <div className="grid grid-cols-3 gap-2 px-4 py-5 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="space-y-0.5">
              <p className="text-[8px] font-bold text-inactive uppercase tracking-wider">
                Sales
              </p>
              <p className="text-sm font-bold text-gray-900">฿1.2k</p>
            </div>
            <div className="space-y-0.5 border-x border-gray-200/30">
              <p className="text-[8px] font-bold text-inactive uppercase tracking-wider">
                Orders
              </p>
              <p className="text-sm font-bold text-gray-900">42</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[8px] font-bold text-inactive uppercase tracking-wider">
                Staff
              </p>
              <p className="text-sm font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>

        {/* Balance Card - Swiss Modern Redesign */}
        <div className="relative bg-[#ED7117] rounded-[32px] p-6 shadow-elevation group/balance transition-all duration-500 overflow-hidden hover:shadow-elevation-hover hover:-translate-y-0.5">
          {/* Subtle Accent Background Element */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-20">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-widest pl-0.5">
                  Total Outstanding
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white tracking-tight font-sans">
                    <span className="font-sans opacity-90">฿</span>1,930
                  </p>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
              <button className="h-9 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider transition-all backdrop-blur-sm">
                Details
              </button>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-white/10">
              <div className="flex flex-col gap-2">
                <p className="text-[9px] font-semibold text-white/60 uppercase tracking-wide">
                  8 active Customers
                </p>
                <div className="flex -space-x-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#ED7117] bg-white ring-2 ring-white/10 overflow-hidden shadow-sm"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i * 123}`}
                        alt="customer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#ED7117] bg-white/20 flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white/10 backdrop-blur-sm">
                    +4
                  </div>
                </div>
              </div>
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-[#ED7117] shadow-lg shadow-black/5 active:scale-95 transition-transform cursor-pointer">
                <TrendingUp size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Targeted Analytics - Ultra Compact */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100/50 shadow-elevation relative group/analytics hover:shadow-elevation-hover hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg text-primary border border-gray-100 flex items-center justify-center">
                <BarChart3 size={20} strokeWidth={2} />
              </div>
              Analytics
            </h3>
            <div className="h-8 w-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-inactive hover:bg-gray-100 transition-colors cursor-pointer">
              <MoreVertical size={18} strokeWidth={2} />
            </div>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-24 px-1 mb-4">
            {[
              { m: "M", v1: 45, v2: 65 },
              { m: "T", v1: 60, v2: 80 },
              { m: "W", v1: 50, v2: 70 },
              { m: "T", v1: 75, v2: 95 },
              { m: "F", v1: 65, v2: 85 },
              { m: "S", v1: 90, v2: 110 },
              { m: "S", v1: 80, v2: 100 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-1 group/bar relative h-full justify-end"
              >
                <div className="w-full flex justify-center relative items-end h-[100px] mb-2">
                  <div className="w-2.5 bg-gray-50 rounded-full h-full absolute bottom-0"></div>
                  <div
                    className="w-2.5 bg-primary rounded-full absolute bottom-0 transition-all duration-700 ease-out"
                    style={{
                      height: `${item.v1}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] font-bold text-inactive group-hover/bar:text-primary tracking-wider transition-colors duration-300">
                  {item.m}
                </span>
              </div>
            ))}
          </div>

          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] font-semibold text-inactive uppercase tracking-wide">
                  Overall Growth
                </p>
                <p className="text-lg font-bold text-emerald-500 tracking-tight">
                  +12.4%
                </p>
              </div>
              <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                <TrendingUp size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-gray-100">
              <div className="bg-emerald-500 h-full w-[65%] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
