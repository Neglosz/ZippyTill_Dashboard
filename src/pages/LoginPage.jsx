import React, { useState } from "react";
import { Box, BarChart3, TrendingUp, Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const session = await authService.getSession();
      if (session) {
        navigate("/select-branch", { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login(email, password);
      // Navigate to select-branch on success with history replacement
      navigate("/select-branch", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      // Supabase typically returns an error object with a message property
      setError(
        err.message ||
          "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดตรวจสอบอีเมลและรหัสผ่าน",
      );
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
              <div className="bg-primary text-white font-bold h-14 w-14 flex items-center justify-center rounded-xl text-3xl transition-colors duration-500">
                Z
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Zippy Till
              </h1>
            </div>

            <div className="mb-16 lg:mb-24">
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900">
                จัดการคลังสินค้า
                <br className="hidden lg:block" />
                <span className="lg:inline block text-inactive">
                  ที่ทรงพลังและชัดเจน
                </span>
              </h2>
              <div className="w-16 h-1.5 bg-primary/20 rounded-full mb-8">
                <div className="h-full bg-primary w-full" />
              </div>
              <p className="text-gray-500 text-base lg:text-lg max-w-md leading-relaxed font-medium">
                ยกระดับธุรกิจของคุณด้วยระบบ POS ระดับพรีเมียม
                ที่มาพร้อมกับดีไซน์ที่ล้ำสมัยและการใช้งานที่ทรงประสิทธิภาพ
              </p>
            </div>

            <div className="flex gap-16 lg:gap-24 mb-16">
              <div className="group/stat">
                <p className="text-4xl lg:text-6xl font-bold tracking-tight text-primary">
                  670+
                </p>
                <p className="text-[11px] font-bold text-inactive uppercase tracking-wider mt-2">
                  Businesses Trusted
                </p>
              </div>
              <div className="group/stat">
                <p className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900">
                  24/7
                </p>
                <p className="text-[11px] font-bold text-inactive uppercase tracking-wider mt-2">
                  Expert Support
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 pb-8 lg:pb-0">
            {/* Feature Items */}
            <FeatureItem
              icon={Box}
              title="Smart Stock Control"
              desc="Real-time inventory tracking"
            />
            <FeatureItem
              icon={BarChart3}
              title="Advanced Analytics"
              desc="Deep dive into your sales"
            />
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
              Welcome Back
            </h2>
            <p className="text-[11px] font-bold text-inactive mt-2 uppercase tracking-wider">
              Secure login to your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold rounded-2xl flex items-center gap-3">
              <div className="shrink-0 w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="relative group/input">
              <label className="block text-[11px] font-bold text-inactive uppercase tracking-wider mb-3 ml-2 group-focus-within/input:text-primary transition-colors">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zippytill.com"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder-inactive/50 focus:bg-white focus:border-primary/30 transition-all outline-none"
              />
            </div>

            <div className="relative group/input">
              <label className="block text-[11px] font-bold text-inactive uppercase tracking-wider mb-3 ml-2 group-focus-within/input:text-primary transition-colors">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 placeholder-inactive/50 focus:bg-white focus:border-primary/30 transition-all outline-none"
              />
              <div className="text-right mt-3 mr-2">
                <a
                  href="#"
                  className="text-[10px] font-bold text-inactive hover:text-primary uppercase tracking-wider transition-all"
                >
                  Forgot access?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:bg-[#d66515] active:scale-[0.98] mt-4"
            >
              {loading ? (
                <>
                  <Loader2
                    className="animate-spin mr-3"
                    size={20}
                    strokeWidth={2}
                  />
                  Authentication...
                </>
              ) : (
                <span className="flex items-center gap-3 tracking-wider uppercase text-[11px]">
                  Sign In to Terminal
                </span>
              )}
            </button>
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
