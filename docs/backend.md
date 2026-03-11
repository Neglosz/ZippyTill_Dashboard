# ZippyTill Backend Architecture

โครงสร้างโฟลเดอร์และคำอธิบายระบบหลังบ้าน (Backend) ที่ถูกจัดระเบียบใหม่ตามหลัก Clean Architecture

## โครงสร้างโฟลเดอร์ (Folder Structure)

```
backend/
  ├── config/        # การตั้งค่าต่างๆ เช่น การเชื่อมต่อฐานข้อมูล (Supabase)
  ├── controllers/   # ตัวควบคุมการรับส่งข้อมูล (Request/Response Handling)
  ├── middleware/    # ตัวกลางจัดการข้อมูลก่อนถึง Controller (เช่น Auth, Logging)
  ├── models/        # นิยามโครงสร้างข้อมูล (Data Schemas/Models)
  ├── routes/        # กำหนดเส้นทาง API (API Endpoints)
  ├── services/      # ส่วนของ Business Logic และการติดต่อ Database โดยตรง
  ├── utils/         # ฟังก์ชันช่วยเหลือทั่วไป (Helper Functions)
  ├── server.js      # จุดเริ่มต้นของระบบ (Entry Point)
  └── backend.md     # เอกสารประกอบ (ไฟล์นี้)
```

## รายละเอียดแต่ละโฟลเดอร์

### 1. `config/`
- เก็บไฟล์ตั้งค่าระบบ เช่น `supabase.js` ที่ย้ายมาจาก `src/lib/` เพื่อใช้ในการเชื่อมต่อกับ Supabase จากฝั่ง Server โดยใช้ Environment Variables (`process.env`).

### 2. `services/`
- เป็นส่วนที่เก็บ **Business Logic** ทั้งหมด เช่น การคำนวณราคาสินค้า, การเช็คสต็อก, การดึงข้อมูลจาก Database
- โค้ดที่ย้ายมา: ไฟล์ทั้งหมดจาก `src/services/` (เช่น `productService.js`, `authService.js`, etc.) ถูกนำมาปรับปรุงให้เป็นรูปแบบ CommonJS เพื่อใช้งานใน Node.js

### 3. `controllers/`
- ทำหน้าที่รับข้อมูลจาก `routes` แล้วเรียกใช้งาน `services` ที่เกี่ยวข้อง จากนั้นส่งผลลัพธ์ (Response) กลับไปยัง Frontend
- ช่วยแยกหน้าที่การรับส่งข้อมูล ออกจากตรรกะทางธุรกิจ (Business Logic)

### 4. `routes/`
- กำหนด API Endpoints ทั้งหมดของระบบ เช่น `/api/products`, `/api/auth/login`
- ใช้ Express Router ในการจัดการเส้นทางต่างๆ อย่างเป็นระเบียบ

### 5. `middleware/`
- (เตรียมไว้สำหรับการขยายผล) เช่น การตรวจสอบ JWT Token หรือการจัดการข้อผิดพลาด (Error Handling) ก่อนที่ข้อมูลจะถูกส่งไปยัง Controller

### 6. Testing with TestSprite
- **Configuration:** ใช้ไฟล์ `testsprite.json` ใน root directory เพื่อตั้งค่าโปรเจกต์
- **Environment:** ต้องมี `TESTSPRITE_API_KEY` ในไฟล์ `backend/.env`
- **Commands:** 
  - `npm run test:sprite` (ในโฟลเดอร์ `backend`) เพื่อเรียกใช้งาน TestSprite MCP สำหรับการทดสอบ API อัตโนมัติ

## การเชื่อมต่อจาก Frontend

เมื่อย้าย Backend ออกมาแยกต่างหากแล้ว การเรียกใช้งานจาก Frontend จะเปลี่ยนจากการเรียกใช้ Service โดยตรง เป็นการเรียกผ่าน API (HTTP Requests) ดังนี้:

### ตัวอย่างการเรียกใช้งาน (Frontend):

```javascript
// เดิม (Client-side directly calling Supabase)
// import { productService } from '../services/productService';
// const data = await productService.getAllProducts(branchId);

// ใหม่ (Calling via API)
const response = await fetch(`http://localhost:5000/api/products?branchId=${branchId}`);
const data = await response.json();
```

## ประโยชน์ของการจัดระเบียบใหม่
1. **Separation of Concerns:** แยกหน้าที่กันชัดเจน (Frontend จัดการ UI, Backend จัดการ Data/Logic)
2. **Security:** ปกป้อง API Keys และความปลอดภัยของข้อมูลได้ดีกว่าการเรียกจาก Browser โดยตรง
3. **Maintainability:** ง่ายต่อการแก้ไขและขยายระบบในอนาคต
4. **Consistency:** ตามมาตรฐานการพัฒนา Web Application ระดับสากล
