const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const saleService = require("./saleService");
const productService = require("./productService");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// ============================================================
// CHATBOT SYSTEM PROMPT & TEMPLATES
// ============================================================
const CHATBOT_SYSTEM_PROMPT = `
คุณคือ AI ผู้ช่วยเจ้าของร้านค้า ชื่อ "น้องเช็คกี้"
นิสัย: ร่าเริง สุภาพ เป็นกันเอง (ใช้ ครับ/ค่ะ) เหมือนเพื่อนคู่คิดเจ้าของร้าน

กฏการตอบ:
1. สั้น กระชับ: ตอบไม่เกิน 2-3 ประโยค (ยกเว้นถูกถามรายละเอียด)
2. Context Aware:
   - ถ้า user บ่นเหนื่อย → ให้กำลังใจก่อน
   - ถ้า user ถามเรื่องทั่วไป → ชวนคุยสั้นๆ แล้ววกเข้าเรื่องร้านนิดหน่อย
3. ห้ามวิชาการ: ใช้ภาษาพูดที่เข้าใจง่าย ไม่ใช้ศัพท์เทคนิค
4. Emoji: ใส่อิโมจิประกอบอารมณ์เสมอ 😊✌️
`;

const CHAT_PROMPT_TEMPLATES = {
  bundling: `รับบทเป็นผู้จัดการร้านมืออาชีพ ช่วยคิด '3 ไอเดียจับคู่สินค้า (Bundling)' จากข้อมูลสินค้าขายดีไว้ด้านบน

คำสั่ง:
1. วิเคราะห์สินค้าที่ยอดขายพุ่งสูง หรือกำไรดี จากรายการ 'สินค้าขายดี' ที่ส่งให้เท่านั้น
2. (สำคัญมาก) ห้ามแนะนำสินค้าที่ไม่มีชื่ออยู่ในรายการ 'สินค้าขายดี' ด้านบนเด็ดขาด หากในรายการมีสินค้าไม่พอ ให้แนะนำเท่าที่มี
3. ระบุ 'เหตุผลความปัง': อธิบายว่าทำไมถึงจับคู่แบบนี้
4. คิดชื่อโปรโมชั่นให้น่ารัก จำง่าย

รูปแบบคำตอบ: ขอ 3 ข้อ แยกเป็นหัวข้อ: ชื่อโปร, 💡 เหตุผลที่แนะนำ, 📦 จัดเซต
และ (สำคัญมาก) ทันทีที่จบคำอธิบายของแต่ละข้อ ให้สรุปข้อมูลโปรโมชั่นของข้อนั้นในรูปแบบ JSON ไว้ใน Tag [PROMO_JSON]{...}[/PROMO_JSON] เสมอ (สรุปคือจะมี Tag นี้ 3 ครั้งในหนึ่งคำตอบ)
ตัวอย่าง JSON: {"title": "ชื่อโปร", "desc": "เหตุผล", "target_products": [{"name": "สินค้า A", "id": "uuid"}, {"name": "สินค้า B", "id": "uuid"}], "promotion_type": "discount_percent", "discount_value": 15, "duration_days": 14}`,

  clearStock: `รับบทเป็นผู้เชี่ยวชาญด้านบริหารสต็อก ช่วยคิดกลยุทธ์ระบายสินค้า (Dead Stock) จากข้อมูลด้านบน

คำสั่ง:
1. เสนอวิธีระบายสินค้าเหล่านี้ให้เร็วที่สุด (เช่น 1 แถม 1, ลดราคา, หรือจับคู่)
2. (สำคัญ) ระบุ 'ระดับความเร่งด่วน': บอกเหตุผลชัดเจนว่าทำไมต้องรีบระบาย (เช่น หมดอายุเดือนหน้า, เงินจมมา 3 เดือนแล้ว)

รูปแบบคำตอบ: แยกรายสินค้า: ชื่อกลยุทธ์, ⚠️ สถานะความเร่งด่วน, 🛠 วิธีจัดโปร`,

  weeklySales: `รับบทเป็นที่ปรึกษาธุรกิจส่วนตัว สรุปยอดขายสัปดาห์นี้เทียบกับสัปดาห์ก่อน จากข้อมูลด้านบน

คำสั่ง:
1. สรุปยอดขายรวมว่า 'ขึ้น' หรือ 'ลง' กี่ %
2. (สำคัญ) วิเคราะห์ 'สาเหตุ': เชื่อมโยงตัวเลขกับบริบท (เช่น ยอดตกเพราะฝนตก, ยอดขึ้นเพราะหวยออก)
3. ระบุช่วงเวลาที่ขายดีที่สุด (Peak Hour)
4. แนะนำกลยุทธ์สำหรับสัปดาห์หน้า 1 ข้อ

รูปแบบคำตอบ: พาดหัวสรุป, 🔍 เจาะลึกสาเหตุ, ⏰ ช่วงเวลาทอง, 💡 คำแนะนำสัปดาห์หน้า`,
};

