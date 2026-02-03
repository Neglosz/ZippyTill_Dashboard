import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const CustomDatePicker = ({ value, onChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  // Parse initial value (DD/MM/YYYY) to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  const initialDate = parseDate(value);
  const [currentDate, setCurrentDate] = useState(initialDate); // Navigation state
  const [selectedDate, setSelectedDate] = useState(initialDate); // Selection state

  const daysOfWeek = ["SAN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const handleDateClick = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);

    // Format to DD/MM/YYYY for parent
    const formattedDate = `${String(day).padStart(2, "0")}/${String(
      newDate.getMonth() + 1
    ).padStart(2, "0")}/${newDate.getFullYear()}`;
    onChange(formattedDate);
    setShowCalendar(false);
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

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
          value={value}
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-[#1B2559] font-medium focus:ring-2 focus:ring-[#6d28d9] focus:outline-none transition-all hover:bg-gray-50 cursor-pointer bg-white"
        />
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute bottom-0 left-full ml-16 z-50 bg-white rounded-2xl shadow-xl p-6 w-[320px] border border-gray-100">
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
            <span className="text-[#1B2559] font-bold text-lg">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
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
