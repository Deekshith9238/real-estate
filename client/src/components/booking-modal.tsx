import { useState } from "react";
import { useCreateConsultation } from "@/hooks/use-consultations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertConsultationRequestSchema } from "@shared/routes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar as CalendarIcon, CheckCircle2, ChevronRight, ChevronLeft, PhoneCall } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { useConsultationForm } from "@/hooks/use-consultation-form";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceTitle?: string;
}

const steps = [
  { id: "intro", title: "How it works" },
  { id: "schedule", title: "Choose Slot" },
  { id: "details", title: "Your Details" },
];

const timeSlots = [
  { id: "morning", title: "Morning", hours: "8 AM - 12 PM", icon: Clock },
  { id: "afternoon", title: "Afternoon", hours: "12 PM - 4 PM", icon: Clock },
  { id: "evening", title: "Evening", hours: "4 PM - 8 PM", icon: Clock },
];

export function BookingModal({ open, onOpenChange, serviceTitle = "" }: BookingModalProps) {
  const [step, setStep] = useState(0);
  
  const { form, onSubmit, isPending } = useConsultationForm({
    onSuccess: () => {
      onOpenChange(false);
      setStep(0);
    },
    defaultValues: {
      title: serviceTitle,
    }
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="flex min-h-[500px]">
          {/* Left Sidebar - Progress */}
          <div className="w-1/3 bg-primary p-8 text-primary-foreground hidden sm:flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div className="space-y-6">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                      step >= i ? "bg-white text-primary border-white" : "border-white/30 text-white/50"
                    )}>
                      {step > i ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                    </div>
                    <div>
                      <p className={cn("text-xs font-medium uppercase tracking-wider", step >= i ? "text-white" : "text-white/40")}>Step {i + 1}</p>
                      <p className={cn("text-sm font-bold font-serif", step >= i ? "text-white" : "text-white/40")}>{s.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              IndiaZameen Expert Consultation
            </div>
          </div>

          {/* Right Area - Content */}
          <div className="flex-1 bg-background p-8 flex flex-col overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-serif font-bold">How it works</DialogTitle>
                      <DialogDescription className="text-base">
                        Simple steps to get professional guidance on your property.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {[
                        { title: "Book your slot", desc: "Choose a preferred time for our expert to call." },
                        { title: "Expert Analysis", desc: "Our team reviews your specific case details." },
                        { title: "Get Solutions", desc: "Expert call within 24h with actionable advice." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold">Schedule your Call</h3>
                    <div className="grid gap-4">
                      <div className="border rounded-2xl p-2 bg-secondary/5">
                        <Calendar
                          mode="single"
                          selected={form.watch("scheduledDate") || undefined}
                          onSelect={(date) => form.setValue("scheduledDate", date as Date)}
                          disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0,0,0,0))}
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => form.setValue("timeSlot", slot.title)}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-left group",
                              form.watch("timeSlot") === slot.title 
                                ? "border-primary bg-primary/5 shadow-inner" 
                                : "border-border/50 hover:border-primary/30"
                            )}
                          >
                            <slot.icon className={cn("w-4 h-4 mb-2 group-hover:scale-110 transition-transform", form.watch("timeSlot") === slot.title ? "text-primary" : "text-muted-foreground")} />
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">{slot.title}</p>
                            <p className="text-[8px] font-medium leading-none mt-1">{slot.hours}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold">Consultation Details</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</FormLabel>
                              <FormControl>
                                <Input className="rounded-xl" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Describe your issue</FormLabel>
                              <FormControl>
                                <Textarea className="rounded-xl min-h-[100px] resize-none" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-auto flex justify-between items-center bg-secondary/10 p-4 -mx-8 -mb-8 sm:rounded-none border-t border-border/50">
              {step > 0 ? (
                <Button variant="ghost" size="sm" onClick={prevStep} className="rounded-full">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < steps.length - 1 ? (
                <Button 
                  size="sm" 
                  onClick={nextStep} 
                  disabled={step === 1 && (!form.watch("scheduledDate") || !form.watch("timeSlot"))}
                  className="rounded-full px-6 bg-primary shadow-lg shadow-primary/20"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={form.handleSubmit(onSubmit)} 
                  disabled={isPending}
                  className="rounded-full px-8 bg-primary shadow-lg shadow-primary/20"
                >
                  {isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
