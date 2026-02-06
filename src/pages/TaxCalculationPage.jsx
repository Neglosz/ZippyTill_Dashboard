import React, { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Wallet,
  ShoppingCart,
  ReceiptText,
  ChevronDown,
} from "lucide-react";

const TaxCalculationPage = () => {
  // --- PIT State ---
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [deductions, setDeductions] = useState("");

  // --- VAT State ---
  const [buyVatAmount, setBuyVatAmount] = useState("");
  const [sellVatAmount, setSellVatAmount] = useState("");

  // --- PIT Calculation Logic ---
  const taxableIncome = Math.max(
    0,
    (Number(income) || 0) - (Number(expenses) || 0) - (Number(deductions) || 0),
  );

  const pitResult = useMemo(() => {
    let remaining = taxableIncome;
    let totalTax = 0;
    const brackets = [
      { limit: 150000, rate: 0 },
      { limit: 150000, rate: 0.05 },
      { limit: 200000, rate: 0.1 },
      { limit: 250000, rate: 0.15 },
      { limit: 250000, rate: 0.2 },
      { limit: 1000000, rate: 0.25 },
      { limit: 3000000, rate: 0.3 },
      { limit: Infinity, rate: 0.35 },
    ];

    for (const bracket of brackets) {
      if (remaining <= 0) break;
      const taxableInThisBracket = Math.min(remaining, bracket.limit);
      totalTax += taxableInThisBracket * bracket.rate;
      remaining -= taxableInThisBracket;
    }

    return {
      taxableIncome,
      totalTax,
    };
  }, [taxableIncome]);

  // --- VAT Calculation Logic ---
  const buyVat = ((Number(buyVatAmount) || 0) * 7) / 107;
  const sellVat = ((Number(sellVatAmount) || 0) * 7) / 107;
  const netVat = sellVat - buyVat;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleNumberInput = (e, setter) => {
    const value = e.target.value;
    setter(value === "" ? "" : Number(value));
  };

  // Prevent scroll wheel changes
  const handleWheel = (e) => {
    e.target.blur();
  };

  return (
    <>
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[110px]" />
      </div>

      <div className="relative pb-10 space-y-6 min-h-screen">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <Calculator className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                คำนวณภาษี
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                คำนวณและจัดการภาษีมูลค่าเพิ่มและภาษีอื่นๆ
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Personal Income Tax (PIT) */}
          <div className="flex flex-col gap-6">
            {/* PIT Input Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 flex flex-col gap-8 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <ReceiptText className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  ข้อมูลการคำนวณภาษีเงินได้
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] block">
                    เลือกประเภทภาษี
                  </label>
                  <div className="relative">
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 appearance-none focus:ring-2 focus:ring-primary/20 transition-all outline-none text-gray-900 font-bold text-sm">
                      <option>ภ.ด.94 (ภาษีเงินได้บุคคลธรรมดา)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-inactive" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                      รายได้รวม (บาท)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={income}
                    placeholder="0.00"
                    onChange={(e) => handleNumberInput(e, setIncome)}
                    onWheel={handleWheel}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-gray-900 font-black text-2xl tracking-tighter"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                    <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                      ค่าใช้จ่าย (บาท)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={expenses}
                    placeholder="0.00"
                    onChange={(e) => handleNumberInput(e, setExpenses)}
                    onWheel={handleWheel}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-gray-900 font-black text-2xl tracking-tighter"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-purple-500" />
                    <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                      ค่าลดหย่อนอื่นๆ (บาท)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={deductions}
                    placeholder="0.00"
                    onChange={(e) => handleNumberInput(e, setDeductions)}
                    onWheel={handleWheel}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-gray-900 font-black text-2xl tracking-tighter"
                  />
                </div>
              </div>
            </div>

            {/* PIT Results Card */}
            <div className="bg-[#FFF7ED] rounded-[32px] p-8 shadow-premium border border-orange-100 relative flex flex-col gap-8 overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/20 transition-colors"></div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                  <Calculator className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">
                    สรุปภาษีเงินได้
                  </h2>
                  <p className="text-[10px] font-black text-inactive uppercase tracking-widest mt-1">
                    บุคคลธรรมดา
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                {[
                  {
                    label: "รายได้สุทธิ",
                    val: pitResult.taxableIncome,
                    icon: <ReceiptText className="w-4 h-4" />,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-orange-100/50 hover:border-primary/30 transition-all group/item shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-primary/60 group-hover/item:text-primary transition-colors">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-black text-inactive uppercase tracking-widest">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter text-gray-900 break-all">
                      ฿{formatCurrency(item.val)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-7 relative z-10 border border-primary/20 shadow-premium group hover:shadow-lg transition-all">
                <span className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em] block mb-2">
                  ภาษีที่ต้องชำระ (เบื้องต้น)
                </span>
                <div className="text-5xl font-black text-primary drop-shadow-sm group-hover:scale-105 transition-transform tracking-tighter break-all">
                  ฿{formatCurrency(pitResult.totalTax)}
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 text-[10px] font-bold leading-relaxed text-orange-800/60 relative z-10 italic">
                หมายเหตุ: การคำนวณนี้เป็นเพียงการประมาณการเบื้องต้น
              </div>
            </div>
          </div>

          {/* Column 2: Value Added Tax (VAT) */}
          <div className="flex flex-col gap-6">
            {/* VAT Input Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 flex flex-col gap-8 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  ภาษีมูลค่าเพิ่ม (VAT 7%)
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                      ยอดรวมราคาขาย (รวม VAT)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={sellVatAmount}
                    placeholder="0.00"
                    onChange={(e) => handleNumberInput(e, setSellVatAmount)}
                    onWheel={handleWheel}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-gray-900 font-black text-2xl tracking-tighter"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-rose-500" />
                    <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em]">
                      ยอดรวมราคาซื้อ (รวม VAT)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={buyVatAmount}
                    placeholder="0.00"
                    onChange={(e) => handleNumberInput(e, setBuyVatAmount)}
                    onWheel={handleWheel}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-gray-900 font-black text-2xl tracking-tighter"
                  />
                </div>
              </div>
            </div>

            {/* VAT Results Card (New Vertical Layout) */}
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                  <ReceiptText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">
                    สรุปภาษีมูลค่าเพิ่ม
                  </h2>
                  <p className="text-[10px] font-black text-inactive uppercase tracking-widest mt-1">
                    ส่วนต่าง ภาษีขาย - ภาษีซื้อ
                  </p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ภาษีขาย (7%)
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    +{formatCurrency(sellVat)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ภาษีซื้อ (7%)
                  </span>
                  <span className="text-xl font-black text-rose-500">
                    -{formatCurrency(buyVat)}
                  </span>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 text-center border border-primary/10 group-hover:bg-primary/10 transition-colors mt-2">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-2 block">
                    ยอดนำส่งสุทธิ (VAT)
                  </span>
                  <span className="text-5xl font-black block tracking-tighter text-primary break-all">
                    ฿{formatCurrency(netVat)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Rates Table - Moved to Right Column to balance height */}
            <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  อัตราภาษีบุคคลธรรมดา
                </h2>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-primary text-white">
                      <th className="px-6 py-4 rounded-tl-2xl font-black text-[10px] uppercase tracking-wider">
                        เงินได้สุทธิ (บาท/ปี)
                      </th>
                      <th className="px-6 py-4 rounded-tr-2xl font-black text-[10px] text-right uppercase tracking-wider">
                        อัตราภาษี
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      {
                        range: "0 - 150,000",
                        rate: "ยกเว้น (0%)",
                        highlight: true,
                      },
                      { range: "150,001 - 300,000", rate: "5%" },
                      { range: "300,001 - 500,000", rate: "10%" },
                      { range: "500,001 - 750,000", rate: "15%" },
                      { range: "750,001 - 1,000,000", rate: "20%" },
                      { range: "1,000,001 - 2,000,000", rate: "25%" },
                      { range: "2,000,001 - 5,000,000", rate: "30%" },
                      { range: "มากกว่า 5,000,000", rate: "35%" },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-xs font-bold text-inactive">
                          {row.range}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                              row.highlight
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-inactive group-hover:bg-primary/10 group-hover:text-primary transition-all"
                            }`}
                          >
                            {row.rate}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Hide scroll arrows for number input (Chrome/Safari/Edge) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `,
          }}
        />
      </div>
    </>
  );
};

export default TaxCalculationPage;
