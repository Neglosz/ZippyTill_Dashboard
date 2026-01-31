import React, { useState } from "react";
import {
  X,
  Search,
  Filter,
  Check,
  ChevronRight,
  ChevronLeft,
  Percent,
  DollarSign,
  Gift,
  Calendar,
  Tag,
  ShoppingBag,
  Sparkles,
  Clock,
  Package,
} from "lucide-react";
import { createPortal } from "react-dom";

const CreatePromotionModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [promoData, setPromoData] = useState({
    name: "",
    type: "percent", // percent, amount, buy_get
    value: "",
    minSpend: "",
    startDate: "",
    endDate: "",
  });

  if (!isOpen) return null;

  // Mock Products
  const products = [
    {
      id: "SKU001",
      name: "มาม่า รสต้มยำกุ้ง",
      price: 6,
      stock: 156,
      image:
        "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop",
    },
    {
      id: "SKU002",
      name: "เลย์ รสออริจินัล",
      price: 25,
      stock: 280,
      image:
        "https://images.unsplash.com/photo-1566478919030-26d81dd812de?w=200&h=200&fit=crop",
    },
    {
      id: "SKU003",
      name: "โค้ก 325 มล.",
      price: 15,
      stock: 200,
      image:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop",
    },
    {
      id: "SKU004",
      name: "เป๊ปซี่ 325 มล.",
      price: 15,
      stock: 380,
      image:
        "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop",
    },
    {
      id: "SKU005",
      name: "ทวิสตี้ รสชีส",
      price: 20,
      stock: 65,
      image:
        "https://images.unsplash.com/photo-1599490659213-e2b95b777a58?w=200&h=200&fit=crop",
    },
    {
      id: "SKU006",
      name: "น้ำส้ม 600 มล.",
      price: 10,
      stock: 500,
      image:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop",
    },
    {
      id: "SKU007",
      name: "ชาทไวนิงส์ English",
      price: 225,
      stock: 45,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&h=200&fit=crop",
    },
    {
      id: "SKU008",
      name: "สบู่ลักส์",
      price: 35,
      stock: 145,
      image:
        "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=200&h=200&fit=crop",
    },
  ];

  const toggleProduct = (product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  // --- Render Steps ---
  const renderStep1 = () => (
    <div className="flex flex-col lg:flex-row h-full gap-6 ">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        {/* Top Filter Bar */}
        <div className="bg-gray-200/80 p-1.5 rounded-2xl flex items-center gap-2 mb-2 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-gray-900 whitespace-nowrap ring-1 ring-black/5">
            <Search size={16} strokeWidth={2.5} />
            สินค้าทั้งหมด
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/50 rounded-xl text-sm font-bold text-gray-500 whitespace-nowrap transition-colors">
            <Clock size={16} strokeWidth={2.5} />
            ใกล้หมดอายุ
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/50 rounded-xl text-sm font-bold text-gray-500 whitespace-nowrap transition-colors">
            <Package size={16} strokeWidth={2.5} />
            ล้นสต๊อก
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="ค้นหาสินค้า......"
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-sm font-bold placeholder-gray-400 shadow-sm"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1">
          <button className="px-6 py-2 rounded-full border border-gray-600 bg-white text-gray-900 text-sm font-bold shadow-sm whitespace-nowrap">
            ทั้งหมด
          </button>
          <button className="px-6 py-2 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-400 text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all">
            <Check size={14} className="opacity-0" />
            ยอดขายต่ำ
          </button>
          <button className="px-6 py-2 rounded-full border border-gray-200 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-400 text-sm font-bold whitespace-nowrap flex items-center gap-2 transition-all">
            <Check size={14} className="opacity-0" />
            ยอดขายดี
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20 custom-scrollbar">
          {products.map((product) => {
            const isSelected = selectedProducts.find(
              (p) => p.id === product.id,
            );
            return (
              <div
                key={product.id}
                onClick={() => toggleProduct(product)}
                className={`group relative p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white z-10 animate-fade-in-up">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
                <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-[10px] text-inactive font-medium mb-2">
                  {product.id}
                </p>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-black text-primary">
                    ฿{product.price}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    คงเหลือ {product.stock}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Items Sidebar */}
      <div className="w-full lg:w-[320px] bg-white border border-gray-100 rounded-2xl p-6 shadow-premium flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">
            สินค้าที่เลือก ({selectedProducts.length})
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {selectedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag size={48} className="text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-400">
                ยังไม่ได้เลือกสินค้า
              </p>
            </div>
          ) : (
            selectedProducts.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 relative group text-left"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProduct(p);
                  }}
                  className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden shrink-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-primary">
                      ฿{p.price}
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                      {p.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleNext}
            disabled={selectedProducts.length === 0}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            ไปขั้นตอนถัดไป
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            ชื่อโปรโมชั่น
          </label>
          <input
            type="text"
            value={promoData.name}
            onChange={(e) =>
              setPromoData({ ...promoData, name: e.target.value })
            }
            placeholder="เช่น โปรโมชั่นวันตรุษจีน"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            ประเภทโปรโมชั่น
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                id: "percent",
                label: "ส่วนลดเปอร์เซ็นต์",
                desc: "ลดราคาตามเปอร์เซ็นต์ที่กำหนด",
                icon: Percent,
              },
              {
                id: "amount",
                label: "ส่วนลดจำนวนเงิน",
                desc: "ลดราคาตามจำนวนเงินที่กำหนด",
                icon: DollarSign,
              },
              {
                id: "buy_get",
                label: "ซื้อ X แถม Y",
                desc: "ซื้อสินค้าครบจำนวนรับของแถม",
                icon: Gift,
              },
            ].map((type) => (
              <div
                key={type.id}
                onClick={() => setPromoData({ ...promoData, type: type.id })}
                className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${
                  promoData.type === type.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-gray-200 hover:border-primary/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${promoData.type === type.id ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <type.icon size={20} />
                </div>
                <div>
                  <h4
                    className={`font-bold text-sm ${promoData.type === type.id ? "text-primary" : "text-gray-900"}`}
                  >
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-fit">
        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
          <Tag size={18} className="text-primary" />
          ตั้งค่าส่วนลด
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              {promoData.type === "percent"
                ? "ส่วนลด (%)"
                : promoData.type === "amount"
                  ? "ส่วนลด (บาท)"
                  : "จำนวนที่ต้องซื้อ"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={promoData.value}
                onChange={(e) =>
                  setPromoData({ ...promoData, value: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg font-black text-gray-900"
                placeholder="0"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                {promoData.type === "percent"
                  ? "%"
                  : promoData.type === "amount"
                    ? "THB"
                    : "ชิ้น"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
              ยอดซื้อขั้นต่ำ (บาท)
            </label>
            <input
              type="number"
              value={promoData.minSpend}
              onChange={(e) =>
                setPromoData({ ...promoData, minSpend: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              placeholder="0" // Default 0
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                วันเริ่มต้น
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                วันสิ้นสุด
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium text-gray-600"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            ย้อนกลับ
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            ไปขั้นตอนถัดไป
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-premium text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-400 to-orange-500"></div>
        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20 shadow-sm relative z-10">
          <Sparkles size={40} className="animate-pulse" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">
          โปรโมชั่นใหม่
        </h2>
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold mb-8">
          {promoData.name || "โปรโมชั่นใหม่"}
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-inactive text-xs font-bold uppercase">
              <Calendar size={12} />
              ระยะเวลา
            </div>
            <p className="font-bold text-gray-900 text-sm">ไม่ระบุ</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-inactive text-xs font-bold uppercase">
              <Tag size={12} />
              ยอดซื้อขั้นต่ำ
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {promoData.minSpend ? `฿${promoData.minSpend}` : "ไม่กำหนด"}
            </p>
          </div>
          <div className="col-span-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
            <div className="flex items-center gap-2 mb-2 text-primary text-xs font-bold uppercase">
              <Package size={12} />
              สินค้าที่ร่วมรายการ
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {selectedProducts.length} รายการ
            </p>
          </div>
          <div className="col-span-2 bg-primary p-4 rounded-xl border border-primary/10 text-white shadow-lg shadow-primary/20">
            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs font-bold uppercase">
              <Percent size={12} />
              ประเภทส่วนลด
            </div>
            <p className="font-black text-2xl">
              {promoData.type === "percent"
                ? `ลด ${promoData.value || 0}%`
                : promoData.type === "amount"
                  ? `ลด ฿${promoData.value || 0}`
                  : "ซื้อแถมฟรี"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-4">
            <Check size={20} className="bg-emerald-100 p-0.5 rounded-full" />
            พร้อมสร้างโปรโมชั่น
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm font-medium text-emerald-800/80">
              <Check size={16} className="text-emerald-500" />
              เลือกสินค้าแล้ว {selectedProducts.length} รายการ
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-emerald-800/80">
              <Check size={16} className="text-emerald-500" />
              ตั้งค่าส่วนลดเรียบร้อย
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-emerald-800/80">
              <Check size={16} className="text-emerald-500" />
              กำหนดระยะเวลาแล้ว
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <button
            className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all flex items-center justify-center gap-2"
            onClick={onClose}
          >
            <Sparkles size={20} className="animate-pulse" />
            สร้างโปรโมชั่น
          </button>
          <button
            onClick={handleBack}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            ย้อนกลับแก้ไข
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-20">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              สร้างโปรโมชั่น
            </h2>
            <p className="text-xs text-inactive font-bold mt-1">
              เลือกสินค้าและตั้งค่าส่วนลดสำหรับโปรโมชั่นใหม่
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Stepper */}
        <div className="py-6 px-12 bg-white flex justify-center shrink-0 relative z-10">
          <div className="flex items-center w-full max-w-lg relative">
            {/* Progress Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>

            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-all duration-300 ${
                    s <= step
                      ? "bg-primary border-white ring-2 ring-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  {s < step ? <Check size={18} strokeWidth={4} /> : s}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${s <= step ? "text-primary" : "text-gray-300"}`}
                >
                  {s === 1
                    ? "เลือกสินค้า"
                    : s === 2
                      ? "ตั้งค่าโปรโมชั่น"
                      : "ยืนยัน"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F9FAFB] custom-scrollbar">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreatePromotionModal;
