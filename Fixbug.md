# ZippyTill - Code Review & Bug Fix Roadmap

สรุปรายการที่ต้องปรับปรุงและแก้ไขจากการตรวจสอบโค้ด (Code Review) วันที่ 25 กุมภาพันธ์ 2026

## 🚨 1. ความปลอดภัย (Security) - ความสำคัญระดับ: สูงสุด (Critical)
- **ช่องโหว่:** Backend API ทุกเส้นขาดการตรวจสอบสิทธิ์ (Missing Authentication Middleware)
- **รายละเอียด:** ปัจจุบัน API ใน `backend/routes/api.js` ไม่มีการเช็ค JWT Token ทำให้ใครก็ตามที่รู้ URL สามารถเข้าถึงข้อมูลส่วนตัวของร้านค้าได้
- **รายการที่ต้องทำ:**
  - [ ] สร้าง `authMiddleware.js` เพื่อตรวจสอบ Supabase JWT ใน Header
  - [ ] นำ Middleware ไปครอบ Routes ทั้งหมดใน `api.js` ยกเว้น Public Routes (เช่น Login)

## ⚡ 2. ประสิทธิภาพ (Performance) - ความสำคัญระดับ: กลาง
- **ปัญหา:** การประมวลผลข้อมูลในหน่วยความจำ (Heavy In-memory Filtering)
- **รายละเอียด:** ฟังก์ชันใน `productService.js` และ `saleService.js` มีการดึงข้อมูลทั้งหมดมาวนลูปกรองด้วย JavaScript แทนที่จะให้ Database จัดการ
- **รายการที่ต้องทำ:**
  - [ ] แก้ไข Query ใน `productService.js` (เช่น `getDashboardNotifications`) ให้กรองวันที่และสต็อกผ่าน SQL (Supabase Query)
  - [ ] จำกัดจำนวนข้อมูลที่ดึง (Pagination) สำหรับรายการที่มีโอกาสมีข้อมูลเยอะ

## 🛠️ 3. คุณภาพโค้ดและโครงสร้าง (Code Quality & Architecture) - ความสำคัญระดับ: ต่ำ-กลาง
- **ปัญหา:** โครงสร้างโค้ดบางส่วนยังไม่เป็นมาตรฐานเดียวกัน (Inconsistent Practices)
- **รายการที่ต้องทำ:**
  - [ ] **Centralized Error Handling:** สร้าง Middleware กลางสำหรับจัดการ Error ใน Backend เพื่อให้ Response มีรูปแบบเดียวกัน
  - [ ] **Environment Variable Loading:** ปรับปรุงการโหลด `.env` ให้โหลดที่ `server.js` เพียงจุดเดียว
  - [ ] **Request Validation:** เพิ่มการตรวจสอบความถูกต้องของ Body และ Query Params ก่อนส่งเข้า Service Layer (แนะนำใช้ Zod หรือ Joi)

## ✅ รายการที่แก้ไขแล้ว (Completed)
- [x] ย้าย AI Logic (Prompt Templates) จาก Frontend ไปไว้ที่ Backend Service
- [x] แก้ไขปัญหาการโหลดไฟล์ `.env` ใน Backend เมื่อรันจาก Root Directory
- [x] สร้างไฟล์ `frontend/src/lib/supabase.js` ที่หายไป
- [x] เชื่อมต่อ Frontend AI Components เข้ากับ Backend API ใหม่

---
*หมายเหตุ: ข้อมูลนี้เป็นบันทึกสำหรับใช้ในการปรับปรุงระบบให้มีความเสถียรและปลอดภัยยิ่งขึ้น*
