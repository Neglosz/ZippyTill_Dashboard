import React, { useState, useEffect } from "react";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import TextInput from "../components/common/TextInput";
import SubmitButton from "../components/common/SubmitButton";

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user came from password reset email
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // If no session, redirect to login
        navigate("/", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Update password error:", err);
      setError(
        err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-[#F3F4F6] relative overflow-hidden">
      {/* Left Side - Branding */}
      <div className="w-full lg:w-1/2 bg-white text-gray-900 p-10 lg:p-24 flex flex-col justify-between relative overflow-hidden shrink-0 lg:h-screen border-r border-gray-100">
        <div className="relative z-10 flex flex-col h-full lg:justify-between overflow-y-auto no-scrollbar">
          {/* Header / Logo */}
          <div>
            <div className="flex items-center gap-5 mb-16 lg:mb-24">
              <div className="bg-primary text-white font-bold h-14 w-14 flex items-center justify-center rounded-xl text-3xl transition-colors duration-500">
                Z
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Zippy Till
              </h1>
            </div>

            <div className="mb-16 lg:mb-24">
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                ตั้งรหัสผ่านใหม่
                <br className="hidden lg:block" />
                <span className="lg:inline block text-inactive">
                  เริ่มต้นใหม่อย่างปลอดภัย
                </span>
              </h2>
              <div className="w-16 h-1.5 bg-primary/20 rounded-full mb-8">
                <div className="h-full bg-primary w-full" />
              </div>
              <p className="text-gray-500 text-base lg:text-lg max-w-md leading-relaxed font-medium">
                กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ
                รหัสผ่านควรมีความปลอดภัยและจดจำได้ง่าย
              </p>
            </div>
          </div>

          <div className="pb-8 lg:pb-0">
            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-transparent transition-all duration-300">
              <div className="bg-white text-primary p-2.5 rounded-lg shrink-0 border border-gray-100">
                <Lock size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-gray-900">
                  รหัสผ่านที่แข็งแรง
                </h3>
                <p className="text-[10px] text-inactive font-bold uppercase tracking-wider mt-0.5">
                  ใช้ตัวอักษร ตัวเลข และสัญลักษณ์
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Update Password Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 lg:h-screen relative">
        <div className="bg-white p-12 lg:p-16 rounded-3xl w-full max-w-lg z-10 relative border border-gray-100/50 shadow-elevation transition-all duration-500 hover:shadow-elevation-hover hover:-translate-y-0.5">
          {success ? (
            /* Success State */
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-6">
                <CheckCircle2
                  size={28}
                  className="text-emerald-500"
                  strokeWidth={2}
                />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                เปลี่ยนรหัสผ่านสำเร็จ!
              </h2>
              <p className="text-sm text-inactive mb-8 max-w-sm">
                รหัสผ่านของคุณถูกเปลี่ยนแล้ว กำลังนำคุณไปหน้าเข้าสู่ระบบ...
              </p>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-6">
                  <Lock size={28} className="text-primary" strokeWidth={2} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  ตั้งรหัสผ่านใหม่
                </h2>
                <p className="text-[11px] font-bold text-inactive mt-2 uppercase tracking-wider">
                  กรุณากรอกรหัสผ่านใหม่ของคุณ
                </p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold rounded-2xl flex items-center gap-3">
                  <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500" />
                  {error}
                </div>
              )}

              <form className="space-y-8" onSubmit={handleUpdatePassword}>
                <TextInput
                  label="รหัสผ่านใหม่"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />

                <TextInput
                  label="ยืนยันรหัสผ่านใหม่"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />

                <SubmitButton
                  loading={loading}
                  loadingText="กำลังบันทึก..."
                  text="บันทึกรหัสผ่านใหม่"
                  icon={Lock}
                  className="mt-4"
                />
              </form>
            </>
          )}
        </div>

        <div className="mt-12 lg:absolute lg:bottom-10 text-[10px] text-inactive font-bold tracking-widest uppercase opacity-60">
          © 2026 ZIPPY TILL • SWISS MODERN TERMINAL
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
