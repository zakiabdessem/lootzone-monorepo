import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserRole } from "~/constants/enums";
import { env } from "~/env";
import { createUserWithCredentials, verifyPassword } from "~/lib/auth-utils";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  // Register a new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        firstName: z
          .string()
          .min(1, "First name is required")
          .max(255, "First name too long"),
        lastName: z
          .string()
          .min(1, "Last name is required")
          .max(255, "Last name too long"),
        phone: z
          .string()
          .min(1, "Phone is required")
          .max(255, "Phone too long")
      })
    )
    .mutation(async ({ input }) => {
      try {
        const user = await createUserWithCredentials({
          email: input.email,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          role: UserRole.USER,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof Error && error.message === "User already exists") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }
    }),

  // Login user
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("🔍 [AUTH_ROUTER] Login attempt for email:", input.email);

      // Find user by email
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          password: true,
          role: true,
        },
      });

      if (!user || !user.password) {
        console.log("❌ [AUTH_ROUTER] User not found or no password for email:", input.email);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      console.log("🔍 [AUTH_ROUTER] User found, verifying password...");

      // Verify password
      const isValid = await verifyPassword(input.password, user.password);
      if (!isValid) {
        console.log("❌ [AUTH_ROUTER] Invalid password for user:", input.email);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      console.log("🔍 [AUTH_ROUTER] Password verified, generating JWT token...");

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      console.log("🔍 [AUTH_ROUTER] JWT token generated:", token ? `${token.substring(0, 20)}...` : "undefined");

      // Create database session for tracking
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      console.log("🔍 [AUTH_ROUTER] Creating database session...");

      await ctx.db.session.create({
        data: {
          sessionToken: token,
          userId: user.id,
          expires: expiresAt,
        },
      });

      console.log("🔍 [AUTH_ROUTER] Database session created successfully");

      const response = {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
        },
      };

      console.log("🔍 [AUTH_ROUTER] Login successful, returning response");
      return response;
    }),

  // Check if user exists by email
  checkUserExists: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true, email: true },
      });

      return { exists: !!user };
    }),
});
