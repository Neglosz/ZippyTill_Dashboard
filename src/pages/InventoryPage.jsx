import React, { useState } from "react";
import {
  Package,
  Truck,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
} from "lucide-react";

import waterImg from "../assets/water.jpg";
import cokeImg from "../assets/coke-full-red-pet-500-ml.png";
import ExportModal from "../components/features/outstanding/ExportModal";
import EditProductModal from "../components/features/inventory/EditProductModal";

const PRODUCTS = [
  {
    id: "0001",
    name: "เลย์",
    category: "ขนม",
    qty: 100,
    cost: 18,
    price: 22,
    exp: "20-05-2026",
    remaining: 56,
    image: "/lays_pack_1768246959348.png", // Using the previously generated image
  },
  {
    id: "0002",
    name: "น้ำสิงห์ 1.5L",
    category: "เครื่องดื่ม",
    qty: 50,
    cost: 10,
    price: 15,
    exp: "12-12-2026",
    remaining: 24,
    image: waterImg,
  },
  {
    id: "0003",
    name: "โค้ก 325ml",
    category: "เครื่องดื่ม",
    qty: 200,
    cost: 12,
    price: 18,
    exp: "01-01-2027",
    remaining: 150,
    image: cokeImg,
  },
  // Add more mock data if needed
];

const CATEGORY_TAGS = ["สินค้าทั่วไป", "สินค้า 1", "สินค้า 2", "สินค้า 3"];

const InventoryPage = () => {
  const [activeTag, setActiveTag] = useState("สินค้าทั่วไป");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleExportPDF = () => {
    console.log("Exporting PDF...");
    setIsExportModalOpen(false);
  };

  const handleExportExcel = () => {
    console.log("Exporting Excel...");
    setIsExportModalOpen(false);
  };

  const handleSaveProduct = (updatedProduct) => {
    console.log("Saving product:", updatedProduct);
    // Here you would typically update the state or call an API
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Section: stats & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* Card 1: Total Products */}
          <div className="bg-[#FFE2E5] rounded-2xl p-4 flex items-center gap-4 min-w-[240px] shadow-sm">
            <div className="bg-white p-3 rounded-full text-[#FA5A7D] shadow-[0_2px_10px_rgba(250,90,125,0.2)]">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1B2559]">510</h3>
              <p className="text-sm font-medium text-gray-500">
                จำนวนสินค้าทั้งหมด
              </p>
            </div>
          </div>

          {/* Card 2: Total Stock */}
          <div className="bg-[#FFF4DE] rounded-2xl p-4 flex items-center gap-4 min-w-[240px] shadow-sm">
            <div className="bg-white p-3 rounded-full text-[#FF947A] shadow-[0_2px_10px_rgba(255,148,122,0.2)]">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1B2559]">510</h3>
              <p className="text-sm font-medium text-gray-500">
                จำนวนสินค้าทั้งหมด
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFB547] text-white rounded-xl font-bold hover:bg-[#ffca7a] transition-all shadow-md active:scale-95"
          >
            <Download size={18} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5656] text-white rounded-xl font-bold hover:bg-[#ff6b6b] transition-all shadow-md active:scale-95">
            <Plus size={18} />
            เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Filters Section */}
      <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-[320px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาสินค้า....."
              className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-[#FF5656]/20 transition-all placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm">
            <Filter size={16} />
            ตัวกรอง
          </button>
        </div>

        {/* Category Tags */}
        <div className="flex overflow-x-auto pb-1 lg:pb-0 gap-2 w-full lg:w-auto no-scrollbar">
          {CATEGORY_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTag === tag
                  ? "bg-gray-200 text-[#1B2559]"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs font-bold tracking-wider bg-gray-50/50">
                <th className="py-4 pl-4 rounded-l-xl">รูปภาพ</th>
                <th className="py-4">รหัสสินค้า</th>
                <th className="py-4">ชื่อสินค้า</th>
                <th className="py-4">หมวดหมู่</th>
                <th className="py-4 text-center">จำนวน</th>
                <th className="py-4 text-center">ราคาทุน</th>
                <th className="py-4 text-center">ราคาขาย</th>
                <th className="py-4">EXP.</th>
                <th className="py-4 text-center">คงเหลือ</th>
                <th className="py-4 pr-4 rounded-r-xl text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PRODUCTS.map((product) => (
                <tr
                  key={product.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 pl-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 p-1 flex items-center justify-center border border-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50";
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-500">
                    {product.id}
                  </td>
                  <td className="py-3 text-sm font-bold text-[#1B2559]">
                    {product.name}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-500">
                    {product.category}
                  </td>
                  <td className="py-3 text-center text-sm font-bold text-[#1B2559]">
                    {product.qty}
                  </td>
                  <td className="py-3 text-center text-sm font-bold text-gray-500">
                    {product.cost}
                  </td>
                  <td className="py-3 text-center text-sm font-bold text-[#1B2559]">
                    {product.price}
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-500">
                    {product.exp}
                  </td>
                  <td className="py-3 text-center text-sm font-bold text-[#1B2559]">
                    {product.remaining}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 resize hover:bg-gray-200 rounded-lg text-gray-400 hover:text-[#1B2559] transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
