import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const TextInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  rightElement = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`relative group/input ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-inactive uppercase tracking-wider mb-3 ml-2 group-focus-within/input:text-primary transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder-inactive/50 focus:bg-white focus:border-primary/30 transition-all outline-none ${
            isPassword ? "pr-12" : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-inactive hover:text-primary transition-colors"
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={2} />
            ) : (
              <Eye size={18} strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      {rightElement && (
        <div className="text-right mt-3 mr-2">{rightElement}</div>
      )}
    </div>
  );
};

export default TextInput;
