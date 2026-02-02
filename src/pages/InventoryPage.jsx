import React, { useState, useEffect } from "react";
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
import { productService } from "../services/productService";

const CATEGORY_TAGS = ["สินค้าทั่วไป", "สินค้า 1", "สินค้า 2", "สินค้า 3"];

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("สินค้าทั่วไป");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "An error occurred while fetching products");
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchProducts(); // Refresh list after save
    setEditingProduct(null);
  };

  if (error) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Error Loading Inventory
        </h2>
        <p className="text-gray-700 bg-gray-100 p-4 rounded-lg inline-block">
          {error}
        </p>
        <div className="mt-6">
          <button
            onClick={fetchProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 pb-10 min-h-screen ">
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Top Section: Header & Stats */}
      <div className="flex flex-col gap-5">
        {/* Header Section in a white box */}
        <div className="bg-white rounded-[24px] p-6 shadow-premium border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden group transition-all duration-500 hover:shadow-float">
          <div className="flex flex-col gap-1 px-2 relative z-10">
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter">
              Inventory
            </h2>
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-1.2 h-1.2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(237,113,23,0.4)]" />
              <p className="text-[10px] font-black text-inactive uppercase tracking-[0.15em]">
                จัดการสต็อกสินค้าและดูภาพรวมของคลังสินค้าทั้งหมด
              </p>
            </div>
          </div>

          <button className="bg-primary hover:bg-primary/95 rounded-[20px] px-6 py-4 flex items-center justify-center gap-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-500 group/btn relative overflow-hidden border border-white/10 active:scale-95 shrink-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            <div className="bg-white/20 p-2.5 rounded-[15px] text-white shadow-inner group-hover/btn:rotate-90 transition-transform duration-500">
              <Plus size={16} strokeWidth={3} />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-black text-white/70 uppercase tracking-[0.1em] mb-0.5">
                จัดการสต็อก
              </p>
              <h3 className="text-[12px] font-black tracking-widest text-white uppercase leading-none">
                เพิ่มสินค้า
              </h3>
            </div>
          </button>
        </div>

        {/* Stats Cards - Adjusted to 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Total Products */}
          <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float hover:-translate-y-1.5 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
            <div className="bg-rose-50 p-4 rounded-[22px] text-rose-500 shadow-sm group-hover:rotate-6 transition-transform border border-rose-100 shrink-0">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
                Total Products
              </p>
              <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
                {products.length}{" "}
                <span className="text-lg font-black text-inactive">รายการ</span>
              </h3>
            </div>
          </div>

          {/* Card 2: Low Stock */}
          <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float hover:-translate-y-1.5 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
            <div className="bg-amber-50 p-4 rounded-[22px] text-amber-500 shadow-sm group-hover:rotate-6 transition-transform border border-amber-100 shrink-0">
              <Truck size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
                Low Stock Alert
              </p>
              <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none text-amber-600">
                12{" "}
                <span className="text-lg font-black text-inactive">รายการ</span>
              </h3>
            </div>
          </div>
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
      <div className="bg-white rounded-[24px] p-4 shadow-premium flex flex-col lg:flex-row gap-4 justify-between items-center border border-gray-100 relative overflow-hidden">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-[320px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-inactive"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาสินค้า....."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-inactive"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 text-inactive rounded-2xl font-black hover:text-gray-900 hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest">
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
              className={`px-5 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-widest border ${activeTag === tag
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                : "bg-white text-inactive hover:text-gray-900 border-gray-100 hover:bg-gray-50"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[32px] p-2 border border-gray-100 shadow-premium relative overflow-hidden">
        <div className="overflow-x-auto p-4 scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-inactive text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="py-6 pl-4">รูปภาพ</th>
                <th className="py-6">ชื่อสินค้า</th>
                <th className="py-6">หมวดหมู่</th>
                <th className="py-6 text-center">คงเหลือ</th>
                <th className="py-6 text-center">ทุน</th>
                <th className="py-6 text-center">ขาย</th>
                <th className="py-6 pr-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-20 text-inactive font-bold"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-20 text-inactive font-bold"
                  >
                    ไม่พบข้อมูลสินค้า
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 pl-4">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/50";
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] font-bold text-inactive mt-1">
                        #{product.barcode || product.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-4">
                      <span className="text-[10px] font-black text-inactive uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        {product.product_categories?.name || "ทั่วไป"}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`text-sm font-black ${product.stock_qty < 10 ? "text-rose-500" : "text-gray-900"}`}
                      >
                        {product.stock_qty}
                      </span>
                    </td>
                    <td className="py-4 text-center text-sm font-bold text-inactive">
                      ฿{product.cost_price}
                    </td>
                    <td className="py-4 text-center text-sm font-black text-primary">
                      ฿{product.price}
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-3 bg-white border border-gray-100 hover:border-primary/30 hover:bg-primary/5 rounded-2xl text-inactive hover:text-primary transition-all shadow-sm active:scale-95"
                      >
                        <Edit size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
