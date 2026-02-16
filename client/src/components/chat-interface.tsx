import { useState, useRef, useEffect } from "react";
import { useMessages, useSendMessage } from "@/hooks/use-consultations";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInterfaceProps {
  consultationId: number;
  isActive: boolean;
}

export function ChatInterface({ consultationId, isActive }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(consultationId);
  const { mutate: sendMessage, isPending } = useSendMessage();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage({ consultationId, content: inputValue });
    setInputValue("");
  };

  return (
    <Card className="flex flex-col h-[600px] border border-border/50 shadow-xl shadow-black/5 rounded-2xl overflow-hidden bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg text-foreground">Consultation Chat</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {isActive ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Active Session
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                Session Closed
              </>
            )}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-background to-secondary/10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Clock className="w-5 h-5 animate-spin mr-2" /> Loading conversation...
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex w-full",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-5 py-3 shadow-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-secondary text-secondary-foreground rounded-tl-none border border-border/50"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={cn(
                        "text-[10px] mt-1 opacity-70",
                        isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {msg.createdAt && format(new Date(msg.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p>Start the conversation by sending a message.</p>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50 bg-background">
        <form onSubmit={handleSend} className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isActive ? "Type your message..." : "This consultation is closed."}
            disabled={!isActive || isPending}
            className="flex-1 rounded-xl bg-secondary/30 border-border/50 focus:ring-primary/20 focus:border-primary"
          />
          <Button 
            type="submit" 
            disabled={!isActive || isPending || !inputValue.trim()}
            className="rounded-xl px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
