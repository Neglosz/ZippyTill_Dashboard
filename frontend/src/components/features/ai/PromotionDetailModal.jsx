import React from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  Package,
  Calendar,
  Zap,
  Target,
  ArrowRight,
  Quote,
} from "lucide-react";
import { createPortal } from "react-dom";

const PromotionDetailModal = ({ isOpen, onClose, recommendation, onCreate }) => {
  if (!isOpen || !recommendation) return null;

  // Function to process AI analysis text into cleaner blocks
  const processAnalysis = (text) => {
    if (!text) return [];
    // Split by common Thai sentence markers or parentheses if needed, 
    // but here we'll try to split by some logic or just provide it as is with bold keywords
    return text.split(' ').map((word, i) => {
      if (word.includes('(') || word.includes(')') || word.includes('%')) {
        return <b key={i} className="text-gray-900">{word} </b>;
      }
      return word + ' ';
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Main Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-gray-100">
        
        {/* Header: Minimal & Readable */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                  AI Power Analysis
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {recommendation.title}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-12 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* LEFT: AI ANALYSIS (5/12) */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Quote size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">บทวิเคราะห์จาก AI</h3>
            </div>
            
            <div className="space-y-4">
              <div className="text-base md:text-lg text-gray-600 leading-relaxed">
                {recommendation.desc ? (
                  <div className="space-y-3">
                    {recommendation.desc.split(' ').some(w => w.length > 30) ? (
                      <p>{recommendation.desc}</p>
                    ) : ( recommendation.desc.split('. ').map((sentence, idx) => (
                        <p key={idx} className="flex gap-3">
                          <span className="text-orange-400 mt-1.5 min-w-[6px] h-[6px] rounded-full bg-orange-400" />
                          <span>{sentence}</span>
                        </p>
                      ))
                    )}
                  </div>
                ) : (
                  <p>กำลังวิเคราะห์ข้อมูล...</p>
                )}
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                  ZT
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">ZippyTill Intelligence</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Business Optimization</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SPECS & STATS (7/12) */}
          <div className="md:col-span-7 space-y-8">
            
            {/* Impact & Confidence Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  <TrendingUp size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Expected Impact</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{recommendation.benefit}</p>
              </div>
              
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  <Target size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Confidence</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{recommendation.match}</p>
              </div>
            </div>

            {/* Promo Details Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Promotion Specs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-gray-100 space-y-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">กลยุทธ์ส่วนลด</p>
                    <p className="text-sm font-bold text-gray-900">
                      {recommendation.promotion_type === 'discount_percent' ? `${recommendation.discount_value}% Discount` : 
                       recommendation.promotion_type === 'discount_amount' ? `฿${recommendation.discount_value} Discount` :
                       recommendation.promotion_type === 'buy_x_get_y' ? `Buy ${recommendation.min_qty_required} Get ${recommendation.free_qty}` : 'Special Offer'}
                    </p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 space-y-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">เวลาที่แนะนำ</p>
                    <p className="text-sm font-bold text-gray-900">{recommendation.duration_days} วัน (7 วันแรกสำคัญสุด)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Badges */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                สินค้าเป้าหมาย ({recommendation.target_products?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {recommendation.target_products?.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 text-gray-600">
                    <Package size={14} className="text-gray-400" />
                    <span className="text-xs font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between gap-4 bg-gray-50/30">
          <p className="hidden sm:block text-[11px] text-gray-400 leading-relaxed max-w-xs">
            เมื่อกดปุ่ม คุณสามารถไปปรับแต่งเงื่อนไขเพิ่มเติม เช่น ยอดซื้อขั้นต่ำ หรือวันที่เริ่มใช้งานจริงได้
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={() => {
                onCreate(recommendation);
                onClose();
              }}
              className="flex-[1.5] sm:flex-none px-10 py-3 bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-600/10"
            >
              <span>ปรับแต่งและสร้างเลย</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PromotionDetailModal;
