const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel() {
  try {
    console.log("Checking API Key: " + (apiKey ? "Present" : "Missing"));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success! gemini-1.5-flash is working.");
  } catch (error) {
    console.error("Error Detail: " + error.message);
  }
}

testModel();
