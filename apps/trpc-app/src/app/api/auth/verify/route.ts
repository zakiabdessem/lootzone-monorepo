
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const getCorsOrigin = () => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://admin.lootzone.digital";
};

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": getCorsOrigin(),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-trpc-source, trpc-accept",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": getCorsOrigin(),
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }

    // Verify the JWT token
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
          {
            status: 401,
            headers: {
              "Access-Control-Allow-Origin": getCorsOrigin(),
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      }

      return NextResponse.json({
        valid: true,
        user: decoded,
      }, {
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(),
          "Access-Control-Allow-Credentials": "true",
        },
      });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid token" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": getCorsOrigin(),
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
}
