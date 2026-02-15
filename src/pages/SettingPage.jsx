import React, { useState } from "react";
import {
  Settings,
  Bell,
  Lock,
  Key,
  ChevronRight,
  Shield,
} from "lucide-react";

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
      enabled ? "bg-primary" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const SettingPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [stockAlert, setStockAlert] = useState(true);

  return (
    <>
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative space-y-6 pb-10">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <Settings className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                ตั้งค่า
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                จัดการการตั้งค่าระบบและการแจ้งเตือน
              </p>
            </div>
          </div>
        </div>

        {/* All Settings - Single Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="relative z-10 space-y-5">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-inactive shadow-sm border border-gray-100">
                  <Bell size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    การแจ้งเตือนในระบบ
                  </p>
                  <p className="text-xs text-inactive">
                    รับการแจ้งเตือนผ่านเบราว์เซอร์
                  </p>
                </div>
              </div>
              <Toggle
                enabled={notifications}
                onToggle={() => setNotifications(!notifications)}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-inactive shadow-sm border border-gray-100">
                  <Bell size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    แจ้งเตือนทางอีเมล
                  </p>
                  <p className="text-xs text-inactive">
                    รับสรุปรายงานประจำวันทางอีเมล
                  </p>
                </div>
              </div>
              <Toggle
                enabled={emailNotif}
                onToggle={() => setEmailNotif(!emailNotif)}
              />
            </div>

            {/* Stock Alert */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-inactive shadow-sm border border-gray-100">
                  <Bell size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    แจ้งเตือนสินค้าใกล้หมด
                  </p>
                  <p className="text-xs text-inactive">
                    เมื่อสินค้าต่ำกว่าจุดสั่งซื้อ
                  </p>
                </div>
              </div>
              <Toggle
                enabled={stockAlert}
                onToggle={() => setStockAlert(!stockAlert)}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Change Password */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all group/item cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-inactive shadow-sm border border-gray-100">
                  <Key size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    เปลี่ยนรหัสผ่าน
                  </p>
                  <p className="text-xs text-inactive">
                    อัปเดตรหัสผ่านของคุณ
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-inactive group-hover/item:text-primary transition-colors"
              />
            </div>

            {/* Two Factor */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all group/item cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-inactive shadow-sm border border-gray-100">
                  <Shield size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    การยืนยันตัวตน 2 ขั้นตอน
                  </p>
                  <p className="text-xs text-inactive">
                    เพิ่มความปลอดภัยด้วย 2FA
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-inactive bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                ปิดอยู่
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingPage;
