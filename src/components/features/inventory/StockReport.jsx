import React, { useState, useEffect } from "react";
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
} from "lucide-react";
import { useBranch } from "./../../../contexts/BranchContext";

// Placeholder for data fetching - will integrate with productService later
const StockReportPage = () => {
  const { activeBranchId } = useBranch();
  const [transactions, setTransactions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // Mock data for initial UI build
  useEffect(() => {
    setTransactions([
      {
        id: 1,
        created_at: "2023-10-25T10:30:15",
        product: "น้ำสิงห์ 1.5L",
        type: "IN",
        qty: 50,
        note: "เติมสต็อก",
      },
      {
        id: 2,
        created_at: "2023-10-26T14:15:30",
        product: "มาม่าหมูสับ",
        type: "OUT",
        qty: 2,
        note: "Order #1001",
      },
      {
        id: 3,
        created_at: "2023-10-26T14:15:45",
        product: "โค้ก 325ml",
        type: "OUT",
        qty: 1,
        note: "Order #1001",
      },
      {
        id: 4,
        created_at: "2023-10-27T09:00:00",
        product: "เลย์ รสโนริสาหร่าย",
        type: "ADJUST",
        qty: -1,
        note: "สินค้าชำรุด",
      },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 min-h-[500px]">
        <h2 className="text-xl font-bold text-[#1B2559] mb-6 flex items-center gap-2">
          <ArrowUpRight className="text-green-500" />
          ความเคลื่อนไหวล่าสุด
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-sm">
                <th className="py-4 font-bold">วัน/เวลา</th>
                <th className="py-4 font-bold">สินค้า</th>
                <th className="py-4 font-bold text-center">ประเภท</th>
                <th className="py-4 font-bold text-right">จำนวน</th>
                <th className="py-4 font-bold pl-4">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="text-[#1B2559]">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4">
                    <div className="font-bold text-[#1B2559]">
                      {new Date(tx.created_at).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}{" "}
                      น.
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="py-4 font-bold">{tx.product}</td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold
                      ${
                        tx.type === "IN"
                          ? "bg-green-100 text-green-700"
                          : tx.type === "OUT"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 text-right font-bold text-lg">
                    {tx.type === "OUT" || (tx.type === "ADJUST" && tx.qty < 0)
                      ? "-"
                      : "+"}
                    {Math.abs(tx.qty)}
                  </td>
                  <td className="py-4 pl-4 text-gray-500 text-sm">{tx.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockReportPage;
