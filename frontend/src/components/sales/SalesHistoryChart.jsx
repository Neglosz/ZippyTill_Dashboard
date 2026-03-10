import React, { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";

const formatThaiDate = (dateString) => {
  if (!dateString) return "";
  if (!dateString.includes("-")) return dateString;
  
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = (date.getFullYear() + 543).toString().slice(-2);
  
  return `${d} ${m} ${y}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const rawDateLabel = payload[0].payload.fullDate || label;
    const dateLabel = formatThaiDate(rawDateLabel);
    return (
      <div className="bg-white/98 backdrop-blur-[10px] p-3 rounded-[20px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
        <p className="text-[#1E293B] font-extrabold text-[11px] mb-1 uppercase">
          {dateLabel}
        </p>
        <p className="text-[#ED7117] text-[13px] font-black">
          ฿{Number(value).toLocaleString()}{" "}
          <span className="text-[#64748B] font-bold text-[11px] ml-1">
            ยอดขาย
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const SalesHistoryChart = ({ data, timeRange, isLoading }) => {
  const displayData = useMemo(() => {
    if (timeRange === "1W" && data && data.length > 0) {
      const daysOrder = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
      return [...data].sort((a, b) => {
        return daysOrder.indexOf(a.name) - daysOrder.indexOf(b.name);
      });
    }
    return data;
  }, [data, timeRange]);

  if (!displayData || displayData.length === 0) {
    return (
      <div className="flex-1 min-h-[300px] w-full flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50">
        <p className="text-sm font-bold text-gray-400">
          ไม่มีข้อมูลยอดขายในช่วยเวลานี้
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[300px] w-full relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-[32px]">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={displayData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ED7117" stopOpacity={1} />
              <stop offset="100%" stopColor="#F97316" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ED7117" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#ED7117" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="5 5"
            vertical={false}
            stroke="#F1F5F9"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
            dy={10}
            minTickGap={timeRange === "1M" ? 15 : 5}
            interval={timeRange === "1M" ? "preserveStartEnd" : 0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 700 }}
            width={50}
            tickCount={6}
            domain={[0, "auto"]}
            tickFormatter={(value) =>
              value === 0
                ? "0"
                : value >= 1000
                  ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
                  : value
            }
          />
          <Tooltip
            cursor={{ fill: "#F8FAFC", radius: 10 }}
            content={<CustomTooltip />}
          />
          <Bar
            dataKey="totalSales"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(SalesHistoryChart);
