import React, { useState } from "react";
import CustomDatePicker from "../../common/CustomDatePicker";

const EditDebtorModal = ({ item, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(item || {});

  if (!isOpen || !item) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    let formattedValue = rawValue;

    if (rawValue.length > 6) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(
        3,
        6
      )}-${rawValue.slice(6, 10)}`;
    } else if (rawValue.length > 3) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
    }

    handleChange("phone", formattedValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-[#1B2559] mb-4">แก้ไขข้อมูล</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#6d28d9] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="text"
              value={formData.phone || ""}
              onChange={handlePhoneChange}
              maxLength={12}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#6d28d9] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ยอดค้างชำระ
            </label>
            <input
              type="number"
              value={formData.amount || ""}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันครบกำหนด
            </label>
            <CustomDatePicker
              value={formData.dueDate}
              onChange={(date) => handleChange("dueDate", date)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#6d28d9] text-white font-medium hover:bg-[#5b21b6]"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDebtorModal;
