import React from "react";
import { X, Phone, Mail, Calendar, CreditCard, Clock, User } from "lucide-react";

const DebtorDetailModal = ({ item, isOpen, onClose }) => {
    if (!isOpen || !item) return null;

    const getStatusBadge = (status, days) => {
        if (days > 15 || status === "เกินกำหนด") {
            return (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1 w-max">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                    เกินกำหนด
                </span>
            );
        }
        return (
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                ค้างชำระ
            </span>
        );
    };

    const bills = item.items || [];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header */}
                <div className="bg-white p-8 pb-6 relative border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all active:scale-95"
                    >
                        <X size={22} />
                    </button>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Profile with Gradient Ring */}
                        <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-[#8b5cf6] via-[#d946ef] to-[#ec4899] shadow-lg shadow-purple-100">
                            <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{item.name || item.customerName}</h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-purple-100">
                                    <User size={14} />
                                    {item.customerId || `C00${item.id}`}
                                </span>
                                {getStatusBadge(item.status || (item.maxOverdueDays > 0 ? "เกินกำหนด" : "ค้างชำระ"), item.overdueDays || item.maxOverdueDays)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Contact Info Card */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">ข้อมูลการติดต่อ</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">เบอร์โทรศัพท์</p>
                                        <p className="font-semibold text-gray-900">{item.phone || "-"}</p>
                                    </div>
                                </div>
                            
                            </div>
                        </div>

                        {/* Financial Stats Card */}
                        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">สรุปยอดค้างชำระ</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">ยอดรวมทั้งหมด</p>
                                            <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                                                ฿{(item.totalAmount || item.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">จำนวนรายการ</p>
                                        <p className="text-lg font-bold text-purple-600">{(item.totalCount || bills.length)} บิล</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 bg-red-50/50 p-2 rounded-lg px-3">
                                    <Clock size={16} className="text-red-500" />
                                    <span>ครบกำหนดล่าสุดเมื่อ <span className="font-bold text-red-600">{(item.items?.[0]?.dueDate || item.dueDate) || "-"}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">รายการใบแจ้งหนี้ ({bills.length} รายการ)</h3>
                            <button className="text-xs font-bold text-purple-600 hover:text-purple-700">ดูทั้งหมด</button>
                        </div>
                        <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                            {bills.length > 0 ? bills.map((bill) => (
                                <div key={bill.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-purple-600 transition-colors">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{bill.id}</p>
                                            <p className="text-xs text-gray-500">{new Date(bill.createdAt || bill.dueDate).toLocaleDateString('th-TH')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900">฿{Number(bill.amount).toLocaleString()}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bill.overdueDays > 0 ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                                            {bill.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-400 text-sm">ไม่พบรายการใบแจ้งหนี้</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-3">
                   
                    {/* <button
                        onClick={() => {
                            onClose();
                            if (onEdit) onEdit(item);
                        }}
                        className="px-8 py-3 bg-[#6d28d9] text-white font-bold text-sm rounded-2xl hover:bg-[#5b21b6] hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        แก้ไขข้อมูลลูกค้า
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default DebtorDetailModal;
