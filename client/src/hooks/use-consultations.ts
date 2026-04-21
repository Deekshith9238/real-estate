import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import type { 
  ConsultationRequest, 
  Message, 
  CreateConsultationInput, 
  UpdateStatusInput,
  CreateMessageInput 
} from "@shared/routes";

// --- Consultations ---

export function useConsultations() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [api.consultations.list.path],
    queryFn: async () => {
      const res = await fetch(api.consultations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch consultations");
      return api.consultations.list.responses[200].parse(await res.json());
    },
    enabled: isAuthenticated,
  });
}

export function useConsultation(id: number) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [api.consultations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.consultations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch consultation");
      return api.consultations.get.responses[200].parse(await res.json());
    },
    enabled: !!id && isAuthenticated,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateConsultationInput) => {
      const res = await fetch(api.consultations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create consultation request");
      return api.consultations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.consultations.list.path] });
    },
  });
}

export function useUpdateConsultationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number } & UpdateStatusInput) => {
      const url = buildUrl(api.consultations.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.consultations.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.consultations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.consultations.get.path, variables.id] });
    },
  });
}

// --- Messages ---

export function useMessages(consultationId: number) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [api.messages.list.path, consultationId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { id: consultationId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!consultationId && isAuthenticated,
    refetchInterval: 3000, // Poll every 3 seconds for real-time chat
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ consultationId, content }: { consultationId: number; content: string }) => {
      const url = buildUrl(api.messages.create.path, { id: consultationId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, variables.consultationId] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ consultationId, file }: { consultationId: number; file: File }) => {
      const url = `/api/consultations/${consultationId}/upload`;
      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload document");
      // Res returns the created message
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, variables.consultationId] });
    },
  });
}
