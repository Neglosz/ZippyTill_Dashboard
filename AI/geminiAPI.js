import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const generateAIContent = async (
  prompt,
  modelName = "gemini-3-flash-preview",
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

    // Primary Fallback: gemini-3 -> gemini-1.5-flash
    if (
      modelName === "gemini-3-flash-preview" &&
      (isModelUnavailable || isModelOverloaded)
    ) {
      console.warn("Gemini 3 fails, falling back to Gemini 1.5 Flash...");
      return generateAIContent(prompt, "gemini-1.5-flash");
    }

    // Secondary Fallback: gemini-1.5-flash -> gemini-pro (1.0 Pro)
    if (modelName === "gemini-1.5-flash" && isModelUnavailable) {
      console.warn("Gemini 1.5 Flash not found, falling back to Gemini Pro...");
      return generateAIContent(prompt, "gemini-pro");
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

  try {
    [topProducts, salesData, notifications] = await Promise.all([
      saleService.getTopSellingProducts(branchId),
      saleService.getWeeklyAnalytics(branchId),
      productService.getDashboardNotifications(branchId),
    ]);
  } catch (error) {
    console.error("Error fetching context for AI:", error);
  }

  const contextData = {
    branchName: branchName || "Unknown Branch",
    topSellingItems: topProducts.slice(0, 5).map((p) => ({
      name: p.name,
      sold_qty: p.sold_qty,
      revenue: p.revenue,
    })),
    salesGrowth: salesData?.growth || 0,
    inventoryStats: {
      lowStock: notifications?.lowStock?.length || 0,
      expiringSoon: notifications?.expiringSoon?.length || 0,
      expired: notifications?.expired?.length || 0,
    },
    // Extract problematic items for AI to focus on
    stockIssues: [
      ...(notifications?.expiringSoon || []).map(
        (p) => `${p.name} (ใกล้หมดอายุ)`,
      ),
      ...(notifications?.lowStock || []).map((p) => `${p.name} (สต็อกต่ำ)`),
    ].slice(0, 5),
  };

  const prompt = `
    Based on the following REAL store data from Supabase for branch "${contextData.branchName}":
    ${JSON.stringify(contextData, null, 2)}
    
    Recommend 3 promotions that would help increase sales or solve stock issues.
    Rules:
    1. Focus on top selling items to boost revenue further.
    2. Focus on expiring or low stock items if they exist to clear or restock them.
    3. Use Thai for titles and descriptions.
    4. Provide the response in EXPLICIT JSON format (no markdown code blocks) with this structure:
    [
      {
        "id": number,
        "title": "Thai title",
        "desc": "Thai explanation of why this is recommended and what it is",
        "match": "XX%",
        "benefit": "benefit in Thai (e.g., +25% ยอดขาย)",
        "icon": "TrendingUp | Package | Users",
        "color": "tailwind text color class",
        "bg": "tailwind bg color class"
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
  modelName = "gemini-3-flash-preview",
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
      modelName === "gemini-3-flash-preview" &&
      (isModelUnavailable || isModelOverloaded)
    ) {
      return chatWithAI(message, history, "gemini-1.5-flash");
    }

    // Secondary Fallback for Chat
    if (modelName === "gemini-1.5-flash" && isModelUnavailable) {
      return chatWithAI(message, history, "gemini-pro");
    }

    throw error;
  }
};
