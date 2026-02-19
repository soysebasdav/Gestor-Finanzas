import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    demoLogin: publicProcedure
      .input(
        z.object({
          username: z.string().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ENV.demoAuthEnabled) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Demo auth disabled" });
        }

        if (!ENV.demoUsername || !ENV.demoPassword) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "DEMO_USERNAME/DEMO_PASSWORD not configured",
          });
        }

        const ok =
          input.username === ENV.demoUsername && input.password === ENV.demoPassword;

        if (!ok) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciales inválidas" });
        }

        const openId = `demo:${input.username}`;

        // crea/actualiza user (si DB existe)
        await db.upsertUser({
          openId,
          name: input.username,
          email: null,
          loginMethod: "demo",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.username,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        return { success: true } as const;
      }),
  }),

  transactions: router({
    list: protectedProcedure
      .input((val: any) => val)
      .query(async ({ ctx, input }) => {
        const { getTransactionsByUser } = await import("./db");
        return getTransactionsByUser(ctx.user.id, input.filters);
      }),
    create: protectedProcedure
      .input((val: any) => val)
      .mutation(async ({ ctx, input }) => {
        const { createTransaction } = await import("./db");
        return createTransaction({
          ...input,
          userId: ctx.user.id,
        });
      }),
    update: protectedProcedure
      .input((val: any) => val)
      .mutation(async ({ ctx, input }) => {
        const { updateTransaction } = await import("./db");
        return updateTransaction(input.id, ctx.user.id, input.data);
      }),
    delete: protectedProcedure
      .input((val: any) => val)
      .mutation(async ({ ctx, input }) => {
        const { deleteTransaction } = await import("./db");
        return deleteTransaction(input.id, ctx.user.id);
      }),
  }),
  categories: router({
    list: protectedProcedure
      .input((val: any) => val)
      .query(async ({ input }) => {
        const { getCategories } = await import("./db");
        return getCategories(input?.type);
      }),
  }),
  concepts: router({
    list: protectedProcedure
      .input((val: any) => val)
      .query(async ({ input }) => {
        const { getConceptsByCategory } = await import("./db");
        if (input?.categoryId) {
          return getConceptsByCategory(input.categoryId);
        }
        const { getAllConcepts } = await import("./db");
        return getAllConcepts();
      }),
  }),
});

export type AppRouter = typeof appRouter;
