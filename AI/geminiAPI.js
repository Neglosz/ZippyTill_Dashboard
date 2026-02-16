import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const generateAIContent = async (
  prompt,
  modelName = "gemini-3-pro-preview",
) => {
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

import { saleService } from "../src/services/saleService";
import { productService } from "../src/services/productService";

export const getPromotionRecommendations = async (branchId, branchName) => {
  if (!branchId) throw new Error("Branch ID is required for AI analysis");

  // Fetch real data for context
  let salesData = null;
  let topProducts = [];
  let notifications = null;
  let topStockProducts = [];

  try {
    [topProducts, salesData, notifications, topStockProducts] =
      await Promise.all([
        saleService.getTopSellingProducts(branchId),
        saleService.getWeeklyAnalytics(branchId),
        productService.getDashboardNotifications(branchId),
        productService.getTopStockProducts(branchId),
      ]);
  } catch (error) {
    console.error("Error fetching context for AI:", error);
  }

  // Send only top 10 products to reduce AI processing time
  const productData = topProducts.slice(0, 10).map((p) => ({
    id: p.id,
    name: p.name,
    sold_qty: p.sold_qty,
    revenue: p.revenue,
  }));

  const contextData = {
    branchName: branchName || "Unknown Branch",
    topSellingItems: productData,
    salesGrowth: salesData?.growth || 0,
    inventoryStats: {
      lowStock: notifications?.lowStock?.length || 0,
      expiringSoon: notifications?.expiringSoon?.length || 0,
      expired: notifications?.expired?.length || 0,
    },
    // Extract problematic items for AI to focus on
    stockIssues: [
      ...(notifications?.expiringSoon || []).map((p) => ({
        name: p.name,
        reason: `ใกล้หมดอายุ - หมดอายุวันที่ ${p.expiryDate}`,
        id: p.id,
      })),
      ...(notifications?.lowStock || []).map((p) => ({
        name: p.name,
        reason: `สต็อกต่ำ - เหลือ ${p.qty}`,
        id: p.id,
      })),
    ].slice(0, 5),
    highStockItems: topStockProducts.slice(0, 5).map((p) => ({
      name: p.name,
      reason: `สต็อกเยอะ - ${p.stock_qty} ${p.unit_type || "ชิ้น"}`,
      id: p.id,
    })),
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
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Failed to parse AI recommendations:", error);
    throw error;
  }
};

export const chatWithAI = async (
  message,
  history = [],
  modelName = "gemini-3-pro-preview",
) => {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Chat Error (${modelName}):`, error);

    const isModelUnavailable =
      error.message?.includes("404") || error.message?.includes("not found");
    const isModelOverloaded =
      error.message?.includes("503") || error.message?.includes("overloaded");

    // Primary Fallback for Chat
    if (
      modelName === "gemini-3-pro-preview" &&
      (isModelUnavailable || isModelOverloaded)
    ) {
      return chatWithAI(message, history, "gemini-3-flash-preview");
    }

    // Secondary Fallback for Chat
    if (modelName === "gemini-3-flash-preview" && isModelUnavailable) {
      return chatWithAI(message, history, "gemini-1.5-flash");
    }

    throw error;
  }
};
