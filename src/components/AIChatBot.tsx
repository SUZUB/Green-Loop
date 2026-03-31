import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, MessageSquare, Send, X, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEco } from "@/context/EcoContext";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

type ChatRole = "buyer" | "picker" | "recycler" | "global";

type Msg = { role: "user" | "assistant"; content: string };

type BuyerOrder = {
  orderId: string;
  supplier: string;
  material: string;
  quantity: string;
  totalCredits: number;
  status: string;
};

const STORAGE_KEY = "ai_chat_history";
const ORDER_STORAGE_KEY = "buyer_order_tracker_orders";

const buyerQuickPrompts = [
  "Where is my order?",
  "Check my balance",
  "Download last invoice",
  "Help with sourcing requests",
];

const pickerQuickPrompts = [
  "Where should I go?",
  "Show safety tips",
  "Explain live heatmap",
  "Start hands-free mode",
];

const recyclerQuickPrompts = [
  "Find a challenge",
  "Explain carbon market trends",
  "Show community rewards",
  "How does the carbon market work?",
];

const globalQuickPrompts = [
  "What can Gemini do?",
  "Show my carbon credit summary",
  "Highlight the next priority zone",
];

const defaultBuyerOrders: BuyerOrder[] = [
  {
    orderId: "ORD-001",
    supplier: "ABC Recyclers",
    material: "PET",
    quantity: "500 kg",
    totalCredits: 70,
    status: "In Transit",
  },
  {
    orderId: "ORD-002",
    supplier: "XYZ Plastics",
    material: "HDPE",
    quantity: "1,000 kg",
    totalCredits: 150,
    status: "Delivered",
  },
  {
    orderId: "ORD-003",
    supplier: "Green Plastics Co",
    material: "PP",
    quantity: "2,000 kg",
    totalCredits: 240,
    status: "Completed",
  },
];

const roleLabels: Record<ChatRole, string> = {
  buyer: "Buyer Mode",
  picker: "Picker Mode",
  recycler: "Recycler Mode",
  global: "Gemini Assistant",
};

const roleHints: Record<ChatRole, string> = {
  buyer: "Need help with sourcing requests, credit purchases, and invoice tracking.",
  picker: "Route optimization, safety tips, and live heatmap guidance are available.",
  recycler: "Community challenges and carbon market trends are ready to explain.",
  global: "Ask me anything across Buyer, Picker, and Recycler workflows.",
};

const isBuyerPath = (pathname: string) => pathname.startsWith("/buyer");
const isPickerPath = (pathname: string) => pathname.startsWith("/picker");
const isRecyclerPath = (pathname: string) =>
  pathname.startsWith("/recycler") || pathname.startsWith("/community") || pathname.startsWith("/partners") || pathname.startsWith("/education");

const pickRole = (pathname: string): ChatRole => {
  if (isBuyerPath(pathname)) return "buyer";
  if (isPickerPath(pathname)) return "picker";
  if (isRecyclerPath(pathname)) return "recycler";
  return "global";
};

