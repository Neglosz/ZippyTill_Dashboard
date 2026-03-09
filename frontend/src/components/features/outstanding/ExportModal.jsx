import React from "react";
import { createPortal } from "react-dom";
import { FileText, FileSpreadsheet, X } from "lucide-react";

const ExportModal = ({ isOpen, onClose, onExportPDF, onExportExcel }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] p-8 w-full max-w-[380px] relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col items-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#1B2559] mb-1">ส่งออกข้อมูล</h3>
        <p className="text-gray-400 text-xs mb-8">เลือกรูปแบบไฟล์ที่ต้องการ</p>

        {/* Options */}
        <div className="flex gap-4 w-full justify-center">
          {/* PDF Option */}
          <button
            onClick={onExportPDF}
            className="group flex-1 flex flex-col items-center justify-center bg-gray-50 hover:bg-white border-2 border-transparent hover:border-red-100 h-36 rounded-[20px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="h-14 w-14 mb-3 rounded-full flex items-center justify-center text-red-500 bg-white shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
              <FileText size={28} />
            </div>
            <span className="text-gray-600 font-bold text-sm group-hover:text-red-500 transition-colors">
              PDF
            </span>
          </button>

          {/* Excel Option */}
          <button
            onClick={onExportExcel}
            className="group flex-1 flex flex-col items-center justify-center bg-gray-50 hover:bg-white border-2 border-transparent hover:border-green-100 h-36 rounded-[20px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="h-14 w-14 mb-3 rounded-full flex items-center justify-center text-green-600 bg-white shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
              <FileSpreadsheet size={28} />
            </div>
            <span className="text-gray-600 font-bold text-sm group-hover:text-green-600 transition-colors">
              Excel
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ExportModal;
