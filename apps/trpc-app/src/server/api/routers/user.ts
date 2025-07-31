import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { UserRole } from "~/constants/enums";

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.session.user.id,
      // firstName: ctx.session.user.firstName,
      // lastName: ctx.session.user.lastName,
      // phone: ctx.session.user.phone,
      email: ctx.session.user.email,
      image: ctx.session.user.image,
      role: ctx.session.user.role,
    };
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Update user in database
      return {
        success: true,
        user: {
          ...ctx.session.user,
          ...input,
        },
      };
    }),

  // Admin: List all users
  listUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        role: z.nativeEnum(UserRole).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Get users from database with pagination
      return {
        items: [],
        nextCursor: undefined,
      };
    }),

  // Admin: Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.nativeEnum(UserRole),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Update user role in database
      return { success: true };
    }),
});
