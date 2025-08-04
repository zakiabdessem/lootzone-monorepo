import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      // Check if the session still exists in the database
      const session = await db.session.findFirst({
        where: {
          sessionToken: token,
          userId: decoded.userId,
          expires: {
            gt: new Date(), // Not expired
          },
        },
      });

      if (!session) {
        return NextResponse.json(
          { valid: false, error: "Session has been revoked" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        valid: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
      });
    } catch (jwtError) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
