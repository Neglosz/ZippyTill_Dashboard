const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./config/supabase");

async function cleanupNotifications() {
  console.log("--- เริ่มกระบวนการล้างการแจ้งเตือนที่ซ้ำซ้อน ---");

  // 1. ดึงการแจ้งเตือนที่ยังไม่ได้อ่านทั้งหมด
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, store_id, type, payload, created_at")
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error.message);
    return;
  }

  console.log(`พบการแจ้งเตือนที่ยังไม่ได้อ่านทั้งหมด ${notifications.length} รายการ`);

  const seenKeys = new Set();
  const idsToDelete = [];

  for (const n of notifications) {
    // ดึง Product ID หรือ Batch ID ออกมาเช็ค
    const productId = n.payload?.productId || n.payload?.product_id;
    const batchId = n.payload?.batchId || n.payload?.batch_id;
    const targetId = batchId || productId;

    if (!targetId) continue;

    // Normalize ประเภทให้เป็นมาตรฐานเดียวกันเพื่อเช็คซ้ำ
    let normalizedType = n.type;
    if (normalizedType === 'stock_low') normalizedType = 'low_stock';
    if (normalizedType === 'stock_expired' || normalizedType === 'stock_near_expiry' || normalizedType === 'stock_out') normalizedType = 'expiry';

    // สร้าง Key สำหรับตรวจสอบความซ้ำ (ร้านค้า + ประเภท + สินค้า)
    const dedupeKey = `${n.store_id}:${normalizedType}:${targetId}`;

    if (seenKeys.has(dedupeKey)) {
      // ถ้าเคยเจอ Key นี้แล้ว (ซึ่งอันที่เจอตัวแรกจะใหม่กว่าเพราะเราเรียงแบบ desc) ตัวนี้คือตัวซ้ำ ให้ลบออก
      idsToDelete.push(n.id);
    } else {
      seenKeys.add(dedupeKey);
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`ตรวจพบรายการซ้ำทั้งหมด ${idsToDelete.length} รายการ กำลังดำเนินการลบ...`);

    // แบ่งลบทีละ 50 รายการเพื่อความปลอดภัย
    for (let i = 0; i < idsToDelete.length; i += 50) {
      const chunk = idsToDelete.slice(i, i + 50);
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .in("id", chunk);

      if (deleteError) {
        console.error(`ข้อผิดพลาดขณะลบชุดที่ ${i / 50 + 1}:`, deleteError.message);
      }
    }
    console.log("--- ล้างข้อมูลซ้ำซ้อนสำเร็จแล้ว ---");
  } else {
    console.log("ไม่พบรายการซ้ำซ้อนที่ต้องลบครับ");
  }
}

cleanupNotifications();
