import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { createPortal } from "react-dom";

const BEDatePicker = ({ value, onChange, placeholder = "วัน/เดือน/ปี (พ.ศ.)" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const [isReady, setIsReady] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    // Constants
    const monthsTH = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const daysTH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                const portalElement = document.getElementById("be-datepicker-portal");
                if (portalElement && portalElement.contains(event.target)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
            setIsReady(true);
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            setIsReady(false);
            updateCoords();
            
            // Re-calculate after a tiny delay to ensure proper layout
            const timer = setTimeout(updateCoords, 0);
            
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('scroll', updateCoords, true);
                window.removeEventListener('resize', updateCoords);
            };
        }
    }, [isOpen]);

    const formatDateToBE = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const yStr = (date.getFullYear() + 543).toString();
        return `${d}/${m}/${yStr}`;
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (e, day) => {
        e.preventDefault();
        e.stopPropagation();
        const y = currentDate.getFullYear();
        const m = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const d = day.toString().padStart(2, "0");
        const dateValue = `${y}-${m}-${d}`;
        onChange({ target: { name: "exp", value: dateValue } });
        setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const dropdown = isOpen && isReady ? createPortal(
        <div
            id="be-datepicker-portal"
            className="fixed z-[10001] bg-white rounded-[24px] shadow-2xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-200"
            style={{
                top: `${coords.top + 8}px`,
                left: `${coords.left + coords.width / 2}px`,
                transform: 'translateX(-50%)',
                width: '280px'
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 px-1">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors text-[#1B2559]/40 hover:text-primary border border-transparent hover:border-gray-100"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                    <p className="text-sm font-black text-[#1B2559] leading-tight">
                        {monthsTH[currentDate.getMonth()]}
                    </p>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-tight">
                        พ.ศ. {currentDate.getFullYear() + 543}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors text-[#1B2559]/40 hover:text-primary border border-transparent hover:border-gray-100"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Days Weekday */}
            <div className="grid grid-cols-7 mb-2 border-b border-gray-50/50 pb-1">
                {daysTH.map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isToday = new Date().toDateString() === dateObj.toDateString();
                    const isSelected = value && new Date(value).toDateString() === dateObj.toDateString();

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={(e) => handleDateClick(e, day)}
                            className={`
                                h-10 w-full rounded-xl text-sm font-black transition-all flex items-center justify-center
                                ${isSelected
                                    ? "bg-[#ED7117] text-white shadow-lg shadow-orange-200 scale-110 z-10"
                                    : isToday
                                        ? "bg-orange-50 text-orange-600 border border-orange-100"
                                        : "text-[#1B2559] hover:bg-gray-50 hover:text-primary"
                                }
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between px-1">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange({ target: { name: "exp", value: "" } });
                        setIsOpen(false);
                    }}
                    className="text-[11px] font-black text-rose-500 uppercase tracking-tighter hover:underline px-2 py-1"
                >
                    ล้างข้อมูล
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const today = new Date();
                        const y = today.getFullYear();
                        const m = (today.getMonth() + 1).toString().padStart(2, "0");
                        const d = today.getDate().toString().padStart(2, "0");
                        const dateValue = `${y}-${m}-${d}`;
                        onChange({ target: { name: "exp", value: dateValue } });
                        setCurrentDate(today);
                        setIsOpen(false);
                    }}
                    className="text-[11px] font-black text-[#ED7117] uppercase tracking-tighter hover:underline px-2 py-1"
                >
                    วันนี้
                </button>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                ref={triggerRef}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-full bg-[#F8FAFD] border-none rounded-[18px] px-5 py-4 text-base font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm shadow-indigo-100/20 flex justify-between items-center"
            >
                <span className={!value ? "text-gray-400" : "text-[#1B2559]"}>
                    {value ? formatDateToBE(value) : placeholder}
                </span>
                <CalendarIcon size={20} className="text-gray-400" />
            </div>
            {dropdown}
        </div>
    );
};

export default BEDatePicker;
