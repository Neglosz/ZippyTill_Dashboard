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
import { orderService } from "../../../services/orderService";
import ReceiptModal from "../../modals/ReceiptModal";

const DebtorDetailModal = ({
  item,
  isOpen,
  onClose,
  onSave,
  activeBranchId,
}) => {
  const [activeTab, setActiveTab] = useState("info"); // "info" or "bills"
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    customerDueDate: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedBill, setSelectedBill] = useState(null);
  const [fullOrderData, setFullOrderData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);

  useEffect(() => {
    if (item) {
      setEditForm({
        name: item.name || "",
        phone: item.phone || "",
        customerDueDate: item.customerDueDate || "",
      });
      setIsEditing(false);
      setErrors({});
    }
  }, [item]);

  useEffect(() => {
    if (selectedBill && activeBranchId) {
      fetchOrderDetails(selectedBill.orderId);
    } else {
      setFullOrderData(null);
    }
  }, [selectedBill, activeBranchId]);

  const fetchOrderDetails = async (orderId) => {
    if (!orderId || !activeBranchId) return;
    setIsLoadingDetails(true);
    try {
      const details = await orderService.getOrderDetails(
        orderId,
        activeBranchId,
      );
      setFullOrderData(details);
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = rawValue;
    if (rawValue.length > 6) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 6)}-${rawValue.slice(6)}`;
    } else if (rawValue.length > 3) {
      formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    }
    setEditForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const handleNameChange = (e) => {
    setEditForm(prev => ({ ...prev, name: e.target.value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: null }));
    }
  };

  const handleSave = async () => {
    if (!onSave || !item) return;
    
    const newErrors = {};
    
    // TC045: Validate name is not empty
    if (!editForm.name || !editForm.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อลูกค้า";
    }
    
    // TC047: Validate phone length
    const phoneDigits = (editForm.phone || "").replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length < 10) {
      newErrors.phone = "กรุณาใส่เบอร์โทรศัพท์ให้ครบ 10 หลัก";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TC048: Check for past date
    if (editForm.customerDueDate) {
      const selectedDate = new Date(editForm.customerDueDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setShowDateWarning(true);
        return;
      }
    }

    confirmSave();
  };

  const confirmSave = async () => {
    // TC049: Basic sanitization for name
    const sanitizedName = (editForm.name || "").trim().replace(/<[^>]*>?/gm, '');

    setIsSaving(true);
    try {
      await onSave(item.customerId, {
        name: sanitizedName,
        phone: editForm.phone.replace(/\D/g, ""),
        customerDueDate: editForm.customerDueDate,
      });
      setIsEditing(false);
      setErrors({});
      setShowDateWarning(false);
    } catch (err) {
      console.error("Error saving:", err);
      // TC050: Descriptive error message
      alert(err.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
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
    setErrors({});
  };

  if (!isOpen || !item) return null;

  const getStatusBadge = (status, days) => {
    if (days > 0 || status === "overdue" || status === "เกินกำหนด") {
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
    const datePart = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;
    const [year, month, day] = datePart.split("-");
    return `${day}-${month}-${year}`;
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith("http") || cleanPath.startsWith("data:")) return cleanPath;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    let fullPath = cleanPath;
    if (!cleanPath.startsWith("customers/")) {
      fullPath = `customers/${cleanPath}`;
    }
    return `${supabaseUrl}/storage/v1/object/public/${fullPath}`;
  };

  const isOverdue = (() => {
    // Use the date from the form if editing, otherwise from the item
    const dateToCheck = isEditing ? editForm.customerDueDate : item.customerDueDate;
    if (!dateToCheck) return false;
    
    const due = new Date(dateToCheck);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return today > due;
  })();

  const bills = item.items || [];

  const modalContent = (
    <div className="fixed inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-lg flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-500 overflow-y-auto">
      <div className="bg-gradient-to-br from-white via-white to-gray-50/80 rounded-[48px] w-full max-w-4xl max-h-[80vh] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/80 relative backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 via-orange-400/5 to-transparent rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse" />
        
        <div className="relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-white/90 backdrop-blur-sm p-3 rounded-2xl transition-all duration-300 active:scale-90 z-10 shadow-lg hover:shadow-xl border border-gray-200/50"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex h-[600px]">
            <div className="w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-100/50 flex items-center justify-center p-8 relative overflow-hidden">
              <div className="w-full aspect-square bg-gradient-to-br from-white to-gray-50 rounded-[40px] border-2 border-white/80 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 relative">
                <img
                  src={getImageUrl(item.imageUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-1/2 flex flex-col bg-gradient-to-br from-white to-gray-50/30">
              <div className="bg-gradient-to-r from-white to-gray-50/50 px-10 pt-10 pb-0 border-b border-gray-200/50">
                <div className="flex gap-8">
                  <button onClick={() => setActiveTab("info")} className={`pb-5 px-3 font-bold text-base transition-all duration-300 relative ${activeTab === "info" ? "text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                    ข้อมูลทั่วไป
                    {activeTab === "info" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full shadow-lg" />}
                  </button>
                  <button onClick={() => setActiveTab("bills")} className={`pb-5 px-3 font-bold text-base transition-all duration-300 relative flex items-center gap-2.5 ${activeTab === "bills" ? "text-primary" : "text-gray-500 hover:text-gray-700"}`}>
                    รายการใบแจ้งหนี้
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${activeTab === "bills" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}>{bills.length}</span>
                    {activeTab === "bills" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full shadow-lg" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {activeTab === "info" ? (
                  <div className="bg-white p-6 h-full">
                    <div className="space-y-4">
                      {!isEditing && onSave && (
                        <div className="flex justify-end">
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 border border-primary/20">
                            <Pencil size={14} strokeWidth={2.5} /> แก้ไข
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-[0.15em]">
                          ชื่อลูกค้า <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-col gap-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={handleNameChange}
                              className={`text-xl font-black text-gray-900 tracking-tight bg-gray-50 border rounded-xl px-4 py-2 w-full outline-none transition-all ${
                                errors.name ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500" : "border-gray-200 focus:border-primary/50"
                              }`}
                            />
                          ) : (
                            <div className="text-2xl font-black text-gray-900 tracking-tight">
                              {item.name || item.customerName}
                            </div>
                          )}
                          {errors.name && <p className="text-xs font-bold text-rose-500">{errors.name}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-[0.15em]">เบอร์โทรศัพท์</label>
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <div className={`flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border ${errors.phone ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500" : "border-gray-200"}`}>
                              <Phone size={18} className="text-primary" strokeWidth={2.5} />
                              <input type="text" value={editForm.phone} onChange={handlePhoneChange} maxLength={12} placeholder="0XX-XXX-XXXX" className="flex-1 bg-transparent font-bold text-base text-gray-900 outline-none" />
                            </div>
                            {errors.phone && <p className="text-xs font-bold text-rose-500">{errors.phone}</p>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-gray-900 font-bold text-base bg-white/80 border border-gray-200/80 px-4 py-2.5 rounded-2xl shadow-lg">
                            <Phone size={18} className="text-primary" strokeWidth={2.5} />
                            {item.phone ? item.phone.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") : "-"}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200/50 shadow-lg">
                          <label className="text-[9px] font-bold text-orange-700/80 mb-1.5 block uppercase tracking-[0.15em]">ยอดค้างชำระ</label>
                          <div className="text-2xl font-black text-primary">฿{(item.totalAmount || item.amount).toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-lg">
                          <label className="text-[9px] font-bold text-gray-600/80 mb-1.5 block uppercase tracking-[0.15em]">จำนวนบิล</label>
                          <div className="text-2xl font-black text-gray-900">{item.totalCount || (item.items || []).length} บิล</div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1.5 block uppercase tracking-[0.15em]">วันครบกำหนดล่าสุด</label>
                        {isEditing ? (
                          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
                            <Calendar size={18} className={isOverdue ? "text-red-500" : "text-primary"} strokeWidth={2.5} />
                            <input type="date" value={editForm.customerDueDate || ""} onChange={(e) => setEditForm(prev => ({ ...prev, customerDueDate: e.target.value }))} className="flex-1 bg-transparent font-bold text-base text-gray-900 outline-none" />
                          </div>
                        ) : (
                          <div className={`flex items-center gap-3 text-gray-900 font-bold text-base border px-4 py-2.5 rounded-2xl shadow-lg ${isOverdue ? "bg-red-50 border-red-200/50" : "bg-white border-gray-200/80"}`}>
                            <Calendar size={18} className={isOverdue ? "text-red-500" : "text-primary"} strokeWidth={2.5} />
                            {formatDate(item.customerDueDate)}
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 pt-2">
                          <button onClick={handleCancelEdit} disabled={isSaving} className="flex-1 px-4 py-3 rounded-2xl text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 border border-gray-200">ยกเลิก</button>
                          <button onClick={handleSave} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg disabled:opacity-50">
                            <Save size={16} strokeWidth={2.5} /> {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-10 h-full">
                    <div className="mb-7">
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">รายการใบแจ้งหนี้ทั้งหมด</h3>
                      <p className="text-sm text-gray-500 font-medium">แสดง {bills.length} รายการ</p>
                    </div>
                    <div className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-xl">
                      {bills.map((bill) => (
                        <div key={bill.id} onClick={() => setSelectedBill(bill)} className="p-6 hover:bg-orange-50/50 transition-all flex items-center justify-between group cursor-pointer border-b last:border-0">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary border border-gray-200/60 shadow-md"><Calendar size={22} strokeWidth={2.5} /></div>
                            <div>
                              <p className="text-base font-black text-gray-900 mb-1">#{bill.orderNo}</p>
                              <p className="text-xs text-gray-500 font-semibold">{new Date(bill.createdAt || bill.dueDate).toLocaleDateString("th-TH")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-gray-900 mb-2">฿{Number(bill.amount).toLocaleString()}</p>
                            <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ${bill.overdueDays > 0 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                              {bill.status === "overdue" ? "เกินกำหนด" : bill.status === "unpaid" ? "ค้างชำระ" : bill.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date Warning Modal Overlay */}
        {showDateWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10002] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] p-10 w-full max-w-[420px] text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden animate-in zoom-in-95 duration-500 border border-orange-100">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-400 via-rose-500 to-orange-400" />
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center text-orange-500 shadow-inner ring-8 ring-orange-50/50">
                  <Calendar size={48} strokeWidth={2.5} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">วันที่ครบกำหนดเลยมาแล้ว!</h3>
              <p className="text-gray-500 font-medium text-base leading-relaxed mb-10 px-2">
                คุณกำลังเลือกวันที่ในอดีต <span className="text-gray-900 font-bold">({new Date(editForm.customerDueDate).toLocaleDateString('th-TH')})</span><br/>
                ซึ่งจะทำให้สถานะบิลนี้เป็น <span className="text-rose-500 font-black underline decoration-2 underline-offset-4">"เกินกำหนด"</span> ทันที<br/>
                ต้องการดำเนินการต่อหรือไม่?
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmSave} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95">ยืนยันดำเนินการต่อ</button>
                <button onClick={() => setShowDateWarning(false)} className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-100">กลับไปแก้ไขวันที่</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReceiptModal
        visible={!!selectedBill}
        transaction={selectedBill ? {
          receiptNo: selectedBill.orderNo || "-",
          date: new Date(selectedBill.createdAt || selectedBill.dueDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }),
          paymentMethod: "เครดิต",
          items: isLoadingDetails ? [{ name: "กำลังโหลด...", quantity: 0, price: 0, subtotal: 0 }] : 
                 fullOrderData?.order_items?.map(detail => ({ name: detail.products?.name || "สินค้า", quantity: detail.qty, unit: detail.products?.unit_type, price: detail.price_per_unit, subtotal: detail.subtotal })) || [],
          total: Number(selectedBill.amount),
          received: 0, change: 0,
          store: { name: item?.name || "ลูกค้า", address: "-", phone: item?.phone || "-" }
        } : null}
        onClose={() => setSelectedBill(null)}
        onPrint={() => window.print()}
        onNewTransaction={() => setSelectedBill(null)}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DebtorDetailModal;
