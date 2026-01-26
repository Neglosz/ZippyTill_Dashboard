import React from "react";
import { TrendingUp, TrendingDown, Coins, Wallet, Banknote, QrCode, HandCoins, LogOut } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

const FinancePage = () => {
  const financeTopics = [
    {
      id: 1,
      title: "รายรับทั้งหมด",
      amount: "200,403",
      subtext: "+8% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#FFE2E5]", // Light Pink
      iconBg: "bg-[#FA5A7D]", // Deep Pink
      icon: TrendingUp,
    },
    {
      id: 2,
      title: "รายจ่ายทั้งหมด",
      amount: "300",
      subtext: "+5% จาก เมื่อวาน",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#FFF4DE]", // Light Orange
      iconBg: "bg-[#FF947A]", // Deep Orange
      icon: TrendingDown,
    },
    {
      id: 3,
      title: "กำไรสุทธิ",
      amount: "5,503,900",
      subtext: "+1.2% จาก สัปดาห์ที่แล้ว",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#DCFCE7]", // Light Green
      iconBg: "bg-[#3CD856]", // Deep Green
      icon: Coins,
    },
    {
      id: 4,
      title: "ยอดเงินทั้งหมด",
      amount: "8,950,402",
      subtext: "0.5% จากเมื่อวาน",
      subtextColor: "text-[#4079ED]",
      color: "bg-[#F3E8FF]", // Light Purple
      iconBg: "bg-[#BF83FF]", // Deep Purple
      icon: Wallet,
    },
  ];

  // Mock Data for Graph (00:00 - 23:00)
  const data = [
    { name: "00", income: 12000, expense: 8000 },
    { name: "01", income: 15000, expense: 12000 },
    { name: "02", income: 22000, expense: 18000 },
    { name: "03", income: 35000, expense: 28000 },
    { name: "04", income: 55000, expense: 45000 },
    { name: "05", income: 75000, expense: 68000 },
    { name: "06", income: 85000, expense: 72000 },
    { name: "07", income: 80000, expense: 65000 },
    { name: "08", income: 72000, expense: 60000 },
    { name: "09", income: 65000, expense: 55000 },
    { name: "10", income: 55000, expense: 48000 },
    { name: "11", income: 48000, expense: 42000 },
    { name: "12", income: 45000, expense: 40000 },
    { name: "13", income: 42000, expense: 38000 },
    { name: "14", income: 38000, expense: 32000 },
    { name: "15", income: 32000, expense: 30000 },
    { name: "16", income: 38000, expense: 35000 },
    { name: "17", income: 32000, expense: 30000 },
    { name: "18", income: 28000, expense: 28000 },
    { name: "19", income: 25000, expense: 20000 },
    { name: "20", income: 18000, expense: 15000 },
    { name: "21", income: 12000, expense: 8000 },
    { name: "22", income: 10000, expense: 7000 },
    { name: "23", income: 8000, expense: 5000 },
  ];

  const paymentChannels = [
    {
      id: 1,
      name: "เงินสด",
      amount: "45,430",
      percent: 77,
      color: "bg-orange-500",
      icon: Banknote,
      iconBg: "bg-teal-700",
    },
    {
      id: 2,
      name: "PromtPay",
      amount: "32,031",
      percent: 20,
      color: "bg-blue-500",
      icon: QrCode,
      iconBg: "bg-white border text-blue-500", // Special case for PromptPay logo look
    },
    {
      id: 3,
      name: "ค้างชำระ",
      amount: "5,510",
      percent: 13,
      color: "bg-red-500",
      icon: HandCoins,
      iconBg: "bg-orange-100 text-orange-600",
    },
  ];

  const recentTransactions = [
    { id: "TXN-001", date: "20-12-2025", detail: "ขายสินค้า - คุณสมชาย", type: "รายรับ", amount: "฿1,250", status: "สำเร็จ" },
    { id: "TXN-002", date: "20-12-2025", detail: "ซื้อสินค้าเข้า - บริษัท ABC", type: "รายจ่าย", amount: "฿8,500", status: "สำเร็จ" },
    { id: "TXN-003", date: "19-12-2025", detail: "ขายสินค้า - ร้านค้าส่ง XYZ", type: "รายรับ", amount: "฿5,600", status: "สำเร็จ" },
    { id: "TXN-004", date: "19-12-2025", detail: "ค่าไฟฟ้า", type: "รายจ่าย", amount: "฿2,300", status: "รอดำเนินการ" },
    { id: "TXN-005", date: "18-12-2025", detail: "ขายสินค้า - คุณสมหญิง", type: "รายรับ", amount: "฿890", status: "สำเร็จ" },
    { id: "TXN-006", date: "18-12-2025", detail: "ค่าเช่า", type: "รายจ่าย", amount: "฿15,000", status: "สำเร็จ" },
    { id: "TXN-007", date: "17-12-2025", detail: "ขายสินค้า - บริษัท DEF", type: "รายรับ", amount: "฿12,500", status: "สำเร็จ" },
  ];

  const monthlyData = [
    { name: "Jan", รายรับ: 45000, รายจ่าย: 32000 },
    { name: "Feb", รายรับ: 52000, รายจ่าย: 35000 },
    { name: "Mar", รายรับ: 48000, รายจ่าย: 30000 },
    { name: "Apr", รายรับ: 61000, รายจ่าย: 42000 },
    { name: "May", รายรับ: 55000, รายจ่าย: 38000 },
    { name: "Jun", รายรับ: 67000, รายจ่าย: 45000 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-gray-500 text-sm mb-1">08/01/67</p>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-orange-400">
              เงินเข้า <br/> <span className="text-black text-lg">{payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-sm font-medium text-purple-400">
              เงินออก <br/> <span className="text-black text-lg">{payload[1].value.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-10 space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-gray-500">จัดการติดตามรายรับรายจ่าย</p>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financeTopics.map((topic) => (
          <div
            key={topic.id}
            className={`${topic.color} border-none rounded-[24px] p-4 shadow-sm relative overflow-hidden h-[180px] flex flex-col`}
          >
            <div className={`w-12 h-12 rounded-full ${topic.iconBg} flex items-center justify-center text-white mb-4`}>
              <topic.icon size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-extrabold text-[#1B2559]">{topic.amount}</h3>
              <p className="text-sm font-medium text-gray-600">{topic.title}</p>
              <p className={`text-xs font-medium ${topic.subtextColor} mt-1`}>{topic.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1B2559]">กระแสเงินรายวัน</h2>
            <p className="text-gray-500">Chain ratio</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                <span className="text-sm text-gray-500">เงินเข้า</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                <span className="text-sm text-gray-500">เงินออก</span>
             </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
                tickFormatter={(value) => `${value / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E0E0E0', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#FB923C" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#FB923C' }} 
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#A78BFA" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#A78BFA' }} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Channels Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#1B2559] mb-6">ช่องทางการชำระเงิน</h2>
        <div className="flex flex-col gap-6">
          {paymentChannels.map((channel) => (
            <div key={channel.id} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${channel.iconBg} flex items-center justify-center shrink-0`}>
                <channel.icon size={24} className={channel.iconBg.includes('text') ? '' : 'text-white'} />
              </div>
              
              <div className="flex-1">
                 <div className="flex justify-between mb-2">
                    <span className="text-[#1B2559] font-bold">{channel.name}</span>
                    <div className="text-right">
                       <p className="text-[#1B2559] font-bold">{channel.amount}</p>
                       <p className="text-gray-500 text-xs">{channel.percent}%</p>
                    </div>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${channel.color}`} 
                      style={{ width: `${channel.percent}%` }}
                    ></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1B2559]">รายการล่าสุด</h2>
          <button className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors">
            <LogOut size={16} />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm rounded-l-lg">เลขที่รายการ</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">วันที่</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">รายละเอียด</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">ประเภท</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm">จำนวนเงิน</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium text-sm rounded-r-lg">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, index) => (
                <tr key={index} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-600 text-sm">{tx.id}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{tx.date}</td>
                  <td className="py-4 px-4 text-gray-800 text-sm font-medium">{tx.detail}</td>
                  <td className={`py-4 px-4 text-sm font-medium ${tx.type === 'รายรับ' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'รายรับ' ? '↗' : '↘'} {tx.type}
                  </td>
                  <td className={`py-4 px-4 text-sm font-medium ${tx.type === 'รายรับ' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'รายรับ' ? '+' : '-'}{tx.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${tx.status === 'สำเร็จ' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Summary Section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1B2559]">สรุปรายเดือน</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#A3AED0', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="rect"
                formatter={(value) => <span className="text-gray-500 ml-2">{value}</span>}
              />
              <Bar 
                dataKey="รายรับ" 
                fill="#10B981" 
                barSize={30} 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="รายจ่าย" 
                fill="#EF4444" 
                barSize={30} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
