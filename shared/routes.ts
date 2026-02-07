import { z } from 'zod';
import { insertUserSchema, insertDepositSchema, insertLoanSchema, pools, deposits, loans, proofs } from './schema';

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
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.object({ id: z.number(), username: z.string(), walletAddress: z.string().optional().nullable() }).nullable(),
      },
    }
  },
  pools: {
    list: {
      method: 'GET' as const,
      path: '/api/pools' as const,
      responses: {
        200: z.array(z.custom<typeof pools.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/pools/:id' as const,
      responses: {
        200: z.custom<typeof pools.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  deposits: {
    create: {
      method: 'POST' as const,
      path: '/api/deposits' as const,
      input: insertDepositSchema.extend({
        amount: z.coerce.number().min(0),
        poolId: z.coerce.number()
      }),
      responses: {
        201: z.custom<typeof deposits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/deposits' as const,
      responses: {
        200: z.array(z.custom<typeof deposits.$inferSelect>()),
      },
    },
    verify: { // Mock ZK verification endpoint
      method: 'POST' as const,
      path: '/api/deposits/:id/verify' as const,
      responses: {
        200: z.object({ verified: z.boolean(), proofHash: z.string() }),
        404: errorSchemas.notFound,
      }
    }
  },
  loans: {
    create: {
      method: 'POST' as const,
      path: '/api/loans' as const,
      input: insertLoanSchema.extend({
         amount: z.coerce.number().min(0),
         poolId: z.coerce.number(),
         collateralDepositId: z.coerce.number()
      }),
      responses: {
        201: z.custom<typeof loans.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/loans' as const,
      responses: {
        200: z.array(z.custom<typeof loans.$inferSelect>()),
      },
    }
  }
};

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
