import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/PageBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuyerBottomNav } from "@/components/BuyerNav";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Paperclip, Search, Shield, Circle,
  MessageSquare, Phone, MoreVertical,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "buyer" | "supplier";
  time: string;
  read: boolean;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  verified: boolean;
  avatar: string;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 1, name: "ABC Recyclers", lastMessage: "We can deliver 500 kg by Friday", time: "2m ago",
    unread: 2, online: true, verified: true, avatar: "AR",
    messages: [
      { id: 1, text: "Hi, I'm interested in your PET inventory. Do you have 500 kg available?", sender: "buyer", time: "10:30 AM", read: true },
      { id: 2, text: "Yes, we have 600 kg of clean PET bottles ready. Price is ₹14/kg.", sender: "supplier", time: "10:35 AM", read: true },
      { id: 3, text: "Can you do ₹13/kg for bulk? I need recurring monthly orders.", sender: "buyer", time: "10:40 AM", read: true },
      { id: 4, text: "For monthly orders of 500+ kg, we can offer ₹13.5/kg. Deal?", sender: "supplier", time: "10:45 AM", read: true },
      { id: 5, text: "Deal! When can you deliver?", sender: "buyer", time: "10:48 AM", read: true },
      { id: 6, text: "We can deliver 500 kg by Friday", sender: "supplier", time: "10:50 AM", read: false },
    ],
  },
  {
    id: 2, name: "XYZ Plastics", lastMessage: "Quality report attached", time: "1h ago",
    unread: 1, online: false, verified: true, avatar: "XP",
    messages: [
      { id: 1, text: "Can you share a quality report for the last shipment?", sender: "buyer", time: "9:00 AM", read: true },
      { id: 2, text: "Quality report attached", sender: "supplier", time: "9:30 AM", read: false },
    ],
  },
  {
    id: 3, name: "Eco Solutions", lastMessage: "Sure, I'll send the samples tomorrow", time: "3h ago",
    unread: 0, online: true, verified: false, avatar: "ES",
    messages: [
      { id: 1, text: "Hi, can we get samples of your HDPE flakes before placing a bulk order?", sender: "buyer", time: "Yesterday", read: true },
      { id: 2, text: "Sure, I'll send the samples tomorrow", sender: "supplier", time: "Yesterday", read: true },
    ],
  },
  {
    id: 4, name: "Green Plastics Co", lastMessage: "Invoice has been sent to your email", time: "1d ago",
    unread: 0, online: false, verified: true, avatar: "GP",
    messages: [
      { id: 1, text: "Could you resend the invoice for order ORD-004?", sender: "buyer", time: "2 days ago", read: true },
      { id: 2, text: "Invoice has been sent to your email", sender: "supplier", time: "1 day ago", read: true },
    ],
  },
];

const BuyerMessages = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat) {
      setChatMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: chatMessages.length + 1,
      text: newMessage,
      sender: "buyer",
      time: "Just now",
      read: false,
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Chat view
  if (selectedChat) {
    return (
      <div className="h-screen bg-transparent flex flex-col overflow-hidden">
        <PageBackground type="oceanPlastic" overlay="bg-[#F8FAF9]/65" />
        {/* Chat header */}
        <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
          <div className="container mx-auto flex items-center gap-3 h-14 px-4 max-w-lg">
            <Button variant="ghost" size="sm" className="p-1" onClick={() => setSelectedChat(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-[#10B981]/20 flex items-center justify-center text-sm font-bold text-[#065F46]">
              {selectedChat.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{selectedChat.name}</span>
                {selectedChat.verified && <Shield className="h-3 w-3 text-[#14532D]" />}
              </div>
              <span className="text-xs text-[#475569]">
                {selectedChat.online ? "Online" : "Offline"}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="p-1"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="p-1"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </nav>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
          <div className="space-y-3">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === "buyer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === "buyer"
                      ? "bg-[#10B981] text-white rounded-br-md"
                      : "bg-card border border-[#D1FAE5] rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${
                    msg.sender === "buyer" ? "text-white/60" : "text-[#475569]"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 nav-glass border-t border-[#D1FAE5] p-3">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2 shrink-0">
              <Paperclip className="h-5 w-5 text-[#475569]" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="bg-[#10B981] text-white hover:bg-[#10B981]/90 p-2 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="min-h-screen pb-20">
      <PageBackground type="oceanPlastic" overlay="bg-[#F8FAF9]/65" />

      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(248,250,249,0.95)", borderColor: "#D1FAE5" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#065F46]" />
            <span className="font-display font-bold text-lg">Messages</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#475569]" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Conversations */}
        <div className="space-y-2">
          {filteredConversations.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setSelectedChat(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors text-left"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#10B981]/15 flex items-center justify-center text-sm font-bold text-[#065F46]">
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-primary text-[#14532D] stroke-background stroke-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{conv.name}</span>
                      {conv.verified && <Shield className="h-3 w-3 text-[#14532D]" />}
                    </div>
                    <span className="text-[10px] text-[#475569]">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-[#475569] truncate pr-2">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <BuyerBottomNav />
    </div>
  );
};

export default BuyerMessages;
