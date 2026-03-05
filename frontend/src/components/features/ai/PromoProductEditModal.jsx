import React, { useMemo } from "react";
import { X, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

const PromoProductEditModal = ({
  isOpen,
  product,
  formData,
  onFormChange,
  onSave,
  onClose,
}) => {
  const validation = useMemo(() => {
    if (!product || !formData) return { errors: {}, warnings: {}, isValid: true };
    const errors = {};
    const warnings = {};

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = "จำนวนต้องมากกว่า 0";
    } else if (qty > product.stock) {
      warnings.quantity = "สต็อกไม่เพียงพอ (คงเหลือ " + product.stock + ")";
    }

    const cost = parseFloat(formData.costPrice);
    const lastPrice = parseFloat(formData.lastSalePrice);
    if (!isNaN(cost) && !isNaN(lastPrice) && cost > lastPrice) {
      warnings.costPrice = "ต้นทุนสูงกว่าราคาขาย (ขาดทุน)";
    }

    return {
      errors,
      warnings,
      isValid: Object.keys(errors).length === 0,
    };
  }, [product, formData]);

  if (!isOpen || !product) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-3xl blur-2xl" />
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                แก้ไขข้อมูลสินค้า
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-500 text-gray-500 hover:text-white transition-all flex items-center justify-center group"
              >
                <X
                  size={18}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* Body - Two Column Layout: 50% Image, 50% Form */}
          <div className="p-6 flex gap-6">
            {/* Left: Product Image - 50% */}
            <div className="basis-[50%] flex flex-col items-center justify-center">
              <div className="w-72 h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                <img
                  src={
                    product.image ||
                    product.image_url ||
                    "https://via.placeholder.com/300"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-bold text-gray-900">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  SKU: {product.sku || product.id}
                </p>
              </div>
            </div>

            {/* Right: Form Fields - 50% */}
            <div className="basis-[50%] space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  จำนวน
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) =>
                    onFormChange({ ...formData, quantity: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 text-sm font-semibold transition-all ${
                    validation.errors.quantity
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : validation.warnings.quantity
                      ? "border-orange-300 focus:border-orange-500 focus:ring-orange-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                  placeholder="จำนวน"
                />
                {validation.errors.quantity && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {validation.errors.quantity}
                  </p>
                )}
                {validation.warnings.quantity && !validation.errors.quantity && (
                  <p className="text-orange-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {validation.warnings.quantity}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  วันที่หมดอายุ
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      expiryDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold transition-all"
                />
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ทุน (฿)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPrice}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      costPrice: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 text-sm font-semibold transition-all ${
                    validation.warnings.costPrice
                      ? "border-orange-300 focus:border-orange-500 focus:ring-orange-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                  placeholder="0.00"
                />
                {validation.warnings.costPrice && (
                  <p className="text-orange-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {validation.warnings.costPrice}
                  </p>
                )}
              </div>

              {/* Acceptable Profit */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  กำไรที่ยอมรับได้ (฿)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.acceptableProfit}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      acceptableProfit: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Last Sale Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ราคาขายล่าสุด (฿)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.lastSalePrice}
                  onChange={(e) =>
                    onFormChange({
                      ...formData,
                      lastSalePrice: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-semibold transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!validation.isValid}
              className={`flex-[2] py-3 text-white rounded-xl font-black transition-all shadow-lg ${
                validation.isValid
                  ? "bg-gradient-to-r from-primary to-orange-600 hover:shadow-xl hover:scale-[1.02] shadow-primary/30"
                  : "bg-gray-300 cursor-not-allowed shadow-none"
              }`}
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default PromoProductEditModal;
