import React, { useState } from "react";
import { BarChart3, FileText, Tag, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const SalesPage = () => {
  const [timeRange, setTimeRange] = useState("1D");

  const stats = [
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      bgIcon: "bg-red-400",
      value: "$1k",
      label: "ยอดขายรวม",
      trend: "+8% จาก สัปดาห์ที่แล้ว",
      trendColor: "text-blue-500",
      bgColor: "bg-pink-100",
    },
    {
      icon: <FileText className="w-6 h-6 text-white" />,
      bgIcon: "bg-orange-400",
      value: "300",
      label: "Total Order",
      trend: "+5% จาก เมื่อวาน",
      trendColor: "text-blue-500",
      bgColor: "bg-orange-100",
    },
    {
      icon: <Tag className="w-6 h-6 text-white" />,
      bgIcon: "bg-green-500",
      value: "5",
      label: "Product Sold",
      trend: "+1.2% จาก สัปดาห์ที่แล้ว",
      trendColor: "text-blue-500",
      bgColor: "bg-green-100",
    },
    {
      icon: <UserPlus className="w-6 h-6 text-white" />,
      bgIcon: "bg-purple-400",
      value: "8",
      label: "New Customers",
      trend: "0.5% จากเมื่อวาน",
      trendColor: "text-blue-500",
      bgColor: "bg-purple-100",
    },
  ];

  // Mock Data for Line Chart
  const data1D = [
    { name: "07:00", general: 2400, home: 1800, fresh: 2000, snack: 1500 },
    { name: "08:00", general: 3000, home: 2200, fresh: 2500, snack: 1800 },
    { name: "09:00", general: 3500, home: 2800, fresh: 3000, snack: 2100 },
    { name: "10:00", general: 4100, home: 3100, fresh: 3200, snack: 2400 },
    { name: "11:00", general: 4500, home: 3500, fresh: 3600, snack: 2800 },
    { name: "12:00", general: 4800, home: 3800, fresh: 4100, snack: 3200 },
    { name: "13:00", general: 4200, home: 3400, fresh: 3900, snack: 2900 },
    { name: "14:00", general: 3800, home: 3000, fresh: 3500, snack: 2600 },
    { name: "15:00", general: 3500, home: 2800, fresh: 3100, snack: 2300 },
    { name: "16:00", general: 3900, home: 3200, fresh: 3700, snack: 2700 },
    { name: "17:00", general: 4400, home: 3600, fresh: 4000, snack: 3100 },
    { name: "18:00", general: 4600, home: 3900, fresh: 4200, snack: 3500 },
  ].map(item => ({
    name: item.name,
    general: Math.round(item.general + Math.random() * 50),
    home: Math.round(item.home + Math.random() * 50),
    fresh: Math.round(item.fresh + Math.random() * 50),
    snack: Math.round(item.snack + Math.random() * 50),
  }));

  const data1M = Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    general: Math.round(2000 + Math.abs(Math.sin(i * 0.5) * 2000) + Math.random() * 500),
    home: Math.round(1500 + Math.abs(Math.cos(i * 0.3) * 2500) + Math.random() * 500),
    fresh: Math.round(1000 + Math.abs(Math.sin(i * 0.2) * 3000) + Math.random() * 500),
    snack: Math.round(2500 + Math.abs(Math.cos(i * 0.4) * 1500) + Math.random() * 500),
  }));

  const data1Y = [
    { name: "ม.ค.", general: 4000, home: 2400, fresh: 2400, snack: 2400 },
    { name: "ก.พ.", general: 3000, home: 1398, fresh: 2210, snack: 2290 },
    { name: "มี.ค.", general: 2000, home: 9800, fresh: 2290, snack: 2000 },
    { name: "เม.ย.", general: 2780, home: 3908, fresh: 2000, snack: 2181 },
    { name: "พ.ค.", general: 1890, home: 4800, fresh: 2181, snack: 2500 },
    { name: "มิ.ย.", general: 2390, home: 3800, fresh: 2500, snack: 2100 },
    { name: "ก.ค.", general: 3490, home: 4300, fresh: 2100, snack: 2100 },
    { name: "ส.ค.", general: 4000, home: 2400, fresh: 2400, snack: 2400 },
    { name: "ก.ย.", general: 3000, home: 1398, fresh: 2210, snack: 2290 },
    { name: "ต.ค.", general: 2000, home: 9800, fresh: 2290, snack: 2000 },
    { name: "พ.ย.", general: 2780, home: 3908, fresh: 2000, snack: 2181 },
    { name: "ธ.ค.", general: 1890, home: 4800, fresh: 2181, snack: 2500 },
  ];

  const getChartData = () => {
    switch (timeRange) {
      case "1D": return data1D;
      case "1M": return data1M;
      case "1Y": return data1Y;
      case "Max": return data1Y; 
      default: return data1D;
    }
  };

  // Pie Chart Data
  const pieData = [
    { name: "ของใช้ทั่วไป", value: 30, color: "#C084FC" }, // Purple
    { name: "ของสด", value: 40, color: "#2563EB" }, // Blue
    { name: "ของใช้ในบ้าน", value: 20, color: "#F97316" }, // Orange
    { name: "ขนม", value: 10, color: "#22C55E" }, // Green
  ];

  return (
    <div className="pb-10 space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} border-none rounded-[24px] p-4 shadow-sm relative overflow-hidden h-[180px] flex flex-col`}
          >
            <div className={`w-12 h-12 rounded-full ${stat.bgIcon} flex items-center justify-center shrink-0 mb-4`}>
              {stat.icon}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-extrabold text-[#1B2559] mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className={`${stat.trendColor} text-xs font-medium mt-1`}>{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Total Sales */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-gray-600 font-medium">ยอดขายรวมทั้งหมด</h3>
              <p className="text-3xl font-bold text-gray-800">294,420</p>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {["1D", "1M", "1Y", "Max"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  width={45}
                  tickCount={5}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => value === 0 ? "0" : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   labelFormatter={(value) => timeRange === '1M' ? `วันที่ ${value}` : value}
                />
                <Line type="monotone" dataKey="general" stroke="#A855F7" strokeWidth={2} dot={false} name="ของใช้ทั่วไป" />
                <Line type="monotone" dataKey="home" stroke="#F97316" strokeWidth={2} dot={false} name="ของใช้ในบ้าน" />
                <Line type="monotone" dataKey="fresh" stroke="#2563EB" strokeWidth={2} dot={false} name="ของสด" />
                <Line type="monotone" dataKey="snack" stroke="#22C55E" strokeWidth={2} dot={false} name="ขนม" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-[400px]">
             <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-purple-500"></span>
                <span className="text-gray-600 font-medium">ของใช้ทั่วไป</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-blue-600"></span>
                <span className="text-gray-600 font-medium">ของสด</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                <span className="text-gray-600 font-medium">ของใช้ในบ้าน</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span className="text-gray-600 font-medium">ขนม</span>
             </div>
          </div>
        </div>

        {/* Right Chart: Income Structure */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm flex flex-col">
           <div className="mb-4">
              <h3 className="text-gray-600 font-medium">ยอดขายรวมทั้งหมด</h3>
              <p className="text-3xl font-bold text-gray-800">294,420</p>
           </div>
           
           <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
           </div>

           <div className="mt-4 space-y-3">
              {pieData.map((item, index) => (
                 <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                       <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{item.value}%</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Top 5 Products Section */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">สินค้าขายดี Top 5</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b border-gray-100">
                <th className="pb-4 font-medium pl-4">อันดับ</th>
                <th className="pb-4 font-medium">ชื่อสินค้า</th>
                <th className="pb-4 font-medium">ยอดขาย</th>
                <th className="pb-4 font-medium">รายได้</th>
                <th className="pb-4 font-medium">แนวโน้ม</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { rank: 1, name: "เลย์ รสออริจินอล", sales: "1250 ชิ้น", revenue: "฿25,000", trend: "12%", trendUp: true, image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Lays_Classic_Chips.png/600px-Lays_Classic_Chips.png" }, // Using a generic placeholder if needed or just styling
                { rank: 2, name: "เบียร์ช้าง", sales: "890 ชิ้น", revenue: "฿44,500", trend: "8%", trendUp: true },
                { rank: 3, name: "น้ำมะนาว", sales: "750 ชิ้น", revenue: "฿11,250", trend: "3%", trendUp: false },
                { rank: 4, name: "ข้าวสาร 5 กก.", sales: "420 ชิ้น", revenue: "฿75,600", trend: "15%", trendUp: true },
                { rank: 5, name: "น้ำดื่ม", sales: "1520 ชิ้น", revenue: "฿15,200", trend: "5%", trendUp: true },
              ].map((product, index) => (
                <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 pl-4 font-medium">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${product.rank === 1 ? 'bg-yellow-400 text-white' : 
                        product.rank === 2 ? 'bg-gray-400 text-white' : 
                        product.rank === 3 ? 'bg-orange-500 text-white' : 
                        'bg-gray-200 text-gray-600'}`}>
                      {product.rank}
                    </div>
                  </td>
                  <td className="py-4 text-gray-800 font-medium">{product.name}</td>
                  <td className="py-4 text-gray-600">{product.sales}</td>
                  <td className="py-4 text-gray-600">{product.revenue}</td>
                  <td className="py-4">
                    <div className={`flex items-center gap-1 ${product.trendUp ? "text-green-500" : "text-red-500"}`}>
                      {product.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{product.trend}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
