import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  ArrowRight,
  Minus,
  RotateCcw,
} from "lucide-react";
import { chatWithAI } from "../../../../AI/geminiAPI";
import { useBranch } from "../../../contexts/BranchContext";
import { saleService } from "../../../services/saleService";
import ReactMarkdown from "react-markdown";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "สวัสดีค่ะ! ฉันคือ AI Assistant ของคุณ มีอะไรให้ช่วยเกี่ยวกับการจัดโปรโมชั่น หรือวิเคราะห์ธุรกิจไหมคะ? ยินดีให้คำแนะนำค่ะ 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { activeBranchId, activeBranchName } = useBranch();
  const [storeContext, setStoreContext] = useState(null);

  // Fetch store context data when branch changes
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!activeBranchId) return;
      try {
        const [metrics, topSelling] = await Promise.all([
          saleService.getDashboardMetrics(activeBranchId),
          saleService.getTopSellingProducts(activeBranchId),
        ]);

        setStoreContext({
          branchName: activeBranchName,
          metrics,
          topProducts: topSelling.map((p) => ({
            name: p.name,
            sold: p.sold_qty,
            revenue: p.revenue,
          })),
        });
      } catch (error) {
        console.error("Error fetching context for AI:", error);
      }
    };

    fetchStoreData();
  }, [activeBranchId, activeBranchName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Gemini API requires history to start with a 'user' message.
      // We filter out the initial greeting if it's the first message.
      const firstUserIdx = messages.findIndex((msg) => msg.role === "user");
      const validHistory =
        firstUserIdx !== -1 ? messages.slice(firstUserIdx) : [];

      const chatHistory = validHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // Inject store context if available
      let finalPrompt = text;
      if (storeContext) {
        const contextString = `
[SYSTEM INSTRUCTION: คุณเป็นผู้ช่วย AI อัจฉริยะที่เชี่ยวชาญด้านการวิเคราะห์ธุรกิจ ตอบคำถามด้วยภาษาที่สุภาพ เป็นกันเอง และใช้ Markdown ในการจัดรูปแบบข้อความให้สวยงาม เช่น:
- ใช้หัวข้อ (Headers) เมื่อจำเป็น
- ใช้รายการแบบจุด (Bullet points) หรือตัวเลขเพื่อให้ข้อมูลอ่านง่าย
- ใช้ตัวหนา (Bold) เน้นประเด็นสำคัญ
- ใช้ Emoji เพิ่มความสดใสและสื่อความหมาย
- จัดระเบียบข้อมูลเป็นสัดส่วน]

[CONTEXT DATA]
ร้านค้า: ${storeContext.branchName}
สรุปยอดขาย: รายได้รวม ${storeContext.metrics.totalRevenue.toLocaleString()} บาท, จำนวนออเดอร์ ${storeContext.metrics.totalOrders}, สินค้าที่ขายได้ ${storeContext.metrics.totalSold} ชิ้น
สินค้าขายดี: ${storeContext.topProducts.map((p) => `${p.name} (ขายได้ ${p.sold})`).join(", ")}
--------------------------------------------------
คำถามจากผู้ใช้: ${text}
`;
        finalPrompt = contextString;
      }

      const response = await chatWithAI(finalPrompt, chatHistory);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      console.error("Chatbot Full Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `ขออภัยค่ะ มีข้อผิดพลาดเกิดขึ้น: ${error.message || "การเชื่อมต่อขัดข้อง"} กรุณาลองใหม่อีกครั้งนะคะ`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "สวัสดีค่ะ! ฉันคือ AI Assistant ของคุณ มีอะไรให้ช่วยเกี่ยวกับการจัดโปรโมชั่น หรือวิเคราะห์ธุรกิจไหมคะ? ยินดีให้คำแนะนำค่ะ 😊",
      },
    ]);
    setInput("");
  };

  const quickActions = [
    "แนะนำโปรโมชั่นยอดฮิต",
    "ช่วยคิดโปรโมชั่นลดล้างสต็อก",
    "วิเคราะห์ยอดขายสัปดาห์นี้",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[550px] md:w-[750px] lg:w-[900px] max-h-[700px] h-[75vh] bg-white/95 backdrop-blur-xl rounded-[48px] shadow-2xl border border-orange-100/50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-orange-500 to-orange-600 p-8 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-white/20 rounded-[22px] flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-110 transition-transform">
                <Sparkles size={28} className="text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-black text-2xl tracking-tighter leading-none mb-1.5">
                  AI Assistant
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></span>
                    <span className="relative block w-3 h-3 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50"></span>
                  </div>
                  <span className="text-white/90 text-[12px] font-black uppercase tracking-widest">
                    System Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="เริ่มแชทใหม่"
                className="p-3 hover:bg-white/20 rounded-2xl transition-all text-white hover:scale-110 active:scale-90 flex items-center gap-2"
              >
                <RotateCcw size={24} strokeWidth={3} />
                <span className="hidden md:inline text-sm font-bold">
                  เริ่มแชทใหม่
                </span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-white/20 rounded-2xl transition-all text-white hover:scale-110 active:scale-90"
              >
                <Minus size={28} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none shadow-orange-200"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100 markdown-content"
                    }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white/50 backdrop-blur-sm border-t border-gray-100/50">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action)}
                className="whitespace-nowrap px-4 py-2 bg-orange-50 hover:bg-orange-100 text-primary text-[11px] font-bold rounded-full transition-all border border-orange-100/50 shadow-sm active:scale-95 shrink-0"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl flex items-center p-1.5 shadow-inner border border-gray-100 focus-within:border-primary/50 transition-colors group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="พิมพ์คำถามหรือคำสั่ง..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <ArrowRight size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden group relative bg-gradient-to-br from-primary via-orange-500 to-orange-600"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <MessageSquare
              className="text-white animate-pulse"
              size={28}
              strokeWidth={2.5}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            </div>
          </div>
        </button>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .markdown-content p { margin-bottom: 0.75rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul, .markdown-content ol { margin-left: 1.25rem; margin-bottom: 0.75rem; }
        .markdown-content li { margin-bottom: 0.25rem; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; }
        .markdown-content strong { color: #f97316; font-weight: 800; }
      `,
        }}
      />
    </div>
  );
};

export default AIChatBot;
