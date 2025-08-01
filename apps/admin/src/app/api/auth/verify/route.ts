import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, message: "Token missing" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET || "your-secret-key";

    // Verify signature & expiration
    await jwtVerify(token, new TextEncoder().encode(secret));

    // If verification passes, decode payload for user info
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );

    return NextResponse.json({ valid: true, user: payload });
  } catch (err) {
    return NextResponse.json({ valid: false, message: "Invalid token" }, { status: 401 });
  }
}
