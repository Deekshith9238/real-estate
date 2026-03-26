import { z } from "zod";
import { insertConsultationRequestSchema } from "@shared/routes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateConsultation } from "./use-consultations";
import { useToast } from "./use-toast";

export const consultationFormSchema = insertConsultationRequestSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide more detail (at least 20 characters)"),
  scheduledDate: z.date({
    required_error: "Please select a date for consultation",
  }).optional().nullable(),
  timeSlot: z.string().optional().nullable(),
});

export type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

interface UseConsultationFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<ConsultationFormValues>;
}

export function useConsultationForm({ onSuccess, defaultValues }: UseConsultationFormProps = {}) {
  const { mutate: createConsultation, isPending } = useCreateConsultation();
  const { toast } = useToast();

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      timeSlot: null,
      scheduledDate: null,
      ...defaultValues,
    },
  });

  const onSubmit = (data: ConsultationFormValues) => {
    createConsultation(data, {
      onSuccess: () => {
        form.reset();
        toast({
          title: "Request Submitted",
          description: data.scheduledDate 
            ? "Your consultation has been scheduled successfully." 
            : "Your consultation request has been submitted.",
        });
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    form,
    onSubmit,
    isPending,
  };
}
