import React from 'react';
import { Box, BarChart3, TrendingUp, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    // Outer container: 
    // Desktop: Split screen, fixed height.
    // Mobile: Stacked, natural scroll.
    <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-[#f8f9fa]">
      
      {/* Left Side - Branding & Info */}
      {/* Visible on all screens now. On mobile it is top section. */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="w-full lg:w-1/2 bg-[#6d28d9] text-white p-6 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0 lg:h-screen">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] opacity-100 z-0"></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

        {/* Content Container */}
        {/* Added overflow-y-auto to allow scrolling if content is too tall on small vertical screens */}
        <div className="relative z-10 flex flex-col h-full lg:justify-between overflow-y-auto no-scrollbar">
            {/* Header / Logo */}
            <div>
              <div className="flex items-center gap-3 mb-6 lg:mb-12">
                <div className="bg-white text-black font-bold h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center rounded-lg text-xl lg:text-2xl">Z</div>
                <h1 className="text-xl lg:text-3xl font-bold tracking-wide">Zippy Till</h1>
              </div>

              <div className="mb-6 lg:mb-12">
                <h2 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4 leading-tight">
                  ระบบจัดการคลังสินค้า<br className="hidden lg:block" />
                  <span className="lg:inline block">ที่ทรงพลังและใช้งานง่าย</span>
                </h2>
                <p className="text-purple-100 text-sm lg:text-base max-w-md leading-relaxed">
                  จัดการธุรกิจของคุณอย่างมีประสิทธิภาพด้วยระบบที่ออกแบบมาเพื่อคุณ ไม่ว่าจะเป็นการจัดการสต็อก 
                  ติดตามยอดขายหรือวิเคราะห์การเงิน
                </p>
              </div>

              <div className="flex gap-8 lg:gap-12 mb-8 lg:mb-12">
                <div>
                    <p className="text-2xl lg:text-3xl font-bold">670+</p>
                    <p className="text-xs lg:text-sm text-purple-200">ร้านค้าในระบบ</p>
                </div>
                <div>
                    <p className="text-2xl lg:text-3xl font-bold">24/7</p>
                    <p className="text-xs lg:text-sm text-purple-200">ซัพพอร์ต</p>
                </div>
              </div>
            </div>
          
            <div className="grid grid-cols-1 gap-4 pb-8 lg:pb-0">
              {/* Feature Items */}
              <FeatureItem icon={Box} title="จัดการสต็อกอัจฉริยะ" desc="ติดตามสินค้าคงคลังแบบเรียลไทม์" />
              <FeatureItem icon={BarChart3} title="รายงานที่ละเอียด" desc="วิเคราะห์ยอดขายและกำไร" />
              <FeatureItem icon={TrendingUp} title="เพิ่มยอดขาย" desc="ใช้ข้อมูลตัดสินใจเพื่อการเติบโต" />
              <FeatureItem icon={Lock} title="ปลอดภัย" desc="ระบบคลาวด์มาตรฐานสากล" />
            </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-[#f8f9fa] flex flex-col items-center justify-center p-4 lg:p-6 lg:h-screen relative">
        
        {/* Floating Z Logo - Desktop Clean */}
        <div className="hidden lg:flex mb-6">
            <div className="bg-white shadow-xl h-16 w-16 flex items-center justify-center rounded-xl text-3xl font-bold text-black border border-gray-100">
                Z
            </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md z-10 relative">
           <div className="text-center mb-5 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">ยินดีต้อนรับ</h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">เข้าสู่ระบบเพื่อเริ่มจัดการธุรกิจของคุณ</p>
           </div>

           <form className="space-y-3 lg:space-y-5">
              <div>
                 <label className="block text-[10px] lg:text-xs font-semibold text-gray-600 mb-1 ml-1">อีเมล</label>
                 <input 
                    type="email" 
                    placeholder="example@email.com"
                    className="w-full bg-gray-100 border-none rounded-lg px-4 py-2.5 text-xs lg:text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                 />
              </div>

              <div>
                 <label className="block text-[10px] lg:text-xs font-semibold text-gray-600 mb-1 ml-1">รหัสผ่าน</label>
                 <input 
                    type="password" 
                    placeholder="********"
                    className="w-full bg-gray-100 border-none rounded-lg px-4 py-2.5 text-xs lg:text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none"
                 />
                 <div className="text-right mt-1.5">
                    <a href="#" className="text-[10px] text-gray-500 hover:text-purple-600">ลืมรหัสผ่าน?</a>
                 </div>
              </div>

              <button 
                type="button"
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2.5 lg:py-3 text-sm lg:text-base rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
              >
                เข้าสู่ระบบ
              </button>
           </form>
        </div>

        <div className="mt-6 lg:absolute lg:bottom-4 text-[10px] text-gray-400">
           © 2026 Zippy Till. All rights reserved.
        </div>
      </div>
    </div>
  );
};

// Helper component for features to keep code clean and uniform
const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl flex items-center gap-4 border border-white/10">
      <div className="bg-white text-[#6d28d9] p-2 rounded-lg shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-sm lg:text-base">{title}</h3>
        <p className="text-xs text-purple-100">{desc}</p>
      </div>
  </div>
);

export default LoginPage;
