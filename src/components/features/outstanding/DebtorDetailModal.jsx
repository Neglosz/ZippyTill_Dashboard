import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Clock,
  User,
  Pencil,
  Save,
} from "lucide-react";
import ReceiptModal from "../../ReceiptModal";

const DebtorDetailModal = ({ item, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("info"); // "info" or "bills"
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", customerDueDate: "" });
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    if (item) {
      setEditForm({
        name: item.name || "",
        phone: item.phone || "",
        customerDueDate: item.customerDueDate || "",
      });
      setIsEditing(false);
    }
  }, [item]);

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    let formatted = rawValue;
    if (rawValue.length > 6) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 6)}-${rawValue.slice(6, 10)}`;
    } else if (rawValue.length > 3) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    }
    setEditForm((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSave = async () => {
    if (!onSave || !item) return;
    setIsSaving(true);
    try {
      await onSave(item.customerId, {
        name: editForm.name,
        phone: editForm.phone.replace(/\D/g, ""),
        customerDueDate: editForm.customerDueDate,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving:", err);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: item.name || "",
      phone: item.phone || "",
      customerDueDate: item.customerDueDate || "",
    });
    setIsEditing(false);
  };

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
      <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1 w-max">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
        ค้างชำระ
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Check if it's a full ISO string or just date
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;
    const [year, month, day] = datePart.split("-");
    return `${day}-${month}-${year}`;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http")) return cleanPath;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    // Ensure path starts with the bucket name 'customers'
    // The screenshot showed the bucket is named 'customers'
    let fullPath = cleanPath;
    if (!cleanPath.startsWith("customers/")) {
      fullPath = `customers/${cleanPath}`;
    }

    return `${supabaseUrl}/storage/v1/object/public/${fullPath}`;
  };

  const bills = item.items || [];

  return createPortal(
    <div className="fixed inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-lg flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-500 overflow-y-auto">
      <div className="bg-gradient-to-br from-white via-white to-gray-50/80 rounded-[48px] w-full max-w-4xl max-h-[80vh] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/80 relative backdrop-blur-xl">
        {/* Enhanced Background Decor */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-orange-400/5 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/10 via-blue-400/5 to-transparent rounded-full blur-[80px] -z-10 pointer-events-none animate-pulse"
          style={{ animationDuration: "5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400/5 to-orange-400/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* 3-Section Layout - Enhanced Design */}
        <div className="relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-white/90 backdrop-blur-sm p-3 rounded-2xl transition-all duration-300 active:scale-90 z-10 shadow-lg hover:shadow-xl border border-gray-200/50"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex max-h-[75vh]">
            {/* Section 1 - Left: Profile Image (Full Height) */}
            <div className="w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-100/50 flex items-center justify-center p-8 relative overflow-hidden">
              {/* Enhanced decorative elements with animation */}
              <div
                className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-orange-400/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDuration: "3s" }}
              ></div>
              <div
                className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-purple-400/10 rounded-full blur-2xl animate-pulse"
                style={{ animationDuration: "4s" }}
              ></div>
              <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-r from-pink-400/5 to-orange-400/5 rounded-full blur-xl"></div>

              <div className="w-full aspect-square bg-gradient-to-br from-white to-gray-50 rounded-[40px] border-2 border-white/80 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 relative">
                <img
                  src={
                    getImageUrl(item.imageUrl) ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                  }}
                />
              </div>
            </div>

            {/* Right Side - Tabs & Content */}
            <div className="w-1/2 flex flex-col bg-gradient-to-br from-white to-gray-50/30">
              {/* Tab Navigation - Modern Design */}
              <div className="bg-gradient-to-r from-white to-gray-50/50 px-10 pt-10 pb-0 border-b border-gray-200/50">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`pb-5 px-3 font-bold text-base transition-all duration-300 relative ${
                      activeTab === "info"
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ข้อมูลทั่วไป
                    {activeTab === "info" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full shadow-lg shadow-primary/30 animate-in slide-in-from-left duration-300"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("bills")}
                    className={`pb-5 px-3 font-bold text-base transition-all duration-300 relative flex items-center gap-2.5 ${
                      activeTab === "bills"
                        ? "text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    รายการใบแจ้งหนี้
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300 ${
                        activeTab === "bills"
                          ? "bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg shadow-primary/30"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {bills.length}
                    </span>
                    {activeTab === "bills" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full shadow-lg shadow-primary/30 animate-in slide-in-from-left duration-300"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content - Adjusted Height */}
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-white">
                {activeTab === "info" ? (
                  /* Customer Information Tab */
                  <div className="bg-white p-6 h-full">
                    <div className="space-y-4">
                      {/* Edit Button */}
                      {!isEditing && onSave && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-all duration-300 active:scale-95 border border-primary/20"
                          >
                            <Pencil size={14} strokeWidth={2.5} />
                            แก้ไข
                          </button>
                        </div>
                      )}

                      {/* Customer Name and Status */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-[0.15em]">
                          ชื่อลูกค้า
                        </label>
                        <div className="flex items-center justify-between">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                              className="text-xl font-black text-gray-900 tracking-tight bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
                            />
                          ) : (
                            <div className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                              {item.name || item.customerName}
                            </div>
                          )}
                          {!isEditing && getStatusBadge(
                            item.status ||
                              (item.maxOverdueDays > 0
                                ? "เกินกำหนด"
                                : "ค้างชำระ"),
                            item.overdueDays || item.maxOverdueDays,
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-[0.15em]">
                          เบอร์โทรศัพท์
                        </label>
                        {isEditing ? (
                          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-orange-400/10 flex items-center justify-center shrink-0">
                              <Phone size={18} className="text-primary" strokeWidth={2.5} />
                            </div>
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={handlePhoneChange}
                              maxLength={12}
                              placeholder="0XX-XXX-XXXX"
                              className="flex-1 bg-transparent font-bold text-base text-gray-900 outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-900 font-bold text-base bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-orange-400/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-orange-400/20 transition-all duration-300">
                              <Phone size={18} className="text-primary" strokeWidth={2.5} />
                            </div>
                            {item.phone
                              ? item.phone
                                  .replace(/\D/g, "")
                                  .replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
                              : "-"}
                          </div>
                        )}
                      </div>

                      {/* Amount and Bills - Enhanced Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-orange-50 via-orange-50/50 to-orange-100/30 p-4 rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <label className="text-[9px] font-bold text-orange-700/80 mb-1.5 block uppercase tracking-[0.15em] relative z-10">
                            ยอดค้างชำระ
                          </label>
                          <div className="text-2xl font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent leading-none relative z-10">
                            ฿
                            {(item.totalAmount || item.amount).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100/30 p-4 rounded-2xl border border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <label className="text-[9px] font-bold text-gray-600/80 mb-1.5 block uppercase tracking-[0.15em] relative z-10">
                            จำนวนบิล
                          </label>
                          <div className="text-2xl font-black text-gray-900 leading-none relative z-10">
                            {item.totalCount || (item.items || []).length}{" "}
                            <span className="text-base font-bold text-gray-500">
                              บิล
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-[0.15em]">
                          วันครบกำหนดล่าสุด
                        </label>
                        {isEditing ? (
                          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100/80 to-pink-100/50 flex items-center justify-center shrink-0">
                              <Calendar size={18} className="text-red-500" strokeWidth={2.5} />
                            </div>
                            <input
                              type="date"
                              value={editForm.customerDueDate || ""}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, customerDueDate: e.target.value }))}
                              className="flex-1 bg-transparent font-bold text-base text-gray-900 outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-900 font-bold text-base bg-gradient-to-r from-red-50/80 to-pink-50/50 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100/80 to-pink-100/50 flex items-center justify-center group-hover:from-red-200/80 group-hover:to-pink-200/50 transition-all duration-300">
                              <Calendar size={18} className="text-red-500" strokeWidth={2.5} />
                            </div>
                            {formatDate(item.customerDueDate)}
                          </div>
                        )}
                      </div>

                      {/* Save / Cancel Buttons */}
                      {isEditing && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 rounded-2xl text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 transition-all duration-300 active:scale-95 border border-gray-200"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-95 disabled:opacity-50"
                          >
                            <Save size={16} strokeWidth={2.5} />
                            {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Bill List Tab */
                  <div className="bg-white p-10 h-full">
                    <div className="mb-7">
                      <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight mb-2">
                        รายการใบแจ้งหนี้ทั้งหมด
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        แสดง {bills.length} รายการ
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-xl">
                      {bills.length > 0 ? (
                        bills.map((bill, index) => (
                          <div
                            key={bill.id}
                            className="p-6 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-300 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBill(bill);
                                }}
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 group-hover:from-orange-50 group-hover:to-orange-100 group-hover:text-primary transition-all duration-300 border border-gray-200/60 group-hover:border-orange-200/60 shadow-md group-hover:shadow-lg group-hover:scale-110 cursor-pointer"
                                title="ดูใบเสร็จ"
                              >
                                <Calendar size={22} strokeWidth={2.5} />
                              </button>
                              <div>
                                <p className="text-base font-black text-gray-900 mb-1">
                                  #{bill.orderNo}
                                </p>
                                <p className="text-xs text-gray-500 font-semibold">
                                  {new Date(
                                    bill.createdAt || bill.dueDate,
                                  ).toLocaleDateString("th-TH")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-gray-900 mb-2">
                                ฿{Number(bill.amount).toLocaleString()}
                              </p>
                              <span
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ${bill.overdueDays > 0 ? "bg-gradient-to-r from-red-100 to-red-50 text-red-600 border border-red-200/50" : "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 border border-orange-200/50"}`}
                              >
                                {bill.status === "overdue"
                                  ? "เกินกำหนด"
                                  : bill.status === "unpaid"
                                    ? "ค้างชำระ"
                                    : bill.status === "paid"
                                      ? "ชำระแล้ว"
                                      : bill.status === "partial"
                                        ? "ชำระบางส่วน"
                                        : bill.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-16 text-center text-gray-400 text-base font-semibold">
                          ไม่พบรายการใบแจ้งหนี้
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        visible={!!selectedBill}
        transaction={
          selectedBill
            ? {
                receiptNo: selectedBill.orderNo || "-",
                date: new Date(
                  selectedBill.createdAt || selectedBill.dueDate,
                ).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                paymentMethod: "เครดิต",
                items: [
                  {
                    name: `รายการ #${selectedBill.orderNo}`,
                    quantity: 1,
                    price: Number(selectedBill.amount),
                  },
                ],
                total: Number(selectedBill.amount),
                received: 0,
                change: 0,
                store: {
                  name: item?.name || "ลูกค้า",
                  address: "-",
                  phone: item?.phone || "-",
                },
              }
            : null
        }
        onClose={() => setSelectedBill(null)}
        onPrint={() => window.print()}
        onNewTransaction={() => setSelectedBill(null)}
      />
    </div>,
    document.body
  );
};

export default DebtorDetailModal;
