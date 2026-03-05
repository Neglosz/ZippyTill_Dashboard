import React, { useState, useEffect } from "react";
import {
  Plus,
  Target,
  Calendar,
  Package,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { promotionService } from "../../../services/promotionService";

// ─── Helper utilities ───────────────────────────────────────────────
const parseLocalDate = (dateStr, isEndDate = false) => {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return isEndDate
      ? new Date(year, month - 1, day, 23, 59, 59)
      : new Date(year, month - 1, day, 0, 0, 0);
  }
  return new Date(dateStr);
};

const getStatusInfo = (isActive, endDate) => {
  if (!isActive) return { label: "ปิดใช้งาน", color: "bg-gray-400" };
  if (parseLocalDate(endDate, true) < new Date())
    return { label: "หมดอายุ", color: "bg-red-500" };
  return { label: "ใช้งาน", color: "bg-emerald-500" };
};

const formatDateRange = (start, end) => {
  if (!start && !end) return "ไม่มีกำหนด";
  const s = start ? parseLocalDate(start).toLocaleDateString("th-TH") : "...";
  const e = end
    ? parseLocalDate(end, true).toLocaleDateString("th-TH")
    : "ไม่มีกำหนด";
  return `${s} - ${e}`;
};

const getPromotionLabel = (promo) => {
  switch (promo.type) {
    case "discount_percent":
      return `ลด ${promo.discount_value}%`;
    case "discount_amount":
      return `ลด ฿${promo.discount_value}`;
    case "buy_x_get_y":
      return `ซื้อ ${promo.min_qty_required} แถม ${promo.free_qty}`;
    case "bundle":
      return "ราคาพิเศษยกชุด";
    default:
      return "ส่วนลดพิเศษ";
  }
};

const getTimeRemaining = (startDate, endDate) => {
  const now = new Date();
  const start = parseLocalDate(startDate) || now;
  const end = parseLocalDate(endDate, true);
  if (!end)
    return {
      text: "ไม่มีกำหนด",
      percentage: 0,
      color: "from-emerald-500 to-emerald-600",
    };

  const total = end - start;
  const remaining = end - now;

  if (remaining <= 0)
    return {
      text: "หมดเวลา",
      percentage: 100,
      color: "from-red-500 to-red-600",
    };

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const elapsed = now - start;
  const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));

  const remainingPercentage = 100 - percentage;
  const color =
    remainingPercentage > 50
      ? "from-emerald-500 to-emerald-600"
      : remainingPercentage > 20
        ? "from-yellow-500 to-yellow-600"
        : "from-red-500 to-red-600";

  let text;
  if (days > 0) {
    text = `${days} วัน ${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
  } else if (hours > 0) {
    text = `${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`;
  } else if (minutes > 0) {
    text = `${minutes} นาที ${seconds} วินาที`;
  } else {
    text = `${seconds} วินาที`;
  }

  return { text, percentage, color };
};

// ─── Component ────────────────────────────────────────────────────────
const PromotionDetailModal = ({ promo, onClose, onDeleteSuccess }) => {
  const [promoProducts, setPromoProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [, setTick] = useState(0);

  // live countdown ticker
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // fetch products for this promotion
  const fetchProducts = async () => {
    if (!promo) return;
    setIsLoading(true);
    try {
      const data = await promotionService.getPromotionDetails(promo.id);
      setPromoProducts(
        data?.promotion_items?.map((item) => item.product).filter(Boolean) ||
          [],
      );
    } catch (e) {
      console.error("PromotionDetailModal fetch error:", e);
      setPromoProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [promo?.id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await promotionService.deletePromotion(promo.id);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      alert("ไม่สามารถลบโปรโมชั่นได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleDeleteItem = async (productId) => {
    if (!window.confirm("คุณต้องการลบสินค้านี้ออกจากโปรโมชั่นใช่หรือไม่?")) return;
    
    try {
      setDeletingProductId(productId);
      await promotionService.deletePromotionItem(promo.id, productId);
      // Update local state instead of re-fetching to be faster
      setPromoProducts(prev => prev.filter(p => p.id !== productId));
      if (onDeleteSuccess) {
        onDeleteSuccess(); // Refresh parent to update item count
      }
    } catch (error) {
      console.error("Failed to delete promotion item:", error);
      alert("ไม่สามารถลบสินค้าออกจากโปรโมชั่นได้");
    } finally {
      setDeletingProductId(null);
    }
  };

  if (!promo) return null;

  const status = getStatusInfo(promo.is_active, promo.end_date);
  const timeRemaining = promo.end_date
    ? getTimeRemaining(promo.start_date, promo.end_date)
    : null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-orange-50 p-8 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg text-white ${status.color}`}
                >
                  {status.label}
                </span>
                <span className="text-[10px] font-bold text-inactive uppercase tracking-wider">
                  ID: {promo.id.slice(0, 8)}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter pt-2">
                {promo.name}
              </h2>
              {promo.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {promo.description}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="w-10 h-10 bg-white/80 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all border border-red-100 shadow-sm shrink-0"
                title="ลบโปรโมชั่น"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/80 rounded-2xl flex items-center justify-center text-inactive hover:text-primary hover:bg-primary/5 transition-all border border-gray-100 shadow-sm shrink-0"
                title="ปิด"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-4">
          {/* Discount Type */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-inactive uppercase tracking-wider mb-0.5">
                ประเภทส่วนลด
              </p>
              <p className="text-sm font-black text-gray-900">
                {getPromotionLabel(promo)}
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-inactive uppercase tracking-wider mb-0.5">
                ระยะเวลา
              </p>
              <p className="text-sm font-black text-gray-900">
                {formatDateRange(promo.start_date, promo.end_date)}
              </p>
            </div>
          </div>

          {/* Products List */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Package size={18} className="text-emerald-500" />
              </div>
              <p className="text-[10px] font-black text-inactive uppercase tracking-wider">
                สินค้าที่ร่วมรายการ ({promoProducts.length} รายการ)
              </p>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-3">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : promoProducts.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium text-center py-2">
                ไม่มีข้อมูลสินค้า
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {promoProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100 group"
                  >
                    <span className="text-sm font-bold text-gray-800 truncate flex-1">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-sm font-black text-primary shrink-0">
                        ฿{product.price?.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(product.id)}
                        disabled={deletingProductId === product.id}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="ลบรายการนี้"
                      >
                        {deletingProductId === product.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Time Remaining */}
          {timeRemaining && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex justify-between mb-3">
                <p className="text-[10px] font-black text-inactive uppercase tracking-wider">
                  เวลาที่เหลือ
                </p>
                <p className="text-[10px] font-black text-gray-900">
                  {timeRemaining.text}
                </p>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${timeRemaining.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${100 - timeRemaining.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all text-sm"
          >
            ปิด
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              ยืนยันการลบโปรโมชั่น?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              การลบโปรโมชั่นไม่สามารถกู้คืนได้ และจะหยุดให้ส่วนลดทันที
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <span>ยืนยันลบ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionDetailModal;
