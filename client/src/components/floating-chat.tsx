import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useConsultations } from "@/hooks/use-consultations";
import { ChatInterface } from "@/components/chat-interface";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, LogIn, PlusCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export function FloatingChat() {
    const { user, isAuthenticated } = useAuth();
    const { data: consultations } = useConsultations();
    const [isOpen, setIsOpen] = useState(false);
    const [activeConsultationId, setActiveConsultationId] = useState<number | null>(null);

    // Auto-select the most recent active consultation if any
    useEffect(() => {
        if (consultations && consultations.length > 0 && !activeConsultationId) {
            const active = consultations.find(c => c.status === 'active') || consultations[0];
            setActiveConsultationId(active.id);
        }
    }, [consultations, activeConsultationId]);

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[380px] max-w-[calc(100vw-48px)] h-[550px] shadow-2xl rounded-3xl overflow-hidden border border-border/50"
                    >
                        {!isAuthenticated ? (
                            <Card className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <h3 className="font-serif font-bold text-2xl mb-3">Ready to Chat?</h3>
                                <p className="text-muted-foreground mb-8">Login or create an account to start a property consultation with our experts.</p>
                                <div className="flex flex-col w-full gap-3">
                                    <Link href="/auth">
                                        <Button className="w-full rounded-xl h-12 font-semibold" onClick={() => setIsOpen(false)}>
                                            <LogIn className="w-4 h-4 mr-2" /> Login / Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col bg-background">
                                {activeConsultationId ? (
                                    <div className="flex flex-col h-full relative">
                                        <button
                                            onClick={() => setActiveConsultationId(null)}
                                            className="absolute top-4 left-4 z-10 p-2 hover:bg-secondary/50 rounded-full transition-colors"
                                            title="Back to inquiries"
                                        >
                                            <PlusCircle className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                        <ChatInterface
                                            consultationId={activeConsultationId}
                                            isActive={consultations?.find(c => c.id === activeConsultationId)?.status === 'active'}
                                        />
                                    </div>
                                ) : (
                                    <Card className="h-full flex flex-col bg-background">
                                        <div className="p-6 border-b border-border/50 bg-secondary/20">
                                            <h3 className="font-serif font-bold text-xl">My Consultations</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Select an inquiry to continue chatting.</p>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {consultations && consultations.length > 0 ? (
                                                consultations.map((c) => (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => setActiveConsultationId(c.id)}
                                                        className="p-4 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary">{c.title}</h4>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {c.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                                                    <MessageCircle className="w-12 h-12 mb-4" />
                                                    <p className="text-sm">No active inquiries. Start one to begin chatting with us!</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 border-t border-border/50">
                                            <Link href="/dashboard">
                                                <Button className="w-full rounded-xl h-12 font-semibold" onClick={() => setIsOpen(false)}>
                                                    <PlusCircle className="w-4 h-4 mr-2" /> Start New Inquiry
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={toggleChat}
                className={`w-14 h-14 rounded-full shadow-2xl p-0 transition-all duration-300 ${isOpen ? 'bg-foreground hover:bg-foreground/90 rotate-90' : 'bg-primary hover:bg-primary/90 hover:scale-110'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </Button>
        </div>
    );
}
