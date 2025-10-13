import { z } from "zod";
import type { IUser } from "./participant";

export interface IPoint {
  challengeId: string;
  points: number;
  submission_link?: string;
}

export interface ITeam {
  _id?: string;
  username: string;
  password: string;
  name: string;
  submission_link?: string;
  points?: IPoint[];
  total_points?: number;
  teamMembers?: IUser[];
}

export const teamSchema = z.object({
  _id: z.string(),
  username: z.string(),
  name: z.string().min(3).max(56),
  password: z.string(),
  total_points: z.number().optional(),
  teamMembers: z.array(
    z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      discordUsername: z.string().optional(),
      tShirtSize: z.string().optional(),
      checkInDates: z.array(z.string()).optional(),
      status: z.string(),
    }),
  ),
});
