import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { createPortal } from "react-dom";

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    id: product?.id || "",
    name: product?.name || "",
    category: product?.category || "",
    qty: product?.stock_qty || "",
    cost: product?.cost_price || "",
    price: product?.price || "",
    exp: product?.exp || "",
    image: product?.image_url || product?.image || "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-[800px] relative shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-[#1B2559]">
            แก้ไขรายละเอียดสินค้า
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col lg:flex-row gap-8">
          {/* Left Column: Image */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 p-4 mb-4">
              <img
                src={formData.image || "https://via.placeholder.com/150"}
                alt={formData.name}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-2/3 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product ID */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1B2559]">
                  รหัสสินค้า
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all placeholder:text-gray-400"
                  placeholder="รหัสสินค้า"
                />
              </div>

              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1B2559]">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all placeholder:text-gray-400"
                  placeholder="ชื่อสินค้า"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1B2559]">
                  หมวดหมู่
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    <option value="ขนม">ขนม</option>
                    <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                    <option value="ของใช้">ของใช้</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 4.5L6 8L9.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1B2559]">
                  จำนวน
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all placeholder:text-gray-400 text-right pr-10"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                    ถุง
                  </span>
                </div>
              </div>

              {/* Cost Price */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1B2559]">
                  ราคาทุน
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all placeholder:text-gray-400 text-right pr-12"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                    บาท
                  </span>
                </div>
              </div>

              {/* Selling Price */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1B2559]">
                  ราคาขาย
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all placeholder:text-gray-400 text-right pr-12"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                    บาท
                  </span>
                </div>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1B2559]">
                วันหมดอายุ
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="exp"
                  value={formData.exp}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FFB547]/50 transition-all placeholder:text-gray-400"
                />
                <Calendar
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => onSave(formData)}
                className="bg-[#FFA41B] text-white text-base font-bold px-12 py-3 rounded-2xl shadow-lg shadow-amber-200 hover:bg-[#ff9500] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 active:translate-y-0"
              >
                แก้ไขรายการ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EditProductModal;
