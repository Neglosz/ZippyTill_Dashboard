import React, { useState } from "react";
import { Box, BarChart3, TrendingUp, Lock, Loader2 } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import TextInput from "../components/common/TextInput";
import SubmitButton from "../components/common/SubmitButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Check for URL errors (e.g., expired reset link)
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));

    const errorCode =
      searchParams.get("error_code") || hashParams.get("error_code");
    const errorDesc =
      searchParams.get("error_description") ||
      hashParams.get("error_description");

    if (errorCode || errorDesc) {
      let displayError = errorDesc
        ? decodeURIComponent(errorDesc).replace(/\+/g, " ")
        : "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์";

      // Specifically handle the expired/used token case
      if (
        displayError.toLowerCase().includes("expired") ||
        displayError.toLowerCase().includes("invalid") ||
        displayError.toLowerCase().includes("used")
      ) {
        displayError = "ลิงก์หมดอายุ หรือถูกใช้งานไปแล้ว (link expired/used)";
      }

      setError(displayError);

      // Clean up the URL to prevent showing the error again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Timer effect for lockdown countdown
  React.useEffect(() => {
    let interval;
    if (lockoutUntil) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = lockoutUntil - now;

        if (distance <= 0) {
          clearInterval(interval);
          setLockoutUntil(null);
          setCountdown(0);
          setError(null);
          // Optional: Reset attempts to 4 to allow 1 more try before locking again
          // setFailedAttempts(4);
        } else {
          setCountdown(Math.ceil(distance / 1000));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutUntil) {
      return; // Prevent login while locked out
    }

    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      // Reset on success
      setFailedAttempts(0);
      setLockoutUntil(null);
      // Navigate to select-branch on success with history replacement
      navigate("/select-branch", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      let lockDurationMs = 0;
      if (newAttempts >= 8)
        lockDurationMs = 10 * 60 * 1000; // 10 minutes
      else if (newAttempts === 7)
        lockDurationMs = 5 * 60 * 1000; // 5 minutes
      else if (newAttempts === 6)
        lockDurationMs = 3 * 60 * 1000; // 3 minutes
      else if (newAttempts === 5) lockDurationMs = 1 * 60 * 1000; // 1 minute

      if (lockDurationMs > 0) {
        const unlockTime = new Date().getTime() + lockDurationMs;
        setLockoutUntil(unlockTime);
        setCountdown(lockDurationMs / 1000);
      } else {
        // Supabase typically returns an error object with a message property
        setError(
          err.message ||
          `เกิดข้อผิดพลาดในการเข้าสู่ระบบ (คุณใส่ผิดไปแล้ว ${newAttempts} ครั้ง)`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-[#F3F4F6] relative overflow-hidden">
      {/* Background - Minimalist clean background already set in layout/global */}

      {/* Left Side - Branding & Info */}
      <div className="w-full lg:w-1/2 bg-white text-gray-900 p-10 lg:p-24 flex flex-col justify-between relative overflow-hidden shrink-0 lg:h-screen border-r border-gray-100">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full lg:justify-between overflow-y-auto no-scrollbar">
          {/* Header / Logo */}
          <div className="group/logo cursor-pointer">
            <div className="flex items-center gap-5 mb-16 lg:mb-24">
              <div className="bg-primary text-white font-bold h-16 w-16 flex items-center justify-center rounded-xl text-4xl transition-colors duration-500">
                Z
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Zippy Till
              </h1>
            </div>

            <div className="mb-16 lg:mb-24">
              <h2 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                จัดการคลังสินค้า
                <br className="hidden lg:block" />
                <span className="lg:inline block text-inactive">
                  ที่ทรงพลังและชัดเจน
                </span>
              </h2>
              <div className="w-20 h-2 bg-primary/20 rounded-full mb-8">
                <div className="h-full bg-primary w-full" />
              </div>
              <p className="text-gray-500 text-lg lg:text-xl max-w-lg leading-relaxed font-medium">
                ยกระดับธุรกิจของคุณด้วยระบบ POS ระดับพรีเมียม
                ที่มาพร้อมกับดีไซน์ที่ล้ำสมัยและการใช้งานที่ทรงประสิทธิภาพ
              </p>
            </div>



            <div className="grid grid-cols-1 gap-5 pb-8 lg:pb-0">
              {/* Feature Items */}
              <FeatureItem
                icon={Box}
                title="ควบคุมสต๊อกอัจฉริยะ"
                desc="ติดตามสินค้าคงคลังแบบเรียลไทม์"
              />
              <FeatureItem
                icon={BarChart3}
                title="การวิเคราะห์ขั้นสูง"
                desc="วิเคราะห์ข้อมูลการขายอย่างลึกซึ้ง"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 lg:h-screen relative">
        <div className="bg-white p-12 lg:p-16 rounded-3xl w-full max-w-lg z-10 relative border border-gray-100/50 shadow-elevation transition-all duration-500 hover:shadow-elevation-hover hover:-translate-y-0.5">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-6">
              <Lock size={28} className="text-primary" strokeWidth={2} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              ยินดีต้อนรับกลับมา
            </h2>
            <p className="text-[11px] font-bold text-inactive mt-2 uppercase tracking-wider">
              เข้าสู่ระบบอย่างปลอดภัย
            </p>
          </div>

          {(error || lockoutUntil) && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-sm font-bold rounded-2xl flex items-center gap-3">
              <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500"></div>
              {lockoutUntil ? (
                <span>
                  บัญชีถูกระงับชั่วคราวเนื่องจากใส่รหัสผิดหลายครั้ง
                  กรุณาลองใหม่ในอีก{" "}
                  <span className="text-rose-600 px-1">
                    {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </span>{" "}
                  นาที
                </span>
              ) : (
                error
              )}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <TextInput
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zippytill.com"
              required
              disabled={lockoutUntil !== null}
            />

            <TextInput
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              disabled={lockoutUntil !== null}
              rightElement={
                <Link
                  to="/reset-password"
                  className={`text-xs font-bold text-inactive hover:text-primary uppercase tracking-wider transition-all ${lockoutUntil !== null ? "pointer-events-none opacity-50" : ""}`}
                >
                  ลืมรหัสผ่าน?
                </Link>
              }
            />

            <SubmitButton
              loading={loading}
              loadingText="กำลังตรวจสอบ..."
              text={
                lockoutUntil
                  ? `ลองใหม่ใน ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")}`
                  : "เข้าสู่ระบบ"
              }
              className="mt-4"
              disabled={lockoutUntil !== null}
            />
          </form>
        </div>

        <div className="mt-12 lg:absolute lg:bottom-10 text-[10px] text-inactive font-bold tracking-widest uppercase opacity-60">
          © 2026 ZIPPY TILL • SWISS MODERN TERMINAL
        </div>
      </div>
    </div>
  );
};

// Helper component for features to keep code clean and uniform
const FeatureItem = ({ icon, title, desc }) => (
  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-transparent transition-all duration-300">
    <div className="bg-white text-primary p-2.5 rounded-lg shrink-0 border border-gray-100">
      {React.createElement(icon, { size: 20, strokeWidth: 2 })}
    </div>
    <div>
      <h3 className="font-bold text-sm tracking-tight text-gray-900">
        {title}
      </h3>
      <p className="text-[10px] text-inactive font-bold uppercase tracking-wider mt-0.5">
        {desc}
      </p>
    </div>
  </div>
);

export default LoginPage;
