import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { X, Send, Sparkles, GripVertical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { WHATSAPP_NUMBER, waGeneralUrl, waOrderUrl } from "@/lib/whatsapp";

interface Message { id: string; text: string; isBot: boolean; timestamp: Date }

/** Friendly assistant glyph — circular avatar with smile + spark accent. */
const AssistantGlyph = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="ag-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="18" fill="url(#ag-bg)" />
    <circle cx="14.5" cy="18" r="2" fill="currentColor" />
    <circle cx="25.5" cy="18" r="2" fill="currentColor" />
    <path d="M13 24c1.8 2.2 4.3 3.3 7 3.3s5.2-1.1 7-3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M31.5 8.5l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9.9-1.9Z" fill="currentColor" opacity="0.9" />
  </svg>
);

const BotAvatar = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="bot-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
      </linearGradient>
    </defs>
    <rect x="6" y="14" width="52" height="40" rx="18" fill="url(#bot-g)" />
    <circle cx="32" cy="10" r="3" fill="hsl(var(--foreground))" />
    <rect x="31" y="6" width="2" height="6" fill="hsl(var(--foreground))" />
    <circle cx="23" cy="34" r="4.5" fill="white" />
    <circle cx="41" cy="34" r="4.5" fill="white" />
    <circle cx="23" cy="34" r="2" fill="hsl(var(--foreground))" />
    <circle cx="41" cy="34" r="2" fill="hsl(var(--foreground))" />
    <rect x="26" y="42" width="12" height="3" rx="1.5" fill="white" opacity="0.85" />
  </svg>
);

const STORAGE_KEY = "g360.chatLauncherPos";

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
  const [recommended, setRecommended] = useState<{ name: string; price: number } | null>(null);
  const [pageProduct, setPageProduct] = useState<{ name: string; price: number; category: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Draggable launcher position (offsets from bottom-right)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: 20, y: 20 };
  });
  const dragRef = useRef<{ active: boolean; sx: number; sy: number; ox: number; oy: number; moved: boolean }>({
    active: false, sx: 0, sy: 0, ox: 0, oy: 0, moved: false,
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setSessionId(crypto.randomUUID()); }, []);

  // Track the currently viewed product so the bot — and WhatsApp handoff — has context.
  useEffect(() => {
    const id = (params as { id?: string }).id;
    if (location.pathname.startsWith("/product/") && id) {
      supabase.from("products").select("name, price, category").eq("id", id).maybeSingle()
        .then(({ data }) => setPageProduct(data ? { name: data.name, price: Number(data.price), category: data.category } : null));
    } else {
      setPageProduct(null);
    }
  }, [location.pathname, params]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
    // Convert to bottom-right offset (subtract movement from offsets)
    const next = {
      x: Math.max(8, Math.min(window.innerWidth - 80, dragRef.current.ox - dx)),
      y: Math.max(8, Math.min(window.innerHeight - 80, dragRef.current.oy - dy)),
    };
    setPos(next);
  };
  const onPointerUp = () => {
    if (dragRef.current.active) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch {}
      const wasMoved = dragRef.current.moved;
      dragRef.current.active = false;
      if (!wasMoved) setIsOpen(true);
    }
  };

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
      {/* Draggable launcher */}
      {!isOpen && (
        <div
          className="fixed z-50 select-none touch-none"
          style={{ right: pos.x, bottom: pos.y }}
        >
          <button
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Open chat (drag to move)"
            className="group relative block cursor-grab active:cursor-grabbing"
          >
            <span className="absolute inset-0 rounded-full bg-primary/25 blur-2xl animate-pulse" />
            <span className="relative grid place-items-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-crimson text-primary-foreground shadow-glow-crimson ring-1 ring-primary/30 group-hover:scale-105 transition-transform">
              <AssistantGlyph size={22} />
            </span>
            <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-whatsapp ring-2 ring-background" />
            <span className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded-full hidden sm:flex items-center gap-0.5">
              <GripVertical size={8} /> drag
            </span>
          </button>
        </div>
      )}

      {/* Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[380px] h-[560px] max-h-[85vh] z-50 rounded-3xl overflow-hidden border border-border bg-background shadow-elegant flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-crimson text-primary-foreground px-5 pt-4 pb-5 overflow-hidden">
            <svg className="absolute -right-6 -bottom-8 opacity-20" width="180" height="180" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" />
              <circle cx="100" cy="100" r="55" stroke="white" strokeWidth="1" />
              <circle cx="100" cy="100" r="30" stroke="white" strokeWidth="1" />
            </svg>
            <div className="flex items-start justify-between relative">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-2xl bg-white/15 backdrop-blur">
                  <AssistantGlyph size={22} />
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
                        <div className="h-7 w-7 rounded-full bg-gradient-crimson grid place-items-center shrink-0 text-primary-foreground">
                          <AssistantGlyph size={16} />
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
                      <div className="h-7 w-7 rounded-full bg-gradient-crimson grid place-items-center text-primary-foreground"><AssistantGlyph size={16} /></div>
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
