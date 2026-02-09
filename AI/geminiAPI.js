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

export const getPromotionRecommendations = async (contextData) => {
  const prompt = `
    Based on the following store data:
    ${JSON.stringify(contextData)}
    
    Recommend 3 promotions that would help increase sales.
    Provide the response in EXPLICIT JSON format (no markdown code blocks) with the following structure:
    [
      {
        "id": 1,
        "title": "string",
        "desc": "string",
        "match": "percentage string",
        "benefit": "benefit string",
        "icon": "string (TrendingUp, Package, or Users)",
        "color": "tailwind text classes",
        "bg": "tailwind bg classes"
      }
    ]
    Use Thai for titles and descriptions.
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
