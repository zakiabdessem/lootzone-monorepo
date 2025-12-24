import { z } from "zod";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  adminProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env";
// Note: Netflix passwords are stored as-is (not hashed) because they need to be retrievable
// In production, consider encrypting them instead

const ROOM_CODES = ["A", "B", "C", "D", "E"] as const;
type RoomCode = typeof ROOM_CODES[number];

// Validation schemas
const createAccountSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const updateAccountSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(1, "Password is required").optional(),
});

const updateRoomPinSchema = z.object({
  accountId: z.string(),
  roomCode: z.enum(["A", "B", "C", "D", "E"]),
  pinCode: z.string().min(1, "PIN code is required"),
});

const createAccessLinkSchema = z.object({
  accountId: z.string(),
  roomCode: z.enum(["A", "B", "C", "D", "E"]),
  expiresAt: z.date(),
});

const getAccountByTokenSchema = z.object({
  accountId: z.string(),
  roomCode: z.string(),
  token: z.string(),
});

export const netflixRouter = createTRPCRouter({
  // Get all Netflix accounts with rooms
  getAll: adminProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.db.netflixAccount.findMany({
      include: {
        rooms: {
          orderBy: {
            roomCode: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return accounts;
  }),

  // Create new Netflix account with 5 rooms (A-E)
  create: adminProcedure
    .input(createAccountSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if account with email already exists
      const existingAccount = await ctx.db.netflixAccount.findUnique({
        where: { email: input.email },
      });

      if (existingAccount) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Store password as-is (not hashed) because it needs to be retrievable for clients
      // TODO: In production, encrypt passwords instead of storing plaintext
      const account = await ctx.db.netflixAccount.create({
        data: {
          email: input.email,
          password: input.password,
          rooms: {
            create: ROOM_CODES.map((roomCode) => ({
              roomCode,
              pinCode: "0000", // Default PIN
            })),
          },
        },
        include: {
          rooms: true,
        },
      });

      // Return account without password
      const { password: _, ...accountWithoutPassword } = account;
      return accountWithoutPassword;
    }),

  // Update Netflix account
  update: adminProcedure
    .input(updateAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Password is stored as-is (not hashed) because it needs to be retrievable

      const account = await ctx.db.netflixAccount.update({
        where: { id },
        data: updateData,
        include: {
          rooms: {
            orderBy: {
              roomCode: "asc",
            },
          },
        },
      });

      // Return account without password
      const { password: _, ...accountWithoutPassword } = account;
      return accountWithoutPassword;
    }),

  // Delete Netflix account (cascades to rooms and access links)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.netflixAccount.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Update room PIN code
  updateRoomPin: adminProcedure
    .input(updateRoomPinSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the room
      const room = await ctx.db.netflixRoom.findUnique({
        where: {
          accountId_roomCode: {
            accountId: input.accountId,
            roomCode: input.roomCode,
          },
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      // Update PIN
      const updatedRoom = await ctx.db.netflixRoom.update({
        where: { id: room.id },
        data: { pinCode: input.pinCode },
      });

      return updatedRoom;
    }),

  // Create access link with expiration
  createAccessLink: adminProcedure
    .input(createAccessLinkSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify account exists
      const account = await ctx.db.netflixAccount.findUnique({
        where: { id: input.accountId },
        include: {
          rooms: {
            where: { roomCode: input.roomCode },
          },
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      if (account.rooms.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      // Verify expiration is in the future
      if (input.expiresAt <= new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expiration date must be in the future",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          accountId: input.accountId,
          roomCode: input.roomCode,
          type: "netflix_access",
          expiresAt: input.expiresAt.toISOString(),
        },
        env.JWT_SECRET || "your-secret-key",
        {
          expiresIn: Math.floor(
            (input.expiresAt.getTime() - Date.now()) / 1000
          ),
        }
      );

      // Create access link record
      const accessLink = await ctx.db.netflixAccessLink.create({
        data: {
          accountId: input.accountId,
          roomCode: input.roomCode,
          token,
          expiresAt: input.expiresAt,
        },
      });

      return {
        id: accessLink.id,
        token,
        expiresAt: accessLink.expiresAt,
        url: `/netflix-access/${input.accountId}/${input.roomCode}/${token}`,
      };
    }),

  // Get account credentials by token (public, but token-validated)
  getAccountByToken: publicProcedure
    .input(getAccountByTokenSchema)
    .query(async ({ ctx, input }) => {
      // Verify JWT token
      let decoded: {
        accountId: string;
        roomCode: string;
        type: string;
        expiresAt: string;
      };

      try {
        decoded = jwt.verify(
          input.token,
          env.JWT_SECRET || "your-secret-key"
        ) as typeof decoded;
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        });
      }

      // Verify token matches request parameters
      if (
        decoded.accountId !== input.accountId ||
        decoded.roomCode !== input.roomCode ||
        decoded.type !== "netflix_access"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token mismatch",
        });
      }

      // Check expiration
      const expiresAt = new Date(decoded.expiresAt);
      if (expiresAt <= new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token has expired",
        });
      }

      // Check if link exists and is valid
      const accessLink = await ctx.db.netflixAccessLink.findUnique({
        where: { token: input.token },
        include: {
          account: {
            include: {
              rooms: {
                where: { roomCode: input.roomCode },
              },
            },
          },
        },
      });

      if (!accessLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Access link not found",
        });
      }

      if (accessLink.expiresAt <= new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Access link has expired",
        });
      }

      // Get room PIN
      const room = accessLink.account.rooms[0];
      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      // Return credentials
      // Note: Password is stored as plaintext - in production, decrypt here if encrypted
      return {
        email: accessLink.account.email,
        password: accessLink.account.password,
        roomCode: input.roomCode,
        pinCode: room.pinCode,
      };
    }),
});