const loadBuyerOrders = (): BuyerOrder[] => {
  if (typeof window === "undefined") return defaultBuyerOrders;
  const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
  if (!stored) return defaultBuyerOrders;

  try {
    const parsed = JSON.parse(stored) as BuyerOrder[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultBuyerOrders;
  } catch {
    return defaultBuyerOrders;
  }
};

const createBuyerOrderAnswer = (query: string): string | null => {
  const orders = loadBuyerOrders();
  const inTransit = orders.find((order) => order.status.toLowerCase() === "in transit");
  const defaultOrder = inTransit || orders[0];

  if (!defaultOrder) {
    return null;
  }

  if (/where is my order|track my order|track order|order status/i.test(query)) {
    if (inTransit) {
      return `Order ${inTransit.orderId} is currently in transit near North Creek. It should reach the hub shortly.`;
    }
    return `Your latest order ${defaultOrder.orderId} is currently ${defaultOrder.status.toLowerCase()}. Visit the Track Orders page for full details.`;
  }

  if (/download .*invoice|last invoice|invoice/i.test(query)) {
    return `I can help you with invoice guidance. Open your Orders page and tap the invoice button for ${defaultOrder.orderId} to download it.`;
  }

  return null;
};

const getBuyerSuggestions = (balance: number, availableMarketCredits: number) =>
  `Your balance is ${balance} credits and you have ${availableMarketCredits} available market credits.`;

const extractIntent = (text: string) => text.toLowerCase();

export function AIChatBot() {
  const location = useLocation();
  const { state, dispatch } = useEco();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const typingTimer = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const role = useMemo(() => pickRole(location.pathname), [location.pathname]);
  const suggestedPrompts = useMemo(() => {
    if (role === "buyer") return buyerQuickPrompts;
    if (role === "picker") return pickerQuickPrompts;
    if (role === "recycler") return recyclerQuickPrompts;
    return globalQuickPrompts;
  }, [role]);

  const initialAssistant = useMemo(
    () => [
      { role: "assistant" as const, content: `Hello! I'm Gemini — your context-aware AI assistant for ${roleLabels[role]}. ${roleHints[role]}` },
    ],
    [role]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {
        // ignore
      }
    }
    setMessages(initialAssistant as Msg[]);
  }, [initialAssistant]);

  useEffect(() => {
    if (messages.length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        window.clearInterval(typingTimer.current);
      }
    };
  }, []);

  const appendMessage = useCallback((message: Msg) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const typeAssistantReply = useCallback(
    (text: string) => {
      return new Promise<void>((resolve) => {
        if (typingTimer.current) {
          window.clearInterval(typingTimer.current);
        }
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        let index = 0;
        typingTimer.current = window.setInterval(() => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last.role !== "assistant") return prev;
            const nextContent = last.content + text[index];
            const next: Msg[] = [...prev.slice(0, -1), { role: "assistant", content: nextContent }];
            return next;
          });
          index += 1;
          if (index >= text.length) {
            if (typingTimer.current) {
              window.clearInterval(typingTimer.current);
            }
            resolve();
          }
        }, 18);
      });
    },
    []
  );

  const dispatchHighlight = (reportId: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("ai-chat-highlight-spot", { detail: reportId }));
  };

  const handleLocalIntent = async (query: string): Promise<string | null> => {
    const intent = extractIntent(query);

    const orderAnswer = createBuyerOrderAnswer(query);
    if (orderAnswer) {
      return orderAnswer;
    }

    // Example: If you have heatmapReports in EcoContext, use state.heatmapReports
    // if (role === "picker" && /where should i go|best route|route optimization|where.*go/i.test(intent)) {
    //   if (!state.heatmapReports || state.heatmapReports.length === 0) {
    //     return "I don't have a heatmap report in view right now, but once data arrives I can recommend the top pickup zone.";
    //   }
    //   const topSpot = [...state.heatmapReports].sort((a, b) => b.intensity - a.intensity)[0];
    //   if (topSpot) {
    //     dispatchHighlight(topSpot.id);
    //     return `The best route is toward the highest-intensity hotspot: **${topSpot.label}**. I've highlighted that zone on your map.`;
    //   }
    // }

    if (role === "recycler" && /challenge|community challenge|find a challenge/i.test(intent)) {
      return `Right now there are ${state.activeChallenges.length} active challenges in your community. The top one is ${state.activeChallenges[0]?.title ?? "a live cleanup mission"} with ${state.activeChallenges[0]?.participants ?? "many"} participants.`;
    }

    if (role === "recycler" && /carbon market|carbon credits|market trends|trends/i.test(intent)) {
      return `Current carbon credit activity: you have ${state.userBalance} credits. The market is moving toward community rewards and demand-driven credit streams.`;
    }

    if (/balance|credit purchases|market credits/i.test(intent)) {
      return `Your current wallet balance is ${state.userBalance} credits.`;
    }

    return null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const localResponse = await handleLocalIntent(text.trim());
      if (localResponse) {
        await typeAssistantReply(localResponse);
        return;
      }

      const allMessages = [...messages, userMsg];
      const { data, error } = await supabase.functions.invoke("recycling-chat", {
        body: {
          messages: allMessages.map((message) => ({ role: message.role, content: message.content })),
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to connect to chatbot");
      }

      const reply = (data as { reply?: string })?.reply;
      if (!reply) {
        throw new Error("No reply received from chatbot");
      }

      await typeAssistantReply(reply);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      appendMessage({ role: "assistant", content: `Sorry, I'm having trouble connecting right now. ${message}` });
      toast({
        title: "Chat Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPromptButtons = suggestedPrompts.map((prompt) => (
    <button
      key={prompt}
      onClick={() => sendMessage(prompt)}
      className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 transition"
    >
      {prompt}
    </button>
  ));

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0 }}
            className="fixed bottom-20 right-4 z-50"
          >
            <Button
              onClick={() => setOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-[0_20px_50px_rgba(59,130,246,0.35)] hover:shadow-lg"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-[360px] max-h-[84vh] rounded-[32px] p-[1px] bg-gradient-to-r from-emerald-400 via-sky-500 to-blue-500 shadow-[0_30px_80px_rgba(59,130,246,0.25)]"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[30px] bg-slate-950 shadow-2xl">
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/95 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-cyan-300 ring-1 ring-cyan-300/20">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Gemini AI</p>
                    <p className="text-[11px] text-slate-400">{roleLabels[role]} · {roleHints[role]}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-slate-300 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, index) => (
                  <motion.div
                    key={`${msg.role}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[82%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${msg.role === "user" ? "bg-blue-500/10 text-blue-200" : "bg-emerald-500 text-white"}`}>
                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`rounded-3xl px-3 py-2 text-sm leading-5 ${msg.role === "user" ? "bg-slate-900 text-slate-100" : "bg-slate-800 text-slate-100"}`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none text-slate-100 [&>p]:m-0 [&>ul]:my-1 [&>li]:mt-1">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-cyan-300">
                      <Bot className="h-4 w-4" />
                    </div>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Gemini is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="space-y-3 border-t border-white/10 bg-slate-950/95 px-4 py-3">
                <div className="flex flex-wrap gap-2">{quickPromptButtons}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-300 hover:bg-white/10"
                    onClick={() => toast({ title: "Voice Input", description: "Voice input is simulated in the UI only.", variant: "default" })}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && sendMessage(input)}
                    placeholder="Ask Gemini..."
                    className="h-11 rounded-2xl bg-slate-900 text-slate-100 placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className="h-11 w-11 rounded-2xl bg-cyan-500 text-white hover:bg-cyan-400"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
