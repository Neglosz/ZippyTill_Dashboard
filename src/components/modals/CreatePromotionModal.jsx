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
  Package,
  Star,
  TrendingUp,
  Heart,
  AlertCircle,
  Settings2,
} from "lucide-react";
import { createPortal } from "react-dom";

const CreatePromotionModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [promoData, setPromoData] = useState({
    name: "",
    type: "percent",
    value: "",
    minSpend: "",
    startDate: "",
    endDate: "",
    prompt: "",
  });

  if (!isOpen) return null;

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

  const renderStep1 = () => (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-5 min-h-0">
        {/* Premium Tab Switcher */}
        <div className="relative bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg border border-white/60">
          <div className="flex gap-1.5">
            {[
              { label: "สินค้าทั้งหมด", icon: Package },
              { label: "ใกล้หมดอายุ", icon: Calendar },
              { label: "ล้นสต็อก", icon: TrendingUp },
            ].map((tab, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(i);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === i
                  ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/30 scale-[1.02]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                  }`}
              >
                <tab.icon
                  size={16}
                  className={activeTab === i ? "animate-pulse" : ""}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Glassmorphic Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-premium overflow-hidden">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            <input
              type="text"
              placeholder="ค้นหาสินค้าด้วย ชื่อ, SKU, หรือหมวดหมู่..."
              className="w-full pl-14 pr-6 py-4 bg-transparent focus:outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Modern Filter Pills - Only show on All Products tab */}
        {activeTab === 0 && (
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "ทั้งหมด", icon: Star },
              { label: "ยอดขายต่ำ", icon: TrendingUp },
              { label: "ยอดขายดี", icon: Sparkles },
              { label: "ลูกค้าชอบ", icon: Heart },
              { label: "กำไรสูง", icon: DollarSign },
            ].map((cat, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveFilter(i);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm h-10 font-bold whitespace-nowrap transition-all duration-300 ${activeFilter === i
                  ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/20 scale-105"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:shadow-md"
                  }`}
              >
                <cat.icon size={14} />
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Alert Box for Expiring/Overstocked Products */}
        {activeTab === 1 && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm">
                  สินค้าใกล้หมดอายุ
                </h4>
                <p className="text-xs text-red-700 font-medium">
                  มี 6 รายการที่หมดอายุภายใน 30 วัน
                  แนะนำให้ทำโปรโมชั่นเพื่อระบาย
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Select all logic would go here
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              เลือกทั้งหมด
            </button>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                <Package className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-orange-900 text-sm">
                  สินค้าล้นสต็อก
                </h4>
                <p className="text-xs text-orange-700 font-medium">
                  มี 4 รายการที่สต็อกเยอะ (50%
                  ขอแนะนำให้ลดราคาเพื่อเพิ่มการหมุนเวียน
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Select all logic would go here
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              เลือกทั้งหมด
            </button>
          </div>
        )}

        {/* Premium Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto pr-2 pb-20">
          {products.map((product) => {
            const isSelected = selectedProducts.find(
              (p) => p.id === product.id,
            );
            return (
              <div
                key={product.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleProduct(product);
                }}
                className={`group relative rounded-2xl cursor-pointer transition-all duration-500 ${isSelected ? "scale-[1.02]" : "hover:scale-[1.03]"
                  }`}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 ${isSelected
                    ? "bg-gradient-to-br from-primary/30 to-orange-400/30 opacity-100"
                    : "bg-gradient-to-br from-gray-200/50 to-gray-300/50 opacity-0 group-hover:opacity-100"
                    }`}
                />

                {/* Card Content */}
                <div
                  className={`relative bg-white rounded-2xl border-2 p-3 transition-all duration-300 ${isSelected
                    ? "border-primary shadow-xl shadow-primary/20"
                    : "border-gray-100 group-hover:border-gray-200 shadow-md group-hover:shadow-xl"
                    }`}
                >
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-7 h-7 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center text-white z-20 shadow-lg shadow-primary/40">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  {/* Discount Badge for Expiring Products */}
                  {activeTab === 1 && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-tl-[14px] rounded-br-lg shadow-md z-10">
                      ลด {10 + (parseInt(product.id.slice(-3)) % 20)}%
                    </div>
                  )}

                  {/* Discount Badge for Overstocked Products */}
                  {activeTab === 2 && (
                    <div className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-tl-[14px] rounded-br-lg shadow-md z-10">
                      ลด {15 + (parseInt(product.id.slice(-3)) % 30)}%
                    </div>
                  )}

                  {/* Blue Checkmark for AI Suggested Products */}
                  {(activeTab === 1 || activeTab === 2) &&
                    parseInt(product.id.slice(-1)) % 2 === 0 && (
                      <div className="absolute top-8 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white z-10 shadow-md">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}

                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-2 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mb-2 tracking-wide">
                    {product.id}
                  </p>

                  {/* Price & Stock */}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                      ฿{product.price}
                    </span>
                    <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 font-bold rounded-full">
                      {product.stock} ชิ้น
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Selected Items Sidebar */}
      <div className="w-full lg:w-[340px] relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-orange-400/10 rounded-3xl blur-2xl" />

        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 shadow-2xl flex flex-col h-[500px]">
          {/* Header with Gradient */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                สินค้าที่เลือก
              </h3>
              <div className="px-3 py-1 bg-gradient-to-r from-primary to-orange-600 text-white text-sm font-black rounded-full shadow-lg shadow-primary/30">
                {selectedProducts.length}
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-primary via-orange-400 to-transparent rounded-full" />
          </div>

          {/* Selected Products List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {selectedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingBag size={36} className="text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400 mb-1">
                  ยังไม่ได้เลือกสินค้า
                </p>
                <p className="text-xs text-gray-300">
                  คลิกที่สินค้าเพื่อเพิ่มในรายการ
                </p>
              </div>
            ) : (
              selectedProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleProduct(p);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>

                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shrink-0 ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                          ฿{p.price}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-full font-bold">
                          {p.stock} ชิ้น
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Button */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              disabled={selectedProducts.length === 0}
              className="w-full py-4 bg-gradient-to-r from-primary to-orange-600 text-white rounded-xl font-black text-sm shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
            >
              <span>ไปขั้นตอนถัดไป</span>
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        {/* Promotion Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            ชื่อโปรโมชั่น
          </label>
          <div className="relative group">
            <input
              type="text"
              value={promoData.name}
              onChange={(e) =>
                setPromoData({ ...promoData, name: e.target.value })
              }
              placeholder="เช่น โปรโมชั่นวันตรุษจีน"
              className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all"
            />
          </div>
        </div>

        {/* Promotion Type */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            ประเภทโปรโมชั่น
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                id: "percent",
                label: "ส่วนลดเปอร์เซ็นต์",
                desc: "ลดราคาตามเปอร์เซ็นต์ที่กำหนด",
                icon: Percent,
                gradient: "from-blue-500 to-blue-600",
              },
              {
                id: "amount",
                label: "ส่วนลดจำนวนเงิน",
                desc: "ลดราคาตามจำนวนเงินที่กำหนด",
                icon: DollarSign,
                gradient: "from-emerald-500 to-emerald-600",
              },
              {
                id: "buy_get",
                label: "ซื้อ X แถม Y",
                desc: "ซื้อสินค้าครบจำนวนรับของแถม",
                icon: Gift,
                gradient: "from-purple-500 to-purple-600",
              },
              {
                id: "custom",
                label: "กำหนดเอง",
                desc: "ตั้งค่าโปรโมชั่นในแบบของคุณ",
                icon: Settings2,
                gradient: "from-orange-500 to-orange-600",
              },
            ].map((type) => (
              <div
                key={type.id}
                onClick={() => setPromoData({ ...promoData, type: type.id })}
                className={`group relative p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all duration-300 ${promoData.type === type.id
                  ? "border-primary bg-gradient-to-br from-primary/5 to-orange-400/5 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${promoData.type === type.id
                    ? `bg-gradient-to-br ${type.gradient} text-white shadow-lg`
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                >
                  <type.icon size={22} />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-bold text-sm mb-0.5 ${promoData.type === type.id
                      ? "text-gray-900"
                      : "text-gray-700"
                      }`}
                  >
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-500">{type.desc}</p>
                </div>
                {promoData.type === type.id && (
                  <Check size={20} className="text-primary" strokeWidth={3} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-400/5 rounded-3xl blur-2xl" />
        <div className="relative bg-white border border-gray-100 rounded-3xl p-7 shadow-2xl h-fit">
          <h3 className="font-black text-lg text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
              <Tag size={16} className="text-white" />
            </div>
            ตั้งค่าส่วนลด
          </h3>

          <div className="space-y-5">
            {promoData.type === "custom" ? (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  ระบุรายละเอียดโปรโมชั่น (Prompt)
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-orange-400/5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <textarea
                    value={promoData.prompt}
                    onChange={(e) =>
                      setPromoData({ ...promoData, prompt: e.target.value })
                    }
                    placeholder="เช่น ซื้อครบ 500 บาท แถมฟรีน้ำแข็งไสเมนูปกติ 1 ถ้วย หรือ ลดราคา 50% สำหรับสมาชิกใหม่..."
                    className="relative w-full h-48 px-5 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium transition-all resize-none leading-relaxed placeholder:text-gray-300"
                  />
                  <div className="absolute bottom-4 right-5 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <AlertCircle size={10} />
                    สามารถพิมพ์ภาษาไทยได้
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Discount Value */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    {promoData.type === "percent"
                      ? "ส่วนลด (%)"
                      : promoData.type === "amount"
                        ? "ส่วนลด (บาท)"
                        : promoData.type === "buy_get"
                          ? "จำนวนที่ต้องซื้อ"
                          : "ส่วนลดพิเศษ"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={promoData.value}
                      onChange={(e) =>
                        setPromoData({ ...promoData, value: e.target.value })
                      }
                      className="w-full px-5 py-4 pr-16 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-2xl font-black text-gray-900 transition-all"
                      placeholder="0"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary font-black text-lg">
                      {promoData.type === "percent"
                        ? "%"
                        : promoData.type === "amount"
                          ? "฿"
                          : promoData.type === "buy_get"
                            ? "ชิ้น"
                            : "OFF"}
                    </div>
                  </div>
                </div>

                {/* Min Spend */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    ยอดซื้อขั้นต่ำ (บาท)
                  </label>
                  <input
                    type="number"
                    value={promoData.minSpend}
                    onChange={(e) =>
                      setPromoData({ ...promoData, minSpend: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                      วันเริ่มต้น
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-gray-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                      วันสิ้นสุด
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-medium text-gray-700 transition-all"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBack();
              }}
              className="flex-1 py-3 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-2 group"
            >
              <ChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              className="flex-[2] py-3 bg-gradient-to-r from-primary to-orange-600 text-white rounded-xl font-black hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 group"
            >
              ไปขั้นตอนถัดไป
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
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
                  : promoData.type === "buy_get"
                    ? "ซื้อแถมฟรี"
                    : promoData.type === "custom" && promoData.prompt
                      ? promoData.prompt
                      : "โปรโมชั่นพิเศษ"}
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
            type="button"
            className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] hover:shadow-xl transition-all flex items-center justify-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          >
            <Sparkles size={20} className="animate-pulse" />
            สร้างโปรโมชั่น
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBack();
            }}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            ย้อนกลับแก้ไข
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      {/* Modal Container with Glow */}
      <div className="relative w-full max-w-6xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-400/20 rounded-[40px] blur-3xl" />
        <div className="relative bg-white w-full h-[88vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
          {/* Premium Header */}
          <div className="relative px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gradient-to-r from-white to-gray-50/50 z-20">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                สร้างโปรโมชั่น
              </h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                เลือกสินค้าและตั้งค่าส่วนลดสำหรับโปรโมชั่นใหม่
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg group"
            >
              <X
                size={20}
                strokeWidth={2.5}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>

          {/* Stepper */}
          <div className="py-4 px-12 bg-white flex justify-center shrink-0 relative z-10 border-b border-gray-50">
            <div className="flex items-start w-full max-w-md relative">
              {/* Progress Line */}
              <div className="absolute left-[16.66%] top-4 w-[66.66%] h-1 bg-gray-100 -z-10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
              </div>

              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-[3px] transition-all duration-300 ${s <= step
                      ? "bg-primary border-white ring-2 ring-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white border-gray-200 text-gray-300"
                      }`}
                  >
                    {s < step ? <Check size={14} strokeWidth={4} /> : s}
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
      </div>
    </div>,
    document.body,
  );
};

export default CreatePromotionModal;
