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
import { useBranch } from "../../../contexts/BranchContext";
import { saleService } from "../../../services/saleService";
import { aiService } from "../../../services/aiService";
import ReactMarkdown from "react-markdown";
import CreatePromotionModal from "./CreatePromotionModal";
import { Tag as TagIcon, Sparkles as SparklesIcon } from "lucide-react";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { activeBranchId, activeBranchName } = useBranch();
  const [storeContext, setStoreContext] = useState(null);
  const historyLoadedFor = useRef(null);
  const [templates, setTemplates] = useState({});

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await aiService.getChatTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to fetch AI templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  // Promotion Creation State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [aiPromoData, setAiPromoData] = useState(null);

  // Custom Modal States
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  // Load chat history from localStorage when branch changes
  useEffect(() => {
    if (!activeBranchId) return;

    const savedHistory = localStorage.getItem(
      `zippytill_chat_history_${activeBranchId}`,
    );
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed);
        historyLoadedFor.current = activeBranchId;
      } catch (e) {
        console.error("Error parsing saved chat history:", e);
      }
    } else {
      // Reset to default greeting if no history found for this branch
      const defaultMsg = [
        {
          role: "assistant",
          content:
            "สวัสดีค่ะ! หนูน้องเช็คกี้เองค่ะ 😊 พร้อมช่วยเรื่องร้านค้าทุกอย่างเลย จะถามเรื่องโปรโมชั่น สต็อก หรือยอดขาย บอกได้เลยนะคะ ✌️",
        },
      ];
      setMessages(defaultMsg);
      historyLoadedFor.current = activeBranchId;
    }

    if (isOpen) {
      fetchStoreData();
    }
  }, [activeBranchId, isOpen]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    // Only save if history has been loaded for the CURRENT active branch
    if (
      activeBranchId &&
      historyLoadedFor.current === activeBranchId &&
      messages.length > 0
    ) {
      localStorage.setItem(
        `zippytill_chat_history_${activeBranchId}`,
        JSON.stringify(messages),
      );
    }
  }, [messages, activeBranchId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Persona = systemInstruction (geminiAPI), Context + Message = inject ที่นี่เสมอ
  const handleSend = async (text = input, displayText = null) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: displayText ?? text };
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

      // Persona = systemInstruction (ใน geminiAPI), Context + Message = inject ที่นี่
      let finalPrompt = text;
      if (storeContext) {
        finalPrompt = `${buildContextData()}

${text}`;
      }

      const response = await aiService.chatWithAI(finalPrompt, chatHistory);
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
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    const defaultGreeting = [
      {
        role: "assistant",
        content:
          "สวัสดีค่ะ! หนูน้องเช็คกี้เองค่ะ 😊 พร้อมช่วยเรื่องร้านค้าทุกอย่างเลย จะถามเรื่องโปรโมชั่น สต็อก หรือยอดขาย บอกได้เลยนะคะ ✌️",
      },
    ];

    setMessages(defaultGreeting);
    if (activeBranchId) {
      localStorage.removeItem(`zippytill_chat_history_${activeBranchId}`);
    }
    setInput("");
    setShowResetConfirm(false);
  };

  // สร้าง context string จาก storeContext สำหรับปุ่ม quick action
  const buildContextData = () => {
    if (!storeContext) return "";
    return `ร้านค้า: ${storeContext.branchName}
รายได้รวม: ${storeContext.metrics.totalRevenue?.toLocaleString()} บาท
จำนวนออเดอร์: ${storeContext.metrics.totalOrders}
สินค้าขายดี: ${storeContext.topProducts.map((p) => `${p.name} (ขายได้ ${p.sold})`).join(", ")}`;
  };

  const quickActions = [
    {
      label: "🛍️ ไอเดียจับคู่สินค้า",
      prompt: templates?.bundling,
    },
    {
      label: "🔥 โปรลดล้างสต็อก",
      prompt: templates?.clearStock,
    },
    {
      label: "📊 วิเคราะห์ยอดขายสัปดาห์นี้",
      prompt: templates?.weeklySales,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[550px] md:w-[750px] lg:w-[900px] max-h-[700px] h-[75vh] bg-white/95 backdrop-blur-xl rounded-[48px] shadow-2xl border border-orange-100/50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-12 duration-500">
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
                    <div className="flex flex-col">
                      {msg.content
                        .split(/(\[PROMO_JSON\][\s\S]*?\[\/PROMO_JSON\])/)
                        .map((part, pIdx) => {
                          if (part.startsWith("[PROMO_JSON]")) {
                            const jsonContent = part
                              .replace("[PROMO_JSON]", "")
                              .replace("[/PROMO_JSON]", "")
                              .trim();
                            try {
                              const data = JSON.parse(jsonContent);
                              return (
                                <div
                                  key={pIdx}
                                  className="pt-2 pb-5 mb-5 border-b border-orange-100/30 last:border-0 last:mb-0 last:pb-0"
                                >
                                  <button
                                    onClick={() => {
                                      setAiPromoData(data);
                                      setIsPromoModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 py-2 px-4 bg-orange-50 hover:bg-orange-100 text-primary rounded-xl text-[11px] font-bold border border-orange-100/50 transition-all shadow-sm hover:shadow-md active:scale-95 group"
                                  >
                                    <TagIcon
                                      size={14}
                                      className="group-hover:rotate-12 transition-transform text-primary"
                                    />
                                    <span>สร้างโปรโมชั่น "{data.title}"</span>
                                  </button>
                                </div>
                              );
                            } catch (e) {
                              console.error(
                                "Error parsing AI promotion JSON:",
                                e,
                              );
                              return null;
                            }
                          } else if (part.trim()) {
                            return (
                              <div key={pIdx} className="markdown-content">
                                <ReactMarkdown>{part}</ReactMarkdown>
                              </div>
                            );
                          }
                          return null;
                        })}
                    </div>
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
                onClick={() => handleSend(action.prompt, action.label)}
                className="whitespace-nowrap px-4 py-2 bg-orange-50 hover:bg-orange-100 text-primary text-[11px] font-bold rounded-full transition-all border border-orange-100/50 shadow-sm active:scale-95 shrink-0"
              >
                {action.label}
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

          {/* Custom Reset Confirmation Modal */}
          {showResetConfirm && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
                onClick={() => setShowResetConfirm(false)}
              />
              <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden border border-orange-100 p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-orange-50 rounded-[30px] flex items-center justify-center mx-auto mb-6 border border-orange-100 shadow-inner group">
                  <RotateCcw
                    size={36}
                    className="text-primary animate-spin-slow group-hover:rotate-180 transition-transform duration-700"
                  />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                  เริ่มแชทใหม่?
                </h4>
                <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                  ประวัติการแชทปัจจุบันจะหายไป
                  <br />
                  คุณต้องการเริ่มแชทใหม่ใช่หรือไม่?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3.5 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={confirmReset}
                    className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-primary/25 active:scale-95"
                  >
                    เริ่มใหม่เลย
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Promotion Modal Integration */}
      {isPromoModalOpen && (
        <CreatePromotionModal
          isOpen={isPromoModalOpen}
          onClose={() => setIsPromoModalOpen(false)}
          initialData={aiPromoData}
          onPromotionCreated={() => {
            setIsPromoModalOpen(false);
            // Optional: Send a success message back as the bot
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "เย้! สร้างโปรโมชั่นเรียบร้อยแล้วค่ะ 🎉 ลูกค้าต้องชอบแน่ๆ เลย 😊",
              },
            ]);
          }}
        />
      )}

      {/* Floating Button — ซ่อนเมื่อ chat เปิดอยู่ */}
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
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
