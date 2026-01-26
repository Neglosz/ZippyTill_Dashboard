import React, { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Wallet, ShoppingCart, ReceiptText, ChevronDown } from "lucide-react";

const TaxCalculationPage = () => {
    // --- PIT State ---
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [deductions, setDeductions] = useState(0);

    // --- VAT State ---
    const [buyVatAmount, setBuyVatAmount] = useState(0);
    const [sellVatAmount, setSellVatAmount] = useState(0);

    // --- PIT Calculation Logic ---
    const taxableIncome = Math.max(0, (Number(income) || 0) - (Number(expenses) || 0) - (Number(deductions) || 0));

    const pitResult = useMemo(() => {
        let remaining = taxableIncome;
        let totalTax = 0;
        const brackets = [
            { limit: 150000, rate: 0 },
            { limit: 150000, rate: 0.05 },
            { limit: 200000, rate: 0.10 },
            { limit: 250000, rate: 0.15 },
            { limit: 250000, rate: 0.20 },
            { limit: 1000000, rate: 0.25 },
            { limit: 3000000, rate: 0.30 },
            { limit: Infinity, rate: 0.35 }
        ];

        for (const bracket of brackets) {
            if (remaining <= 0) break;
            const taxableInThisBracket = Math.min(remaining, bracket.limit);
            totalTax += taxableInThisBracket * bracket.rate;
            remaining -= taxableInThisBracket;
        }

        return {
            taxableIncome,
            totalTax
        };
    }, [taxableIncome]);

    // --- VAT Calculation Logic ---
    const buyVat = ((Number(buyVatAmount) || 0) * 7) / 107;
    const sellVat = ((Number(sellVatAmount) || 0) * 7) / 107;
    const netVat = sellVat - buyVat;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const handleNumberInput = (e, setter) => {
        const value = e.target.value;
        setter(value === '' ? '' : Number(value));
    };

    // Prevent scroll wheel changes
    const handleWheel = (e) => {
        e.target.blur();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
            {/* Header Banner */}
            <div className="bg-[#2D3E8B] rounded-[2rem] p-8 text-white flex items-center gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="w-16 h-16 bg-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
                    <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">ระบบคำนวณภาษี</h1>
                    <p className="text-blue-100/80 text-sm">กรอกข้อมูลเพื่อคำนวณภาษีเบื้องต้นอย่างรวดเร็ว ด้วยความแม่นยำ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PIT Input Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <ReceiptText className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">ข้อมูลการคำนวณ</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">เลือกประเภทภาษี</label>
                            <div className="relative">
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium">
                                    <option>ภ.ด.94 (ภาษีเงินได้บุคคลธรรมดา)</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">รายได้รวม (บาท)</label>
                            </div>
                            <input
                                type="number"
                                value={income}
                                onChange={(e) => handleNumberInput(e, setIncome)}
                                onWheel={handleWheel}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-800 font-bold text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-rose-500" />
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ค่าใช้จ่าย (บาท)</label>
                            </div>
                            <input
                                type="number"
                                value={expenses}
                                onChange={(e) => handleNumberInput(e, setExpenses)}
                                onWheel={handleWheel}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-800 font-bold text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet className="w-4 h-4 text-[#7B5CFA]" />
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ค่าลดหย่อนอื่นๆ (บาท)</label>
                            </div>
                            <input
                                type="number"
                                value={deductions}
                                onChange={(e) => handleNumberInput(e, setDeductions)}
                                onWheel={handleWheel}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-800 font-bold text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* PIT Results Card */}
                <div className="bg-[#2D54FF] rounded-3xl p-8 shadow-xl text-white relative flex flex-col gap-6 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold">ผลการคำนวณ</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        {[
                            { label: "รายได้รวม (บาท)", val: income, icon: <TrendingUp className="w-4 h-4" /> },
                            { label: "ค่าใช้จ่าย (บาท)", val: expenses, icon: <DollarSign className="w-4 h-4" /> },
                            { label: "หักลดหย่อน", val: deductions, icon: <Wallet className="w-4 h-4" /> },
                            { label: "รายได้สุทธิ", val: pitResult.taxableIncome, icon: <ReceiptText className="w-4 h-4" /> },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="text-white/60">{item.icon}</div>
                                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{item.label}</span>
                                </div>
                                <div className="text-xl font-bold tracking-tight">฿{formatCurrency(item.val)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#FF9500] rounded-2xl p-6 relative z-10 shadow-lg border border-orange-400/30">
                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest block mb-1">ภาษีที่ต้องชำระ (เบื้องต้น)</span>
                        <div className="text-4xl font-black">฿{formatCurrency(pitResult.totalTax)}</div>
                    </div>

                    <div className="bg-blue-900/40 rounded-xl p-4 border border-blue-400/20 text-[10px] leading-relaxed text-blue-100/70 relative z-10 italic">
                        หมายเหตุ: การคำนวณนี้เป็นเพียงการประมาณการเบื้องต้น สำหรับข้อมูลที่แน่นอนกรุณาปรึกษากับผู้เชี่ยวชาญด้านภาษี
                    </div>
                </div>

                {/* Buy VAT Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <div className="bg-white p-1 rounded-lg border border-emerald-100">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">ภาษีซื้อ</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">ยอดรวมรวม VAT</label>
                        <input
                            type="number"
                            value={buyVatAmount}
                            onChange={(e) => handleNumberInput(e, setBuyVatAmount)}
                            onWheel={handleWheel}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all mb-4"
                        />
                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 transition-transform hover:scale-[1.02] cursor-default">
                            <div className="text-xs font-medium text-emerald-600/80 mb-1">VAT 7%</div>
                            <div className="text-3xl font-black text-emerald-600">฿{formatCurrency(buyVat)}</div>
                        </div>
                    </div>
                </div>

                {/* Sell VAT Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <div className="bg-white p-1 rounded-lg border border-blue-100">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">ภาษีขาย</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">ยอดรวมรวม VAT</label>
                        <input
                            type="number"
                            value={sellVatAmount}
                            onChange={(e) => handleNumberInput(e, setSellVatAmount)}
                            onWheel={handleWheel}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all mb-4"
                        />
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 transition-transform hover:scale-[1.02] cursor-default">
                            <div className="text-xs font-medium text-blue-600/80 mb-1">VAT 7%</div>
                            <div className="text-3xl font-black text-blue-600">฿{formatCurrency(sellVat)}</div>
                        </div>
                    </div>
                </div>

                {/* Net VAT Result Card (Spans 2 columns on large screens) */}
                <div className="lg:col-span-2 bg-[#FF5C00] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                    {/* Decorative background glass shape */}
                    <div className="absolute top-0 right-0 w-80 h-full bg-white/10 skew-x-[-20deg] translate-x-32 group-hover:translate-x-10 transition-transform duration-1000 ease-out"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                <ReceiptText className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">ภาษีที่ต้องนำส่ง</h2>
                                <p className="text-white/70 text-sm mt-1">ส่วนต่างระหว่างภาษีขายและภาษีซื้อ</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">ภาษีขาย</span>
                                <span className="text-2xl font-bold">฿{formatCurrency(sellVat)}</span>
                            </div>
                            <div className="w-8 h-[1px] md:h-8 md:w-[1px] bg-white/20"></div>
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">ภาษีซื้อ</span>
                                <span className="text-2xl font-bold">฿{formatCurrency(buyVat)}</span>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-md min-w-[200px]">
                                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1 block">ยอดสุทธิที่ต้องนำส่ง</span>
                                <span className="text-4xl font-black block">฿{formatCurrency(netVat)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Rates Table */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                        <ReceiptText className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">อัตราภาษีเงินได้บุคคลธรรมดา</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                                <th className="px-6 py-4 rounded-tl-2xl font-bold text-sm uppercase tracking-wider">เงินได้สุทธิ (บาท/ปี)</th>
                                <th className="px-6 py-4 rounded-tr-2xl font-bold text-sm text-right uppercase tracking-wider">อัตราภาษี</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { range: "0 - 150,000", rate: "ยกเว้น (0%)", highlight: true, color: "emerald" },
                                { range: "150,001 - 300,000", rate: "5%", color: "emerald" },
                                { range: "300,001 - 500,000", rate: "10%", color: "teal" },
                                { range: "500,001 - 750,000", rate: "15%", color: "blue" },
                                { range: "750,001 - 1,000,000", rate: "20%", color: "indigo" },
                                { range: "1,000,001 - 2,000,000", rate: "25%", color: "purple" },
                                { range: "2,000,001 - 5,000,000", rate: "30%", color: "pink" },
                                { range: "มากกว่า 5,000,000", rate: "35%", color: "rose" },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{row.range}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${row.highlight ? 'bg-emerald-100 text-emerald-700' :
                                                idx === 1 ? 'bg-emerald-50 text-emerald-600' :
                                                    idx === 2 ? 'bg-teal-50 text-teal-600' :
                                                        idx === 3 ? 'bg-blue-50 text-blue-600' :
                                                            idx === 4 ? 'bg-indigo-50 text-indigo-600' :
                                                                idx === 5 ? 'bg-purple-50 text-purple-600' :
                                                                    idx === 6 ? 'bg-pink-50 text-pink-600' :
                                                                        'bg-rose-50 text-rose-600'
                                            }`}>
                                            {row.rate}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hide scroll arrows for number input (Chrome/Safari/Edge) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            ` }} />
        </div>
    );
};

export default TaxCalculationPage;
