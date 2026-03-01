import React, { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  Lock,
  Key,
  ChevronRight,
  X,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useBranch } from "../contexts/BranchContext";
import { Modal } from "../components/common/ProfileComponents";
import TextInput from "../components/common/TextInput";

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
  const { activeBranchId } = useBranch();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(
      `setting_notifications_${activeBranchId}`,
    );
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [stockAlert, setStockAlert] = useState(() => {
    const saved = localStorage.getItem(`setting_stockAlert_${activeBranchId}`);
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Re-read settings when branch changes
  useEffect(() => {
    if (!activeBranchId) return;
    const savedNotif = localStorage.getItem(
      `setting_notifications_${activeBranchId}`,
    );
    setNotifications(savedNotif !== null ? JSON.parse(savedNotif) : true);
    const savedStock = localStorage.getItem(
      `setting_stockAlert_${activeBranchId}`,
    );
    setStockAlert(savedStock !== null ? JSON.parse(savedStock) : true);
  }, [activeBranchId]);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    if (!activeBranchId) return;
    localStorage.setItem(
      `setting_notifications_${activeBranchId}`,
      JSON.stringify(notifications),
    );
    window.dispatchEvent(new Event("settingsChanged"));
  }, [notifications, activeBranchId]);

  useEffect(() => {
    if (!activeBranchId) return;
    localStorage.setItem(
      `setting_stockAlert_${activeBranchId}`,
      JSON.stringify(stockAlert),
    );
    window.dispatchEvent(new Event("settingsChanged"));
  }, [stockAlert, activeBranchId]);

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleOpenPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordSuccess(false);
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setSaving(true);
    try {
      // Verify current password by re-authenticating
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ไม่พบผู้ใช้");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        setSaving(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setSaving(false);
    }
  };

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
            <div
              onClick={handleOpenPasswordModal}
              className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all group/item cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-inactive shadow-sm border border-gray-100">
                  <Key size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    เปลี่ยนรหัสผ่าน
                  </p>
                  <p className="text-xs text-inactive">อัปเดตรหัสผ่านของคุณ</p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-inactive group-hover/item:text-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="เปลี่ยนรหัสผ่าน"
        icon={Key}
        onSave={handleChangePassword}
        saving={saving}
        saveText="เปลี่ยนรหัสผ่าน"
        hideFooter={passwordSuccess}
      >
        {/* Success State */}
        {passwordSuccess ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
              <CheckCircle2
                size={32}
                className="text-emerald-500"
                strokeWidth={2}
              />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">
              เปลี่ยนรหัสผ่านสำเร็จ!
            </p>
            <p className="text-sm text-inactive">รหัสผ่านของคุณถูกอัปเดตแล้ว</p>
          </div>
        ) : (
          <>
            {/* Error */}
            {passwordError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-3">
                <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500" />
                {passwordError}
              </div>
            )}

            <div className="space-y-5 mb-8">
              {/* Current Password */}
              <TextInput
                label="รหัสผ่านปัจจุบัน"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                className="mb-5"
              />

              {/* New Password */}
              <TextInput
                label="รหัสผ่านใหม่"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                className="mb-5"
              />

              {/* Confirm New Password */}
              <TextInput
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default SettingPage;
