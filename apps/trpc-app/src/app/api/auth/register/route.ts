import { NextRequest, NextResponse } from "next/server";
import { createUserWithCredentials } from "~/lib/auth-utils";
import { UserRole } from "~/constants/enums";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    try {
      const user = await createUserWithCredentials({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: UserRole.USER,
      });

      // Create JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "User already exists") {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
