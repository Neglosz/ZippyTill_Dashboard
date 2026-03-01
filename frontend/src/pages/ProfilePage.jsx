import React, { useState, useRef, useEffect } from "react";
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
  X,
  Save,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { useBranch } from "../contexts/BranchContext";
import { supabase } from "../lib/supabase";
import { Modal, InfoItem } from "../components/common/ProfileComponents";

const ProfilePage = () => {
  const { activeBranchId, activeBranchName, selectBranch, userRole } =
    useBranch();
  const fileInputRef = useRef(null);

  // State
  const [profileImage, setProfileImage] = useState(null);
  const [branchName, setBranchName] = useState(activeBranchName || "สาขาหลัก");
  const [userProfile, setUserProfile] = useState({
    email: "",
    fullName: "",
    phone: "",
    role: "",
    storeName: "",
    createdAt: "",
  });
  const [storeData, setStoreData] = useState({
    address: "",
    phone: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBranchName, setEditBranchName] = useState(branchName);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load profile and store data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Load profile from profiles table
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email, full_name, phone, role, store_name, created_at")
            .eq("id", user.id)
            .single();

          if (profileData) {
            setUserProfile({
              email: profileData.email || user.email || "",
              fullName: profileData.full_name || "",
              phone: profileData.phone || "",
              role: profileData.role === "owner" ? "เจ้าของร้าน" : "ผู้จัดการ",
              storeName: profileData.store_name || "",
              createdAt: profileData.created_at
                ? new Date(profileData.created_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "",
            });
          }
        }

        // Load store data
        if (activeBranchId) {
          const { data: store } = await supabase
            .from("stores")
            .select("name, address, phone")
            .eq("id", activeBranchId)
            .single();

          if (store) {
            setBranchName(store.name);
            setStoreData({
              address: store.address || "",
              phone: store.phone || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    loadData();
  }, [activeBranchId]);

  const displayName = branchName || userProfile.storeName || "สาขาหลัก";

  const formatPhone = (phone) => {
    if (!phone) return "-";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  const infoItems = [
    { icon: Mail, label: "อีเมล", value: userProfile.email || "-" },
    {
      icon: Phone,
      label: "เบอร์โทรศัพท์",
      value: formatPhone(userProfile.phone || storeData.phone),
    },
    { icon: Briefcase, label: "ตำแหน่ง", value: userProfile.role || "-" },
    { icon: Store, label: "สาขา", value: displayName },
    { icon: MapPin, label: "ที่อยู่", value: storeData.address || "-" },
    {
      icon: Shield,
      label: "เข้าร่วมเมื่อ",
      value: userProfile.createdAt || "-",
    },
  ];

  // Open edit modal
  const handleOpenEdit = () => {
    setEditBranchName(branchName);
    setPreviewImage(profileImage);
    setImageFile(null);
    setIsEditModalOpen(true);
  };

  // Handle image select
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Remove image
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update store name in database
      if (activeBranchId) {
        await supabase
          .from("stores")
          .update({ name: editBranchName.trim() })
          .eq("id", activeBranchId);

        // Update BranchContext
        selectBranch({
          id: activeBranchId,
          name: editBranchName.trim(),
          role: userRole,
        });
      }

      // Update local state
      setBranchName(editBranchName.trim());

      // Update profile image (local only)
      if (imageFile) {
        setProfileImage(previewImage);
      } else if (!previewImage) {
        setProfileImage(null);
      }

      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error saving profile:", err);
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <div className="relative space-y-6 pb-10">
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
              <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (!isEditModalOpen) handleOpenEdit();
                }}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-90 transition-all"
              >
                <Camera size={18} strokeWidth={2.5} />
              </button>
            </div>

            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">
              {displayName}
            </h2>
            <p className="text-sm font-medium text-inactive mb-2">
              {userProfile.email}
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest border border-primary/20">
              <Shield size={14} strokeWidth={2.5} />
              {userProfile.role || "ผู้ดูแลระบบ"}
            </span>

            <div className="w-full mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleOpenEdit}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gray-50 hover:bg-primary/5 text-gray-600 hover:text-primary rounded-2xl font-bold text-sm transition-all border border-gray-100 hover:border-primary/20 active:scale-95"
              >
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
                  <InfoItem key={idx} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขโปรไฟล์"
        icon={Edit}
        onSave={handleSave}
        saving={saving}
        saveDisabled={!editBranchName.trim()}
      >
        {/* Image Upload */}
        <div className="flex flex-col items-center mb-8">
          <p className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-4">
            รูปภาพโปรไฟล์
          </p>
          <div className="relative">
            <div className="w-28 h-28 rounded-[24px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-primary">
                  {editBranchName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 active:scale-90 transition-all"
              title="เลือกรูปภาพ"
            >
              <ImagePlus size={16} strokeWidth={2.5} />
            </button>

            {/* Remove image button */}
            {previewImage && (
              <button
                onClick={handleRemoveImage}
                className="absolute -bottom-2 -left-2 w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-red-500/50 active:scale-90 transition-all"
                title="ลบรูปภาพ"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Branch Name */}
        <div className="mb-8">
          <label className="text-[10px] font-black text-inactive uppercase tracking-[0.2em] mb-2 block">
            ชื่อสาขา
          </label>
          <input
            type="text"
            value={editBranchName}
            onChange={(e) => setEditBranchName(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            placeholder="กรอกชื่อสาขา"
          />
        </div>
      </Modal>
    </>
  );
};

export default ProfilePage;
