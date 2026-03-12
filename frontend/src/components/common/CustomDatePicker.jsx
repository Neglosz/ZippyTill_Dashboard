import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const CustomDatePicker = ({ value, onChange, mode = "day" }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  // Parse initial value (DD/MM/YYYY) to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  const initialDate = parseDate(value);
  const [currentDate, setCurrentDate] = useState(initialDate); // Navigation state
  const [selectedDate, setSelectedDate] = useState(initialDate); // Selection state
  const [view, setView] = useState(mode); // 'day', 'month', 'year'

  useEffect(() => {
    setView(mode);
  }, [mode]);

  useEffect(() => {
    const d = parseDate(value);
    setCurrentDate(d);
    setSelectedDate(d);
  }, [value]);

  const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const shortMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(newDate);
    onChange(newDate);
    setShowCalendar(false);
  };

  const handleMonthClick = (monthIdx) => {
    const newDate = new Date(currentDate.getFullYear(), monthIdx, 1);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    if (mode === "month") {
      onChange(newDate);
      setShowCalendar(false);
    } else {
      setView("day");
    }
  };

  const handleYearClick = (year) => {
    const newDate = new Date(year, currentDate.getMonth(), 1);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    if (mode === "year") {
      onChange(newDate);
      setShowCalendar(false);
    } else {
      setView("month");
    }
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  const renderDayView = () => (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            navigateMonth(-1);
          }}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div 
          className="text-[#1B2559] font-bold text-lg cursor-pointer hover:text-primary"
          onClick={() => setView("month")}
        >
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigateMonth(1);
          }}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-4">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold text-gray-400 tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const isSelected =
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear();

          return (
            <button
              key={day}
              onClick={(e) => {
                e.preventDefault();
                handleDateClick(day);
              }}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                        ${
                          isSelected
                            ? "bg-[#ff5722] text-white shadow-md shadow-orange-200"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderMonthView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            navigateYear(-1);
          }}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div 
          className="text-[#1B2559] font-bold text-lg cursor-pointer hover:text-primary"
          onClick={() => setView("year")}
        >
          {currentDate.getFullYear()}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigateYear(1);
          }}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {shortMonths.map((month, idx) => {
          const isSelected = selectedDate.getMonth() === idx && selectedDate.getFullYear() === currentDate.getFullYear();
          return (
            <button
              key={month}
              onClick={(e) => {
                e.preventDefault();
                handleMonthClick(idx);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                isSelected ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
    </>
  );

  const renderYearView = () => {
    const startYear = Math.floor(currentDate.getFullYear() / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentDate(new Date(currentDate.getFullYear() - 12, 0, 1));
            }}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-[#1B2559] font-bold text-lg">
            {years[0]} - {years[years.length - 1]}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentDate(new Date(currentDate.getFullYear() + 12, 0, 1));
            }}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {years.map((year) => {
            const isSelected = selectedDate.getFullYear() === year;
            return (
              <button
                key={year}
                onClick={(e) => {
                  e.preventDefault();
                  handleYearClick(year);
                }}
                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                  isSelected ? "bg-primary text-white" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  const getDisplayText = () => {
    const d = parseDate(value);
    if (mode === "day") return value;
    if (mode === "month") return `${months[d.getMonth()]} ${d.getFullYear()}`;
    if (mode === "year") return `${d.getFullYear()}`;
    return value;
  };

  return (
    <div className="relative w-full">
      {/* Input Field Trigger */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="text-[#6d28d9]" size={18} />
        </div>
        <input
          type="text"
          readOnly
          value={getDisplayText()}
          onClick={() => {
            setShowCalendar(!showCalendar);
            setView(mode);
          }}
          className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-[#1B2559] font-medium focus:ring-2 focus:ring-[#6d28d9] focus:outline-none transition-all hover:bg-gray-50 cursor-pointer bg-white"
        />
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-white rounded-2xl shadow-xl p-6 w-[320px] border border-gray-100">
          {view === "day" && renderDayView()}
          {view === "month" && renderMonthView()}
          {view === "year" && renderYearView()}
        </div>
      )}

      {/* Backdrop to close */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
};

export default CustomDatePicker;
