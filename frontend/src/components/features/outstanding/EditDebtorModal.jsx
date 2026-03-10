import React, { useState } from "react";
import CustomDatePicker from "../../common/CustomDatePicker";
import { Calendar } from "lucide-react";

const EditDebtorModal = ({ item, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(item || {});
  const [errors, setErrors] = useState({});
  const [showDateWarning, setShowDateWarning] = useState(false);

  if (!isOpen || !item) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formattedValue = rawValue;

    if (rawValue.length > 6) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(
        3,
        6
      )}-${rawValue.slice(6)}`;
    } else if (rawValue.length > 3) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    }

    handleChange("phone", formattedValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // TC045: Validate name is not empty
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อ-นามสกุล";
    }
    
    // TC047: Validate phone length
    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    if (phoneDigits.length > 0 && phoneDigits.length < 10) {
      newErrors.phone = "กรุณาใส่เบอร์โทรศัพท์ให้ครบ 10 หลัก";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TC048: Check for past date
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setShowDateWarning(true);
        return;
      }
    }

    processSave();
  };

  const processSave = () => {
    // TC049: Basic sanitization for name
    const sanitizedName = (formData.name || "").trim().replace(/<[^>]*>?/gm, '');
    
    onSave({
      ...formData,
      name: sanitizedName
    });
    setShowDateWarning(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
          <h3 className="text-2xl font-black text-[#1B2559] mb-6 tracking-tight">แก้ไขข้อมูล</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2">
                ชื่อ-นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="ชื่อ-นามสกุลลูกค้า"
                className={`w-full bg-gray-50/50 border rounded-2xl px-5 py-3.5 font-bold text-gray-900 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${
                  errors.name ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500" : "border-gray-100 focus:border-primary/30"
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-xs font-bold text-rose-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2">
                เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={handlePhoneChange}
                maxLength={12}
                placeholder="0XX-XXX-XXXX"
                className={`w-full bg-gray-50/50 border rounded-2xl px-5 py-3.5 font-bold text-gray-900 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all ${
                  errors.phone ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500" : "border-gray-100 focus:border-primary/30"
                }`}
              />
              {errors.phone && (
                <p className="mt-2 text-xs font-bold text-rose-500">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2">
                ยอดค้างชำระ
              </label>
              <div className="w-full bg-gray-100 border border-gray-100 rounded-2xl px-5 py-3.5 font-black text-gray-400 cursor-not-allowed">
                ฿ {(formData.amount || 0).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2">
                วันครบกำหนด
              </label>
              <CustomDatePicker
                value={formData.dueDate}
                onChange={(date) => handleChange("dueDate", date)}
              />
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl text-gray-500 font-bold bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-lg active:scale-95"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Beautiful Date Warning Modal */}
      {showDateWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10002] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-[420px] text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden animate-in zoom-in-95 duration-500 border border-orange-100">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-400 via-rose-500 to-orange-400" />
            
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center text-orange-500 shadow-inner ring-8 ring-orange-50/50">
                <Calendar size={48} strokeWidth={2.5} />
              </div>
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">
              วันที่ครบกำหนดเลยมาแล้ว!
            </h3>
            <p className="text-gray-500 font-medium text-base leading-relaxed mb-10 px-2">
              คุณกำลังเลือกวันที่ในอดีต <span className="text-gray-900 font-bold">({new Date(formData.dueDate).toLocaleDateString('th-TH')})</span><br/>
              ซึ่งจะทำให้สถานะบิลนี้เป็น <span className="text-rose-500 font-black underline decoration-2 underline-offset-4">"เกินกำหนด"</span> ทันที<br/>
              ต้องการดำเนินการต่อหรือไม่?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={processSave}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl active:scale-95"
              >
                ยืนยันดำเนินการต่อ
              </button>
              <button
                onClick={() => setShowDateWarning(false)}
                className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
              >
                กลับไปแก้ไขวันที่
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditDebtorModal;
