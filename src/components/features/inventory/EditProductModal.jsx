import React, { useState, useEffect } from "react";
import { X, Calendar, Upload } from "lucide-react";
import { createPortal } from "react-dom";
import { productService } from "../../../services/productService";

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  activeBranchId,
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
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, product, activeBranchId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Categories
      const cats = await productService.getAllCategories(activeBranchId);
      setCategories(cats);

      // 2. Map Product Data
      if (product) {
        let expDate = "";
        try {
          const batches = await productService.getProductBatches(product.id);
          if (batches && batches.length > 0) {
            // Take the most recent batch expiry date
            expDate = batches[0].expire_date || "";
          }
        } catch (batchErr) {
          console.error("Error fetching batches:", batchErr);
        }

        setFormData({
          id: product.barcode || product.id || "",
          dbId: product.id, // Keep original DB ID for updates
          name: product.name || "",
          category: product.category_id || "",
          qty: product.stock_qty || "",
          cost: product.cost_price || "",
          price: product.price || "",
          exp: expDate,
          image: product.image_url || product.image || "",
          unit: product.unit_type || "ชิ้น",
        });
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simple resizing to avoid huge base64 strings
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 800; // Limit width
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); // Compress

          setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-[1000px] relative shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-[#1B2559]">
            {product ? "แก้ไขรายละเอียดสินค้า" : "เพิ่มสินค้าใหม่"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 flex flex-col lg:flex-row gap-8">
          {/* Left Column: Image - Upload Focus (60%) */}
          <div className="w-full lg:w-[60%] flex flex-col justify-center items-center">
            {/* Premium Image Frame */}
            <div className="w-full aspect-[4/3] relative group">
              {/* Decorative Blur Background */}
              <div className="absolute inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Main Container - View Only */}
              <div className="w-full h-full bg-white rounded-[32px] flex items-center justify-center p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_25px_50px_-12px_rgba(27,37,89,0.15)] group-hover:-translate-y-1">
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white/20 opacity-50" />

                <img
                  src={
                    formData.image ||
                    "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  alt={formData.name}
                  className="w-full h-full object-contain drop-shadow-md relative z-10 transition-transform duration-500 group-hover:scale-105 rounded-[24px]"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x400?text=No+Image";
                  }}
                />

                {/* Shiny Corner Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/80 to-transparent opacity-50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Column: Form (40%) */}
          <div className="w-full lg:w-[40%] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Product ID */}
              <div className="space-y-2">
                <label className="text-base font-bold text-[#1B2559] block px-1">
                  รหัสสินค้า
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 shadow-sm shadow-indigo-100/20"
                  placeholder="รหัสสินค้า"
                />
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-base font-bold text-[#1B2559] block px-1">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 shadow-sm shadow-indigo-100/20"
                  placeholder="ชื่อสินค้า"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-base font-bold text-[#1B2559] block px-1">
                  หมวดหมู่
                </label>
                <div className="relative group">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm shadow-indigo-100/20"
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-transform group-hover:translate-y-[-40%]">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.5 5.5L7 9L10.5 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-base font-bold text-[#1B2559] block px-1">
                  จำนวน
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-right pr-16 shadow-sm shadow-indigo-100/20"
                    placeholder="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    {formData.unit || "ชิ้น"}
                  </span>
                </div>
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <label className="text-base font-bold text-[#1B2559] block px-1">
                  ราคาทุน
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-right pr-16 shadow-sm shadow-indigo-100/20"
                    placeholder="0.00"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    บาท
                  </span>
                </div>
              </div>

              {/* Selling Price */}
              <div className="space-y-2">
                <label className="text-base font-bold text-[#1B2559] block px-1">
                  ราคาขาย
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 text-right pr-16 shadow-sm shadow-indigo-100/20"
                    placeholder="0.00"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    บาท
                  </span>
                </div>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="text-base font-bold text-[#1B2559] block px-1">
                วันหมดอายุ
              </label>
              <div className="relative group">
                <input
                  type="date"
                  name="exp"
                  value={formData.exp}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 shadow-sm shadow-indigo-100/20 appearance-none"
                />
                <Calendar
                  size={20}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary transition-colors"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => onSave(formData)}
                disabled={isLoading}
                className="group relative bg-gradient-to-r from-primary to-orange-600 text-white text-base font-black px-12 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Internal Glow Flare */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <span className="relative flex items-center gap-2">
                  {isLoading
                    ? "กำลังบันทึก..."
                    : product
                      ? "แก้ไขรายการ"
                      : "เพิ่มสินค้า"}
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

export default EditProductModal;
