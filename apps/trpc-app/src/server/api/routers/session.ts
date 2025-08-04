
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const sessionRouter = createTRPCRouter({
  // Get all active sessions for current user
  getUserSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id || ctx.customUser?.id;
    
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return ctx.db.session.findMany({
      where: { userId },
      orderBy: { expires: 'desc' },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
        user: {
          select: {
            email: true,
          }
        }
      }
    });
  }),

  // Admin: Get all sessions with pagination
  getAllSessions: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const [sessions, total] = await Promise.all([
        ctx.db.session.findMany({
          skip: offset,
          take: input.limit,
          orderBy: { expires: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              }
            }
          }
        }),
        ctx.db.session.count()
      ]);

      return {
        sessions,
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),

  // Revoke a specific session
  revokeSession: adminProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.session.delete({
        where: { id: input.sessionId },
      });

      return { success: true };
    }),

  // Revoke all sessions for a user
  revokeUserSessions: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.session.deleteMany({
        where: { userId: input.userId },
      });

      return { success: true };
    }),

  // Clean up expired sessions
  cleanupExpiredSessions: adminProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    return { deletedCount: result.count };
  }),
});