// ============================================================
// CORE AI FUNCTIONS WITH FALLBACK
// ============================================================

const generateAIContent = async (prompt, modelName = "gemini-3-pro-preview") => {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Gemini Error (${modelName}):`, error);

    const isModelUnavailable =
      error.message?.includes("404") || error.message?.includes("not found");
    const isModelOverloaded =
      error.message?.includes("503") || error.message?.includes("overloaded");

    // Primary Fallback: gemini-3-pro -> gemini-3-flash
    if (
      modelName === "gemini-3-pro-preview" &&
      (isModelUnavailable || isModelOverloaded)
    ) {
      console.warn("Gemini 3 Pro fails, falling back to Gemini 3 Flash...");
      return generateAIContent(prompt, "gemini-3-flash-preview");
    }

    // Secondary Fallback: gemini-3-flash -> gemini-1.5-flash
    if (modelName === "gemini-3-flash-preview" && isModelUnavailable) {
      console.warn(
        "Gemini 3 Flash not found, falling back to Gemini 1.5 Flash...",
      );
      return generateAIContent(prompt, "gemini-1.5-flash");
    }

    if (error.message?.includes("404")) {
      return `ขออภัยค่ะ ไม่พบโมเดล AI (${modelName}) ในระบบของคุณ กรุณาตรวจสอบสิทธิ์ที่ Google AI Studio หรือลองใช้ Gemini Pro ค่ะ`;
    }
    if (isModelOverloaded) {
      return "ขออภัยค่ะ ขณะนี้โมเดล AI มีผู้ใช้งานจำนวนมากเกินไป (503) กรุณาลองใหม่อีกครั้งในภายหลังค่ะ";
    }
    throw error;
  }
};

const aiService = {
  // ดึง Templates ไปใช้ใน UI
  getChatTemplates() {
    return CHAT_PROMPT_TEMPLATES;
  },

  async getPromotionRecommendations(branchId, branchName) {
    if (!branchId) throw new Error("Branch ID is required");

    let [topProducts, salesData, notifications, topStockProducts] = await Promise.all([
      saleService.getTopSellingProducts(branchId),
      saleService.getWeeklyAnalytics(branchId),
      productService.getDashboardNotifications(branchId),
      productService.getTopStockProducts(branchId),
    ]);

    const contextData = {
      branchName: branchName || "Unknown Branch",
      topSellingItems: topProducts.slice(0, 10).map(p => ({
        id: p.id, name: p.name, category: p.product_categories?.name || "ไม่ระบุประเภท",
        sold_qty: p.sold_qty, revenue: p.revenue
      })),
      salesGrowth: salesData?.growth || 0,
      inventoryStats: {
        lowStock: notifications?.lowStock?.length || 0,
        expiringSoon: notifications?.expiringSoon?.length || 0,
        expired: notifications?.expired?.length || 0,
      },
      stockIssues: [
        ...(notifications?.expiringSoon || []).map(p => ({ name: p.name, reason: `ใกล้หมดอายุ - หมดอายุวันที่ ${p.expiryDate}`, id: p.id })),
        ...(notifications?.lowStock || []).map(p => ({ name: p.name, reason: `สต็อกต่ำ - เหลือ ${p.qty}`, id: p.id })),
      ].slice(0, 5),
      highStockItems: topStockProducts.slice(0, 5).map(p => ({ name: p.name, reason: `สต็อกเยอะ - ${p.stock_qty} ${p.unit_type || "ชิ้น"}`, id: p.id })),
    };

    const prompt = `
    Analyze store "${contextData.branchName}" and create 3 best promotions (JSON only):
    ${JSON.stringify(contextData, null, 2)}
    
    Rules: Maximize profit, clear inventory, attract customers.
    
    ANALYSIS & CALCULATION RULES:
    
    1. **PRODUCT SELECTION** (target_products):
       - For expiring items: Select products expiring within 7-30 days from stockIssues
       - For high stock: Select products with stock > 50 units from highStockItems
       - For best sellers: Select top 3-5 products from topSellingItems
       - ALWAYS use exact product names and IDs from the input data
    
    2. **PROMOTION TYPE** (promotion_type):
       - Expiring soon (< 7 days): "discount_percent" with 30-50% off
       - High stock (> 100 units): "buy_x_get_y" (e.g., buy 2 get 1)
       - Moderate stock: "discount_percent" with 15-25% off
       - Best sellers: "discount_amount" with fixed baht discount
    
    3. **DISCOUNT VALUE** (discount_value):
       - Calculate based on profit margin (don't go below 50% of profit)
       - For percent: 15-50% depending on urgency
       - For amount: 10-100 baht based on product price
       - For buy_x_get_y: min_qty_required=2-3, free_qty=1
    
    4. **MINIMUM SPEND** (min_spend):
       - Calculate as: average_product_price × 2
       - For bundle deals: sum of product prices × 1.5
       - For clearance: 0 (no minimum to move fast)
    
    5. **DURATION** (duration_days):
       - Expiring items: 3-7 days (urgent)
       - High stock: 14-30 days (moderate)
       - Regular promotions: 7-14 days
       - Best sellers: 30 days (long-term)
    
    6. **EMPTY DATA RULE** (CRITICAL):
       - If topSellingItems, stockIssues, and highStockItems are ALL empty or provide no specific products, DO NOT invent any products.
       - In this case, return exactly an empty array: []
       - Do not suggest generic promotions for "Green Tea", "Noodles", or any common items if they are not in the provided data.
    
    7. **NO DUPLICATE PRODUCTS** (CRITICAL):
       - Each product (by id) may only appear in ONE promotion across the entire response.
       - Do NOT use the same product in Promotion 1 and Promotion 2, even if it fits both.
       - If a product was already assigned to a promotion, exclude it from all subsequent promotions.
       - This prevents overlapping/redundant promotions and confusion at checkout.
    
    8. **SAME CATEGORY ONLY** (CRITICAL):
       - Each promotion must only contain products from the SAME category.
       - Do NOT mix food items with household items, beverages with cleaning products, etc.
       - Group products by their "category" field — only products sharing the same category can be in one promotion.
       - If categories are mixed, it confuses customers and feels unnatural.
       - Example: "น้ำดื่ม" and "น้ำอัดลม" can be together (both beverages). "แป้ง" and "ยาสีฟัน" cannot.
    
    OUTPUT REQUIREMENTS:
    - Use Thai language for title and description
    - Explain WHY each promotion is recommended
    - Show expected impact (e.g., "+25% sales")
    - Return VALID JSON (no markdown code blocks)
    
    JSON Structure:
    [
      {
        "id": number,
        "title": "Thai promotion title",
        "desc": "Thai explanation of why this promotion works and its business logic",
        "match": "XX%",
        "benefit": "Expected result in Thai (e.g., +25% ยอดขาย, -50% สต็อก)",
        "icon": "TrendingUp | Package | Users",
        "color": "text-purple-500",
        "bg": "bg-purple-50",
        "target_products": [{"name": "Exact Product Name", "id": "product_id"}],
        "promotion_type": "discount_percent | discount_amount | buy_x_get_y",
        "discount_value": calculated_number,
        "min_spend": calculated_number,
        "duration_days": calculated_number,
        "min_qty_required": number (only for buy_x_get_y),
        "free_qty": number (only for buy_x_get_y)
      }
    ]
    `;

    try {
      const responseText = await generateAIContent(prompt);
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      const recs = JSON.parse(cleanJson);

      // Safety net: remove duplicate products across recommendations
      const usedProductIds = new Set();
      for (const rec of recs) {
        if (Array.isArray(rec.target_products)) {
          rec.target_products = rec.target_products.filter((p) => {
            if (!p.id || usedProductIds.has(p.id)) return false;
            usedProductIds.add(p.id);
            return true;
          });
        }
      }
      return recs;
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      throw error;
    }
  },

  async chatWithAI(message, history = [], modelName = "gemini-3-pro-preview") {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: CHATBOT_SYSTEM_PROMPT,
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Chat Error (${modelName}):`, error);
      
      const isModelUnavailable = error.message?.includes("404") || error.message?.includes("not found");
      const isModelOverloaded = error.message?.includes("503") || error.message?.includes("overloaded");

      // Primary Fallback for Chat
      if (
        modelName === "gemini-3-pro-preview" &&
        (isModelUnavailable || isModelOverloaded)
      ) {
        return this.chatWithAI(message, history, "gemini-3-flash-preview");
      }

      // Secondary Fallback for Chat
      if (modelName === "gemini-3-flash-preview" && isModelUnavailable) {
        return this.chatWithAI(message, history, "gemini-1.5-flash");
      }
      throw error;
    }
  }
};

module.exports = aiService;
