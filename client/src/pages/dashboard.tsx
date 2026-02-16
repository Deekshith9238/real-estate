import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useConsultations, useUpdateConsultationStatus } from "@/hooks/use-consultations";
import { NavBar } from "@/components/nav-bar";
import { RequestModal } from "@/components/request-modal";
import { ChatInterface } from "@/components/chat-interface";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Clock, CheckCircle, XCircle, MessageSquare, ChevronRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ConsultationRequest } from "@shared/routes";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: consultations, isLoading } = useConsultations();
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  
  // Admin logic: For this demo, let's say the user with ID "admin" or just the first user is admin.
  // Ideally this comes from the backend user role. 
  // For simplicity: If the user sees all requests (backend usually filters), we can just render the admin view.
  // But since the schema links request to userId, standard users only see their own.
  // We'll simulate "Admin View" if the user has a specific email or ID. 
  // Let's assume ANYONE can see the dashboard, but the content differs.
  
  // Since we don't have roles in the schema provided in the prompt, I'll build a unified dashboard.
  // If the user is the CREATOR, they see their requests.
  // If the app was structured with roles, we'd have conditional rendering here.
  
  const selectedConsultation = consultations?.find(c => c.id === selectedConsultationId);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <NavBar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your consultation requests and messages.</p>
          </div>
          <RequestModal />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
            {/* List Column */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
              <Card className="flex-1 border-border/50 shadow-lg flex flex-col overflow-hidden bg-card">
                <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-serif">Requests</CardTitle>
                    <Filter className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-3">
                    {consultations && consultations.length > 0 ? (
                      consultations.map((item) => (
                        <ConsultationCard
                          key={item.id}
                          item={item}
                          isSelected={selectedConsultationId === item.id}
                          onClick={() => setSelectedConsultationId(item.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-10 px-4 text-muted-foreground">
                        <p>No consultation requests found.</p>
                        <p className="text-xs mt-2">Create a new request to get started.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            {/* Detail/Chat Column */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
              {selectedConsultation ? (
                <div className="grid grid-rows-[auto_1fr] gap-6 h-full">
                  {/* Summary Card */}
                  <Card className="border-border/50 shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className={`mb-2 ${getStatusColor(selectedConsultation.status)}`}>
                            {selectedConsultation.status.charAt(0).toUpperCase() + selectedConsultation.status.slice(1)}
                          </Badge>
                          <CardTitle className="text-2xl font-serif">{selectedConsultation.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created on {format(new Date(selectedConsultation.createdAt || new Date()), "MMMM do, yyyy")}
                          </p>
                        </div>
                        <AdminControls consultation={selectedConsultation} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{selectedConsultation.description}</p>
                    </CardContent>
                  </Card>

                  {/* Chat Interface */}
                  <ChatInterface 
                    consultationId={selectedConsultation.id} 
                    isActive={selectedConsultation.status === 'active'} 
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-3xl bg-secondary/10">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-serif font-bold text-foreground">Select a Request</h3>
                    <p>Choose a consultation from the list to view details and chat.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components for cleaner file

function ConsultationCard({ item, isSelected, onClick }: { item: ConsultationRequest; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl cursor-pointer transition-all duration-200 border
        hover:shadow-md hover:border-primary/30
        ${isSelected 
          ? "bg-primary/5 border-primary/50 shadow-sm ring-1 ring-primary/20" 
          : "bg-background border-transparent hover:bg-secondary/40"
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-semibold text-sm line-clamp-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
          {item.title}
        </h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
          {item.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {item.description}
      </p>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
        <span>{format(new Date(item.createdAt || new Date()), "MMM d")}</span>
        <ChevronRight className={`w-3 h-3 ${isSelected ? "text-primary" : "opacity-0"}`} />
      </div>
    </div>
  );
}

function AdminControls({ consultation }: { consultation: ConsultationRequest }) {
  // This component would likely be conditionally rendered only for admins
  // For the demo, we'll show it but perhaps disable it if it's the user's own view?
  // Let's assume everyone can change status for now to demonstrate the feature functionality requested
  // "Ability to accept/reject/complete requests"
  
  const { mutate: updateStatus, isPending } = useUpdateConsultationStatus();

  const handleStatusChange = (status: "active" | "completed" | "rejected") => {
    updateStatus({ id: consultation.id, status });
  };

  if (consultation.status === "completed" || consultation.status === "rejected") {
    return null;
  }

  return (
    <div className="flex gap-2">
      {consultation.status === "pending" && (
        <>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 border-green-500/20 text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleStatusChange("active")}
            disabled={isPending}
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Accept
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 border-red-500/20 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleStatusChange("rejected")}
            disabled={isPending}
          >
            <XCircle className="w-3 h-3 mr-1" /> Reject
          </Button>
        </>
      )}
      {consultation.status === "active" && (
        <Button 
          size="sm" 
          variant="outline"
          className="h-8"
          onClick={() => handleStatusChange("completed")}
          disabled={isPending}
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Mark Complete
        </Button>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-700 border-green-200";
    case "completed": return "bg-blue-100 text-blue-700 border-blue-200";
    case "rejected": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}
