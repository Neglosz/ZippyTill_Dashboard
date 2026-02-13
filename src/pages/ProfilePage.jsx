import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Briefcase,
  Store,
  Edit,
  Camera,
} from "lucide-react";
import { useBranch } from "../contexts/BranchContext";

const ProfilePage = () => {
  const { activeBranchName } = useBranch();

  // Mock profile data
  const profile = {
    name: "Testsystem",
    email: "testsystem@gmail.com",
    phone: "081-234-5678",
    role: "ผู้ดูแลระบบ",
    branch: activeBranchName || "สาขาหลัก",
    address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
    joinDate: "15 ม.ค. 2569",
  };

  const infoItems = [
    { icon: Mail, label: "อีเมล", value: profile.email },
    { icon: Phone, label: "เบอร์โทรศัพท์", value: profile.phone },
    { icon: Briefcase, label: "ตำแหน่ง", value: profile.role },
    { icon: Store, label: "สาขา", value: profile.branch },
    { icon: MapPin, label: "ที่อยู่", value: profile.address },
    { icon: Shield, label: "เข้าร่วมเมื่อ", value: profile.joinDate },
  ];

  return (
    <>
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative space-y-6 pb-10 min-h-screen">
        {/* Header Banner */}
        <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500">
              <User className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
                โปรไฟล์
                <span className="text-primary">.</span>
              </h1>
              <p className="text-sm font-medium text-inactive">
                จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                <span className="text-5xl font-black text-primary">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-90 transition-all">
                <Camera size={18} strokeWidth={2.5} />
              </button>
            </div>

            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
              {profile.name}
            </h2>
            <p className="text-sm font-medium text-inactive mb-2">
              {profile.email}
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20">
              <Shield size={14} strokeWidth={2.5} />
              {profile.role}
            </span>

            <div className="w-full mt-8 pt-6 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gray-50 hover:bg-primary/5 text-gray-600 hover:text-primary rounded-2xl font-bold text-sm transition-all border border-gray-100 hover:border-primary/20 active:scale-95">
                <Edit size={16} strokeWidth={2.5} />
                แก้ไขโปรไฟล์
              </button>
            </div>
          </div>

          {/* Right: Info Details */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/20 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="relative z-10">
              <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-8 flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  <User size={20} strokeWidth={2.5} />
                </div>
                ข้อมูลส่วนตัว
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {infoItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="group/item flex items-start gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all duration-300"
                  >
                    <div className="p-2.5 bg-white rounded-xl text-inactive group-hover/item:text-primary transition-colors shadow-sm border border-gray-100 shrink-0">
                      <item.icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-1">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-premium border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/20 rounded-full blur-3xl -mr-16 -mt-16" />

          <div className="relative z-10">
            <h3 className="text-xl font-black text-gray-900 tracking-tighter mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-500 border border-emerald-100">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              กิจกรรมล่าสุด
            </h3>

            <div className="space-y-4">
              {[
                {
                  action: "เข้าสู่ระบบ",
                  time: "วันนี้ 10:30 น.",
                  detail: "Chrome - macOS",
                },
                {
                  action: "แก้ไขสินค้า",
                  time: "วันนี้ 09:15 น.",
                  detail: "อัปเดตราคาสินค้า Mixed Berry Juice",
                },
                {
                  action: "ส่งออกรายงาน",
                  time: "เมื่อวาน 16:45 น.",
                  detail: "รายงานยอดขายประจำสัปดาห์",
                },
                {
                  action: "เพิ่มสินค้าใหม่",
                  time: "เมื่อวาน 14:20 น.",
                  detail: "เพิ่มสินค้า OISHI Green Tea",
                },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group/act"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/30 group-hover/act:bg-primary transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-inactive">{activity.detail}</p>
                  </div>
                  <span className="text-[10px] font-black text-inactive uppercase tracking-widest shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
