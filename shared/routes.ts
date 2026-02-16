import { z } from 'zod';
import { insertConsultationRequestSchema, insertMessageSchema, consultationRequests, messages } from './schema';

export { insertConsultationRequestSchema, insertMessageSchema };

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  consultations: {
    list: {
      method: 'GET' as const,
      path: '/api/consultations' as const,
      responses: {
        200: z.array(z.custom<typeof consultationRequests.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/consultations/:id' as const,
      responses: {
        200: z.custom<typeof consultationRequests.$inferSelect>(),
        404: errorSchemas.notFound,
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/consultations' as const,
      input: insertConsultationRequestSchema,
      responses: {
        201: z.custom<typeof consultationRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/consultations/:id/status' as const,
      input: z.object({ status: z.enum(["active", "completed", "rejected"]) }),
      responses: {
        200: z.custom<typeof consultationRequests.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        403: errorSchemas.unauthorized,
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/consultations/:id/messages' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        403: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/consultations/:id/messages' as const,
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type CreateConsultationInput = z.infer<typeof api.consultations.create.input>;
export type UpdateStatusInput = z.infer<typeof api.consultations.updateStatus.input>;
export type CreateMessageInput = z.infer<typeof api.messages.create.input>;
