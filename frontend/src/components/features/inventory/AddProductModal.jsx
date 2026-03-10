import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Upload,
  Plus,
  Check,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { productService } from "../../../services/productService";
import BEDatePicker from "../../common/BEDatePicker";

const AddProductModal = ({
  isOpen,
  onClose,
  onSave,
  activeBranchId,
  products = [],
}) => {
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    qty: "",
    cost: "",
    price: "",
    exp: "",
    image: "",
    unit: "ชิ้น",
    isWeightable: false,
    productType: "general",
    lowStockThreshold: "",
  });
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      // Reset form when opening
      setFormData({
        id: "",
        name: "",
        category: "",
        qty: "",
        cost: "",
        price: "",
        exp: "",
        image: "",
        unit: "ชิ้น",
        isWeightable: false,
        productType: "general",
        lowStockThreshold: "",
      });
    }
  }, [isOpen, activeBranchId]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const cats = await productService.getAllCategories(activeBranchId);
      setCategories(cats);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        };
      };
      reader.readAsAsDataURL(file);
    }
    // Reset input so the same file can be picked again
    e.target.value = "";
  };

  const handleDeleteImage = (e) => {
    e.stopPropagation(); // Don't trigger file input
    if (confirm("คุณต้องการลบรูปภาพที่เลือกใช่หรือไม่?")) {
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "__add_new__") {
      setIsAddingCategory(true);
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setIsAddingCategory(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  // Filter categories based on current product type
  const filteredCategories = categories.filter(
    (cat) =>
      !cat.category_type || // Show categories without type (legacy/uncategorized) in both
      cat.category_type === formData.productType,
  );

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    try {
      setIsLoading(true);
      const newCategory = await productService.createCategory(
        newCategoryName.trim(),
        activeBranchId,
        formData.productType, // Pass the current product type
      );

      // Refresh categories list
      await fetchCategories();

      // Auto-select the newly created category
      setFormData((prev) => ({ ...prev, category: newCategory.id }));

      // Reset and close inline form
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err) {
      console.error("Error creating category:", err);
      alert("ไม่สามารถสร้างหมวดหมู่ได้: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAddCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] w-full max-w-[900px] relative shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#1B2559]">เพิ่มสินค้าใหม่</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Product Type Switch Bar */}
        <div className="px-6 pt-4">
          <div className="bg-[#F8FAFD] p-1 rounded-[16px] flex gap-1 items-center max-w-fit shadow-sm border border-gray-100">
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  productType: "general",
                  unit: "ชิ้น",
                  category: "", // Reset category when switching type
                }))
              }
              className={`flex items-center gap-2 px-5 py-2 rounded-[12px] text-xs font-bold transition-all duration-300 ${
                formData.productType === "general"
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  formData.productType === "general"
                    ? "bg-primary animate-pulse"
                    : "bg-gray-300"
                }`}
              />
              สินค้าทั่วไป
            </button>
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  productType: "weighted",
                  unit: "กิโลกรัม",
                  category: "", // Reset category when switching type
                }))
              }
              className={`flex items-center gap-2 px-5 py-2 rounded-[12px] text-xs font-bold transition-all duration-300 ${
                formData.productType === "weighted"
                  ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  formData.productType === "weighted"
                    ? "bg-primary animate-pulse"
                    : "bg-gray-300"
                }`}
              />
              สินค้าชั่งขาย
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          {/* Left Column: Image - Upload Focus (55%) */}
          <div className="w-full md:w-[55%] flex flex-col justify-start items-center">
            <div className="w-full aspect-[4/5] relative group">
              <div className="absolute inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div
                onClick={handleImageClick}
                className="w-full h-full bg-white rounded-[24px] flex items-center justify-center p-4 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_40px_-10px_rgba(27,37,89,0.12)] cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white/20 opacity-50" />

                {formData.image ? (
                  <>
                    <img
                      src={formData.image}
                      alt={formData.name}
                      className="w-full h-full object-contain drop-shadow-md relative z-10 transition-transform duration-500 group-hover:scale-105 rounded-[16px]"
                    />
                    {/* Hover Controls */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white border border-white/30">
                          <Upload size={24} strokeWidth={3} />
                        </div>
                        <p className="text-white font-black text-lg">
                          เปลี่ยนรูปภาพ
                        </p>
                      </div>
                      <button
                        onClick={handleDeleteImage}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                      >
                        <Trash2 size={18} />
                        ลบรูปภาพ
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-300 group-hover:text-primary transition-colors relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                      <Upload size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-sm font-bold text-gray-400 group-hover:text-primary/70">
                      อัปโหลดรูปภาพ
                    </p>
                  </div>
                )}

                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/80 to-transparent opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Column: Form (45%) */}
          <div className="w-full md:w-[45%] space-y-4">
            {/* Section: Basic Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-0.5 h-3.5 bg-primary rounded-full" />
                <h3 className="text-sm font-bold text-[#1B2559]">
                  ข้อมูลทั่วไป
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 block px-1 flex items-center gap-2">
                    <Check
                      size={12}
                      className={errors.name ? "text-rose-500" : "text-primary"}
                    />
                    ชื่อสินค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full bg-[#F8FAFD] border-none rounded-[12px] px-4 py-2.5 text-sm font-bold text-[#1B2559] focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 shadow-sm ${
                      errors.name
                        ? "ring-2 ring-rose-500/50"
                        : "focus:ring-primary/20"
                    }`}
                    placeholder="ระบุชื่อสินค้า"
                  />
                  {errors.name && (
                    <p className="text-[10px] font-bold text-rose-500 px-1">
                      กรุณากรอกชื่อสินค้า
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Product ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block px-1 flex items-center gap-2">
                      <Plus
                        size={12}
                        className={errors.id ? "text-rose-500" : "text-primary"}
                      />
                      รหัสสินค้า <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      className={`w-full bg-[#F8FAFD] border-none rounded-[12px] px-4 py-2.5 text-sm font-bold text-[#1B2559] focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 shadow-sm ${
                        errors.id
                          ? "ring-2 ring-rose-500/50"
                          : "focus:ring-primary/20"
                      }`}
                      placeholder="รหัสสินค้า"
                    />
                    {errors.id && (
                      <p className="text-[10px] font-bold text-rose-500 px-1">
                        กรุณากรอกรหัสสินค้า
                      </p>
                    )}
                    {formData.id &&
                      products.some(
                        (p) =>
                          p.barcode === formData.id &&
                          p.name.trim() !== formData.name.trim(),
                      ) && (
                        <p className="text-[10px] font-bold text-rose-500 px-1">
                          รหัสสินค้าซ้ำ
                        </p>
                      )}
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 block px-1 flex items-center gap-2">
                      <X size={12} className="text-primary rotate-45" />{" "}
                      หมวดหมู่
                    </label>
                    <div className="relative group">
                      <select
                        name="category"
                        value={
                          isAddingCategory ? "__add_new__" : formData.category
                        }
                        onChange={handleCategoryChange}
                        className="w-full bg-[#F8FAFD] border-none rounded-[12px] px-4 py-2.5 text-sm font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="">เลือกหมวดหมู่</option>
                        {(filteredCategories || []).map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                        <option
                          value="__add_new__"
                          className="text-primary font-black"
                        >
                          + เพิ่มหมวดหมู่ใหม่
                        </option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-all">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inline Category Creation Form */}
                {isAddingCategory && (
                  <div className="relative z-50 p-4 bg-gradient-to-br from-primary/5 to-orange-50/30 rounded-[18px] border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg shadow-primary/5">
                    <label className="text-xs font-bold text-[#1B2559] block mb-2 px-1">
                      ชื่อหมวดหมู่ใหม่
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-[14px] px-4 py-2.5 text-sm font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-gray-400"
                        placeholder="พิมพ์ชื่อ..."
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="p-2.5 bg-primary text-white rounded-[14px] hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddCategory}
                        className="p-2.5 bg-gray-200 text-gray-600 rounded-[14px] hover:bg-gray-300 transition-all shadow-sm active:scale-95"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-0.5 h-3.5 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold text-[#1B2559]">ราคา</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block px-1">
                    ราคาทุน
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      className={`w-full bg-[#F8FAFD] border-none rounded-[12px] px-4 py-2.5 text-sm font-bold text-[#1B2559] focus:outline-none focus:ring-2 transition-all text-right pr-12 shadow-sm ${
                        errors.cost
                          ? "ring-2 ring-rose-500/50"
                          : "focus:ring-emerald-500/20"
                      }`}
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black">
                      THB
                    </span>
                  </div>
                  {errors.cost && (
                    <p className="text-[10px] font-bold text-rose-500 px-1">
                      ห้ามค่าติดลบ
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block px-1">
                    ราคาขาย
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`w-full bg-emerald-50 text-emerald-600 border-none rounded-[12px] px-4 py-2.5 text-sm font-black focus:outline-none focus:ring-2 transition-all text-right pr-12 shadow-md shadow-emerald-200/5 ${
                        errors.price || errors.priceLowerThanCost
                          ? "ring-2 ring-rose-500/50"
                          : "focus:ring-emerald-500/30"
                      }`}
                      placeholder="0.00"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px] font-black">
                      THB
                    </span>
                  </div>
                  {(errors.price || errors.priceLowerThanCost) && (
                    <p className="text-[10px] font-bold text-rose-500 px-1">
                      {errors.price ? "ห้ามค่าติดลบ" : "ราคาขายต่ำกว่าราคาทุน"}
                    </p>
                  )}
                </div>
              </div>
              {((Number(formData.cost) > Number(formData.price) &&
                Number(formData.price) > 0) ||
                (formData.cost !== "" &&
                  formData.price !== "" &&
                  Number(formData.cost) === 0 &&
                  Number(formData.price) === 0)) && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-300">
                  <AlertCircle size={14} className="text-amber-600" />
                  <p className="text-[10px] font-bold text-amber-700">
                    {Number(formData.cost) === 0 && Number(formData.price) === 0
                      ? "ราคาทุนและราคาขายเป็น 0 โปรดตรวจสอบความถูกต้อง"
                      : "ราคาทุนสูงกว่าราคาขาย โปรดตรวจสอบความถูกต้อง"}
                  </p>
                </div>
              )}
            </div>

            {/* Section: Inventory */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-400 rounded-full" />
                  <h3 className="text-sm font-bold text-[#1B2559]">
                    การจัดการสต็อก
                  </h3>
                </div>
                {formData.productType === "weighted" && (
                  <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-widest">
                    โหมดชั่งขาย
                  </span>
                )}
              </div>

              <div className="bg-[#F8FAFD]/50 rounded-[20px] p-4 border border-gray-100 min-h-[300px] flex flex-col justify-between animate-in fade-in duration-300">
                <div className="space-y-5 flex-1">
                  {formData.productType === "weighted" ? (
                    <>
                      {/* แถว 1: จำนวนสต็อกสินค้าสด */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          จำนวนสต็อกคงเหลือ
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={Math.floor(Number(formData.qty || 0))}
                              onChange={(e) => {
                                const kg = parseInt(e.target.value) || 0;
                                const currentKhid =
                                  (Number(formData.qty || 0) % 1) * 10;
                                setFormData((prev) => ({
                                  ...prev,
                                  qty: kg + currentKhid / 10,
                                }));
                              }}
                              className="w-full bg-white border border-gray-200 rounded-[14px] px-4 py-2.5 text-sm font-black text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-right pr-16 shadow-sm"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] font-black uppercase">
                              กิโลกรัม
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="9"
                              value={Math.round(
                                (Number(formData.qty || 0) % 1) * 10,
                              )}
                              onChange={(e) => {
                                const khid = Math.min(
                                  9,
                                  Math.max(0, parseInt(e.target.value) || 0),
                                );
                                const currentKg = Math.floor(
                                  Number(formData.qty || 0),
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  qty: currentKg + khid / 10,
                                }));
                              }}
                              className="w-full bg-white border border-gray-200 rounded-[14px] px-4 py-2.5 text-sm font-black text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-right pr-12 shadow-sm"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] font-black uppercase">
                              ขีด
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* แถว 2: แจ้งเตือนขั้นต่ำสินค้าสด */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest px-1 flex items-center gap-2">
                          <AlertCircle size={12} /> แจ้งเตือนเมื่อสต็อกต่ำกว่า
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={Math.floor(
                                Number(formData.lowStockThreshold || 0),
                              )}
                              onChange={(e) => {
                                const kg = parseInt(e.target.value) || 0;
                                const currentKhid =
                                  (Number(formData.lowStockThreshold || 0) %
                                    1) *
                                  10;
                                setFormData((prev) => ({
                                  ...prev,
                                  lowStockThreshold: kg + currentKhid / 10,
                                }));
                              }}
                              className="w-full bg-orange-50/30 border border-dashed border-orange-200 rounded-[12px] px-4 py-2 text-xs font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-right pr-16"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 text-[9px] font-black uppercase">
                              กิโลกรัม
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="9"
                              value={Math.round(
                                (Number(formData.lowStockThreshold || 0) % 1) *
                                  10,
                              )}
                              onChange={(e) => {
                                const khid = Math.min(
                                  9,
                                  Math.max(0, parseInt(e.target.value) || 0),
                                );
                                const currentKg = Math.floor(
                                  Number(formData.lowStockThreshold || 0),
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  lowStockThreshold: currentKg + khid / 10,
                                }));
                              }}
                              className="w-full bg-orange-50/30 border border-dashed border-orange-200 rounded-[12px] px-4 py-2 text-xs font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-right pr-12"
                              placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 text-[9px] font-black uppercase">
                              ขีด
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* แถว 1: จำนวนสต็อกสินค้าทั่วไป */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                          จำนวนสต็อกคงเหลือ
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            name="qty"
                            value={formData.qty}
                            onChange={handleChange}
                            className={`w-full bg-white border border-gray-200 rounded-[14px] px-4 py-2.5 text-sm font-black text-[#1B2559] focus:outline-none focus:ring-2 transition-all text-right pr-16 shadow-sm ${
                              errors.qty
                                ? "ring-2 ring-rose-500/50"
                                : "focus:ring-primary/20"
                            }`}
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[9px] font-black uppercase tracking-wider">
                            {formData.unit}
                          </span>
                        </div>
                      </div>

                      {/* แถว 2: แจ้งเตือนขั้นต่ำสินค้าทั่วไป */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest px-1 flex items-center gap-2">
                          <AlertCircle size={12} /> แจ้งเตือนเมื่อสต็อกต่ำกว่า
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            name="lowStockThreshold"
                            value={formData.lowStockThreshold}
                            onChange={handleChange}
                            className={`w-full bg-orange-50/30 border border-dashed border-orange-200 rounded-[12px] px-4 py-2 text-xs font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-right pr-16 shadow-sm ${
                              errors.lowStockThreshold
                                ? "ring-2 ring-rose-500/50"
                                : "focus:ring-orange-500/20"
                            }`}
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 text-[9px] font-black uppercase tracking-wider">
                            {formData.unit}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* แถวสุดท้าย: วันหมดอายุ (ตำแหน่งคงที่) */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-primary" />{" "}
                    วันหมดอายุสินค้า
                  </label>
                  <div className="w-[180px] scale-90 origin-right">
                    <BEDatePicker
                      value={formData.exp}
                      onChange={handleChange}
                      align="right"
                    />
                  </div>
                </div>
              </div>

              {formData.exp &&
                new Date(formData.exp).setHours(0, 0, 0, 0) <
                  new Date().setHours(0, 0, 0, 0) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-300">
                    <AlertCircle size={14} className="text-amber-600" />
                    <p className="text-[10px] font-bold text-amber-700">
                      วันที่หมดอายุที่เลือกเป็นอดีต โปรดตรวจสอบ
                    </p>
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  const newErrors = {};
                  if (!formData.name.trim()) newErrors.name = true;
                  if (!formData.id.trim()) newErrors.id = true;

                  // Duplicate barcode check with alert
                  if (
                    formData.id &&
                    products.some(
                      (p) =>
                        p.barcode === formData.id &&
                        p.name.trim() !== formData.name.trim(),
                    )
                  ) {
                    alert("รหัสสินค้าซ้ำ");
                    return;
                  }

                  // Negative value validation
                  if (formData.cost !== "" && Number(formData.cost) < 0)
                    newErrors.cost = true;
                  if (formData.price !== "" && Number(formData.price) < 0)
                    newErrors.price = true;
                  if (
                    formData.lowStockThreshold !== "" &&
                    Number(formData.lowStockThreshold) < 0
                  )
                    newErrors.lowStockThreshold = true;

                  // TC: Warning if selling price < cost price
                  if (formData.price !== "" && formData.cost !== "" && Number(formData.price) < Number(formData.cost)) {
                    newErrors.priceLowerThanCost = true;
                  }

                  if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    return;
                  }

                  const handleSave = async () => {
                    setIsLoading(true);
                    try {
                      await onSave(formData);
                    } finally {
                      setIsLoading(false);
                    }
                  };

                  handleSave();
                }}
                disabled={isLoading}
                className="group relative w-full bg-primary text-white text-base font-black py-3 rounded-[16px] shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={20} strokeWidth={3} />
                  )}
                  {isLoading ? "กำลังบันทึก..." : "เพิ่มสินค้าใหม่เข้าสต็อก"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddProductModal;
