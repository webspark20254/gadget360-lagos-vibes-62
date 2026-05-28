import { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ChatIcon from "@/components/ChatIcon";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { WHATSAPP_NUMBER, waGeneralUrl } from "@/lib/whatsapp";

interface Message { id: string; text: string; isBot: boolean; timestamp: Date }

// Friendly bot avatar illustration (inline SVG)
const BotAvatar = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="bot-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
      </linearGradient>
    </defs>
    <rect x="6" y="14" width="52" height="40" rx="14" fill="url(#bot-g)" />
    <circle cx="32" cy="10" r="3" fill="hsl(var(--foreground))" />
    <rect x="31" y="6" width="2" height="6" fill="hsl(var(--foreground))" />
    <circle cx="23" cy="34" r="4.5" fill="white" />
    <circle cx="41" cy="34" r="4.5" fill="white" />
    <circle cx="23" cy="34" r="2" fill="hsl(var(--foreground))" />
    <circle cx="41" cy="34" r="2" fill="hsl(var(--foreground))" />
    <rect x="26" y="42" width="12" height="3" rx="1.5" fill="white" opacity="0.85" />
  </svg>
);

const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi! 👋 I'm the Gadget360.ng assistant. Ask me about phones, laptops, consoles, delivery or warranties — or jump straight to WhatsApp.", isBot: true, timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setSessionId(crypto.randomUUID()); }, []);

  const createChatSession = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ customer_name: customerName.trim(), is_active: true, user_id: user?.id || null })
      .select("id").maybeSingle();
    if (error || !data) return null;
    return data.id;
  };

  const handleNameSubmit = async () => {
    if (!customerName.trim()) {
      toast({ title: "Name required", description: "Please enter your name to start chatting.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const newId = await createChatSession();
    if (newId) { setSessionId(newId); setNameSet(true); }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    const userMessage: Message = { id: Date.now().toString(), text: inputValue, isBot: false, timestamp: new Date() };
    setMessages((p) => [...p, userMessage]);
    const current = inputValue;
    setInputValue("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gemini-chat", {
        body: { message: current, sessionId, customerName },
      });
      if (error) throw new Error(error.message);
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), text: data.response || "Sorry, I'm having trouble. Please WhatsApp +234 810 841 8727.", isBot: true, timestamp: new Date() }]);
    } catch {
      setMessages((p) => [...p, { id: (Date.now() + 1).toString(), text: "I'm having trouble right now. Tap the WhatsApp button to reach a human instantly.", isBot: true, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") nameSet ? handleSendMessage() : handleNameSubmit();
  };

  return (
    <>
      {/* Launcher */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 group"
        >
          <span className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
          <span className="relative grid place-items-center h-14 w-14 rounded-full bg-gradient-crimson text-primary-foreground shadow-glow-crimson ring-1 ring-primary/30 hover:scale-105 transition-transform">
            <ChatIcon size={26} />
          </span>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-whatsapp ring-2 ring-background" />
        </button>
      )}

      {/* Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[380px] h-[560px] max-h-[85vh] z-50 rounded-3xl overflow-hidden border border-border bg-background shadow-elegant flex flex-col">
          {/* Header — illustrated gradient banner */}
          <div className="relative bg-gradient-crimson text-primary-foreground px-5 pt-4 pb-5 overflow-hidden">
            <svg className="absolute -right-6 -bottom-8 opacity-20" width="180" height="180" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" />
              <circle cx="100" cy="100" r="55" stroke="white" strokeWidth="1" />
              <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="1" />
            </svg>
            <div className="flex items-start justify-between relative">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-2xl bg-white/15 backdrop-blur">
                  <ChatIcon size={20} />
                </div>
                <div>
                  <div className="font-display font-bold text-lg leading-tight">Gadget Assistant</div>
                  <div className="text-[11px] opacity-80 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-whatsapp" /> Online · replies fast</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/15" aria-label="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {!nameSet ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <BotAvatar size={64} />
                <h3 className="font-display font-bold text-xl mt-4">What should I call you?</h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px]">
                  Drop your first name so I can personalise your session.
                </p>
                <div className="w-full max-w-xs mt-5 space-y-2">
                  <Input
                    placeholder="e.g. Tunde"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-11 rounded-full text-center"
                  />
                  <Button onClick={handleNameSubmit} disabled={loading} className="w-full h-11 rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold gap-2">
                    {loading ? "Starting…" : (<><Sparkles size={14} /> Start chat</>)}
                  </Button>
                </div>
                <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs font-medium inline-flex items-center gap-1.5 text-whatsapp hover:underline">
                  <WhatsAppIcon size={12} /> Or skip & chat on WhatsApp
                </a>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex items-end gap-2 ${m.isBot ? "justify-start" : "justify-end"}`}>
                      {m.isBot && (
                        <div className="h-7 w-7 rounded-full bg-gradient-crimson grid place-items-center shrink-0">
                          <ChatIcon size={14} className="text-primary-foreground" />
                        </div>
                      )}
                      <div className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-snug rounded-2xl ${
                        m.isBot
                          ? "bg-background border border-border rounded-bl-md"
                          : "bg-foreground text-background rounded-br-md"
                      }`}>
                        <p className="whitespace-pre-line">{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-end gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-crimson grid place-items-center"><ChatIcon size={14} className="text-primary-foreground" /></div>
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-background border border-border">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-border bg-background p-3 space-y-2">
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full h-10 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-xs font-semibold gap-2">
                      <WhatsAppIcon size={13} /> Continue on WhatsApp
                    </Button>
                  </a>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message…"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      className="flex-1 h-10 rounded-full bg-muted border-transparent focus:bg-background focus:border-border text-sm"
                    />
                    <Button onClick={handleSendMessage} disabled={loading || !inputValue.trim()} size="icon" className="h-10 w-10 rounded-full bg-foreground hover:bg-foreground/90 text-background shrink-0">
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChat;
