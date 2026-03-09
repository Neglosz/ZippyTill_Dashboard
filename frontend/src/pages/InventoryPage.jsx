import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Package,
  Truck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Sparkles,
  ShoppingBasket,
} from "lucide-react";

import ExportModal from "../components/features/outstanding/ExportModal";
import EditProductModal from "../components/features/inventory/EditProductModal";
import AddProductModal from "../components/features/inventory/AddProductModal";
import StockReport from "../components/features/inventory/StockReport";
import StatusModal from "../components/common/StatusModal";
import { productService } from "../services/productService";
import { useBranch } from "../contexts/BranchContext";
import { sanitizeHTML, stripThaiToneMarks } from "../utils/sanitizer";


const InventoryPage = () => {
  const { activeBranchId } = useBranch();
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'report'
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const totalCount = products.length;

  const stats = React.useMemo(() => {
    let lowStock = 0;
    let expired = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    products.forEach((product) => {
      const isLowStock =
        product.low_stock_threshold &&
        product.stock_qty <= product.low_stock_threshold &&
        product.stock_qty > 0;
      const isOutOfStock = product.stock_qty <= 0;

      if (isLowStock || isOutOfStock) {
        lowStock++;
      }

      const batches = product.product_batches || [];
      const isExpired = batches.some((b) => new Date(b.expire_date) < today);
      if (isExpired) {
        expired++;
      }
    });

    return { lowStock, expired };
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDays = new Date(today);
    thirtyDays.setDate(today.getDate() + 30);

    const query = searchQuery.toLowerCase().trim();
    const sanitizedQuery = sanitizeHTML(query);
    const normalizedQuery = stripThaiToneMarks(query);

    return products
      .filter((p) => {
        const productName = (p.name || "").toLowerCase();
        const barcode = (p.barcode || "").toLowerCase();
        
        const normalizedProductName = stripThaiToneMarks(productName);
        const sanitizedProductName = sanitizeHTML(productName);

        const matchesSearch =
          !query ||
          productName.includes(query) ||
          normalizedProductName.includes(normalizedQuery) ||
          sanitizedProductName.includes(sanitizedQuery) ||
          barcode.includes(query);

        if (query && matchesSearch) {
          console.log(`Inventory Search: Match found for "${query}" -> "${p.name}"`);
        }

        const matchesCategory =
          !selectedCategory ||
          (selectedCategory === "no-category"
            ? !p.category_id
            : p.category_id === selectedCategory);
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const getScore = (p) => {
          const batches = p.product_batches || [];
          const isExpired = batches.some(
            (batch) => new Date(batch.expire_date) < today,
          );
          const isOutOfStock = p.stock_qty <= 0;
          const isLowStock =
            p.low_stock_threshold && p.stock_qty <= p.low_stock_threshold;
          const isExpiringSoon = batches.some(
            (batch) =>
              new Date(batch.expire_date) >= today &&
              new Date(batch.expire_date) <= thirtyDays,
          );

          if (isExpired) return 0;
          if (isOutOfStock) return 1;
          if (isLowStock) return 2;
          if (isExpiringSoon) return 3;
          return 4;
        };
        return getScore(a) - getScore(b);
      });
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAllProducts(activeBranchId);
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "An error occurred while fetching products");
    } finally {
      setIsLoading(false);
    }
  }, [activeBranchId]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productService.getAllCategories(activeBranchId);
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (activeBranchId) {
      setActiveTab("products"); // reset tab เมื่อเปลี่ยนร้าน
      fetchProducts();
      fetchCategories();
    }
  }, [activeBranchId, fetchProducts, fetchCategories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportPDF = () => {
    console.log("Exporting PDF...");
    setIsExportModalOpen(false);
  };

  const handleExportExcel = () => {
    console.log("Exporting Excel...");
    setIsExportModalOpen(false);
  };

  const handleSaveProduct = async (updatedFormData) => {
    try {
      console.log("Saving product:", updatedFormData);
      if (!activeBranchId) throw new Error("Branch ID is required");

      if (updatedFormData.dbId) {
        // Update existing product
        const payload = {
          barcode: updatedFormData.id,
          name: updatedFormData.name,
          category_id: updatedFormData.category,
          stock_qty: parseFloat(updatedFormData.qty),
          cost_price: parseFloat(updatedFormData.cost),
          price: parseFloat(updatedFormData.price),
          image_url: updatedFormData.image,
          low_stock_threshold: parseFloat(updatedFormData.lowStockThreshold) || 0,
          expireDate: updatedFormData.exp,
        };
        await productService.updateProduct(
          updatedFormData.dbId,
          payload,
          activeBranchId,
        );
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "แก้ไขสำเร็จ",
          message: "ข้อมูลสินค้าถูกอัปเดตเรียบร้อยแล้ว",
        });
      } else {
        // Create new product
        const payload = {
          barcode: updatedFormData.id,
          name: updatedFormData.name,
          categoryId: updatedFormData.category,
          stockQty: parseFloat(updatedFormData.qty),
          costPrice: parseFloat(updatedFormData.cost),
          price: parseFloat(updatedFormData.price),
          image_url: updatedFormData.image,
          unitType: updatedFormData.unit || "ชิ้น",
          isWeightable: updatedFormData.isWeightable || false,
          lowStockThreshold: parseFloat(updatedFormData.lowStockThreshold) || 0,
          expireDate: updatedFormData.exp,
        };

        const newProduct = await productService.createProduct(
          payload,
          activeBranchId,
        );
        setStatusModal({
          isOpen: true,
          type: "success",
          title: "บันทึกสำเร็จ",
          message: "เพิ่มสินค้าใหม่เข้าสู่ระบบเรียบร้อยแล้ว",
        });
      }

      fetchProducts(); // Refresh list after save
      setEditingProduct(null);
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error saving product:", err);
      setStatusModal({
        isOpen: true,
        type: "delete", // Use error/delete style for errors
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถบันทึกข้อมูลได้: " + err.message,
      });
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      if (!activeBranchId) throw new Error("Branch ID is required");

      // Call delete service
      await productService.deleteProduct(product.id, activeBranchId);

      // Record stock removal history
      await productService.recordStockRemoval(
        {
          productId: product.id,
          productName: product.name,
          qty: product.stock_qty,
          reason: "ลบสินค้าออกจากระบบ",
          imageUrl: product.image_url,
        },
        activeBranchId,
      );

      // Refresh product list
      await fetchProducts();
      setDeleteConfirm(null);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "ลบสำเร็จ",
        message: "ลบสินค้าออกจากระบบเรียบร้อยแล้ว",
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      setStatusModal({
        isOpen: true,
        type: "delete",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่สามารถลบสินค้าได้: " + err.message,
      });
    }
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
    <>
      {/* Background Decorative Blobs - High Dimension */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative space-y-6 pb-10 min-h-screen">
        {/* Header Banners */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <Package className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                {activeTab === "products" ? "คลังสินค้า" : "รายงานสต็อก"}
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                {activeTab === "products"
                  ? "จัดการสินค้า ตรวจสอบสต็อก และติดตามสินค้าใกล้หมดอายุ"
                  : "ตรวจสอบความเคลื่อนไหวของสินค้า เข้า-ออก และยอดคงเหลือ"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/95 rounded-[20px] px-6 py-4 flex items-center justify-center gap-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-500 group/btn relative overflow-hidden border border-white/10 active:scale-95 shrink-0 z-10"
          >
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

        {/* Dedicated Tab Navigation */}
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-[20px] w-fit shadow-sm border border-white/20">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 rounded-[16px] font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "products"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-gray-500 hover:text-primary hover:bg-primary/5"
              }`}
          >
            รายการสินค้า
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-6 py-3 rounded-[16px] font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "report"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-gray-500 hover:text-primary hover:bg-primary/5"
              }`}
          >
            รายงานสต็อก
          </button>
        </div>

        {/* Stats Cards - Only for Products Tab */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Products */}
            <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float hover:-translate-y-1.5 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
              <div className="bg-blue-50 p-4 rounded-[22px] text-blue-500 shadow-sm group-hover:rotate-6 transition-transform border border-blue-100 shrink-0">
                <Package size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
                  สินค้าทั้งหมด
                </p>
                <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
                  {totalCount}{" "}
                  <span className="text-lg font-black text-inactive">
                    รายการ
                  </span>
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
                  สินค้าใกล้หมด
                </p>
                <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none text-amber-600">
                  {stats.lowStock}{" "}
                  <span className="text-lg font-black text-inactive">
                    รายการ
                  </span>
                </h3>
              </div>
            </div>

            {/* Card 3: Expired Products */}
            <div className="bg-white rounded-[32px] p-7 flex items-center gap-6 shadow-premium border border-gray-100 relative overflow-hidden group hover:shadow-float hover:-translate-y-1.5 transition-all duration-500">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
              <div className="bg-rose-50 p-4 rounded-[22px] text-rose-500 shadow-sm group-hover:rotate-6 transition-transform border border-rose-100 shrink-0">
                <AlertCircle size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
                  สินค้าหมดอายุ
                </p>
                <h3 className="text-3xl font-black tracking-tighter text-gray-900 leading-none text-rose-600">
                  {stats.expired}{" "}
                  <span className="text-lg font-black text-inactive">
                    รายการ
                  </span>
                </h3>
              </div>
            </div>
          </div>
        )}
        {/* Export Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />

        <EditProductModal
          key={editingProduct ? editingProduct.id : "new"}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={editingProduct}
          onSave={handleSaveProduct}
          activeBranchId={activeBranchId}
          products={products}
        />

        <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveProduct}
          activeBranchId={activeBranchId}
          products={products}
        />

        {activeTab === "report" ? (
          <StockReport activeTab={activeTab} setActiveTab={setActiveTab} />
        ) : (
          <>
            {/* Filters Section */}
            <div className="bg-white rounded-[24px] p-2 sm:p-4 shadow-premium flex flex-col lg:flex-row gap-4 justify-between items-center border border-gray-100 relative z-10 w-full">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-inactive"
                  />
                </div>
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-3 bg-white border rounded-2xl font-black transition-all text-[10px] uppercase tracking-widest ${selectedCategory
                      ? "border-primary text-primary bg-primary/5"
                      : "border-gray-100 text-inactive hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    <Filter size={16} />
                    {selectedCategory
                      ? selectedCategory === "no-category"
                        ? "ทั่วไป"
                        : categories.find((c) => c.id === selectedCategory)
                          ?.name || "ตัวกรอง"
                      : "ตัวกรอง"}
                  </button>

                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-float border border-gray-100 p-2 min-w-[200px] z-50 animate-fade-in max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${!selectedCategory
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        ทั้งหมด
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory("no-category");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === "no-category"
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        ทั่วไป
                      </button>
                      {(categories || []).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === category.id
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid - Horizontal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full bg-white rounded-[32px] p-20 text-center shadow-premium border border-gray-100">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-inactive font-bold">
                    กำลังโหลดข้อมูลสินค้า...
                  </p>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="col-span-full bg-white rounded-[32px] p-20 text-center shadow-premium border border-gray-100">
                  <Package
                    size={48}
                    className="mx-auto mb-4 text-inactive opacity-20"
                  />
                  <p className="text-inactive font-bold">
                    ไม่พบข้อมูลสินค้าที่ต้องการ
                  </p>
                </div>
              ) : (
                (filteredAndSortedProducts || []).map((product) => {
                  // Find earliest expiry date
                  const sortedBatches =
                    product.product_batches?.sort(
                      (a, b) =>
                        new Date(a.expire_date) - new Date(b.expire_date),
                    ) || [];

                  const expDate =
                    sortedBatches.length > 0
                      ? new Date(
                        sortedBatches[0].expire_date,
                      ).toLocaleDateString("th-TH")
                      : "-";

                  // Low stock threshold check (only if threshold is set)
                  const isLowStock =
                    product.low_stock_threshold &&
                    product.stock_qty <= product.low_stock_threshold &&
                    product.stock_qty > 0;
                  const isOutOfStock = product.stock_qty <= 0;

                  // Expiry status
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const thirtyDaysFromNow = new Date(today);
                  thirtyDaysFromNow.setDate(today.getDate() + 30);

                  const isExpired = sortedBatches.some(
                    (b) => new Date(b.expire_date) < today,
                  );
                  const isExpiringSoon =
                    !isExpired &&
                    sortedBatches.some(
                      (b) =>
                        new Date(b.expire_date) >= today &&
                        new Date(b.expire_date) <= thirtyDaysFromNow,
                    );

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-[32px] p-6 shadow-premium border border-gray-100 hover:shadow-float hover:-translate-y-1.5 transition-all duration-500 flex flex-col gap-6 relative overflow-hidden"
                    >
                      {/* Top Section: Image and Info */}
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Left: Image with Status Indicator */}
                        <div className="w-full sm:w-40 h-56 sm:h-40 rounded-[24px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500 overflow-hidden relative shadow-md bg-gray-50">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover relative z-10"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center bg-gray-50 ${product.image_url ? "hidden" : "flex"}`}
                          >
                            <ShoppingBasket
                              className="w-16 h-16 text-gray-200"
                              strokeWidth={1.5}
                            />
                          </div>
                          {/* Status Badges - Stacked Vertically on Left */}
                          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 items-start">
                            {isOutOfStock && (
                              <div className="bg-gray-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                🚫 หมดสต็อก
                              </div>
                            )}
                            {!isOutOfStock && isLowStock && (
                              <div className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                ⚠️ ใกล้หมด
                              </div>
                            )}
                            {isExpired && (
                              <div className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                ❌ หมดอายุ
                              </div>
                            )}
                            {!isExpired && isExpiringSoon && (
                              <div className="bg-orange-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                🕒 ใกล้หมดอายุ
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Right: Details */}
                        <div className="flex-1 flex flex-col min-w-0 pr-1">
                          {/* Header Area */}
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[22px] font-black text-[#1B2559] group-hover:text-primary transition-colors truncate leading-snug pt-1.5 mb-1.5">
                                {product.name}
                              </h4>
                              <span className="inline-flex items-center text-[10px] font-black text-white bg-[#1B2559] px-2.5 py-1 rounded-[10px] shadow-sm tracking-wider">
                                #{(product.barcode || product.id || "").toString().slice(0, 13)}
                              </span>
                            </div>
                            <div className="flex gap-1.5 pt-1">
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2.5 bg-[#F4F7FE] border border-transparent hover:border-primary/20 hover:bg-white rounded-[16px] text-[#1B2559]/40 hover:text-primary transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
                              >
                                <Edit size={20} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(product)}
                                className="p-2.5 bg-[#F4F7FE] border border-transparent hover:border-rose-200 hover:bg-white rounded-[16px] text-[#1B2559]/40 hover:text-rose-500 transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
                              >
                                <Trash2 size={20} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>

                          {/* Middle Area: Meta Chips */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <div className="flex items-center gap-2 bg-[#F5F7FF] px-3 py-2 rounded-[14px] border border-indigo-50/20 shadow-sm transition-all hover:shadow-md">
                              <span className="text-primary">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                                  <path d="M7 7h.01"></path>
                                </svg>
                              </span>
                              <span className="text-[13px] font-black text-[#1B2559]">
                                {product.product_categories?.name || "ทั่วไป"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#FFF5F5] px-3 py-2 rounded-[14px] border border-rose-50/20 shadow-sm transition-all hover:shadow-md">
                              <span className={isExpired ? "text-rose-500" : isExpiringSoon ? "text-orange-500" : "text-primary"}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                  <line x1="16" x2="16" y1="2" y2="6"></line>
                                  <line x1="8" x2="8" y1="2" y2="6"></line>
                                  <line x1="3" x2="21" y1="10" y2="10"></line>
                                </svg>
                              </span>
                              <span className={`text-[13px] font-black ${isExpired ? "text-rose-500" : isExpiringSoon ? "text-orange-500" : "text-[#1B2559]"}`}>
                                หมดอายุ: {expDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Area: Stock & Pricing Row */}
                      <div className="mt-auto pt-5 border-t border-gray-100/60 flex items-center justify-between gap-4">
                        {/* Left: Stock */}
                        <div className="flex flex-col gap-0.5 min-w-[80px]">
                          <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-wider mb-0.5">
                            {product.is_weightable ? "คงเหลือ (KG)" : "คงเหลือ"}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${product.low_stock_threshold && product.stock_qty <= product.low_stock_threshold ? "bg-rose-50 text-rose-500" : "bg-primary/5 text-primary"}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21 8-9-5-9 5v8l9 5 9-5Z"></path>
                                <path d="m3 8 9 5 9-5"></path>
                                <path d="M12 21v-8"></path>
                              </svg>
                            </div>
                            <span className={`text-2xl font-black leading-none ${product.low_stock_threshold && product.stock_qty <= product.low_stock_threshold ? "text-rose-500" : "text-[#1B2559]"}`}>
                              {product.stock_qty ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Right: Pricing Box */}
                        <div className="bg-[#F4F7FE]/70 backdrop-blur-sm rounded-[24px] px-6 py-3.5 flex items-center gap-8 group-hover:bg-primary/5 transition-all duration-500 min-w-[190px] border border-transparent group-hover:border-primary/10">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] font-black text-[#A3AED0] uppercase tracking-wider mb-1">ราคาทุน</span>
                            <span className="text-base font-bold text-[#1B2559]/40">฿{product.cost_price ?? 0}</span>
                          </div>
                          <div className="h-8 w-[1px] bg-[#1B2559]/10" />
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest mb-1 ml-auto">ราคาขาย</span>
                            <span className="text-[26px] font-black text-primary leading-none">฿{product.price ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="pt-8 pb-6 px-8 text-center">
              <div className="inline-flex p-4 bg-rose-500 rounded-full text-white shadow-lg shadow-rose-200 mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                ยืนยันการลบสินค้า?
              </h2>
              <p className="text-sm font-medium text-inactive">
                การลบสินค้าไม่สามารถกู้คืนได้
              </p>
            </div>

            {/* Product Info */}
            <div className="px-8 pb-6 text-left">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {deleteConfirm.image_url ? (
                    <img
                      src={deleteConfirm.image_url}
                      alt={deleteConfirm.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`items-center justify-center w-full h-full bg-gray-50 ${deleteConfirm.image_url ? "hidden" : "flex"}`}
                  >
                    <ShoppingBasket className="w-8 h-8 text-gray-200" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {deleteConfirm.name}
                  </h3>
                  <p className="text-xs font-medium text-inactive">
                    คงเหลือ: {deleteConfirm.stock_qty} ชิ้น
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm)}
                className="flex-1 px-6 py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal for success/error feedback */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
        confirmText="ตกลง"
      />
    </>
  );
};

export default InventoryPage;
