export interface IUser {
  _id: string;
  email: string;
  name: string;
  tShirtSize?: string;
  profilePicture?: string;
  contactNumber?: string;
  discordUsername?: string;
  skills?: string[];
  role: UserRole;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  points: number;
  status?: "pending" | "accepted" | "rejected";
  checkInDates?: string[];
  checkOutDates?: string[];
  hasTeam: boolean;
  teamName: string;
}

enum UserRole {
  PARTICIPANT = "PARTICIPANT",
  ORGANIZER = "ORGANIZER",
  ADMIN = "ADMIN",
}
